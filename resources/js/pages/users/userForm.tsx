import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from '@inertiajs/react';
import { Save, X } from 'lucide-react';
import { useEffect } from 'react';

export default function UserFormDialog({ user = null, isOpen = false, onSave = () => {}, onClose = () => {} }) {
    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'user',
        status: 'active',
    });

    useEffect(() => {
        if (user) {
            setData({
                name: user.name || '',
                email: user.email || '',
                password: '',
                password_confirmation: '',
                role: user.role || 'user',
                status: user.status || 'active',
            });
        } else if (isOpen) {
            // Reset form for new user
            setData({
                name: '',
                email: '',
                password: '',
                password_confirmation: '',
                role: 'user',
                status: 'active',
            });
        }
    }, [user, isOpen]);

    useEffect(() => {
        if (!isOpen) {
            reset('name', 'email', 'password', 'password_confirmation', 'role', 'status');
        }
    }, [isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (user) {
            put(route('users.update', user.id), {
                onSuccess: () => {
                    onSave(data);
                    onClose();
                    reset();
                },
            });
        } else {
            post(route('users.store'), {
                onSuccess: () => {
                    onSave(data);
                    onClose();
                    reset();
                },
            });
        }
    };

    const isEditMode = !!user;

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) onClose();
            }}
        >
            <DialogContent className="sm:max-w-md md:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-xl">{isEditMode ? 'Edit User' : 'Create New User'}</DialogTitle>
                    <DialogDescription>
                        {isEditMode ? 'Update user information and permissions.' : 'Fill in the information to create a new user account.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-medium">
                                Full Name
                            </Label>
                            <Input
                                id="name"
                                placeholder="Enter full name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className={`w-full ${errors.name ? 'border-red-500' : ''}`}
                                required
                            />
                            {errors.name && <p className="mt-1 text-xs font-medium text-red-500">{errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium">
                                Email Address
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="user@example.com"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className={`w-full ${errors.email ? 'border-red-500' : ''}`}
                                required
                            />
                            {errors.email && <p className="mt-1 text-xs font-medium text-red-500">{errors.email}</p>}
                        </div>

                        {!isEditMode && (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-sm font-medium">
                                        Password
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Create a strong password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className={`w-full ${errors.password ? 'border-red-500' : ''}`}
                                        required={!isEditMode}
                                    />
                                    {errors.password && <p className="mt-1 text-xs font-medium text-red-500">{errors.password}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation" className="text-sm font-medium">
                                        Confirm Password
                                    </Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        placeholder="Confirm password"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        className="w-full"
                                        required={!isEditMode}
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="role" className="text-sm font-medium">
                                User Role
                            </Label>
                            <Select value={data.role} onValueChange={(value) => setData('role', value)}>
                                <SelectTrigger className={`w-full ${errors.role ? 'border-red-500' : ''}`}>
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Roles</SelectLabel>
                                        <SelectItem value="admin">Administrator</SelectItem>
                                        <SelectItem value="technician">Technician</SelectItem>
                                        <SelectItem value="custodian">Custodian</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            {errors.role && <p className="mt-1 text-xs font-medium text-red-500">{errors.role}</p>}
                            <p className="text-xs text-gray-500">This determines what permissions the user will have in the system.</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status" className="text-sm font-medium">
                                Account Status
                            </Label>
                            <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                                <SelectTrigger className={`w-full ${errors.status ? 'border-red-500' : ''}`}>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Status</SelectLabel>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                        <SelectItem value="pending">Pending Verification</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            {errors.status && <p className="mt-1 text-xs font-medium text-red-500">{errors.status}</p>}
                            <p className="text-xs text-gray-500">Inactive accounts cannot log in to the system.</p>
                        </div>
                    </div>

                    {isEditMode && (
                        <div className="space-y-2">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="reset_password"
                                    checked={data.reset_password}
                                    onChange={(e) => setData('reset_password', e.target.checked)}
                                    className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <Label htmlFor="reset_password" className="text-sm">
                                    Reset user password
                                </Label>
                            </div>
                            <p className="pl-6 text-xs text-gray-500">This will send a password reset email to the user.</p>
                        </div>
                    )}

                    <DialogFooter className="sm:justify-between">
                        <Button type="button" variant="outline" onClick={onClose} className="flex items-center gap-1" disabled={processing}>
                            <X size={16} />
                            Cancel
                        </Button>
                        <Button type="submit" className="flex items-center gap-1 bg-black text-white hover:bg-gray-700" disabled={processing}>
                            <Save size={16} />
                            {isEditMode ? 'Update User' : 'Create User'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
