import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { AlertCircle, CheckCircle, Edit, Filter, Plus, Search, Trash } from 'lucide-react';
import { useState } from 'react';

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

// Mock data for demonstration
const mockUsers = [
    { id: 1, name: 'john doe', email: 'john.doe@example.com', status: 'active' },
    { id: 2, name: 'jane smith', email: 'jane.smith@example.com', status: 'active' },
    { id: 3, name: 'robert johnson', email: 'robert@example.com', status: 'inactive' },
    { id: 4, name: 'emily williams', email: 'emily@example.com', status: 'active' },
    { id: 5, name: 'michael brown', email: 'michael@example.com', status: 'inactive' },
];

export default function Index({ users = mockUsers }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const capitalizeEachWord = (str) => {
        return str
            .split(' ')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const filteredUsers = users.filter((user) => {
        const matchesSearch =
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase());

        if (statusFilter === 'all') return matchesSearch;
        return matchesSearch && user.status === statusFilter;
    });

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const getStatusBadge = (status) => {
        if (status === 'active') {
            return (
                <div className="flex items-center gap-1 text-green-700">
                    <CheckCircle size={16} />
                    <span className="font-medium">Active</span>
                </div>
            );
        }
        return (
            <div className="flex items-center gap-1 text-amber-700">
                <AlertCircle size={16} />
                <span className="font-medium">Inactive</span>
            </div>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Management" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl bg-white p-6 shadow-sm">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div className="flex flex-1 items-center gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500" />
                            <Input
                                type="search"
                                placeholder="Search by name or email..."
                                className="h-11 w-full border-gray-200 pr-4 pl-10 focus:border-blue-500"
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                        </div>

                        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                            <Filter size={16} className="text-gray-500" />
                            <select
                                className="bg-transparent text-sm text-gray-700 focus:outline-none"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>

                    <Button className="flex h-11 items-center gap-2 px-4 text-white transition-colors hover:bg-blue-700">
                        <Plus size={16} />
                        <span>Add New User</span>
                    </Button>
                </div>

                <div className="overflow-hidden rounded-lg border border-gray-200">
                    <Table>
                        <TableHeader className="bg-gray-50">
                            <TableRow>
                                <TableHead className="w-16 text-gray-700">#.</TableHead>
                                <TableHead className="text-gray-700">Name</TableHead>
                                <TableHead className="text-gray-700">Email</TableHead>
                                <TableHead className="text-gray-700">Status</TableHead>
                                <TableHead className="w-24 text-right text-gray-700">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user, index) => (
                                    <TableRow key={user.id} className="transition-colors hover:bg-gray-50">
                                        <TableCell className="font-medium text-gray-500">{user.id}</TableCell>
                                        <TableCell className="font-medium text-gray-800">{capitalizeEachWord(user.name)}</TableCell>
                                        <TableCell className="text-gray-600">{user.email}</TableCell>
                                        <TableCell>{getStatusBadge(user.status)}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center justify-end gap-4">
                                                <button className="rounded-full p-1 transition-colors hover:bg-gray-100">
                                                    <Edit size={18} className="" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (confirm('Are you sure you want to delete this user?')) {
                                                            router.delete(route('users.destroy', user.id), {
                                                                preserveScroll: true,
                                                            });
                                                        }
                                                    }}
                                                    className="rounded-full p-1 transition-colors hover:bg-gray-100"
                                                >
                                                    <Trash size={18} className="text-red-500" />
                                                </button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center text-gray-500">
                                        No users found matching your search criteria
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
                    <div>
                        Showing {filteredUsers.length} of {users.length} users
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="h-8 border-gray-200 px-3">
                            Previous
                        </Button>
                        <div className="flex items-center">
                            <span className="rounded-md bg-black px-3 py-1 font-medium text-white">1</span>
                            <span className="cursor-pointer px-3 py-1 hover:bg-gray-50">2</span>
                            <span className="cursor-pointer px-3 py-1 hover:bg-gray-50">3</span>
                        </div>
                        <Button variant="outline" size="sm" className="h-8 border-gray-200 px-3">
                            Next
                        </Button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
