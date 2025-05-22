import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { AlertCircle, CheckCircle, Filter, Plus, Search, Shield, User, Users, XCircle } from 'lucide-react';
import { useState } from 'react';
import UserFormDialog from './userForm';

export default function Index({ data }) {
    const [users, setUsers] = useState(data);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [roleFilter, setRoleFilter] = useState('all');
    const [selectedUser, setSelectedUser] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const breadcrumbs = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Users',
            href: '/users',
        },
    ];

    const capitalizeEachWord = (str) => {
        return str
            .split(' ')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const filteredUsers = users.filter((user) => {
        const matchesSearch =
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;

        return matchesSearch && matchesStatus && matchesRole;
    });

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleSaveUser = (userData) => {
        if (selectedUser) {
            setUsers((prevUsers) => prevUsers.map((user) => (user.id === selectedUser.id ? { ...user, ...userData } : user)));
        } else {
            setUsers((prevUsers) => [...prevUsers, { id: users.length + 1, ...userData }]);
        }
        setSelectedUser(null);
        setIsFormOpen(false);
        setIsDialogOpen(false);
    };

    const handleEditUser = (user) => {
        setSelectedUser(user);
        setIsDialogOpen(true);
        setIsFormOpen(true);
    };

    const handleDeleteUser = (userId) => {
        if (confirm('Are you sure you want to delete this user?')) {
            setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
            router.delete(route('users.destroy', userId), {
                preserveScroll: true,
            });
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            active: {
                icon: <CheckCircle size={16} className="text-green-600" />,
                text: 'Active',
                classes: 'bg-green-50 text-green-700 border-green-100',
            },
            inactive: {
                icon: <XCircle size={16} className="text-gray-600" />,
                text: 'Inactive',
                classes: 'bg-gray-50 text-gray-700 border-gray-100',
            },
            pending: {
                icon: <AlertCircle size={16} className="text-amber-600" />,
                text: 'Pending',
                classes: 'bg-amber-50 text-amber-700 border-amber-100',
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

    const getRoleIcon = (role) => {
        switch (role) {
            case 'admin':
                return <Shield className="h-5 w-5 text-purple-600" />;
            case 'manager':
                return <Users className="h-5 w-5 text-blue-600" />;
            case 'user':
                return <User className="h-5 w-5 text-green-600" />;
            default:
                return <User className="h-5 w-5 text-gray-600" />;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Management" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
                    <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="relative w-full flex-1">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500" />
                            <Input
                                type="search"
                                placeholder="Search by name or email..."
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
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="pending">Pending</option>
                                </select>
                            </div>

                            <div className="flex flex-1 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 sm:flex-initial">
                                <Filter size={16} className="shrink-0 text-gray-500" />
                                <select
                                    className="w-full bg-transparent text-sm text-gray-700 focus:outline-none"
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                >
                                    <option value="all">All Roles</option>
                                    <option value="admin">Admin</option>
                                    <option value="technician">Technician</option>
                                    <option value="custodian">Custodian</option>
                                </select>
                            </div>
                        </div>

                        <Button
                            onClick={() => {
                                setSelectedUser(null);
                                setIsFormOpen(true);
                                setIsDialogOpen(true);
                            }}
                            className="flex w-full items-center justify-center gap-2 bg-black text-white hover:bg-gray-700 sm:w-auto"
                        >
                            <Plus size={16} />
                            <span>New User</span>
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Users</CardTitle>
                        <CardDescription>Manage all system users and their permissions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow className="uppercase">
                                    <TableHead className="font-medium">ID</TableHead>
                                    <TableHead className="font-medium">Name</TableHead>
                                    <TableHead className="font-medium">Email</TableHead>
                                    <TableHead className="font-medium">Role</TableHead>
                                    <TableHead className="font-medium">Status</TableHead>
                                    <TableHead className="w-24 text-right font-medium"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map((user) => (
                                        <TableRow key={user.id} className="border-b border-gray-100 transition-colors hover:bg-gray-50">
                                            <TableCell className="font-medium text-gray-500">{user.id}</TableCell>
                                            <TableCell className="font-medium text-gray-800">
                                                {capitalizeEachWord(user.name)}
                                                {user.created_at && (
                                                    <div className="text-xs text-gray-500">{new Date(user.created_at).toLocaleDateString()}</div>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-gray-600">{user.email}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {getRoleIcon(user.role)}
                                                    <span className="capitalize">{user.role}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(user.status)}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 border-gray-200 px-2 hover:bg-blue-50 hover:text-blue-600"
                                                        onClick={() => handleEditUser(user)}
                                                    >
                                                        View
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 border-gray-200 px-2 hover:bg-red-50 hover:text-red-600"
                                                        onClick={() => handleDeleteUser(user.id)}
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
                                                <p>No users found matching your search criteria</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                    <CardFooter className="justify-between border-t px-6 py-3">
                        <div className="text-sm text-gray-500">
                            Showing <span className="font-medium">{filteredUsers.length}</span> of <span className="font-medium">{users.length}</span>{' '}
                            users
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
                <UserFormDialog
                    user={selectedUser}
                    isOpen={isDialogOpen}
                    onSave={handleSaveUser}
                    onClose={() => {
                        setIsFormOpen(false);
                        setIsDialogOpen(false);
                    }}
                />
            )}
        </AppLayout>
    );
}
