import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from '@inertiajs/react';
import { Save, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function IssueFormDialog({ issue, isOpen, onSave, onClose }) {
    const isEditMode = !!issue;
    const { data, setData, post, put, processing, errors, reset } = useForm({
        title: '',
        atm_id: '',
        type: 'hardware',
        description: '',
        status: 'pending',
        user_id: 'unassigned',
    });

    const [users, setUsers] = useState([]);

    useEffect(() => {
        if (issue) {
            setData({
                title: issue.title || '',
                atm_id: issue.atm_id || '',
                type: issue.type || 'hardware',
                description: issue.description || '',
                status: issue.status || 'pending',
                user_id: issue.user_id || 'unassigned',
            });
        } else {
            reset();
        }

        setUsers([
            { id: 1, name: 'John Doe' },
            { id: 2, name: 'Jane Smith' },
            { id: 3, name: 'Robert Johnson' },
            { id: 4, name: 'Emily Davis' },
        ]);
    }, [issue, setData, reset]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData(name, value);
    };

    const handleSelectChange = (name, value) => {
        setData(name, value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (isEditMode) {
            put(route('issues.update', issue.id), {
                onSuccess: () => {
                    onSave(data);
                    onClose();
                    reset();
                },
            });
        } else {
            post(route('issues.store'), {
                onSuccess: () => {
                    onSave(data);
                    onClose();
                    reset();
                },
            });
        }
    };

    const handleOpenChange = (open) => {
        if (!open) onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-md md:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-xl">{isEditMode ? 'Edit Issue' : 'Create New Issue'}</DialogTitle>
                    <DialogDescription>
                        {isEditMode ? 'Update issue details and status.' : 'Fill in the information to create a new issue.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="w-full space-y-2">
                                <Label htmlFor="title" className="text-sm font-medium">
                                    Title <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="title"
                                    name="title"
                                    value={data.title}
                                    onChange={handleChange}
                                    className={`w-full ${errors.title ? 'border-red-500' : ''}`}
                                    aria-invalid={!!errors.title}
                                />
                                {errors.title && <p className="mt-1 text-xs font-medium text-red-500">{errors.title}</p>}
                            </div>

                            <div className="w-full space-y-2">
                                <Label htmlFor="atm_id" className="text-sm font-medium">
                                    ATM ID <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="atm_id"
                                    name="atm_id"
                                    value={data.atm_id}
                                    onChange={handleChange}
                                    className={`w-full ${errors.atm_id ? 'border-red-500' : ''}`}
                                    aria-invalid={!!errors.atm_id}
                                />
                                {errors.atm_id && <p className="mt-1 text-xs font-medium text-red-500">{errors.atm_id}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="w-full space-y-2">
                                <Label htmlFor="type" className="text-sm font-medium">
                                    Issue Type
                                </Label>
                                <Select value={data.type} onValueChange={(value) => handleSelectChange('type', value)} name="type">
                                    <SelectTrigger id="type" className="w-full">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Issue Type</SelectLabel>
                                            <SelectItem value="hardware">Hardware</SelectItem>
                                            <SelectItem value="software">Software</SelectItem>
                                            <SelectItem value="network">Network</SelectItem>
                                            <SelectItem value="security">Security</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                {errors.type && <p className="mt-1 text-xs font-medium text-red-500">{errors.type}</p>}
                            </div>

                            <div className="w-full space-y-2">
                                <Label htmlFor="status" className="text-sm font-medium">
                                    Status
                                </Label>
                                <Select value={data.status} onValueChange={(value) => handleSelectChange('status', value)} name="status">
                                    <SelectTrigger id="status" className="w-full">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Status</SelectLabel>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="in_progress">In Progress</SelectItem>
                                            <SelectItem value="resolved">Resolved</SelectItem>
                                            <SelectItem value="closed">Closed</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                {errors.status && <p className="mt-1 text-xs font-medium text-red-500">{errors.status}</p>}
                            </div>
                        </div>

                        <div className="w-full space-y-2">
                            <Label htmlFor="user_id" className="text-sm font-medium">
                                Sender
                            </Label>
                            <Select value={data.user_id} onValueChange={(value) => handleSelectChange('user_id', value)} name="user_id">
                                <SelectTrigger id="user_id" className="w-full">
                                    <SelectValue placeholder="Select user" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Users</SelectLabel>
                                        <SelectItem value="unassigned">Unassigned</SelectItem>
                                        {users.map((user) => (
                                            <SelectItem key={user.id} value={user.id.toString()}>
                                                {user.name}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            {errors.user_id && <p className="mt-1 text-xs font-medium text-red-500">{errors.user_id}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-sm font-medium">
                                Description
                            </Label>
                            <Textarea
                                id="description"
                                name="description"
                                placeholder="Describe the issue in detail"
                                value={data.description}
                                onChange={handleChange}
                                className="min-h-24 w-full"
                                aria-describedby="description-help"
                            />
                            {errors.description && <p className="mt-1 text-xs font-medium text-red-500">{errors.description}</p>}
                            <p id="description-help" className="text-xs text-gray-500">
                                Provide detailed information about the issue to help with resolution.
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="sm:justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="flex items-center gap-1"
                            disabled={processing}
                            aria-label="Cancel form"
                        >
                            <X size={16} />
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="flex items-center gap-1 bg-black text-white hover:bg-gray-700"
                            disabled={processing}
                            aria-label={isEditMode ? 'Update issue' : 'Create issue'}
                        >
                            <Save size={16} />
                            {processing ? 'Saving...' : isEditMode ? 'Update Issue' : 'Create Issue'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
