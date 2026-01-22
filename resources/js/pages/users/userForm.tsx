import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm } from '@inertiajs/react';
import { Eye, EyeOff, Save, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function UserFormDialog({ user = null, isOpen = false, onSave = () => {}, onClose = () => {} }) {
    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'user',
        status: 'active',
        expertise: [],
        availability: 'available',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

    useEffect(() => {
        if (user) {
            setData({
                name: user.name || '',
                email: user.email || '',
                password: '',
                password_confirmation: '',
                role: user.role || 'user',
                status: user.status || 'active',
                expertise: user.expertise || [],
                availability: user.availability || 'available',
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
                expertise: [],
                availability: 'available',
            });
        }
    }, [user, isOpen]);

    useEffect(() => {
        if (!isOpen) {
            reset('name', 'email', 'password', 'password_confirmation', 'role', 'status', 'expertise', 'availability');
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
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Create a strong password"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            className={`w-full pr-10 ${errors.password ? 'border-red-500' : ''}`}
                                            required={!isEditMode}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((prev) => !prev)}
                                            className="focus:ring-ring/50 absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 focus:ring-2 focus:outline-none"
                                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                                            tabIndex={0}
                                        >
                                            {showPassword ? <EyeOff className="h-3 w-3 text-gray-500" /> : <Eye className="h-3 w-3 text-gray-500" />}
                                        </button>
                                    </div>
                                    {errors.password && <p className="mt-1 text-xs font-medium text-red-500">{errors.password}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation" className="text-sm font-medium">
                                        Confirm Password
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="password_confirmation"
                                            type={showPasswordConfirmation ? 'text' : 'password'}
                                            placeholder="Confirm password"
                                            value={data.password_confirmation}
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                            className="w-full pr-10"
                                            required={!isEditMode}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswordConfirmation((prev) => !prev)}
                                            className="focus:ring-ring/50 absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 focus:ring-2 focus:outline-none"
                                            aria-label={showPasswordConfirmation ? 'Hide password confirmation' : 'Show password confirmation'}
                                            tabIndex={0}
                                        >
                                            {showPasswordConfirmation ? (
                                                <EyeOff className="h-3 w-3 text-gray-500" />
                                            ) : (
                                                <Eye className="h-3 w-3 text-gray-500" />
                                            )}
                                        </button>
                                    </div>
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
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            {errors.status && <p className="mt-1 text-xs font-medium text-red-500">{errors.status}</p>}
                            <p className="text-xs text-gray-500">Inactive accounts cannot log in to the system.</p>
                        </div>
                    </div>

                    {data.role === 'technician' && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">
                                    Availability
                                </Label>
                                <Select value={data.availability} onValueChange={(value) => setData('availability', value)}>
                                    <SelectTrigger className={`w-full ${errors.availability ? 'border-red-500' : ''}`}>
                                        <SelectValue placeholder="Select availability" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Availability Status</SelectLabel>
                                            <SelectItem value="available">Available</SelectItem>
                                            <SelectItem value="busy">Busy</SelectItem>
                                            <SelectItem value="unavailable">Unavailable</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                {errors.availability && <p className="mt-1 text-xs font-medium text-red-500">{errors.availability}</p>}
                                <p className="text-xs text-gray-500">Current availability status of the technician.</p>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium">
                                    Expertise Areas
                                </Label>
                                <div className="space-y-2 rounded-md border p-4">
                                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                        {[
                                            { value: 'dispenser_errors', label: 'Dispenser Errors' },
                                            { value: 'card_reader_errors', label: 'Card Reader Errors' },
                                            { value: 'receipt_printer_errors', label: 'Receipt Printer Errors' },
                                            { value: 'epp_errors', label: 'EPP Errors' },
                                            { value: 'pc_core_errors', label: 'PC Core Errors' },
                                            { value: 'journal_printer_errors', label: 'Journal Printer Errors' },
                                            { value: 'recycling_module_errors', label: 'Recycling Module Errors' },
                                            { value: 'other', label: 'Other' },
                                        ].map((category) => (
                                            <div key={category.value} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`expertise-${category.value}`}
                                                    checked={data.expertise?.includes(category.value) || false}
                                                    onCheckedChange={(checked) => {
                                                        const currentExpertise = data.expertise || [];
                                                        if (checked) {
                                                            setData('expertise', [...currentExpertise, category.value]);
                                                        } else {
                                                            setData('expertise', currentExpertise.filter((e) => e !== category.value));
                                                        }
                                                    }}
                                                />
                                                <Label
                                                    htmlFor={`expertise-${category.value}`}
                                                    className="text-sm font-normal cursor-pointer"
                                                >
                                                    {category.label}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {errors.expertise && <p className="mt-1 text-xs font-medium text-red-500">{errors.expertise}</p>}
                                <p className="text-xs text-gray-500">Select the issue categories this technician is expert in. Used for automatic assignment.</p>
                            </div>
                        </div>
                    )}

                    {isEditMode && <></>}

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
