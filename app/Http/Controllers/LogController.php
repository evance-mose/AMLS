<?php

namespace App\Http\Controllers;

use App\Models\Issue;
use App\Models\Log;
use App\Models\User;
use App\Notifications\IssueAssigned;
use App\Notifications\IssueResolved;
use App\Services\TechnicianAssignmentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Inertia\Inertia;

class LogController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $logsQuery = Log::with(['user', 'issue']);

        // Role-based filtering
        if ($user->role === 'technician') {
            // Technicians only see logs for their assigned issues
            $logsQuery->where('user_id', $user->id);
        } elseif ($user->role === 'admin') {
            // Admins see all logs
            // No filter needed
        } else {
            // Custodians cannot access logs
            abort(403, 'You do not have permission to view logs.');
        }

        return Inertia::render('logs/index', [
            'data' => $logsQuery->get(),
            'issues' => $user->role === 'admin' ? Issue::all() : [],
            'users' => $user->role === 'admin' ? User::all() : [],
        ]);
    }

    public function show(Log $log)
    {
        $user = Auth::user();

        if ($user->role === 'admin') {
            return Inertia::render('logs/show', [
                'log' => $log->load(['user', 'issue']),
            ]);
        }

        if ($user->role === 'technician' && $log->user_id !== $user->id) {
            abort(403, 'You can only view logs assigned to you.');
        }

        if ($user->role === 'custodian') {
            abort(403, 'Custodians cannot view logs.');
        }

        return Inertia::render('logs/show', [
            'log' => $log->load(['user', 'issue']),
        ]);
    }

    public function store(Request $request)
    {
        if (! in_array(Auth::user()->role, ['technician', 'admin'], true)) {
            abort(403, 'Only technicians and administrators can create logs.');
        }

        $validate = $request->validate([
            'user_id' => 'nullable|exists:users,id',
            'issue_id' => 'nullable|exists:issues,id',
            'action_taken' => 'nullable|string|max:255',
            'status' => 'required|in:pending,in_progress,resolved,closed',
            'priority' => 'required|in:low,medium,high',
        ]);

        DB::transaction(function () use ($validate) {
            $log = Log::create($validate);

            if ($log->issue_id) {
                $issue = Issue::find($log->issue_id);

                // Automatic technician assignment if issue exists but no user assigned
                if ($issue && ! $log->user_id && ! $issue->assigned_to) {
                    $assignmentService = new TechnicianAssignmentService;
                    $assignedTechnician = $assignmentService->assignTechnician($issue);

                    if ($assignedTechnician) {
                        $log->update(['user_id' => $assignedTechnician->id]);
                        $issue->update([
                            'assigned_to' => $assignedTechnician->id,
                            'status' => 'acknowledged',
                        ]);

                        Notification::send($assignedTechnician, new IssueAssigned($log, $assignedTechnician));
                    }
                } elseif ($log->user_id && $issue) {
                    // Manual assignment via log
                    $assignedUser = User::find($log->user_id);

                    Notification::send($assignedUser, new IssueAssigned($log, $assignedUser));

                    $issue->update([
                        'status' => 'acknowledged',
                        'assigned_to' => $log->user_id,
                    ]);
                }
            }
        });

        return redirect()->back()->with('success', 'Log created successfully.');
    }

    public function update(Request $request, Log $log)
    {
        $user = Auth::user();

        if (! in_array($user->role, ['technician', 'admin'], true)) {
            abort(403, 'Only technicians and administrators can update logs.');
        }

        if ($user->role === 'technician' && $log->user_id !== $user->id) {
            abort(403, 'You can only update logs assigned to you.');
        }

        $validate = $request->validate([
            'user_id' => 'nullable|exists:users,id',
            'issue_id' => 'nullable|exists:issues,id',
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

                // Update the issue's assigned_to field when user changes
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

        return redirect()->back()->with('success', 'Log updated successfully.');
    }

    public function destroy(string $id)
    {
        // Only admins can delete logs
        if (Auth::user()->role !== 'admin') {
            abort(403, 'Only admins can delete logs.');
        }

        try {
            $log = Log::findOrFail($id);
            $log->delete();

            return redirect()->back()->with('success', 'Log deleted successfully.');
        } catch (Exception $e) {
            \Illuminate\Support\Facades\Log::error('log deletion failed: '.$e->getMessage());
        }
    }
}
