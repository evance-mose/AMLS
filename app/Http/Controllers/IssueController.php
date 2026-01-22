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
        $issuesQuery = Issue::with(['user', 'assignedUser'])->where('status', '!=', 'resolved');

        if ($user->role === 'technician') {
            $issuesQuery->where('assigned_to', $user->id);
        }

        return Inertia::render('issues/index', [
            'issues' => $issuesQuery->get(),
            'users' => User::all()
        ]);
    }    


    public function store(Request $request)
    {
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
        try {
            $issue = Issue::findOrFail($id);
            $issue->delete();
            return redirect()->back()->with('success', 'Issue deleted successfully.');
        } catch (Exception $e) {
            Log::error('Issue deletion failed: ' . $e->getMessage());
        }
    }
    
}
