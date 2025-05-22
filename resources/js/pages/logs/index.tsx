import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    CheckCircle,
    Clock,
    Cpu,
    Filter,
    Flag,
    Globe,
    HardDrive,
    HelpCircle,
    Loader2,
    Plus,
    Search,
    Shield,
    XCircle,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import LogFormDialog from './LogForm';

export default function Index({ data, issues, users }) {
    const { auth } = usePage<SharedData>().props;
    const [logs, setLogs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [selectedLog, setSelectedLog] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const breadcrumbs = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Audit logs',
            href: '/logs',
        },
    ];

    // Initialize logs only once when data changes
    useEffect(() => {
        if (data && Array.isArray(data)) {
            setLogs(data);
        }
    }, [data]);

    // Memoize filtered logs to prevent unnecessary recalculations
    const filteredLogs = useMemo(() => {
        return logs.filter((log) => {
            const matchesSearch =
                log.issue?.type?.toLowerCase().includes(searchTerm.toLowerCase()) || log.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
            const matchesPriority = priorityFilter === 'all' || log.priority === priorityFilter;

            return matchesSearch && matchesStatus && matchesPriority;
        });
    }, [logs, searchTerm, statusFilter, priorityFilter]);

    // Use useCallback to prevent function recreation on every render
    const handleSearchChange = useCallback((e) => {
        setSearchTerm(e.target.value);
    }, []);

    const handleStatusFilterChange = useCallback((e) => {
        setStatusFilter(e.target.value);
    }, []);

    const handlePriorityFilterChange = useCallback((e) => {
        setPriorityFilter(e.target.value);
    }, []);

    const handleSaveLog = useCallback(
        (logData) => {
            setLogs((prevLogs) => {
                if (selectedLog) {
                    // Update existing log
                    return prevLogs.map((log) => (log.id === selectedLog.id ? { ...log, ...logData } : log));
                } else {
                    // Add new log with a proper ID
                    const newId = Math.max(...prevLogs.map((log) => log.id || 0), 0) + 1;
                    return [...prevLogs, { id: newId, ...logData }];
                }
            });

            // Close dialog and reset state
            setSelectedLog(null);
            setIsDialogOpen(false);
        },
        [selectedLog],
    );

    const handleDeleteLog = useCallback((logId) => {
        if (confirm('Are you sure you want to delete this log?')) {
            setLogs((prevLogs) => prevLogs.filter((log) => log.id !== logId));
            router.delete(route('logs.destroy', logId), {
                preserveScroll: true,
            });
        }
    }, []);

    const handleEditLog = useCallback((log) => {
        setSelectedLog(log);
        setIsDialogOpen(true);
    }, []);

    const handleCreateNew = useCallback(() => {
        setSelectedLog(null);
        setIsDialogOpen(true);
    }, []);

    const handleCloseDialog = useCallback(() => {
        setIsDialogOpen(false);
        setSelectedLog(null);
    }, []);

    const getStatusBadge = useCallback((status) => {
        const statusConfig = {
            resolved: {
                icon: <CheckCircle size={16} className="text-green-600" />,
                text: 'Resolved',
                classes: 'bg-green-50 text-green-700 border-green-100',
            },
            closed: {
                icon: <XCircle size={16} className="text-gray-600" />,
                text: 'Closed',
                classes: 'bg-gray-50 text-gray-700 border-gray-100',
            },
            pending: {
                icon: <Clock size={16} className="text-amber-600" />,
                text: 'Pending',
                classes: 'bg-amber-50 text-amber-700 border-amber-100',
            },
            in_progress: {
                icon: <Loader2 size={16} className="text-blue-600" />,
                text: 'In Progress',
                classes: 'bg-blue-50 text-blue-700 border-blue-100',
            },
        };

        const config = statusConfig[status] || statusConfig.pending;

        return (
            <div className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${config.classes}`}>
                {config.icon}
                <span>{config.text}</span>
            </div>
        );
    }, []);

    const getPriorityBadge = useCallback((priority) => {
        const priorityConfig = {
            high: {
                icon: <Flag size={16} className="text-red-600" />,
                text: 'High',
                classes: 'bg-red-50 text-red-700 border-red-100',
            },
            medium: {
                icon: <Flag size={16} className="text-amber-600" />,
                text: 'Medium',
                classes: 'bg-amber-50 text-amber-700 border-amber-100',
            },
            low: {
                icon: <Flag size={16} className="text-blue-600" />,
                text: 'Low',
                classes: 'bg-blue-50 text-blue-700 border-blue-100',
            },
        };

        const config = priorityConfig[priority] || priorityConfig.medium;

        return (
            <div className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${config.classes}`}>
                {config.icon}
                <span>{config.text}</span>
            </div>
        );
    }, []);

    const getIssueTypeIcon = useCallback((type) => {
        const typeIcons = {
            hardware: <AlertCircle size={16} className="text-purple-600" />,
            software: <AlertCircle size={16} className="text-blue-600" />,
            network: <AlertCircle size={16} className="text-teal-600" />,
            security: <AlertCircle size={16} className="text-red-600" />,
            other: <AlertCircle size={16} className="text-gray-600" />,
        };

        return typeIcons[type] || typeIcons.other;
    }, []);

    const getCategoryIcon = useCallback((category) => {
        switch (category) {
            case 'hardware':
                return <HardDrive className="h-5 w-5" />;
            case 'software':
                return <Cpu className="h-5 w-5" />;
            case 'network':
                return <Globe className="h-5 w-5" />;
            case 'security':
                return <Shield className="h-5 w-5" />;
            default:
                return <HelpCircle className="h-5 w-5" />;
        }
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Log Management" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
                    <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="relative w-full flex-1">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500" />
                            <Input
                                type="search"
                                placeholder="Search by fault or user name..."
                                className="h-10 w-full border-gray-200 pr-4 pl-10 focus:border-blue-500 focus:ring-blue-500"
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                        </div>

                        <div className="flex w-full items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 sm:w-auto">
                            <Filter size={16} className="shrink-0 text-gray-500" />
                            <select
                                className="w-full bg-transparent text-sm text-gray-700 focus:outline-none"
                                value={statusFilter}
                                onChange={handleStatusFilterChange}
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="in_progress">In Progress</option>
                                <option value="resolved">Resolved</option>
                                <option value="closed">Closed</option>
                            </select>
                        </div>

                        <div className="flex w-full items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 sm:w-auto">
                            <Flag size={16} className="shrink-0 text-gray-500" />
                            <select
                                className="w-full bg-transparent text-sm text-gray-700 focus:outline-none"
                                value={priorityFilter}
                                onChange={handlePriorityFilterChange}
                            >
                                <option value="all">All Priority</option>
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                            </select>
                        </div>

                        {auth.user.role === 'admin' && (
                            <Button
                                onClick={handleCreateNew}
                                className="flex w-full items-center justify-center gap-2 bg-black text-white hover:bg-gray-700 sm:w-auto"
                            >
                                <Plus size={16} />
                                <span>Assign Log</span>
                            </Button>
                        )}
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Logs</CardTitle>
                        <CardDescription>Maintenance logs sorted by recency</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow className="uppercase">
                                    <TableHead className="font-medium">Issue ID</TableHead>
                                    <TableHead className="font-medium">ATM ID</TableHead>
                                    <TableHead className="font-medium">Category</TableHead>
                                    <TableHead className="font-medium">Action</TableHead>
                                    <TableHead className="font-medium">Priority</TableHead>
                                    <TableHead className="font-medium">Status</TableHead>
                                    <TableHead className="font-medium">Assigned To</TableHead>
                                    <TableHead className="w-24 text-right font-medium"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredLogs.length > 0 ? (
                                    filteredLogs.map((log) => (
                                        <TableRow
                                            key={log.id}
                                            onClick={() => handleEditLog(log)}
                                            className="cursor-pointer border-b border-gray-100 transition-colors hover:bg-gray-50"
                                        >
                                            <TableCell className="font-medium">{`#${log.issue?.id || log.id}`}</TableCell>
                                            <TableCell className="font-medium text-gray-800">
                                                {log.issue?.atm_id || ''}
                                                <div className="text-xs text-gray-500">
                                                    {log.created_at ? new Date(log.created_at).toLocaleDateString() : 'No date'}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <span className="uppercase">{log.issue?.category?.replace(/_/g, ' ') || 'N/A'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-gray-600">
                                                {log.action_taken || 'No action specified'}
                                                <div className="text-xs text-gray-500">
                                                    {log.notes?.substring(0, 40) || 'No additional notes'}
                                                    {log.notes?.length > 40 ? '...' : ''}
                                                </div>
                                            </TableCell>
                                            <TableCell>{getPriorityBadge(log.priority || 'medium')}</TableCell>
                                            <TableCell>{getStatusBadge(log.status || 'pending')}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-gray-700">{log.user?.name || 'Unassigned'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 border-gray-200 px-2 hover:bg-blue-50 hover:text-blue-600"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEditLog(log);
                                                        }}
                                                    >
                                                        View
                                                    </Button>
                                                    {auth.user.role === 'admin' && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-8 border-gray-200 px-2 hover:bg-red-50 hover:text-red-600"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteLog(log.id);
                                                            }}
                                                        >
                                                            Delete
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-32 text-center">
                                            <div className="flex flex-col items-center justify-center gap-2 text-gray-500">
                                                <AlertCircle size={24} />
                                                <p>No logs found matching your search criteria</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                    <CardFooter className="justify-between border-t px-6 py-3">
                        <div className="text-sm text-gray-500">
                            Showing <span className="font-medium">{filteredLogs.length}</span> of <span className="font-medium">{logs.length}</span>{' '}
                            logs
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="h-8 border-gray-200 px-3">
                                Previous
                            </Button>
                            <div className="flex items-center">
                                <span className="rounded-md bg-blue-50 px-3 py-1 font-medium text-blue-700">1</span>
                                <span className="cursor-pointer px-3 py-1 hover:bg-gray-50">2</span>
                                <span className="cursor-pointer px-3 py-1 hover:bg-gray-50">3</span>
                            </div>
                            <Button variant="outline" size="sm" className="h-8 border-gray-200 px-3">
                                Next
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            </div>

            {isDialogOpen && (
                <LogFormDialog
                    log={selectedLog}
                    isOpen={isDialogOpen}
                    issues={issues}
                    users={users}
                    onSave={handleSaveLog}
                    onClose={handleCloseDialog}
                />
            )}
        </AppLayout>
    );
}
