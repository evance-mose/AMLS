import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { AlertCircle, CheckCircle, Clock, Filter, Loader2, Plus, Search, XCircle } from 'lucide-react';
import { useState } from 'react';
import LogFormDialog from './LogForm';

export default function Index({ data }) {
    const [logs, setLogs] = useState(data);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedLog, setSelectedLog] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const breadcrumbs = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Logs',
            href: '/logs',
        },
    ];

    const capitalizeEachWord = (str) => {
        return str
            .split(' ')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const filteredLogs = logs.filter((log) => {
        const matchesSearch =
            log.issue?.type?.toLowerCase().includes(searchTerm.toLowerCase()) || log.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());

        if (statusFilter === 'all') return matchesSearch;
        return matchesSearch && log.status === statusFilter;
    });

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleSaveLog = (logData) => {
        if (selectedLog) {
            setLogs((prevLogs) => prevLogs.map((log) => (log.id === selectedLog.id ? { ...log, ...logData } : log)));
        } else {
            setLogs((prevLogs) => [...prevLogs, { id: logs.length + 1, ...logData }]);
        }
        setSelectedLog(null);
        setIsFormOpen(false);
    };

    const handleEditLog = (log) => {
        setSelectedLog(log);
        setIsFormOpen(true);
    };

    const handleDeleteLog = (logId) => {
        if (confirm('Are you sure you want to delete this log?')) {
            setLogs((prevLogs) => prevLogs.filter((log) => log.id !== logId));
            router.delete(route('logs.destroy', logId), {
                preserveScroll: true,
            });
        }
    };

    const getStatusBadge = (status) => {
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
                icon: <Loader2 size={16} className="animate-spin text-blue-600" />,
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
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Log Management" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-lg bg-white p-6 shadow-sm">
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <h1 className="text-2xl font-semibold text-gray-900">Log Management</h1>
                    <Button
                        onClick={() => {
                            setSelectedLog(null);
                            setIsFormOpen(true);
                        }}
                        className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
                    >
                        <Plus size={16} />
                        <span>New Log</span>
                    </Button>
                </div>

                <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                    <div className="flex flex-col justify-between gap-4 md:flex-row">
                        <div className="flex flex-1 items-center gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500" />
                                <Input
                                    type="search"
                                    placeholder="Search by fault or user name..."
                                    className="h-10 w-full border-gray-200 pr-4 pl-10 focus:border-blue-500 focus:ring-blue-500"
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                />
                            </div>

                            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2">
                                <Filter size={16} className="text-gray-500" />
                                <select
                                    className="bg-transparent text-sm text-gray-700 focus:outline-none"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="all">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="resolved">Resolved</option>
                                    <option value="closed">Closed</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="overflow-hidden rounded-lg border border-gray-200">
                    <Table>
                        <TableHeader className="bg-gray-50">
                            <TableRow>
                                <TableHead className="font-medium text-gray-700">Fault Type</TableHead>
                                <TableHead className="font-medium text-gray-700">Action Taken</TableHead>
                                <TableHead className="font-medium text-gray-700">Status</TableHead>
                                <TableHead className="font-medium text-gray-700">Assigned To</TableHead>
                                <TableHead className="w-24 text-right font-medium text-gray-700">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredLogs.length > 0 ? (
                                filteredLogs.map((log) => (
                                    <TableRow key={log.id} className="border-b border-gray-100 transition-colors hover:bg-gray-50">
                                        <TableCell className="font-medium text-gray-800">{capitalizeEachWord(log.issue?.type || '')}</TableCell>
                                        <TableCell className="text-gray-600">{log.action_taken}</TableCell>
                                        <TableCell>{getStatusBadge(log.status)}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 font-medium text-blue-700">
                                                    {log.user?.name?.charAt(0) || '?'}
                                                </div>
                                                <span className="text-gray-700">{log.user?.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 border-gray-200 px-2 hover:bg-blue-50 hover:text-blue-600"
                                                    onClick={() => handleEditLog(log)}
                                                >
                                                    View
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 border-gray-200 px-2 hover:bg-red-50 hover:text-red-600"
                                                    onClick={() => handleDeleteLog(log.id)}
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center">
                                        <div className="flex flex-col items-center justify-center gap-2 text-gray-500">
                                            <AlertCircle size={24} />
                                            <p>No logs found matching your search criteria</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
                    <div>
                        Showing <span className="font-medium">{filteredLogs.length}</span> of <span className="font-medium">{logs.length}</span> logs
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
                </div>
            </div>

            {isFormOpen && <LogFormDialog log={selectedLog} onSave={handleSaveLog} onClose={() => setIsFormOpen(false)} />}
        </AppLayout>
    );
}
