<?php

namespace Database\Seeders;

use App\Models\Log;
use App\Models\User;
use App\Models\Issue;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class LogSeeder extends Seeder
{
    
    public function run(): void
    {
        Log::factory(10)->create();   
    }
}
