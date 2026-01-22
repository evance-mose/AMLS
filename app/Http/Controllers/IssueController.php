<?php

namespace App\Http\Controllers;

use App\Models\Issue;
use App\Models\User;
use App\Models\Log;
use App\Services\TechnicianAssignmentService;
use App\Notifications\IssueAssigned;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log as LogFacade;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Exception;

class IssueController extends Controller
{
 

    public function index()
    {
        $user = Auth::user();
        $issuesQuery = Issue::with(['user', 'assignedUser']);

        // Role-based filtering
        if ($user->role === 'technician') {
            // Technicians only see their assigned issues
            $issuesQuery->where('assigned_to', $user->id)
                       ->whereNotIn('status', ['resolved', 'closed']);
        } elseif ($user->role === 'custodian') {
            // Custodians see issues they created
            $issuesQuery->where('user_id', $user->id);
        } elseif ($user->role === 'admin') {
            // Admins see all issues
            $issuesQuery->whereNotIn('status', ['resolved', 'closed']);
        }

        return Inertia::render('issues/index', [
            'issues' => $issuesQuery->get(),
            'users' => $user->role === 'admin' ? User::all() : []
        ]);
    }

    public function show(Issue $issue)
    {
        $user = Auth::user();
        
        // Authorization checks
        if ($user->role === 'technician' && $issue->assigned_to !== $user->id) {
            abort(403, 'You can only view issues assigned to you.');
        }
        
        if ($user->role === 'custodian' && $issue->user_id !== $user->id) {
            abort(403, 'You can only view issues you created.');
        }

        return Inertia::render('issues/show', [
            'issue' => $issue->load(['user', 'assignedUser', 'logs'])
        ]);
    }    


    public function store(Request $request)
    {
        // Only custodians can create issues (fault logging)
        if (Auth::user()->role !== 'custodian') {
            abort(403, 'Only custodians can create issues (fault logging).');
        }

        $validated = $request->validate([
            'location' => 'required|string|max:255',
            'atm_id' => 'required|string|max:255',
            'category' => 'required|in:dispenser_errors,card_reader_errors,receipt_printer_errors,epp_errors,pc_core_errors,journal_printer_errors,recycling_module_errors,other',
            'description' => 'nullable|string',
            'status' => 'required|in:pending,in_progress,resolved,closed',
            'priority' => 'required|in:low,medium,high',
            'assigned_to' => 'nullable|exists:users,id',
        ]);
    
        $issue = Issue::create([
            ...$validated,
            'user_id' => Auth()->id()
        ]);

        // Automatic technician assignment if not manually assigned
        if (empty($validated['assigned_to'])) {
            DB::transaction(function () use ($issue, $validated) {
                try {
                    $assignmentService = new TechnicianAssignmentService();
                    $assignedTechnician = $assignmentService->assignTechnician($issue);
                    
                    if ($assignedTechnician) {
                        // Update issue with assigned technician
                        $issue->update([
                            'assigned_to' => $assignedTechnician->id,
                            'status' => 'acknowledged'
                        ]);
                        
                        // Create a log entry for the automatic assignment
                        $log = Log::create([
                            'user_id' => $assignedTechnician->id,
                            'issue_id' => $issue->id,
                            'status' => $validated['status'] ?? 'pending',
                            'priority' => $validated['priority'] ?? 'low',
                            'action_taken' => 'Automatically assigned based on expertise, availability, and workload'
                        ]);
                        
                        // Send notification to assigned technician
                        Notification::send($assignedTechnician, new IssueAssigned($log, $assignedTechnician));
                        
                        LogFacade::info('Issue automatically assigned to technician', [
                            'issue_id' => $issue->id,
                            'technician_id' => $assignedTechnician->id,
                            'technician_name' => $assignedTechnician->name,
                            'log_id' => $log->id
                        ]);
                    } else {
                        LogFacade::warning('No technician could be automatically assigned', [
                            'issue_id' => $issue->id,
                            'category' => $issue->category
                        ]);
                    }
                } catch (Exception $e) {
                    LogFacade::error('Automatic assignment failed', [
                        'issue_id' => $issue->id,
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString()
                    ]);
                    throw $e;
                }
            });
        }
    
        return redirect()->back()->with('success', 'Issue created successfully.');
    }

  
    public function update(Request $request, Issue $issue)
    {
        $user = Auth::user();
        
        // Only technicians can update issues (task resolution)
        if ($user->role !== 'technician') {
            abort(403, 'Only technicians can update issues (task resolution).');
        }
        
        // Technicians can only update their assigned issues
        if ($issue->assigned_to !== $user->id) {
            abort(403, 'You can only update issues assigned to you.');
        }

        $validated = $request->validate([
            'user_id' => 'nullable|exists:users,id',
            'assigned_to' => 'nullable|exists:users,id',
            'location' => 'required|string|max:255',
            'atm_id' => 'required|string|max:255',
            'category' => 'required|in:dispenser_errors,card_reader_errors,receipt_printer_errors,epp_errors,pc_core_errors,journal_printer_errors,recycling_module_errors,other',
            'description' => 'nullable|string',
            'status' => 'required|in:pending,acknowledged,resolved,closed',
            'priority' => 'required|in:low,medium,high',
        ]);

        $issue->update($validated);

        return redirect()->back()->with('success', 'Issue updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        // Only admins can delete issues
        if (Auth::user()->role !== 'admin') {
            abort(403, 'Only admins can delete issues.');
        }

        try {
            $issue = Issue::findOrFail($id);
            $issue->delete();
            return redirect()->back()->with('success', 'Issue deleted successfully.');
        } catch (Exception $e) {
            LogFacade::error('Issue deletion failed: ' . $e->getMessage());
        }
    }
    
}
