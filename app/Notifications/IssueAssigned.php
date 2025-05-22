<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class IssueAssigned extends Notification
{
    use Queueable;

    private $log;
    private $assignedUser;

    public function __construct($log, $assignedUser)
    {
        $this->log = $log;
        $this->assignedUser = $assignedUser;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('New Task Assignment')
            ->greeting('Hello ' . $this->assignedUser->name)
            ->line('You have been assigned a new task.')
            ->line('ATM ID: ' . $this->log->issue->atm_id)
            ->line('Category: ' . ucfirst(str_replace('_', ' ', $this->log->issue->category)))
            ->line('Priority: ' . ucfirst($this->log->priority))
            ->line('Status: ' . ucfirst($this->log->status))
            ->line('Action Required: ' . $this->log->action_taken)
            ->action('View Task', url('/logs'))
            ->line('Thank you for your attention to this matter.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            //
        ];
    }
}
