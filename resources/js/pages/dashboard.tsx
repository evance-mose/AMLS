import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import {
    Activity,
    AlertCircle,
    AlertTriangle,
    CheckCircle,
    Cpu,
    CreditCard,
    Globe,
    HardDrive,
    HelpCircle,
    Shield,
    Users,
    XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

// Mock data - replace with real data from your API
const userData = [
    { name: 'Jan', active: 65, new: 24 },
    { name: 'Feb', active: 78, new: 32 },
    { name: 'Mar', active: 82, new: 18 },
    { name: 'Apr', active: 95, new: 29 },
    { name: 'May', active: 102, new: 22 },
    { name: 'Jun', active: 114, new: 31 },
];

// Issue data by category
const issuesByCategory = [
    { name: 'Hardware', value: 24, color: '#ff6b6b' },
    { name: 'Software', value: 35, color: '#4f46e5' },
    { name: 'Network', value: 18, color: '#10b981' },
    { name: 'Security', value: 12, color: '#f59e0b' },
    { name: 'Other', value: 7, color: '#6b7280' },
];

// ATM faults data
const atmFaultsTrend = [
    { name: 'Jan', hardware: 14, software: 23, network: 8 },
    { name: 'Feb', hardware: 17, software: 20, network: 9 },
    { name: 'Mar', hardware: 12, software: 18, network: 7 },
    { name: 'Apr', hardware: 15, software: 21, network: 11 },
    { name: 'May', hardware: 13, software: 15, network: 10 },
    { name: 'Jun', hardware: 10, software: 17, network: 6 },
];

const maintenanceLogs = [
    { id: 1, system: 'Database Server', action: 'Backup', status: 'Completed', date: '2025-04-22', time: '03:15 AM' },
    { id: 2, system: 'Web Server', action: 'Security Patch', status: 'Completed', date: '2025-04-21', time: '11:30 PM' },
    { id: 3, system: 'API Gateway', action: 'Configuration Update', status: 'Failed', date: '2025-04-20', time: '2:45 PM' },
    { id: 4, system: 'Storage System', action: 'Disk Cleanup', status: 'Completed', date: '2025-04-19', time: '7:20 AM' },
    { id: 5, system: 'Auth Service', action: 'Restart', status: 'Warning', date: '2025-04-18', time: '9:10 PM' },
];

const recentUsers = [
    { id: 1, name: 'Alice Johnson', email: 'alice@example.com', lastActive: '10 mins ago', status: 'active' },
    { id: 2, name: 'Bob Smith', email: 'bob@example.com', lastActive: '35 mins ago', status: 'active' },
    { id: 3, name: 'Carol Davis', email: 'carol@example.com', lastActive: '2 hours ago', status: 'idle' },
    { id: 4, name: 'Dave Wilson', email: 'dave@example.com', lastActive: '1 day ago', status: 'inactive' },
];

// Latest issues by category
const latestIssues = [
    {
        id: 1,
        title: 'ATM Card Reader Failure',
        description: 'ATM #5432 card reader malfunction causing card rejection',
        category: 'hardware',
        priority: 'high',
        status: 'open',
        location: 'Main Branch',
        reportedBy: 'John Smith',
        createdAt: '2025-04-22T10:15:00Z',
    },
    {
        id: 2,
        title: 'Transaction Processing Delay',
        description: 'Users experiencing 30+ second delays when processing transactions',
        category: 'software',
        priority: 'critical',
        status: 'in-progress',
        location: 'All Branches',
        reportedBy: 'System Monitor',
        createdAt: '2025-04-22T09:30:00Z',
    },
    {
        id: 3,
        title: 'VPN Connection Failure',
        description: 'Remote branch unable to connect to main office VPN',
        category: 'network',
        priority: 'medium',
        status: 'open',
        location: 'Downtown Branch',
        reportedBy: 'Maria Garcia',
        createdAt: '2025-04-21T16:45:00Z',
    },
    {
        id: 4,
        title: 'Suspicious Login Attempts',
        description: 'Multiple failed login attempts from unknown IP addresses',
        category: 'security',
        priority: 'high',
        status: 'in-progress',
        location: 'Online Banking',
        reportedBy: 'Security System',
        createdAt: '2025-04-21T14:20:00Z',
    },
    {
        id: 5,
        title: 'ATM Cash Dispenser Error',
        description: 'ATM #3201 reporting cash dispenser alignment issue',
        category: 'hardware',
        priority: 'medium',
        status: 'open',
        location: 'Airport Branch',
        reportedBy: 'Customer Report',
        createdAt: '2025-04-21T11:05:00Z',
    },
    {
        id: 6,
        title: 'Mobile App Crash on Login',
        description: 'iOS app v3.5.2 crashing when users attempt to login with biometrics',
        category: 'software',
        priority: 'high',
        status: 'in-progress',
        location: 'Mobile App',
        reportedBy: 'App Monitoring',
        createdAt: '2025-04-20T21:15:00Z',
    },
    {
        id: 7,
        title: 'Network Latency in Branch',
        description: 'High latency affecting all workstations in west wing',
        category: 'network',
        priority: 'medium',
        status: 'resolved',
        location: 'Corporate HQ',
        reportedBy: 'Network Monitor',
        createdAt: '2025-04-20T14:50:00Z',
    },
];

// ATM fault records
const atmFaults = [
    {
        id: 1,
        atmId: 'ATM-5432',
        location: 'Main Branch',
        issue: 'Card Reader Failure',
        category: 'hardware',
        status: 'open',
        reportedAt: '2025-04-22T10:15:00Z',
        downtime: '4h 35m',
    },
    {
        id: 2,
        atmId: 'ATM-3201',
        location: 'Airport Branch',
        issue: 'Cash Dispenser Error',
        category: 'hardware',
        status: 'open',
        reportedAt: '2025-04-21T11:05:00Z',
        downtime: '27h 45m',
    },
    {
        id: 3,
        atmId: 'ATM-7890',
        location: 'Shopping Mall',
        issue: 'Software Update Failed',
        category: 'software',
        status: 'resolved',
        reportedAt: '2025-04-20T09:30:00Z',
        downtime: '6h 15m',
    },
    {
        id: 4,
        atmId: 'ATM-4567',
        location: 'Downtown Branch',
        issue: 'Network Connectivity Loss',
        category: 'network',
        status: 'resolved',
        reportedAt: '2025-04-19T16:20:00Z',
        downtime: '3h 40m',
    },
    {
        id: 5,
        atmId: 'ATM-6543',
        location: 'West Side Branch',
        issue: 'Printer Paper Jam',
        category: 'hardware',
        status: 'in-progress',
        reportedAt: '2025-04-22T08:10:00Z',
        downtime: '6h 50m',
    },
];

const getStatusIcon = (status) => {
    switch (status) {
        case 'Completed':
            return <CheckCircle className="h-5 w-5 text-green-500" />;
        case 'Failed':
            return <XCircle className="h-5 w-5 text-red-500" />;
        case 'Warning':
            return <AlertCircle className="h-5 w-5 text-yellow-500" />;
        default:
            return null;
    }
};

export default function Dashboard() {
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        // Simulate data loading
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    // Summary stats
    const stats = [
        { title: 'Total Users', value: '358', icon: <Users className="h-6 w-6 text-blue-500" />, change: '+12%' },
        { title: 'Active Now', value: '42', icon: <Activity className="h-6 w-6 text-green-500" />, change: '+5%' },
        { title: 'Open Issues', value: '24', icon: <AlertTriangle className="h-6 w-6 text-orange-500" />, change: '-3%' },
        { title: 'ATM Uptime', value: '98.2%', icon: <CreditCard className="h-6 w-6 text-purple-500" />, change: '-0.5%' },
    ];

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

    const getStatusBadge = (status) => {
        switch (status) {
            case 'open':
                return <Badge variant="destructive">Open</Badge>;
            case 'in-progress':
                return (
                    <Badge variant="warning" className="bg-yellow-500">
                        In Progress
                    </Badge>
                );
            case 'resolved':
                return (
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                        Resolved
                    </Badge>
                );
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const getPriorityBadge = (priority) => {
        switch (priority) {
            case 'critical':
                return (
                    <Badge variant="destructive" className="bg-red-600">
                        Critical
                    </Badge>
                );
            case 'high':
                return <Badge variant="destructive">High</Badge>;
            case 'medium':
                return (
                    <Badge variant="warning" className="bg-yellow-500">
                        Medium
                    </Badge>
                );
            case 'low':
                return (
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                        Low
                    </Badge>
                );
            default:
                return <Badge variant="secondary">{priority}</Badge>;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'idle':
                return 'bg-yellow-100 text-yellow-800';
            case 'inactive':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Calculate issue statistics
    const totalIssues = issuesByCategory.reduce((sum, item) => sum + item.value, 0);
    const openIssues = 24; // Normally you would calculate this from your data

    // Calculate ATM issue stats
    const atmStats = {
        total: atmFaults.length,
        open: atmFaults.filter((fault) => fault.status === 'open').length,
        inProgress: atmFaults.filter((fault) => fault.status === 'in-progress').length,
        resolved: atmFaults.filter((fault) => fault.status === 'resolved').length,
        hardware: atmFaults.filter((fault) => fault.category === 'hardware').length,
        software: atmFaults.filter((fault) => fault.category === 'software').length,
        network: atmFaults.filter((fault) => fault.category === 'network').length,
    };

    if (isLoading) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Dashboard" />
                <div className="flex h-full flex-1 flex-col items-center justify-center">
                    <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
                    <p className="mt-4 text-gray-500">Loading dashboard data...</p>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex flex-1 flex-col gap-6 p-4">
                <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
                    <TabsList className="mb-4 grid w-full grid-cols-4 lg:w-auto">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="issues">Issues</TabsTrigger>
                    </TabsList>
                    <TabsContent value="overview" className="w-full">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                            {stats.map((stat, i) => (
                                <Card key={i}>
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium text-gray-500">{stat.title}</CardTitle>
                                        <div className="rounded-lg bg-gray-50 p-2">{stat.icon}</div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{stat.value}</div>
                                        <p
                                            className={`mt-1 text-xs ${stat.change.startsWith('+') ? 'text-green-500' : stat.change.startsWith('-') ? 'text-red-500' : 'text-gray-500'}`}
                                        >
                                            {stat.change} from last month
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                        <div className="mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Recent Activity</CardTitle>
                                    <CardDescription>Latest system events and maintenance logs</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>System</TableHead>
                                                <TableHead>Action</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Date</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {maintenanceLogs.slice(0, 4).map((log) => (
                                                <TableRow key={log.id}>
                                                    <TableCell className="font-medium">{log.system}</TableCell>
                                                    <TableCell>{log.action}</TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center">
                                                            {getStatusIcon(log.status)}
                                                            <span className="ml-2">{log.status}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {log.date} <span className="text-xs text-gray-400">{log.time}</span>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                                <CardFooter className="justify-center border-t px-6 py-3">
                                    <Button variant="outline" size="sm">
                                        View All Logs
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                    </TabsContent>
                    <TabsContent value="issues" className="w-full">
                        {/* Issues Summary */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{totalIssues}</div>
                                </CardContent>
                            </Card>

                            {issuesByCategory.map((category, i) => (
                                <Card key={i}>
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium">{category.name}</CardTitle>
                                        <div className="rounded-full p-1" style={{ backgroundColor: `${category.color}20` }}>
                                            {getCategoryIcon(category.name.toLowerCase())}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{category.value}</div>
                                        <Progress value={(category.value / totalIssues) * 100} className="mt-2 h-2" indicatorColor={category.color} />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Critical Issues Alert */}
                        <Alert className="mt-6 border-red-600 bg-red-50">
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                            <AlertTitle className="text-red-600">Critical Issues Detected</AlertTitle>
                            <AlertDescription>
                                There is 1 critical issue requiring immediate attention.{' '}
                                <Button variant="link" className="h-auto p-0 text-red-600">
                                    View Details
                                </Button>
                            </AlertDescription>
                        </Alert>

                        {/* Latest Issues */}
                        <Card className="mt-6">
                            <CardHeader>
                                <CardTitle>Latest Issues</CardTitle>
                                <CardDescription>All reported issues sorted by recency</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Issue</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead>Priority</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Location</TableHead>
                                            <TableHead>Reported</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {latestIssues.map((issue) => (
                                            <TableRow key={issue.id}>
                                                <TableCell className="font-medium">
                                                    {issue.title}
                                                    <div className="text-xs text-gray-500">{issue.description.substring(0, 40)}...</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        {getCategoryIcon(issue.category)}
                                                        <span className="capitalize">{issue.category}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{getPriorityBadge(issue.priority)}</TableCell>
                                                <TableCell>{getStatusBadge(issue.status)}</TableCell>
                                                <TableCell>{issue.location}</TableCell>
                                                <TableCell className="text-sm text-gray-500">
                                                    {new Date(issue.createdAt).toLocaleDateString()}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                            <CardFooter className="justify-center border-t px-6 py-3">
                                <Button variant="outline" size="sm">
                                    View All Issues
                                </Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
