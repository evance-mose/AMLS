import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Link, router } from '@inertiajs/react';
import {
    AlertCircle,
    CheckCircle,
    Clock,
    FileText,
    Loader2,
    MapPin,
    Settings,
    TrendingUp,
    Users,
    Wrench,
    XCircle,
} from 'lucide-react';

export default function AdminDashboard({ stats, recentIssues, recentLogs, issuesByStatus, issuesByPriority, totalUsers, totalTechnicians, totalCustodians, totalLogs }) {
    const getStatusBadge = (status) => {
        const statusConfig = {
            resolved: { icon: <CheckCircle size={14} className="text-green-600" />, text: 'Resolved', classes: 'bg-green-50 text-green-700 border-green-100' },
            closed: { icon: <XCircle size={14} className="text-gray-600" />, text: 'Closed', classes: 'bg-gray-50 text-gray-700 border-gray-100' },
            pending: { icon: <Clock size={14} className="text-amber-600" />, text: 'Pending', classes: 'bg-amber-50 text-amber-700 border-amber-100' },
            acknowledged: { icon: <CheckCircle size={14} className="text-blue-600" />, text: 'Acknowledged', classes: 'bg-blue-50 text-blue-700 border-blue-100' },
            in_progress: { icon: <Loader2 size={14} className="animate-spin text-blue-600" />, text: 'In Progress', classes: 'bg-blue-50 text-blue-700 border-blue-100' },
        };
        const config = statusConfig[status] || statusConfig.pending;
        return (
            <div className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${config.classes}`}>
                {config.icon}
                <span>{config.text}</span>
            </div>
        );
    };

    const getPriorityBadge = (priority) => {
        const priorityConfig = {
            high: { text: 'High', classes: 'bg-red-50 text-red-700 border-red-100' },
            medium: { text: 'Medium', classes: 'bg-amber-50 text-amber-700 border-amber-100' },
            low: { text: 'Low', classes: 'bg-blue-50 text-blue-700 border-blue-100' },
        };
        const config = priorityConfig[priority?.toLowerCase()] || priorityConfig.medium;
        return (
            <div className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${config.classes}`}>
                <span>{config.text}</span>
            </div>
        );
    };

    return (
        <div className="flex flex-1 flex-col gap-5 p-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                    <p className="text-muted-foreground">Overview of system operations and management</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => router.visit(route('users.index'))}>
                        <Users className="mr-2 h-4 w-4" />
                        Manage Users
                    </Button>
                    <Button onClick={() => router.visit(route('reports.monthly'))} variant="outline">
                        <FileText className="mr-2 h-4 w-4" />
                        View Reports
                    </Button>
                    <Button onClick={() => router.visit(route('location-trail.index'))} variant="outline">
                        <MapPin className="mr-2 h-4 w-4" />
                        Technician locations
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalIssues}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.resolvedIssues} resolved, {stats.pendingIssues} pending
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.resolutionRate}%</div>
                        <p className="text-xs text-muted-foreground">Issues successfully resolved</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalUsers}</div>
                        <p className="text-xs text-muted-foreground">
                            {totalTechnicians} technicians, {totalCustodians} custodians
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Maintenance Logs</CardTitle>
                        <Wrench className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalLogs}</div>
                        <p className="text-xs text-muted-foreground">Total maintenance actions</p>
                    </CardContent>
                </Card>
            </div>

            {/* Issues by Status */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Issues by Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {Object.entries(issuesByStatus).map(([status, count]) => (
                                <div key={status} className="flex items-center justify-between">
                                    <span className="text-sm capitalize">{status.replace('_', ' ')}</span>
                                    <span className="font-semibold">{count}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Issues by Priority</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {Object.entries(issuesByPriority).map(([priority, count]) => (
                                <div key={priority} className="flex items-center justify-between">
                                    <span className="text-sm capitalize">{priority}</span>
                                    <span className="font-semibold">{count}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Issues */}
            <Card>
                <CardHeader className="flex items-center justify-between">
                    <CardTitle>Recent Issues</CardTitle>
                    <Button onClick={() => router.visit(route('issues.index'))} variant="outline" size="sm">
                        View All
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>ATM ID</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Priority</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Assigned To</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentIssues && recentIssues.length > 0 ? (
                                recentIssues.map((issue) => (
                                    <TableRow key={issue.id}>
                                        <TableCell className="font-mono text-sm">#{issue.id}</TableCell>
                                        <TableCell>{issue.location}</TableCell>
                                        <TableCell>{issue.atm_id}</TableCell>
                                        <TableCell className="capitalize">{issue.category.replace(/_/g, ' ')}</TableCell>
                                        <TableCell>{getPriorityBadge(issue.priority)}</TableCell>
                                        <TableCell>{getStatusBadge(issue.status)}</TableCell>
                                        <TableCell>{issue.assignedUser?.name || 'Unassigned'}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                                        No issues found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Recent Logs */}
            <Card>
                <CardHeader className="flex items-center justify-between">
                    <CardTitle>Recent Maintenance Logs</CardTitle>
                    <Button onClick={() => router.visit(route('logs.index'))} variant="outline" size="sm">
                        View All
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Technician</TableHead>
                                <TableHead>Issue ID</TableHead>
                                <TableHead>Action Taken</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentLogs && recentLogs.length > 0 ? (
                                recentLogs.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell className="font-mono text-sm">#{log.id}</TableCell>
                                        <TableCell>{log.user?.name || 'N/A'}</TableCell>
                                        <TableCell>{log.issue_id ? `#${log.issue_id}` : 'N/A'}</TableCell>
                                        <TableCell className="max-w-md truncate">{log.action_taken || 'No action'}</TableCell>
                                        <TableCell>{getStatusBadge(log.status)}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                                        No logs found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

