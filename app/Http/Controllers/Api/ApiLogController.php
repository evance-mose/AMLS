<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Log;
use App\Models\User;
use App\Models\Issue;
use App\Services\TechnicianAssignmentService;
use Illuminate\Http\Request;
use App\Notifications\IssueAssigned;
use App\Notifications\IssueResolved;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class ApiLogController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $logsQuery = Log::with(['user', 'issue']);
        if ($user && $user->role === 'technician') {
            $logsQuery->where('user_id', $user->id);
        }
        return response()->json($logsQuery->get());
    }

    public function store(Request $request)
    {
        $validate = $request->validate([
            'user_id' => 'nullable|exists:users,id',
            "issue_id" =>'nullable|exists:issues,id',
            'action_taken' => 'nullable|string|max:255',
            'status' => 'required|in:pending,in_progress,resolved,closed',
            'priority' => 'required|in:low,medium,high',
        ]);
    
        DB::transaction(function () use ($validate) {
            $log = Log::create($validate);
    
            if ($log->issue_id) {
                $issue = Issue::find($log->issue_id);
                
                // Automatic technician assignment if issue exists but no user assigned
                if ($issue && !$log->user_id && !$issue->assigned_to) {
                    $assignmentService = new TechnicianAssignmentService();
                    $assignedTechnician = $assignmentService->assignTechnician($issue);
                    
                    if ($assignedTechnician) {
                        $log->update(['user_id' => $assignedTechnician->id]);
                        $issue->update([
                            'assigned_to' => $assignedTechnician->id,
                            'status' => 'acknowledged'
                        ]);
                        
                        Notification::send($assignedTechnician, new IssueAssigned($log, $assignedTechnician));
                    }
                } elseif ($log->user_id && $issue) {
                    // Manual assignment via log
                    $assignedUser = User::find($log->user_id);
                    
                    Notification::send($assignedUser, new IssueAssigned($log, $assignedUser));
                   
                    $issue->update([
                        'status' => 'acknowledged',
                        'assigned_to' => $log->user_id
                    ]);
                }
            }
        });
    
        return response()->json(['message' => 'Log created successfully.'], 201);
    }

    public function update(Request $request, Log $log)
    {
        $validate = $request->validate([
            'user_id' => 'nullable|exists:users,id',
            "issue_id" =>'nullable|exists:issues,id',
            'action_taken' => 'required|string|max:255',
            'status' => 'required|in:pending,in_progress,resolved,closed',
            'priority' => 'required|in:low,medium,high',
        ]);

        $oldUserId = $log->user_id;
        $oldStatus = $log->status;
        
        DB::transaction(function () use ($validate, $log, $oldUserId, $oldStatus) {
            $log->update($validate);

            if ($log->user_id && ($oldUserId !== $log->user_id)) {
                $assignedUser = User::find($log->user_id);
                Notification::send($assignedUser, new IssueAssigned($log, $assignedUser));
                
                if ($log->issue_id) {
                    $issue = Issue::find($log->issue_id);
                    if ($issue) {
                        $issue->update(['assigned_to' => $log->user_id]);
                    }
                }
            }

            if ($log->issue_id && $validate['status'] === 'resolved' && $oldStatus !== 'resolved') {
                $issue = Issue::find($log->issue_id);
                if ($issue) {
                    $issue->update(['status' => 'resolved']);
                    
                    $notifiables = collect();
                    if ($issue->user_id) {
                        $issueReporter = User::find($issue->user_id);
                        if ($issueReporter) {
                            $notifiables->push($issueReporter);
                        }
                    }
                    $admins = User::admins()->get();
                    $notifiables = $notifiables->merge($admins)->unique('id');
                    if ($notifiables->isNotEmpty()) {
                        Notification::send($notifiables, new IssueResolved($issue, $log));
                    }
                }
            }
        });

        return response()->json(['message' => 'Log updated successfully.']);
    }

    public function show(Log $log)
    {
        return response()->json($log->load(['user', 'issue']));
    }

    public function destroy(Log $log)
    {
        try {
            $log->delete();
            return response()->json(['message' => 'Log deleted successfully.']);
        } catch (Exception $e) {
            Log::error('log deletion failed: ' . $e->getMessage());
            return response()->json(['message' => 'Log deletion failed.'], 500);
        }
    }
}
