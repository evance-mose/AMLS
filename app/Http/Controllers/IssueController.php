<?php

namespace App\Http\Controllers;

use App\Models\Issue;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
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
    
        Issue::create([
            ...$validated,
            'user_id' => Auth()->id()
        ]);
    
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
