import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import LogFormDialog from '@/pages/logs/LogForm';
import { User } from '@/types';
import { PageProps as InertiaPageProps } from '@inertiajs/core';
import { Head, router, usePage } from '@inertiajs/react';
import { AlertCircle, CheckCircle, Clock, Cpu, Filter, Flag, Globe, HardDrive, HelpCircle, Loader2, Search, Shield } from 'lucide-react';
import { useState } from 'react';
import IssueFormDialog from './IssueForm';

interface Issue {
    id: number;
    title?: string;
    atm_id?: string;
    location: string;
    category: string;
    description: string;
    status: string;
    priority: string;
    user_id?: string;
    created_at?: string;
    user?: User;
}

interface IndexProps {
    issues: Issue[];
    users: User[];
}

interface PageProps extends InertiaPageProps {
    auth: {
        user: User;
    };
    [key: string]: any;
}

export default function Index({ issues, users }: IndexProps) {
    const { auth } = usePage<PageProps>().props;
    const isAdmin = auth.user.role === 'admin';
    const [issuesList, setIssuesList] = useState<Issue[]>(issues);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
    const [selectedIssueForAssign, setSelectedIssueForAssign] = useState<Issue | null>(null);

    const breadcrumbs: { title: string; href: string }[] = [];

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

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleSaveIssue = (issueData: Partial<Issue>) => {
        if (selectedIssue) {
            setIssuesList((prevIssues) => prevIssues.map((issue) => (issue.id === selectedIssue.id ? { ...issue, ...issueData } : issue)));
        } else {
            setIssuesList((prevIssues) => [...prevIssues, { id: issuesList.length + 1, ...issueData } as Issue]);
        }
        setSelectedIssue(null);
        setIsFormOpen(false);
    };

    const handleDeleteIssue = (issueId: number) => {
        if (confirm('Are you sure you want to delete this issue?')) {
            setIssuesList((prevIssues) => prevIssues.filter((issue) => issue.id !== issueId));
            router.delete(route('issues.destroy', issueId), {
                preserveScroll: true,
            });
        }
    };

    const handleEditIssue = (issue: Issue) => {
        setSelectedIssue(issue);
        setIsDialogOpen(true);
        setIsFormOpen(true);
    };

    const handleAssignIssue = (issue: Issue) => {
        setSelectedIssueForAssign(issue);
        setIsAssignDialogOpen(true);
    };

    const handleAssignSave = (logData: { user_id: string }) => {
        if (selectedIssueForAssign) {
            // Update the issue status to acknowledged
            setIssuesList((prevIssues) =>
                prevIssues.map((issue) =>
                    issue.id === selectedIssueForAssign.id ? { ...issue, status: 'acknowledged', assigned_to: logData.user_id } : issue,
                ),
            );

            // Create log data with category and atm_id
            const logDataWithDetails = {
                ...logData,
                category: selectedIssueForAssign.category,
                atm_id: selectedIssueForAssign.atm_id,
            };

            // Send the log data to the server
            router.post(route('logs.store'), logDataWithDetails, {
                preserveScroll: true,
            });

            setSelectedIssueForAssign(null);
            setIsAssignDialogOpen(false);
        }
    };

    const handleAssignClose = () => {
        setSelectedIssueForAssign(null);
        setIsAssignDialogOpen(false);
    };

    type StatusType = 'resolved' | 'pending' | 'acknowledged';
    const getStatusBadge = (status: StatusType) => {
        const statusConfig = {
            resolved: {
                icon: <CheckCircle size={16} className="text-green-600" />,
                text: 'Resolved',
                classes: 'bg-green-50 text-green-700 border-green-100',
            },
            pending: {
                icon: <Clock size={16} className="text-amber-600" />,
                text: 'Pending',
                classes: 'bg-amber-50 text-amber-700 border-amber-100',
            },
            acknowledged: {
                icon: <Loader2 size={16} className="text-blue-600" />,
                text: 'Acknowledged',
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

    type PriorityType = 'high' | 'medium' | 'low';
    const getPriorityBadge = (priority: PriorityType) => {
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

    type CategoryType = 'hardware' | 'software' | 'network' | 'security';
    const getCategoryIcon = (category: CategoryType) => {
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
                return <HelpCircle className="h-5 w-5 text-red-500" />;
        }
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
                                placeholder="Search by ATM ID or user..."
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
                                    <option value="acknowledged">Acknowledged</option>
                                    <option value="resolved">Resolved</option>
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
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="uppercase">All Issues</CardTitle>
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
                                            <TableCell className="">{issue.location}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <span className="uppercase">{issue.category.replace(/_/g, ' ')}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{getPriorityBadge(issue.priority as PriorityType)}</TableCell>
                                            <TableCell>{getStatusBadge(issue.status as StatusType)}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 border-gray-200 px-2 text-xs uppercase hover:bg-blue-50 hover:text-blue-600"
                                                        onClick={() => handleEditIssue(issue)}
                                                    >
                                                        Edit
                                                    </Button>
                                                    {isAdmin && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-8 border-gray-200 px-2 text-xs uppercase hover:bg-purple-50 hover:text-purple-600"
                                                            onClick={() => handleAssignIssue(issue)}
                                                        >
                                                            Assign
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 border-gray-200 px-2 text-xs uppercase hover:bg-red-50 hover:text-red-600"
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

            {isAssignDialogOpen && selectedIssueForAssign && (
                <LogFormDialog
                    log={null}
                    isOpen={isAssignDialogOpen}
                    issues={[selectedIssueForAssign] as any}
                    users={users as any}
                    onSave={handleAssignSave as any}
                    onClose={handleAssignClose}
                    moreData={{
                        atm_id: selectedIssueForAssign.atm_id,
                        category: selectedIssueForAssign.category,
                        issue_id: selectedIssueForAssign.id.toString(),
                    }}
                />
            )}
        </AppLayout>
    );
}
