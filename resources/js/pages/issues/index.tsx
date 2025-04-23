import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { AlertCircle, CheckCircle, Clock, Filter, Loader2, Plus, Search, XCircle } from 'lucide-react';
import { useState } from 'react';
import IssueFormDialog from './IssueForm';

export default function Index({ issues }) {
    const [issuesList, setIssuesList] = useState(issues);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const breadcrumbs = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Issues',
            href: '/issues',
        },
    ];

    const capitalizeEachWord = (str) => {
        return str
            .split(' ')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const filteredIssues = issuesList.filter((issue) => {
        const matchesSearch =
            issue.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            issue.atm_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            issue.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;
        const matchesType = typeFilter === 'all' || issue.type === typeFilter;

        return matchesSearch && matchesStatus && matchesType;
    });

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleSaveIssue = (issueData) => {
        if (selectedIssue) {
            setIssuesList((prevIssues) => prevIssues.map((issue) => (issue.id === selectedIssue.id ? { ...issue, ...issueData } : issue)));
        } else {
            setIssuesList((prevIssues) => [...prevIssues, { id: issuesList.length + 1, ...issueData }]);
        }
        setSelectedIssue(null);
        setIsFormOpen(false);
    };

    const handleDeleteIssue = (issueId) => {
        if (confirm('Are you sure you want to delete this issue?')) {
            setIssuesList((prevIssues) => prevIssues.filter((issue) => issue.id !== issueId));
            router.delete(route('issues.destroy', issueId), {
                preserveScroll: true,
            });
        }
    };

    const handleEditIssue = (issue) => {
        setSelectedIssue(issue);
        setIsDialogOpen(true);
        setIsFormOpen(true);
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

    const getTypeBadge = (type) => {
        const typeConfig = {
            hardware: {
                classes: 'bg-purple-50 text-purple-700 border-purple-100',
            },
            software: {
                classes: 'bg-blue-50 text-blue-700 border-blue-100',
            },
            network: {
                classes: 'bg-teal-50 text-teal-700 border-teal-100',
            },
            security: {
                classes: 'bg-red-50 text-red-700 border-red-100',
            },
            other: {
                classes: 'bg-gray-50 text-gray-700 border-gray-100',
            },
        };

        const config = typeConfig[type] || typeConfig.other;

        return <div className={`rounded-full border px-2.5 py-1 text-xs font-medium ${config.classes}`}>{capitalizeEachWord(type)}</div>;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Issue Management" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-lg bg-white p-6 shadow-sm">
                <div className="">
                    <div className="flex flex-col justify-between gap-4 md:flex-row">
                        <div className="flex flex-1 items-center gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500" />
                                <Input
                                    type="search"
                                    placeholder="Search by title, ATM ID or user..."
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

                            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2">
                                <Filter size={16} className="text-gray-500" />
                                <select
                                    className="bg-transparent text-sm text-gray-700 focus:outline-none"
                                    value={typeFilter}
                                    onChange={(e) => setTypeFilter(e.target.value)}
                                >
                                    <option value="all">All Types</option>
                                    <option value="hardware">Hardware</option>
                                    <option value="software">Software</option>
                                    <option value="network">Network</option>
                                    <option value="security">Security</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <Button
                                onClick={() => {
                                    setSelectedIssue(null);
                                    setIsFormOpen(true);
                                    setIsDialogOpen(true);
                                }}
                                className="flex items-center gap-2 bg-black text-white hover:bg-gray-700"
                            >
                                <Plus size={16} />
                                <span>New Issue</span>
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="overflow-hidden rounded-lg border border-gray-200">
                    <Table>
                        <TableHeader className="bg-gray-50">
                            <TableRow>
                                <TableHead className="font-medium text-gray-700">ATM ID</TableHead>
                                <TableHead className="font-medium text-gray-700">Title</TableHead>
                                <TableHead className="font-medium text-gray-700">Type</TableHead>
                                <TableHead className="font-medium text-gray-700">Status</TableHead>
                                <TableHead className="w-24 text-right font-medium text-gray-700">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredIssues.length > 0 ? (
                                filteredIssues.map((issue) => (
                                    <TableRow key={issue.id} className="border-b border-gray-100 transition-colors hover:bg-gray-50">
                                        <TableCell className="text-gray-600">{issue.atm_id}</TableCell>
                                        <TableCell className="font-medium text-gray-800">{issue.title}</TableCell>
                                        <TableCell>{getTypeBadge(issue.type)}</TableCell>
                                        <TableCell>{getStatusBadge(issue.status)}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 border-gray-200 px-2 hover:bg-blue-50 hover:text-blue-600"
                                                    onClick={() => handleEditIssue(issue)}
                                                >
                                                    View
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 border-gray-200 px-2 hover:bg-red-50 hover:text-red-600"
                                                    onClick={() => handleDeleteIssue(issue.id)}
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center">
                                        <div className="flex flex-col items-center justify-center gap-2 text-gray-500">
                                            <AlertCircle size={24} />
                                            <p>No issues found matching your search criteria</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
                    <div>
                        Showing <span className="font-medium">{filteredIssues.length}</span> of{' '}
                        <span className="font-medium">{issuesList.length}</span> issues
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

            {isFormOpen && (
                <IssueFormDialog
                    issue={selectedIssue}
                    isOpen={isDialogOpen}
                    onSave={handleSaveIssue}
                    onClose={() => {
                        setIsFormOpen(false);
                        setIsDialogOpen(false);
                    }}
                />
            )}
        </AppLayout>
    );
}
