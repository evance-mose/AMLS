<?php

namespace App\Notifications;

use App\Models\Issue;
use App\Models\Log;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class IssueResolved extends Notification implements ShouldQueue
{
    use Queueable;

    protected $issue;
    protected $log;

    public function __construct(Issue $issue, Log $log)
    {
        $this->issue = $issue;
        $this->log = $log;
    }


    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }


    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
                    ->subject('Issue Resolved: ' . $this->issue->title)
                    ->greeting('Hello ' . $notifiable->name . ',')
                    ->line('Good news! Your reported issue has been resolved.')
                    ->line('**Issue Details:**')
                    ->line('Title: ' . $this->issue->title)
                    ->line('Description: ' . $this->issue->description)
                    ->line('**Resolution Details:**')
                    ->line('Action Taken: ' . $this->log->action_taken)
                    ->line('Resolved By: ' . ($this->log->user ? $this->log->user->name : 'System'))
                    ->line('Resolution Date: ' . $this->log->updated_at->format('M d, Y h:i A'))
                    ->line('Thank you for reporting this issue. If you have any questions about the resolution, please don\'t hesitate to contact us.')
                    ->salutation('Best regards, Support Team');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'issue_id' => $this->issue->id,
            'issue_title' => $this->issue->title,
            'log_id' => $this->log->id,
            'action_taken' => $this->log->action_taken,
            'resolved_by' => $this->log->user ? $this->log->user->name : 'System',
            'resolved_at' => $this->log->updated_at,
            'message' => 'Your issue "' . $this->issue->title . '" has been resolved.',
        ];
    }
}