<?php

namespace App\Services;

use App\Models\User;
use App\Models\Issue;
use Illuminate\Support\Facades\Log;

class TechnicianAssignmentService
{
    /**
     * Automatically assign a technician to an issue based on:
     * 1. Expertise match with issue category
     * 2. Availability status
     * 3. Number of active faults/issues currently assigned
     *
     * @param Issue $issue
     * @return User|null
     */
    public function assignTechnician(Issue $issue): ?User
    {
        // Get all active technicians
        $technicians = User::where('role', 'technician')
            ->where('status', 'active')
            ->get();

        if ($technicians->isEmpty()) {
            Log::warning('No active technicians available for assignment', [
                'issue_id' => $issue->id
            ]);
            return null;
        }

        // Score each technician based on criteria
        $scoredTechnicians = $technicians->map(function ($technician) use ($issue) {
            return [
                'technician' => $technician,
                'score' => $this->calculateScore($technician, $issue)
            ];
        })
        ->filter(function ($item) {
            // Only consider technicians with positive scores
            return $item['score'] > 0;
        })
        ->sortByDesc('score')
        ->values();

        if ($scoredTechnicians->isEmpty()) {
            Log::warning('No suitable technicians found for assignment', [
                'issue_id' => $issue->id,
                'category' => $issue->category
            ]);
            return null;
        }

        // Return the technician with the highest score
        $selectedTechnician = $scoredTechnicians->first()['technician'];
        
        Log::info('Technician automatically assigned', [
            'issue_id' => $issue->id,
            'technician_id' => $selectedTechnician->id,
            'technician_name' => $selectedTechnician->name,
            'score' => $scoredTechnicians->first()['score']
        ]);

        return $selectedTechnician;
    }

    /**
     * Calculate assignment score for a technician
     * Higher score = better match
     *
     * @param User $technician
     * @param Issue $issue
     * @return float
     */
    private function calculateScore(User $technician, Issue $issue): float
    {
        $score = 0;

        // 1. Expertise match (weight: 50 points)
        $expertiseScore = $this->calculateExpertiseScore($technician, $issue);
        $score += $expertiseScore * 50;

        // 2. Availability (weight: 30 points)
        $availabilityScore = $this->calculateAvailabilityScore($technician);
        $score += $availabilityScore * 30;

        // 3. Workload (weight: 20 points) - fewer active issues = higher score
        $workloadScore = $this->calculateWorkloadScore($technician);
        $score += $workloadScore * 20;

        return $score;
    }

    /**
     * Calculate expertise score (0-1)
     * 1.0 = exact match, 0.5 = partial match, 0.0 = no match
     *
     * @param User $technician
     * @param Issue $issue
     * @return float
     */
    private function calculateExpertiseScore(User $technician, Issue $issue): float
    {
        $expertise = $technician->expertise ?? [];

        // If no expertise is set, give a base score (can handle any category)
        if (empty($expertise)) {
            return 0.3; // Base score for technicians without specific expertise
        }

        // Check if technician has expertise in this exact category
        if (in_array($issue->category, $expertise)) {
            return 1.0; // Perfect match
        }

        // Check for related categories (you can expand this logic)
        // For now, if no match, return 0
        return 0.0;
    }

    /**
     * Calculate availability score (0-1)
     * 1.0 = available, 0.5 = busy, 0.0 = unavailable
     *
     * @param User $technician
     * @return float
     */
    private function calculateAvailabilityScore(User $technician): float
    {
        $availability = $technician->availability ?? 'available';

        return match($availability) {
            'available' => 1.0,
            'busy' => 0.5,
            'unavailable' => 0.0,
            default => 0.0
        };
    }

    /**
     * Calculate workload score (0-1)
     * Based on number of active issues assigned
     * Fewer issues = higher score
     *
     * @param User $technician
     * @return float
     */
    private function calculateWorkloadScore(User $technician): float
    {
        // Count active issues (not resolved or closed)
        $activeIssuesCount = Issue::where('assigned_to', $technician->id)
            ->whereNotIn('status', ['resolved', 'closed'])
            ->count();

        // Normalize: 0 issues = 1.0, 5+ issues = 0.0
        // Linear scale: score = max(0, 1 - (count / 5))
        $score = max(0, 1 - ($activeIssuesCount / 5));

        return $score;
    }
}

