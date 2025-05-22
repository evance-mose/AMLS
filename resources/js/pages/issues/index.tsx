import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
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
import { useState } from 'react';
import IssueFormDialog from './IssueForm';

export default function Index({ issues }) {
    const [issuesList, setIssuesList] = useState(issues);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
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
        const matchesType = typeFilter === 'all' || issue.category === typeFilter;
        const matchesPriority = priorityFilter === 'all' || issue.priority === priorityFilter;

        return matchesSearch && matchesStatus && matchesType && matchesPriority;
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
    };

    const getPriorityBadge = (priority) => {
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

    const getCategoryIcon = (category) => {
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
    };

    const getTypeIcon = (type) => {
        // You can customize this with appropriate icons for each type
        const typeIcons = {
            hardware: <AlertCircle size={16} className="text-purple-600" />,
            software: <AlertCircle size={16} className="text-blue-600" />,
            network: <AlertCircle size={16} className="text-teal-600" />,
            security: <AlertCircle size={16} className="text-red-600" />,
            other: <AlertCircle size={16} className="text-gray-600" />,
        };

        return typeIcons[type] || typeIcons.other;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Issue Management" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
                    <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="relative w-full flex-1">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500" />
                            <Input
                                type="search"
                                placeholder="Search by title, ATM ID or user..."
                                className="h-10 w-full border-gray-200 pr-4 pl-10 focus:border-blue-500 focus:ring-blue-500"
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                        </div>

                        <div className="flex w-full flex-row gap-2 sm:w-auto">
                            <div className="flex flex-1 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 sm:flex-initial">
                                <Filter size={16} className="shrink-0 text-gray-500" />
                                <select
                                    className="w-full bg-transparent text-sm text-gray-700 focus:outline-none"
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

                            <div className="flex flex-1 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 sm:flex-initial">
                                <Filter size={16} className="shrink-0 text-gray-500" />
                                <select
                                    className="w-full bg-transparent text-sm text-gray-700 focus:outline-none"
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

                            <div className="flex flex-1 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 sm:flex-initial">
                                <Flag size={16} className="shrink-0 text-gray-500" />
                                <select
                                    className="w-full bg-transparent text-sm text-gray-700 focus:outline-none"
                                    value={priorityFilter}
                                    onChange={(e) => setPriorityFilter(e.target.value)}
                                >
                                    <option value="all">All Priority</option>
                                    <option value="high">High</option>
                                    <option value="medium">Medium</option>
                                    <option value="low">Low</option>
                                </select>
                            </div>
                        </div>

                        <Button
                            onClick={() => {
                                setSelectedIssue(null);
                                setIsFormOpen(true);
                                setIsDialogOpen(true);
                            }}
                            className="flex w-full items-center justify-center gap-2 bg-black text-white hover:bg-gray-700 sm:w-auto"
                        >
                            <Plus size={16} />
                            <span>New Issue</span>
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Issues</CardTitle>
                        <CardDescription>All reported issues sorted by recency</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow className="uppercase">
                                    <TableHead className="font-medium">ID</TableHead>
                                    <TableHead className="font-medium">ATM ID</TableHead>
                                    <TableHead className="font-medium">Location</TableHead>
                                    <TableHead className="font-medium">Category</TableHead>
                                    <TableHead className="font-medium">Priority</TableHead>
                                    <TableHead className="font-medium">Status</TableHead>
                                    <TableHead className="w-24 text-right font-medium"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredIssues.length > 0 ? (
                                    filteredIssues.map((issue) => (
                                        <TableRow key={issue.id} className="border-b border-gray-100 transition-colors hover:bg-gray-50">
                                            <TableCell className="font-medium">{`#${issue.id}`}</TableCell>
                                            <TableCell className="font-medium text-gray-800">
                                                {issue?.atm_id || ''}
                                                <div className="text-xs text-gray-500">
                                                    {issue.created_at ? new Date(issue.created_at).toLocaleDateString() : 'No date'}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium">{issue.location}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {getCategoryIcon(issue.category)}
                                                    <span className="capitalize">{issue.category.replace(/_/g, ' ')}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{getPriorityBadge(issue.priority || 'medium')}</TableCell>
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
                    </CardContent>
                    <CardFooter className="justify-between border-t px-6 py-3">
                        <div className="text-sm text-gray-500">
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
                    </CardFooter>
                </Card>
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
