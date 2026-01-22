<?php

namespace App\Http\Controllers;


use App\Models\Issue;
use App\Models\Log;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReportController extends Controller
{

    public function monthly(Request $request)
    {
        // Only admins can access reports
        if (Auth::user()->role !== 'admin') {
            abort(403, 'Only admins can access reports.');
        }

        $month = $request->input('month', date('F'));
        $year = $request->input('year', date('Y'));


        $monthNum = date('m', strtotime('$month 1'));


        $issues = Issue::whereMonth('created_at', $monthNum)
                        ->whereYear('created_at', $year)
                        ->with('user')
                        ->get();



        $logs = Log::whereMonth('created_at', $monthNum)
                    ->whereYear('created_at', $year)
                    ->with('user')
                    ->get();
                    
        $users = User::all()->keyBy('id')->map(function ($user) {
            return [
                'first_name' => $user->name,
                'last_name' => '',
                'email' => $user->email,
                'role' => 'admin',
            ];
        });

        $totalIssues = $issues->count();
        $resolvedIssues = $issues->where('status', 'Resolved')->count();
        $pendingIssues = $totalIssues - $resolvedIssues;


        $avgResolutionTime= '0h';
        
        $reportData = [
            'reportInfo' => [
                'id' => 'RPT-' . $year . '-' . $monthNum,
                'date' => now()->format('Y-m-d'),
                'generatedBy' => 'System',
            ],
            'issueStats' => [
                'total' => $totalIssues,
                'resolved' => $resolvedIssues,
                'pending' => $pendingIssues,
                'avgResolutionTime' => $avgResolutionTime,
            ],
            'issues' => $issues,
            'maintenanceLogs' => $logs,
            'users' => $users,
           
        ];


        return Inertial::render("dashboard", [
                'initialData' => $reportData
        ]);


    }



    public function apiMonthly(Request $request)
    {
        // Only admins can access reports
        if (Auth::user()->role !== 'admin') {
            return response()->json(['error' => 'Only admins can access reports.'], 403);
        }

        $month = $request->input('month', date('F'));
        $year = $request->input('year', date('Y'));

        
        $monthNum = date('m', strtotime($month . ' 1'));

        $issues = Issue::whereMonth('created_at', $monthNum)
                        ->whereYear('created_at', $year)
                        ->with('User')
                        ->get();


        $latestIssues = Issue::whereMonth('created_at', $monthNum)
                        ->whereYear('created_at', $year)
                        ->with('user')
                        ->latest()  
                        ->take(5)  
                        ->get();

        $logs = Log::whereMonth('created_at', $monthNum)
                    ->whereYear('created_at', $year)
                    ->with('User')
                    ->get();

        $latestLogs = Log::whereMonth('created_at', $monthNum)
                    ->whereYear('created_at', $year)
                    ->with('user')
                    ->latest()  
                    ->take(5)  
                    ->get();

        $users = User::all()->keyBy('id')->map(function ($user) {
            return [
                'first_name' => $user->name,
                'last_name' => '',
                'email' => $user->email,
                'role' => 'admin',
            ];
        });

        $totalIssues = $issues->count();
        $resolvedIssues = $issues->where('status', 'resolved')->count();
        $pendingIssues = $totalIssues - $resolvedIssues;


        $avgResolutionTime= '0h';
        
        $reportData = [
            'reportInfo' => [
                'id' => 'RPT-' . $year . '-' . $monthNum,
                'date' => now()->format('Y-m-d'),
                'generatedBy' => 'System',
            ],
            'issueStats' => [
                'total' => $totalIssues,
                'resolved' => $resolvedIssues,
                'pending' => $pendingIssues,
                'avgResolutionTime' => $avgResolutionTime,
            ],
            'issues' => $latestIssues,
            'maintenanceLogs' => $latestLogs,
            'users' => $users,
           
        ];
    
        return response()->json($reportData);
    }
    
    public function destroy(string $id)
    {
        //
    }
}