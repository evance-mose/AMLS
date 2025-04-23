import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from '@inertiajs/react';
import { Save, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function LogFormDialog({ log = null, issues = [], isOpen = false, onOpenChange = () => {}, onSave = () => {}, onClose = () => {} }) {
    const isEditMode = !!log;
    const [selectedIssue, setSelectedIssue] = useState(null);

    const availableIssues = issues;

    const { data, setData, post, put, processing, errors, reset } = useForm({
        user_id: '',
        issue_id: '',
        action_taken: '',
        status: 'pending',
        issue_title: '',
        issue_type: '',
        atm_id: '',
    });

    useEffect(() => {
        if (log) {
            setData({
                user_id: log.user_id || '',
                issue_id: log.issue_id || '',
                action_taken: log.action_taken || '',
                status: log.status || 'pending',
                issue_title: log.issue?.title || '',
                issue_type: log.issue?.type || '',
                atm_id: log.issue?.atm_id || '',
                description: log.issue?.description || '',
            });
            if (log.issue_id) {
                const issue = availableIssues.find((i) => i.id === log.issue_id);
                setSelectedIssue(issue || null);
            }
        }
    }, [log, availableIssues, setData]);

    useEffect(() => {
        if (!isOpen) {
            reset();
            setSelectedIssue(null);
            if (onClose) {
                onClose();
            }
        }
    }, [isOpen, onClose, reset, data]);

    const handleIssueChange = (issueId) => {
        const issue = availableIssues.find((i) => i.id === issueId);

        if (issue) {
            setData({
                ...data,
                issue_id: issueId,
                issue_title: issue.title || '',
                issue_type: issue.type || '',
                atm_id: issue.atm_id || '',
                description: issue.description || '',
                combo: `#${issue.atm_id}:${issue.title}`,
            });

            setSelectedIssue(issue);
            console.log('Selected issue:', issue);
        } else {
            setData({
                ...data,
                issue_id: issueId,
                issue_title: '',
                issue_type: '',
                atm_id: '',
            });
            setSelectedIssue(null);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (isEditMode) {
            put(route('logs.update', log.id), {
                onSuccess: () => {
                    onSave(data);
                    onOpenChange(false);
                },
            });
        } else {
            post(route('logs.store'), {
                onSuccess: () => {
                    onSave(data);
                    onOpenChange(false);
                },
            });
        }
    };

    const handleOpenChange = (open) => {
        onOpenChange(open);
        if (!open) onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-md md:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-xl">{isEditMode ? 'Log Entry' : 'Create New Log Entry'}</DialogTitle>
                    <DialogDescription>
                        {isEditMode ? 'Update log details and status.' : 'Fill in the information to create a new log entry.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    <div className="space-y-4">
                        {isEditMode ? (
                            <>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="w-full space-y-2">
                                        <Label htmlFor="date" className="text-sm font-medium">
                                            ATM ID
                                        </Label>
                                        <Input id="atm_id" value={log?.issue?.atm_id} className="w-full" disabled aria-label="Log creation date" />
                                    </div>
                                    <div className="w-full space-y-2">
                                        <Label htmlFor="assigned" className="text-sm font-medium">
                                            Issue
                                        </Label>
                                        <Input
                                            id="assigned"
                                            value={log?.issue?.type || 'Unassigned'}
                                            className="w-full"
                                            disabled
                                            aria-label="Assigned user name"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="action_taken" className="text-sm font-medium">
                                        Description
                                    </Label>
                                    <Textarea
                                        id="action_taken"
                                        placeholder="Describe actions taken for this issue"
                                        value={log?.issue.description}
                                        onChange={(e) => setData('action_taken', e.target.value)}
                                        className={`min-h-16 w-full ${errors.action_taken ? 'border-red-500' : ''}`}
                                        aria-invalid={!!errors.action_taken}
                                        aria-describedby="description"
                                        disabled
                                    />
                                    {errors.action_taken && <p className="mt-1 text-xs font-medium text-red-500">{errors.action_taken}</p>}
                                    <p id="action-taken-description" className="text-xs text-gray-500">
                                        Provide details about actions taken regarding this issue.
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="action_taken" className="text-sm font-medium">
                                        Action Taken
                                    </Label>
                                    <Textarea
                                        id="action_taken"
                                        placeholder="Describe actions taken for this issue"
                                        value={data.action_taken}
                                        onChange={(e) => setData('action_taken', e.target.value)}
                                        className={`min-h-24 w-full ${errors.action_taken ? 'border-red-500' : ''}`}
                                        aria-invalid={!!errors.action_taken}
                                        aria-describedby="action-taken-description"
                                    />
                                    {errors.action_taken && <p className="mt-1 text-xs font-medium text-red-500">{errors.action_taken}</p>}
                                    <p id="action-taken-description" className="text-xs text-gray-500">
                                        Provide details about actions taken regarding this issue.
                                    </p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex w-full space-x-4">
                                    <div className="flex-1 space-y-2">
                                        <Label htmlFor="issue_id" className="text-sm font-medium">
                                            Issue ID
                                        </Label>
                                        <Select
                                            value={`#${selectedIssue?.atm_id}:${selectedIssue?.title}`}
                                            onValueChange={handleIssueChange}
                                            name="issue_id"
                                        >
                                            <SelectTrigger id="issue_id" className={`w-full ${errors.issue_id ? 'border-red-500' : ''}`}>
                                                <SelectValue placeholder="Select an issue" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectLabel>Active Issues</SelectLabel>
                                                    {availableIssues.map((issue) => (
                                                        <SelectItem key={issue.id} value={issue.id}>
                                                            #{issue.atm_id}: {issue.title}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                        {errors.issue_id && <p className="mt-1 text-xs font-medium text-red-500">{errors.issue_id}</p>}
                                    </div>

                                    <div className="flex-1 space-y-2">
                                        <Label htmlFor="atm_id" className="text-sm font-medium">
                                            ATM ID
                                        </Label>
                                        <Input id="atm_id" value={selectedIssue?.atm_id} className="w-full" disabled aria-label="ATM ID" />
                                    </div>
                                </div>

                                <div className="flex w-full space-x-4">
                                    <div className="flex-1 space-y-2">
                                        <Label htmlFor="issue_title" className="text-sm font-medium">
                                            Title
                                        </Label>
                                        <Input id="issue_title" value={selectedIssue?.title} className="w-full" disabled aria-label="Issue title" />
                                    </div>

                                    <div className="flex-1 space-y-2">
                                        <Label htmlFor="issue_type" className="text-sm font-medium">
                                            Type
                                        </Label>
                                        <Input id="issue_type" value={selectedIssue?.type} className="w-full" disabled aria-label="Issue type" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="action_taken" className="text-sm font-medium">
                                        About the issue
                                    </Label>
                                    <Textarea
                                        id="action_taken"
                                        placeholder="Deatils about the issue"
                                        value={selectedIssue?.description}
                                        onChange={(e) => setData('action_taken', e.target.value)}
                                        className={`min-h-24 w-full ${errors.action_taken ? 'border-red-500' : ''}`}
                                        aria-invalid={!!errors.action_taken}
                                        aria-describedby="action-taken-description"
                                        disabled
                                    />
                                    {errors.action_taken && <p className="mt-1 text-xs font-medium text-red-500">{errors.action_taken}</p>}
                                    <p id="action-taken-description" className="text-xs text-gray-500">
                                        Detail about this issue.
                                    </p>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="status" className="text-sm font-medium">
                                Status
                            </Label>
                            <Select value={data.status} onValueChange={(value) => setData('status', value)} name="status">
                                <SelectTrigger
                                    id="status"
                                    className={`w-full ${errors.status ? 'border-red-500' : ''}`}
                                    aria-invalid={!!errors.status}
                                    aria-describedby="status-description"
                                >
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
                            <p id="status-description" className="text-xs text-gray-500">
                                Current status of the issue.
                            </p>
                        </div>
                        <div className="w-full space-y-2">
                            <Label htmlFor="assigned" className="text-sm font-medium">
                                Assigned To
                            </Label>
                            <Input
                                id="assigned"
                                value={log?.user?.name || 'Unassigned'}
                                className="w-full"
                                disabled
                                aria-label="Assigned user name"
                            />
                        </div>
                    </div>
                    <DialogFooter className="sm:justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
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
                            aria-label={isEditMode ? 'Update log entry' : 'Create log entry'}
                        >
                            <Save size={16} />
                            {isEditMode ? 'Update Log' : 'Create Log'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
