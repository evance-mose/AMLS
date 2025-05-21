import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import {
    AlertCircle,
    Calendar,
    CheckCircle,
    ClipboardList,
    Clock,
    Cpu,
    Download,
    FileDown,
    Globe,
    HardDrive,
    HelpCircle,
    Loader2,
    PenTool,
    Shield,
    XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Reports',
        href: '/reports',
    },
    {
        title: 'Monthly Report',
        href: '/reports/monthly',
    },
];

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const years = [2025, 2024, 2023];

export default function MonthlyReport({ initialData }) {
    const [isLoading, setIsLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState('April');
    const [selectedYear, setSelectedYear] = useState(2025);
    const [reportData, setReportData] = useState(null);
    const [isExporting, setIsExporting] = useState(false);

    const fetchReportData = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get('/api/reports/monthly', {
                params: {
                    month: selectedMonth,
                    year: selectedYear,
                },
            });
            setReportData(response.data);
        } catch (error) {
            console.error('Error fetching report data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (initialData && !isLoading) return;
        fetchReportData();
    }, [selectedMonth, selectedYear]);

    const exportToCSV = () => {
        setIsExporting(true);

        let issuesCsvContent = 'data:text/csv;charset=utf-8,';
        issuesCsvContent += 'ID,User,Title,ATM ID,Category,Description,Status,Date Reported\n';
        reportData.issues.forEach((issue) => {
            const user = reportData.users[issue.user_id];
            const userName = `${user.first_name} ${user.last_name}`;
            issuesCsvContent += `${issue.id},"${userName}","${issue.title}",${issue.atm_id},${issue.category},`;
            issuesCsvContent += `"${issue.description}",${issue.status},${issue.created_at}\n`;
        });

        const encodedIssuesUri = encodeURI(issuesCsvContent);
        const issuesLink = document.createElement('a');
        issuesLink.setAttribute('href', encodedIssuesUri);
        issuesLink.setAttribute('download', `Issues_${selectedMonth}_${selectedYear}.csv`);
        document.body.appendChild(issuesLink);

        let logsCsvContent = 'data:text/csv;charset=utf-8,';
        logsCsvContent += 'ID,Technician,Issue ID,Action Taken,Status,Date\n';
        reportData.maintenanceLogs.forEach((log) => {
            const user = reportData.users[log.user_id];
            const userName = `${user.first_name} ${user.last_name}`;
            logsCsvContent += `${log.id},"${userName}",${log.issue_id || 'N/A'},"${log.action_taken}",${log.status},${log.created_at}\n`;
        });

        const encodedLogsUri = encodeURI(logsCsvContent);
        const logsLink = document.createElement('a');
        logsLink.setAttribute('href', encodedLogsUri);
        logsLink.setAttribute('download', `Maintenance_Logs_${selectedMonth}_${selectedYear}.csv`);
        document.body.appendChild(logsLink);

        setTimeout(() => {
            issuesLink.click();
            setTimeout(() => {
                logsLink.click();
                document.body.removeChild(issuesLink);
                document.body.removeChild(logsLink);
                setIsExporting(false);
            }, 500);
        }, 500);
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

    const getUserFullName = (userId) => {
        const user = reportData.users[userId];
        return user ? `${user.first_name} ${user.last_name}` : 'Unknown';
    };

    if (isLoading) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Monthly Report" />
                <div className="flex h-full flex-1 flex-col items-center justify-center">
                    <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
                    <p className="mt-4 text-gray-500">Generating report...</p>
                </div>
            </AppLayout>
        );
    }

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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Monthly Report" />
            <div className="flex flex-1 flex-col gap-5 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Monthly Report</h1>
                        <p className="text-muted-foreground">
                            {selectedMonth} {selectedYear} • Report ID: {reportData.reportInfo.id}
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                                <SelectTrigger className="w-32">
                                    <SelectValue placeholder="Month" />
                                </SelectTrigger>
                                <SelectContent>
                                    {months.map((month) => (
                                        <SelectItem key={month} value={month}>
                                            {month}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                                <SelectTrigger className="w-24">
                                    <SelectValue placeholder="Year" />
                                </SelectTrigger>
                                <SelectContent>
                                    {years.map((year) => (
                                        <SelectItem key={year} value={year.toString()}>
                                            {year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={exportToCSV} className="flex items-center gap-1 bg-green-600 hover:bg-green-700">
                            {isExporting ? (
                                <>
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                    <span>Exporting...</span>
                                </>
                            ) : (
                                <>
                                    <FileDown className="h-4 w-4" />
                                    <span>Export Report</span>
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Total Issues</CardTitle>
                            <div className="rounded-lg bg-red-50 p-2">
                                <AlertCircle className="h-5 w-5 text-red-500" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{reportData.issueStats.total}</div>
                            <p className="mt-1 text-xs text-gray-500">
                                {reportData.issueStats.resolved} resolved, {reportData.issueStats.pending} pending
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Resolution Time</CardTitle>
                            <div className="rounded-lg bg-blue-50 p-2">
                                <Clock className="h-5 w-5 text-blue-500" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{reportData.issueStats.avgResolutionTime}</div>
                            <p className="mt-1 text-xs text-gray-500">Average resolution time</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Maintenance Actions</CardTitle>
                            <div className="rounded-lg bg-green-50 p-2">
                                <PenTool className="h-5 w-5 text-green-500" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{reportData.maintenanceLogs.length}</div>
                            <p className="mt-1 text-xs text-gray-500">
                                {reportData.maintenanceLogs.filter((log) => log.status === 'Completed').length} completed
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Resolution Rate</CardTitle>
                            <div className="rounded-lg bg-purple-50 p-2">
                                <CheckCircle className="h-5 w-5 text-purple-500" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {Math.round((reportData.issueStats.resolved / reportData.issueStats.total) * 100)}%
                            </div>
                            <p className="mt-1 text-xs text-gray-500">Issues successfully resolved</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Issues Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-gray-500" />
                            Issues Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Reported By</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>ATM ID</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {reportData.issues.map((issue) => (
                                    <TableRow key={issue.id}>
                                        <TableCell className="font-mono text-sm">{issue.id}</TableCell>
                                        <TableCell>{getUserFullName(issue.user_id)}</TableCell>
                                        <TableCell className="font-medium">{issue.location}</TableCell>
                                        <TableCell>{issue.atm_id}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {getCategoryIcon(issue.category)}
                                                <span className="capitalize">{issue.category.replace(/_/g, ' ')}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{getStatusBadge(issue.status)}</TableCell>
                                        <TableCell>{new Date(issue.created_at).toLocaleDateString()}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Maintenance Logs Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ClipboardList className="h-5 w-5 text-gray-500" />
                            Maintenance Log Summary
                        </CardTitle>
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
                                    <TableHead>Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {reportData.maintenanceLogs.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell className="font-mono text-sm">{log.id}</TableCell>
                                        <TableCell>{getUserFullName(log.user_id)}</TableCell>
                                        <TableCell>{log.issue_id || '-'}</TableCell>
                                        <TableCell className="font-medium">{log.action_taken}</TableCell>
                                        <TableCell>{getStatusBadge(log.status)}</TableCell>
                                        <TableCell>{new Date(log.created_at).toLocaleDateString()}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                    <CardFooter className="flex items-center justify-between border-t px-6 py-3">
                        <div className="text-sm text-gray-500">
                            {selectedMonth} {selectedYear} Report • Generated on {new Date(reportData.reportInfo.date).toLocaleDateString()}
                        </div>
                        <Button onClick={exportToCSV} variant="outline" size="sm" className="flex items-center gap-1">
                            <Download className="h-4 w-4" />
                            <span>Download CSV</span>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </AppLayout>
    );
}
