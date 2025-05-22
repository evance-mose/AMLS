import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { SharedData } from '@/types';
import { useForm, usePage } from '@inertiajs/react';
import { Save, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function IssueFormDialog({ issue, isOpen, onSave, onClose }) {
    const { auth } = usePage<SharedData>().props;
    const isEditMode = !!issue;
    const { data, setData, post, put, processing, errors, reset } = useForm({
        atm_id: '',
        location: '',
        category: 'epp_errors',
        description: '',
        status: 'pending',
        priority: 'low',
        user_id: 'unassigned',
    });

    const [users, setUsers] = useState([]);

    useEffect(() => {
        if (issue) {
            setData({
                location: issue.location || '',
                atm_id: issue.atm_id || '',
                category: issue.category || '',
                description: issue.description || '',
                status: issue.status || 'pending',
                user_id: issue.user_id || 'unassigned',
                priority: issue.priority || '',
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
                            <div className="w-full space-y-2">
                                <Label htmlFor="location" className="text-sm font-medium">
                                    Location <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="location"
                                    name="location"
                                    value={data.location}
                                    onChange={handleChange}
                                    className={`w-full ${errors.location ? 'border-red-500' : ''}`}
                                    aria-invalid={!!errors.location}
                                />
                                {errors.location && <p className="mt-1 text-xs font-medium text-red-500">{errors.location}</p>}
                            </div>
                        </div>
                        <div className="w-full space-y-2">
                            <Label htmlFor="category" className="text-sm font-medium">
                                Category
                            </Label>
                            <Select value={data.category} onValueChange={(value) => handleSelectChange('category', value)} name="category">
                                <SelectTrigger id="category" className="w-full">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Category</SelectLabel>
                                        <SelectItem value="dispenser_errors">Dispenser Errors</SelectItem>
                                        <SelectItem value="card_reader_errors">Card Reader Errors</SelectItem>
                                        <SelectItem value="receipt_printer_errors">Receipt Printer Errors</SelectItem>
                                        <SelectItem value="epp_errors">EPP Errors</SelectItem>
                                        <SelectItem value="pc_core_errors">PC Core Errors</SelectItem>
                                        <SelectItem value="journal_printer_errors">Journal Printer Errors</SelectItem>
                                        <SelectItem value="recycling_module_errors">Recycling Module Errors</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            {errors.category && <p className="mt-1 text-xs font-medium text-red-500">{errors.category}</p>}
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
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                                        <SelectItem value="acknowledged">Acknowledged</SelectItem>
                                        <SelectItem value="resolved">Resolved</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            {errors.status && <p className="mt-1 text-xs font-medium text-red-500">{errors.status}</p>}
                        </div>
                        <div className="w-full space-y-2">
                            <Label htmlFor="priority" className="text-sm font-medium">
                                Priority level
                            </Label>
                            <Select value={data.priority} onValueChange={(value) => handleSelectChange('priority', value)} name="priority">
                                <SelectTrigger id="priority" className="w-full">
                                    <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Priority Level</SelectLabel>
                                        <SelectItem value="high">High</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="low">Low</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            {errors.priority && <p className="mt-1 text-xs font-medium text-red-500">{errors.priority}</p>}
                        </div>

                        {isEditMode && (
                            <div className="w-full space-y-2">
                                <Label htmlFor="user_id" className="text-sm font-medium">
                                    Reported By
                                </Label>
                                <Input
                                    id="user_id"
                                    name="user_id"
                                    value={issue.user.name}
                                    onChange={handleChange}
                                    className={`w-full ${errors.atm_id ? 'border-red-500' : ''}`}
                                    disabled
                                />
                            </div>
                        )}
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
