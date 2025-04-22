<?php

namespace Database\Factories;

use App\Models\Issue;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class IssueFactory extends Factory
{
    protected $model = Issue::class;

    public function definition()
    {
        return [
            'user_id' => User::factory(),
            'title' => $this->faker->sentence(),
            'atm_id' => $this->faker->unique()->bothify('ATM####'),
            'type' => $this->faker->randomElement(['hardware', 'software', 'network', 'security', 'other']),
            'description' => $this->faker->paragraph(),
            'status' => $this->faker->randomElement(['pending', 'in_progress', 'resolved', 'closed']),
        ];
    }
}
