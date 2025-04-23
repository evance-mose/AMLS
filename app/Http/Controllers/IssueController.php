<?php

namespace App\Http\Controllers;

use App\Models\Issue;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
class IssueController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    //

    public function index()
    {
        return Inertia::render('issues/index', [
            'issues' => Issue::with(['user'])->get(),
        ]);
    }    

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'atm_id' => 'required|string|max:255',
            'type' => 'required|in:hardware,software,network,security,other',
            'description' => 'nullable|string',
            'status' => 'required|in:pending,in_progress,resolved,closed',
        ]);
    
        Issue::create([
            ...$validated,
            'user_id' => Auth()->id()
        ]);
    
        return redirect()->back()->with('success', 'Issue created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Issue $issue)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Issue $issue)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Issue $issue)
    {
        $validated = $request->validate([
            'user_id' => 'nullable|exists:users,id',
            'title' => 'required|string|max:255',
            'atm_id' => 'required|string|max:255',
            'type' => 'required|in:hardware,software,network,security,other',
            'description' => 'nullable|string',
            'status' => 'required|in:pending,in_progress,resolved,closed',
        ]);

        $issue->update($validated);

        return redirect()->back()->with('success', 'Log updated successfully.');
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
