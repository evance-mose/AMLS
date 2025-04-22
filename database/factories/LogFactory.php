<?php

namespace Database\Factories;

use App\Models\Log;
use App\Models\User;
use App\Models\Issue;
use Illuminate\Database\Eloquent\Factories\Factory;

class LogFactory extends Factory
{
    
    protected $model = Log::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(), 
            'issue_id' => Issue::factory(),
            'action' => $this->faker->word(),
            'type' => $this->faker->randomElement(['hardware', 'software', 'network', 'security', 'other']),
            'issue' => $this->faker->sentence(),
            'description' => $this->faker->paragraph(),
            'status' => $this->faker->randomElement(['pending', 'in_progress', 'resolved', 'closed']),
        ];
    }
}
