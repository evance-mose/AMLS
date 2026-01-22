import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Link, router } from '@inertiajs/react';
import {
    AlertCircle,
    CheckCircle,
    Clock,
    Plus,
    TrendingUp,
    XCircle,
    Loader2,
} from 'lucide-react';

export default function CustodianDashboard({ stats, recentIssues, issuesByStatus, issuesByPriority }) {
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
                    <h1 className="text-3xl font-bold tracking-tight">Fault Logging Dashboard</h1>
                    <p className="text-muted-foreground">Log and track ATM faults and issues</p>
                </div>
                <Button onClick={() => router.visit(route('issues.index'))}>
                    <Plus className="mr-2 h-4 w-4" />
                    Log New Fault
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">My Issues</CardTitle>
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
                        <p className="text-xs text-muted-foreground">Of your issues resolved</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Pending Issues</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pendingIssues}</div>
                        <p className="text-xs text-muted-foreground">Awaiting resolution</p>
                    </CardContent>
                </Card>
            </div>

            {/* Issues by Status and Priority */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>My Issues by Status</CardTitle>
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
                        <CardTitle>My Issues by Priority</CardTitle>
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
                    <CardTitle>My Recent Fault Reports</CardTitle>
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
                                        No issues logged yet. <button onClick={() => router.visit(route('issues.index'))} className="text-primary hover:underline">Log your first fault</button>
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

