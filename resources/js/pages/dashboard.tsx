import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    AlertCircle,
    CheckCircle,
    Clock,
    FileText,
    Flag,
    Loader2,
    Plus,
    Settings,
    TrendingUp,
    Users,
    Wrench,
    XCircle,
} from 'lucide-react';
import AdminDashboard from '@/components/dashboards/AdminDashboard';
import CustodianDashboard from '@/components/dashboards/CustodianDashboard';
import TechnicianDashboard from '@/components/dashboards/TechnicianDashboard';

const breadcrumbs: BreadcrumbItem[] = [];

export default function Dashboard({ role, stats, recentIssues, recentLogs, assignedIssues, myLogs, issuesByStatus, issuesByPriority, totalUsers, totalTechnicians, totalCustodians, totalLogs }) {
    const renderDashboard = () => {
        switch (role) {
            case 'admin':
                return (
                    <AdminDashboard
                        stats={stats}
                        recentIssues={recentIssues}
                        recentLogs={recentLogs}
                        issuesByStatus={issuesByStatus}
                        issuesByPriority={issuesByPriority}
                        totalUsers={totalUsers}
                        totalTechnicians={totalTechnicians}
                        totalCustodians={totalCustodians}
                        totalLogs={totalLogs}
                    />
                );
            case 'custodian':
                return (
                    <CustodianDashboard
                        stats={stats}
                        recentIssues={recentIssues}
                        issuesByStatus={issuesByStatus}
                        issuesByPriority={issuesByPriority}
                    />
                );
            case 'technician':
                return (
                    <TechnicianDashboard
                        stats={stats}
                        assignedIssues={assignedIssues}
                        myLogs={myLogs}
                        issuesByStatus={issuesByStatus}
                        issuesByPriority={issuesByPriority}
                    />
                );
            default:
                return <div>Unknown role</div>;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            {renderDashboard()}
        </AppLayout>
    );
}
