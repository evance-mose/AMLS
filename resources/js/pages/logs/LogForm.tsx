import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from '@inertiajs/react';
import { Save, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function LogFormDialog({ log = null, logs = [], onSave = () => {} }) {
    const [open, setOpen] = useState(false);

    // Extract unique users and issues from logs data
    const uniqueUsers = [...new Map(logs.filter((log) => log.user).map((log) => [log.user.id, log.user])).values()];

    const uniqueIssues = [...new Map(logs.filter((log) => log.issue).map((log) => [log.issue.id, log.issue])).values()];

    const { data, setData, post, put, processing, errors, reset } = useForm({
        user_id: '',
        issue_id: '',
        action_taken: '',
        status: 'pending',
    });

    useEffect(() => {
        if (log) {
            setData({
                user_id: log.user_id || '',
                issue_id: log.issue_id || '',
                action_taken: log.action_taken || '',
                status: log.status || 'pending',
            });
            setOpen(true);
        }
    }, [log]);

    useEffect(() => {
        if (!open && !log) {
            reset('user_id', 'issue_id', 'action_taken', 'status');
        }
    }, [open]);

    const handleSubmit = (e) => {
        e.preventDefault();

        // Convert "null" string values to actual null
        const formData = {
            ...data,
            user_id: data.user_id === 'null' ? null : data.user_id,
            issue_id: data.issue_id === 'null' ? null : data.issue_id,
        };

        if (log) {
            put(route('logs.update', log.id), formData, {
                onSuccess: () => {
                    onSave(formData);
                    setOpen(false);
                    reset();
                },
            });
        } else {
            post(route('logs.store'), formData, {
                onSuccess: () => {
                    onSave(formData);
                    setOpen(false);
                    reset();
                },
            });
        }
    };

    const capitalizeEachWord = (str) => {
        return str
            .split(' ')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const isEditMode = !!log;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-md md:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-xl">{isEditMode ? 'Log Entry' : 'Create New Log Entry'}</DialogTitle>
                    <DialogDescription>
                        {isEditMode ? 'Update log details and status.' : 'Fill in the information to create a new log entry.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-1">
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-2">
                            <div className="w-full space-y-2">
                                <Label htmlFor="name" className="text-sm font-medium">
                                    Assigned To
                                </Label>
                                <Input id="name" placeholder="Enter full name" value={log?.user.name} className={`w-full`} disabled />
                                {errors.name && <p className="mt-1 text-xs font-medium text-red-500">{errors.name}</p>}
                            </div>
                            <div className="w-full space-y-2">
                                <Label htmlFor="name" className="text-sm font-medium">
                                    Date
                                </Label>
                                <Input id="name" placeholder="Enter full name" value={log?.created_at} className={`w-full`} disabled />
                                {errors.name && <p className="mt-1 text-xs font-medium text-red-500">{errors.name}</p>}
                            </div>
                        </div>
                        <div className="w-full space-y-2">
                            <Label htmlFor="name" className="text-sm font-medium">
                                Issue Title
                            </Label>
                            <Input id="name" placeholder="Enter full name" value={log?.issue.title} className={`w-full`} disabled />
                            {errors.name && <p className="mt-1 text-xs font-medium text-red-500">{errors.name}</p>}
                        </div>
                        <div className="w-full space-y-2">
                            <Label htmlFor="name" className="text-sm font-medium">
                                Issue Type
                            </Label>
                            <Input id="name" placeholder="Enter full name" value={log?.issue.type} className={`w-full`} disabled />
                            {errors.name && <p className="mt-1 text-xs font-medium text-red-500">{errors.name}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="action_taken" className="text-sm font-medium">
                            Action Taken (Optional)
                        </Label>
                        <Textarea
                            id="action_taken"
                            placeholder="Describe actions taken for this issue"
                            value={data.action_taken || ''}
                            onChange={(e) => setData('action_taken', e.target.value)}
                            className={`min-h-24 w-full ${errors.action_taken ? 'border-red-500' : ''}`}
                        />
                        {errors.action_taken && <p className="mt-1 text-xs font-medium text-red-500">{errors.action_taken}</p>}
                        <p className="text-xs text-gray-500">Provide details about actions taken regarding this issue.</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="status" className="text-sm font-medium">
                            Status
                        </Label>
                        <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                            <SelectTrigger className={`w-full ${errors.status ? 'border-red-500' : ''}`}>
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
                        <p className="text-xs text-gray-500">Current status of the issue.</p>
                    </div>

                    <DialogFooter className="sm:justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-1"
                            disabled={processing}
                        >
                            <X size={16} />
                            Cancel
                        </Button>
                        <Button type="submit" className="flex items-center gap-1 bg-black text-white hover:bg-gray-700" disabled={processing}>
                            <Save size={16} />
                            {isEditMode ? 'Update Log' : 'Create Log'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
