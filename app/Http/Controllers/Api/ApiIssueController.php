<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Issue;
use App\Models\User;
use App\Models\Log;
use App\Services\TechnicianAssignmentService;
use App\Notifications\IssueAssigned;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log as LogFacade;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Exception;

class ApiIssueController extends Controller
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

        return response()->json($issuesQuery->get());
    }

    public function store(Request $request)
    {
        // Only custodians can create issues (fault logging)
        if (Auth::user()->role !== 'custodian') {
            return response()->json(['error' => 'Only custodians can create issues (fault logging).'], 403);
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
    
        return response()->json(['message' => 'Issue created successfully.', 'issue' => $issue->fresh(['user', 'assignedUser'])], 201);
    }

    public function show(Issue $issue)
    {
        $user = Auth::user();
        
        // Authorization checks
        if ($user->role === 'technician' && $issue->assigned_to !== $user->id) {
            return response()->json(['error' => 'You can only view issues assigned to you.'], 403);
        }
        
        if ($user->role === 'custodian' && $issue->user_id !== $user->id) {
            return response()->json(['error' => 'You can only view issues you created.'], 403);
        }

        return response()->json($issue->load(['user', 'assignedUser']));
    }
  
    public function update(Request $request, Issue $issue)
    {
        $user = Auth::user();
        
        // Only technicians can update issues (task resolution)
        if ($user->role !== 'technician') {
            return response()->json(['error' => 'Only technicians can update issues (task resolution).'], 403);
        }
        
        // Technicians can only update their assigned issues
        if ($issue->assigned_to !== $user->id) {
            return response()->json(['error' => 'You can only update issues assigned to you.'], 403);
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

        return response()->json(['message' => 'Issue updated successfully.', 'issue' => $issue]);
    }

    public function destroy(Issue $issue)
    {
        // Only admins can delete issues
        if (Auth::user()->role !== 'admin') {
            return response()->json(['error' => 'Only admins can delete issues.'], 403);
        }

        try {
            $issue->delete();
            return response()->json(['message' => 'Issue deleted successfully.']);
        } catch (Exception $e) {
            LogFacade::error('Issue deletion failed: ' . $e->getMessage());
            return response()->json(['message' => 'Issue deletion failed.'], 500);
        }
    }
}
