<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Issue;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Exception;

class ApiIssueController extends Controller
{
    public function index()
    {
        $issuesQuery = Issue::with(['user', 'assignedUser'])->where('status', '!=', 'resolved');

        return response()->json($issuesQuery->get());
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
    
        return response()->json(['message' => 'Issue created successfully.', 'issue' => $issue], 201);
    }

    public function show(Issue $issue)
    {
        return response()->json($issue->load(['user', 'assignedUser']));
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

        return response()->json(['message' => 'Issue updated successfully.', 'issue' => $issue]);
    }

    public function destroy(Issue $issue)
    {
        try {
            $issue->delete();
            return response()->json(['message' => 'Issue deleted successfully.']);
        } catch (Exception $e) {
            Log::error('Issue deletion failed: ' . $e->getMessage());
            return response()->json(['message' => 'Issue deletion failed.'], 500);
        }
    }
}
