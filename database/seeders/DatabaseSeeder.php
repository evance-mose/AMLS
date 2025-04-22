<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Log;
use App\Models\Issue;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();
        Issue::factory(10)->create();
        Log::factory(10)->create();
    }
}
