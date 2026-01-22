<?php

namespace App\Http\Controllers;

use App\Models\Issue;
use App\Models\Log;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $data = [];

        switch ($user->role) {
            case 'admin':
                $data = $this->getAdminDashboardData();
                break;
            case 'custodian':
                $data = $this->getCustodianDashboardData($user);
                break;
            case 'technician':
                $data = $this->getTechnicianDashboardData($user);
                break;
        }

        return Inertia::render('dashboard', $data);
    }

    private function getAdminDashboardData()
    {
        // Admin sees all data
        $totalIssues = Issue::count();
        $resolvedIssues = Issue::whereIn('status', ['resolved', 'closed'])->count();
        $pendingIssues = Issue::whereNotIn('status', ['resolved', 'closed'])->count();
        $totalUsers = User::count();
        $totalTechnicians = User::where('role', 'technician')->where('status', 'active')->count();
        $totalCustodians = User::where('role', 'custodian')->where('status', 'active')->count();
        $totalLogs = Log::count();

        // Recent issues
        $recentIssues = Issue::with(['user', 'assignedUser'])
            ->latest()
            ->take(10)
            ->get();

        // Recent logs
        $recentLogs = Log::with(['user', 'issue'])
            ->latest()
            ->take(10)
            ->get();

        // Issues by status
        $issuesByStatus = [
            'pending' => Issue::where('status', 'pending')->count(),
            'acknowledged' => Issue::where('status', 'acknowledged')->count(),
            'in_progress' => Issue::where('status', 'in_progress')->count(),
            'resolved' => Issue::where('status', 'resolved')->count(),
            'closed' => Issue::where('status', 'closed')->count(),
        ];

        // Issues by priority
        $issuesByPriority = [
            'high' => Issue::where('priority', 'high')->whereNotIn('status', ['resolved', 'closed'])->count(),
            'medium' => Issue::where('priority', 'medium')->whereNotIn('status', ['resolved', 'closed'])->count(),
            'low' => Issue::where('priority', 'low')->whereNotIn('status', ['resolved', 'closed'])->count(),
        ];

        return [
            'role' => 'admin',
            'stats' => [
                'totalIssues' => $totalIssues,
                'resolvedIssues' => $resolvedIssues,
                'pendingIssues' => $pendingIssues,
                'totalUsers' => $totalUsers,
                'totalTechnicians' => $totalTechnicians,
                'totalCustodians' => $totalCustodians,
                'totalLogs' => $totalLogs,
                'resolutionRate' => $totalIssues > 0 ? round(($resolvedIssues / $totalIssues) * 100, 2) : 0,
            ],
            'recentIssues' => $recentIssues,
            'recentLogs' => $recentLogs,
            'issuesByStatus' => $issuesByStatus,
            'issuesByPriority' => $issuesByPriority,
        ];
    }

    private function getCustodianDashboardData($user)
    {
        // Custodians see only their created issues
        $myIssues = Issue::where('user_id', $user->id);
        $totalIssues = $myIssues->count();
        $resolvedIssues = $myIssues->whereIn('status', ['resolved', 'closed'])->count();
        $pendingIssues = $myIssues->whereNotIn('status', ['resolved', 'closed'])->count();

        // Recent issues created by this custodian
        $recentIssues = Issue::with(['user', 'assignedUser'])
            ->where('user_id', $user->id)
            ->latest()
            ->take(10)
            ->get();

        // Issues by status (only my issues)
        $issuesByStatus = [
            'pending' => Issue::where('user_id', $user->id)->where('status', 'pending')->count(),
            'acknowledged' => Issue::where('user_id', $user->id)->where('status', 'acknowledged')->count(),
            'in_progress' => Issue::where('user_id', $user->id)->where('status', 'in_progress')->count(),
            'resolved' => Issue::where('user_id', $user->id)->where('status', 'resolved')->count(),
            'closed' => Issue::where('user_id', $user->id)->where('status', 'closed')->count(),
        ];

        // Issues by priority (only my issues)
        $issuesByPriority = [
            'high' => Issue::where('user_id', $user->id)->where('priority', 'high')->whereNotIn('status', ['resolved', 'closed'])->count(),
            'medium' => Issue::where('user_id', $user->id)->where('priority', 'medium')->whereNotIn('status', ['resolved', 'closed'])->count(),
            'low' => Issue::where('user_id', $user->id)->where('priority', 'low')->whereNotIn('status', ['resolved', 'closed'])->count(),
        ];

        return [
            'role' => 'custodian',
            'stats' => [
                'totalIssues' => $totalIssues,
                'resolvedIssues' => $resolvedIssues,
                'pendingIssues' => $pendingIssues,
                'resolutionRate' => $totalIssues > 0 ? round(($resolvedIssues / $totalIssues) * 100, 2) : 0,
            ],
            'recentIssues' => $recentIssues,
            'issuesByStatus' => $issuesByStatus,
            'issuesByPriority' => $issuesByPriority,
        ];
    }

    private function getTechnicianDashboardData($user)
    {
        // Technicians see only their assigned issues
        $myIssues = Issue::where('assigned_to', $user->id);
        $totalIssues = $myIssues->count();
        $resolvedIssues = $myIssues->whereIn('status', ['resolved', 'closed'])->count();
        $pendingIssues = $myIssues->whereNotIn('status', ['resolved', 'closed'])->count();

        // My assigned issues
        $assignedIssues = Issue::with(['user', 'assignedUser'])
            ->where('assigned_to', $user->id)
            ->whereNotIn('status', ['resolved', 'closed'])
            ->latest()
            ->take(10)
            ->get();

        // My logs
        $myLogs = Log::with(['user', 'issue'])
            ->where('user_id', $user->id)
            ->latest()
            ->take(10)
            ->get();

        // Issues by status (only my assigned)
        $issuesByStatus = [
            'pending' => Issue::where('assigned_to', $user->id)->where('status', 'pending')->count(),
            'acknowledged' => Issue::where('assigned_to', $user->id)->where('status', 'acknowledged')->count(),
            'in_progress' => Issue::where('assigned_to', $user->id)->where('status', 'in_progress')->count(),
            'resolved' => Issue::where('assigned_to', $user->id)->where('status', 'resolved')->count(),
            'closed' => Issue::where('assigned_to', $user->id)->where('status', 'closed')->count(),
        ];

        // Issues by priority (only my assigned)
        $issuesByPriority = [
            'high' => Issue::where('assigned_to', $user->id)->where('priority', 'high')->whereNotIn('status', ['resolved', 'closed'])->count(),
            'medium' => Issue::where('assigned_to', $user->id)->where('priority', 'medium')->whereNotIn('status', ['resolved', 'closed'])->count(),
            'low' => Issue::where('assigned_to', $user->id)->where('priority', 'low')->whereNotIn('status', ['resolved', 'closed'])->count(),
        ];

        return [
            'role' => 'technician',
            'stats' => [
                'totalIssues' => $totalIssues,
                'resolvedIssues' => $resolvedIssues,
                'pendingIssues' => $pendingIssues,
                'totalLogs' => Log::where('user_id', $user->id)->count(),
                'resolutionRate' => $totalIssues > 0 ? round(($resolvedIssues / $totalIssues) * 100, 2) : 0,
            ],
            'assignedIssues' => $assignedIssues,
            'myLogs' => $myLogs,
            'issuesByStatus' => $issuesByStatus,
            'issuesByPriority' => $issuesByPriority,
        ];
    }
}
