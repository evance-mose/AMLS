<?php

namespace App\Http\Controllers;

use App\Models\Log;
use App\Models\User;
use App\Models\Issue;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Notifications\IssueAssigned;
use App\Notifications\IssueResolved;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\DB;

class LogController extends Controller
{

    public function index()
    {
        return Inertia::render('logs/index', [
            'data' => Log::with(['user', 'issue'])->get(),
            'issues' => Issue::all(),
            'users' => User::all()
        ]);
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
    
            if ($log->user_id && $log->issue_id) {
                $assignedUser = User::find($log->user_id);
                $issue = Issue::find($log->issue_id);
                
                Notification::send($assignedUser, new IssueAssigned($log, $assignedUser));
               
                $issue->update(['status' => 'acknowledged']);
            }
        });
    
        return redirect()->back()->with('success', 'Log created successfully.');
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
            }

            if ($log->issue_id && $validate['status'] === 'resolved' && $oldStatus !== 'resolved') {
                $issue = Issue::find($log->issue_id);
                if ($issue) {
                    $issue->update(['status' => 'resolved']);
                    
                    // Send notification to issue reporter that issue has been resolved
                    if ($issue->user_id) {
                        $issueReporter = User::find($issue->user_id);
                        if ($issueReporter) {
                            Notification::send($issueReporter, new IssueResolved($issue, $log));
                        }
                    }
                }
            }
        });

        return redirect()->back()->with('success', 'Log updated successfully.');
    }

    public function destroy(string $id)
    {
        try {
            $log = Log::findOrFail($id);
            $log->delete();
            return redirect()->back()->with('success', 'Log deleted successfully.');
        } catch (Exception $e) {
            Log::error('log deletion failed: ' . $e->getMessage());
        }
    }
}