<?php

namespace App\Console\Commands;

use App\Models\LocationTrailPoint;
use Illuminate\Console\Command;

class PruneLocationTrailCommand extends Command
{
    protected $signature = 'location-trail:prune {--days= : Override retention days (default from config)}';

    protected $description = 'Delete location trail points older than the configured retention period';

    public function handle(): int
    {
        $days = $this->option('days') !== null
            ? (int) $this->option('days')
            : (int) config('location_trail.retention_days', 90);

        if ($days < 1) {
            $this->error('Days must be at least 1.');

            return self::FAILURE;
        }

        $cutoff = now()->subDays($days);
        $deleted = LocationTrailPoint::query()->where('recorded_at', '<', $cutoff)->delete();

        $this->info("Deleted {$deleted} location trail point(s) older than {$days} days.");

        return self::SUCCESS;
    }
}
