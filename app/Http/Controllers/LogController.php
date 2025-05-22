<?php

namespace App\Http\Controllers;

use App\Models\Log;
use App\Models\User;
use App\Models\Issue;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Notifications\IssueAssigned;
use Illuminate\Support\Facades\Notification;

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


    public function create()
    {
        //
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

        $log = Log::create($validate);

        if ($log->user_id) {
            $assignedUser = User::find($log->user_id);
            Notification::send($assignedUser, new IssueAssigned($log, $assignedUser));
        }

        return redirect()->back()->with('success', 'Log created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Log $log)
    {
     
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Log $log)
    {
   
    }

    /**
     * Update the specified resource in storage.
     */
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
        $log->update($validate);

        // Send notification if user is assigned or changed
        if ($log->user_id && ($oldUserId !== $log->user_id)) {
            $assignedUser = User::find($log->user_id);
            Notification::send($assignedUser, new IssueAssigned($log, $assignedUser));
        }

        return redirect()->back()->with('success', 'Log updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
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
