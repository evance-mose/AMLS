<?php

namespace Tests\Unit\Notifications;

use App\Notifications\IssueAssigned;
use App\Models\User;
use App\Models\Log;
use App\Models\Issue;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class IssueAssignedTest extends TestCase
{
    use RefreshDatabase;

    public function test_notification_is_sent_with_correct_data()
    {
        Notification::fake();

        // Create test data
        $assignedUser = User::factory()->create([
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'role' => 'technician',
            'status' => 'active',
            'password' => bcrypt('password'),
            'email_verified_at' => now()
        ]);

        $issue = Issue::factory()->create([
            'atm_id' => 'ATM123',
            'category' => 'hardware_issue'
        ]);

        $log = Log::factory()->create([
            'issue_id' => $issue->id,
            'priority' => 'high',
            'status' => 'pending',
            'action_taken' => 'Please check the hardware'
        ]);

        // Create notification instance
        $notification = new IssueAssigned($log, $assignedUser);

        // Send notification
        $assignedUser->notify($notification);

        // Assert notification was sent
        Notification::assertSentTo(
            $assignedUser,
            IssueAssigned::class,
            function ($notification, $channels) use ($log, $assignedUser) {
                $mail = $notification->toMail($assignedUser);
                
                return $mail->subject === 'New Task Assignment' &&
                    str_contains($mail->greeting, 'John Doe') &&
                    str_contains($mail->introLines[0], 'You have been assigned a new task') &&
                    str_contains($mail->introLines[1], 'ATM123') &&
                    str_contains($mail->introLines[2], 'Hardware issue') &&
                    str_contains($mail->introLines[3], 'High') &&
                    str_contains($mail->introLines[4], 'Pending') &&
                    str_contains($mail->introLines[5], 'Please check the hardware');
            }
        );
    }
} 