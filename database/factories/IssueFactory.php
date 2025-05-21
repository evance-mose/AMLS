<?php

namespace Database\Factories;

use App\Models\Issue;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class IssueFactory extends Factory
{
    protected $model = Issue::class;

    public function definition() : array
    {
        return [
            'user_id' => User::factory(),
            'location' => $this->faker->city(),
            'atm_id' => $this->faker->unique()->bothify('ATM####'),
            'type' => $this->faker->randomElement(['hardware', 'software', 'network', 'security', 'other']),
            'description' => $this->faker->paragraph(),
            'status' => $this->faker->randomElement(['pending', 'in_progress', 'resolved', 'closed']),
            'priority' => $this->faker->randomElement(['low', 'medium', 'high']),
        ];
    }
}
