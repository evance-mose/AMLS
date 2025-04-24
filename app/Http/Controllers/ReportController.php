<?php

namespace App\Http\Controllers;


use App\Models\Issue;
use App\Models\Log;
use App\Models\User;

use Illuminate\Http\Request;

class ReportController extends Controller
{

    public function monthly(Request $request)
    {
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
        $month = $request->input('month', date('F'));
        $year = $request->input('year', date('Y'));

        
        $monthNum = date('m', strtotime($month . ' 1'));

        $issues = Issue::whereMonth('created_at', $monthNum)
                        ->whereYear('created_at', $year)
                        ->with('User')
                        ->get();



        $logs = Log::whereMonth('created_at', $monthNum)
                    ->whereYear('created_at', $year)
                    ->with('User')
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
        $resolvedIssues = $issues->where('status', 'esolved')->count();
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
    
        return response()->json($reportData);
    }
    
    public function destroy(string $id)
    {
        //
    }
}
