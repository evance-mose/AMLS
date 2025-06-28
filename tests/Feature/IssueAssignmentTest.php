<?php

namespace Tests\Feature;

use App\Models\Issue;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class IssueAssignmentTest extends TestCase
{
    use RefreshDatabase;

    public function test_issue_can_be_assigned_to_user()
    {
        // Create a user to assign the issue to
        $assignedUser = User::factory()->create([
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'role' => 'technician'
        ]);

        // Create an issue
        $issue = Issue::factory()->create([
            'atm_id' => 'ATM123',
            'location' => 'Test Location',
            'category' => 'dispenser_errors',
            'description' => 'Test issue description',
            'status' => 'pending',
            'priority' => 'medium'
        ]);

        // Update the issue to assign it to the user
        $response = $this->put(route('issues.update', $issue->id), [
            'assigned_to' => $assignedUser->id,
            'location' => 'Test Location',
            'atm_id' => 'ATM123',
            'category' => 'dispenser_errors',
            'description' => 'Test issue description',
            'status' => 'acknowledged',
            'priority' => 'medium'
        ]);

        $response->assertRedirect();

        // Refresh the issue from database
        $issue->refresh();

        // Assert that the issue is now assigned to the user
        $this->assertEquals($assignedUser->id, $issue->assigned_to);
        $this->assertEquals('acknowledged', $issue->status);
    }

    public function test_issue_can_be_created_with_assignment()
    {
        // Create a user to assign the issue to
        $assignedUser = User::factory()->create([
            'name' => 'Jane Smith',
            'email' => 'jane@example.com',
            'role' => 'technician'
        ]);

        // Create a user to report the issue
        $reporter = User::factory()->create([
            'name' => 'Reporter',
            'email' => 'reporter@example.com',
            'role' => 'admin'
        ]);

        $this->actingAs($reporter);

        // Create an issue with assignment
        $response = $this->post(route('issues.store'), [
            'assigned_to' => $assignedUser->id,
            'location' => 'Test Location',
            'atm_id' => 'ATM456',
            'category' => 'card_reader_errors',
            'description' => 'Test issue description',
            'status' => 'pending',
            'priority' => 'high'
        ]);

        $response->assertRedirect();

        // Get the created issue
        $issue = Issue::latest()->first();

        // Assert that the issue is assigned to the correct user
        $this->assertEquals($assignedUser->id, $issue->assigned_to);
        $this->assertEquals($reporter->id, $issue->user_id);
        $this->assertEquals('ATM456', $issue->atm_id);
    }

    public function test_technician_can_only_see_assigned_issues()
    {
        // Create a technician
        $technician = User::factory()->create([
            'name' => 'Technician',
            'email' => 'tech@example.com',
            'role' => 'technician'
        ]);

        // Create another user
        $otherUser = User::factory()->create([
            'name' => 'Other User',
            'email' => 'other@example.com',
            'role' => 'technician'
        ]);

        // Create issues assigned to different users
        $assignedIssue = Issue::factory()->create([
            'assigned_to' => $technician->id,
            'status' => 'pending'
        ]);

        $otherIssue = Issue::factory()->create([
            'assigned_to' => $otherUser->id,
            'status' => 'pending'
        ]);

        $this->actingAs($technician);

        // Get the issues index
        $response = $this->get(route('issues.index'));

        $response->assertOk();

        // The technician should only see their assigned issues
        $response->assertSee($assignedIssue->atm_id);
        $response->assertDontSee($otherIssue->atm_id);
    }
}
