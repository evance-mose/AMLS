import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { User } from '@/types';
import { useForm } from '@inertiajs/react';
import { Save, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Issue {
    id: number;
    status: string;
    [key: string]: any;
}

type LogFormData = {
    user_id: string;
    issue_id: string;
    action_taken: string;
    priority: string;
    status: string;
    issue_title: string;
    issue_type: string;
    atm_id: string;
    description: string;
    user_name: string;
};

interface LogFormDialogProps {
    log?: Partial<LogFormData> & { id?: number; issue?: Issue; user?: User };
    issues?: Issue[];
    users?: User[];
    isOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    onSave?: (data: LogFormData) => void;
    onClose?: () => void;
}

export default function LogFormDialog({
    log = null,
    issues = [],
    users = [],
    isOpen = false,
    onOpenChange = () => {},
    onSave = () => {},
    onClose = () => {},
}: LogFormDialogProps) {
    const isEditMode = !!log;
    const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const availableIssues = issues.filter((issue) => issue.status !== 'acknowledged');
    const availableUsers = users;

    const { data, setData, post, put, processing, errors, reset } = useForm<LogFormData>({
        user_id: '',
        issue_id: '',
        action_taken: '',
        priority: 'low',
        status: 'pending',
        issue_title: '',
        issue_type: '',
        atm_id: '',
        description: '',
        user_name: '',
    });

    useEffect(() => {
        if (log) {
            setData({
                user_id: log.user_id || '',
                issue_id: log.issue_id || '',
                action_taken: log.action_taken || '',
                status: log.status || 'pending',
                issue_type: log.issue?.category || '',
                atm_id: log.issue?.atm_id || '',
                description: log.issue?.description || '',
                user_name: log.user?.name || '',
                priority: log.priority || '',
                issue_title: log.issue_title || '',
            });
            if (log.issue_id) {
                const issue = issues.find((i) => i.id === log.issue_id) || null;
                setSelectedIssue(issue);
            }
            if (log.user_id) {
                const user = users.find((u) => u.id === log.user_id) || null;
                setSelectedUser(user);
            }
        }
    }, [log, issues, users, setData]);

    useEffect(() => {
        if (!isOpen) {
            reset();
            setSelectedIssue(null);
            setSelectedUser(null);
        }
    }, [isOpen, reset]);

    const formatDate = (dateString: string | undefined) => {
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

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
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

    const handleOpenChange = (open: boolean) => {
        onOpenChange(open);
        if (!open) onClose();
    };

    const handleSelectChange = (name: keyof LogFormData, value: string) => {
        setData(name, value);
        if (name === 'issue_id') {
            const selected = availableIssues.find((i) => i.id === parseInt(value)) || null;
            setSelectedIssue(selected);
            if (selected) {
                setData('atm_id', selected.atm_id || '');
            }
        }
        if (name === 'user_id') {
            const selected = users.find((u) => u.id == parseInt(value)) || null;
            setSelectedUser(selected);
            if (selected) {
                setData('user_name', selected.name || '');
            }
        }
    };

    const handlePriorityChange = (value: string) => {
        setData('priority', value);
    };

    function capitalizeWord(str: string | undefined) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-md md:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-xl">{isEditMode ? 'Log Entry' : 'Assign Issue'}</DialogTitle>
                    <DialogDescription>
                        {isEditMode ? 'Update log details and status.' : 'Fill in the information to assign an issue to a user.'}
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
                                        <Input
                                            id="atm_id"
                                            value={log?.issue?.atm_id || ''}
                                            className="w-full"
                                            disabled
                                            aria-label="Log creation date"
                                        />
                                    </div>
                                    <div className="w-full space-y-2">
                                        <Label htmlFor="assigned" className="text-sm font-medium">
                                            Category
                                        </Label>
                                        <Input
                                            id="assigned"
                                            value={log?.issue.category.replace(/_/g, ' ') || 'Unassigned'}
                                            className="w-full uppercase"
                                            disabled
                                            aria-label="Assigned user name"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description" className="text-sm font-medium">
                                        Description
                                    </Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Describe actions taken for this issue"
                                        value={log?.issue?.description || ''}
                                        className={`min-h-16 w-full ${errors.description ? 'border-red-500' : ''}`}
                                        aria-describedby="description"
                                        disabled
                                    />
                                    {errors.description && <p className="mt-1 text-xs font-medium text-red-500">{errors.description}</p>}
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
                            <></>
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
                            <Label htmlFor="priority" className="text-sm font-medium">
                                Priority level
                            </Label>
                            <Select value={data.priority} onValueChange={handlePriorityChange} name="priority">
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
                        {isEditMode ? (
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
                        ) : (
                            <div className="w-full flex-1 space-y-2">
                                <Label htmlFor="user_id" className="text-sm font-medium">
                                    Assigned To
                                </Label>
                                <Select
                                    value={data.user_id.toString()}
                                    onValueChange={(value) => handleSelectChange('user_id', value)}
                                    name="user_id"
                                >
                                    <SelectTrigger id="user_id" className={`w-full ${errors.user_id ? 'border-red-500' : ''}`}>
                                        <SelectValue placeholder="Select a user">{selectedUser ? selectedUser.name : 'Select a user'}</SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Active Users</SelectLabel>
                                            {availableUsers.map((user) => (
                                                <SelectItem key={user.id} value={user.id.toString()}>
                                                    {user.name}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                {errors.user_id && <p className="mt-1 text-xs font-medium text-red-500">{errors.user_id}</p>}
                            </div>
                        )}
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
                            {isEditMode ? 'Update Log' : 'Assign'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
