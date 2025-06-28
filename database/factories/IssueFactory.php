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
            'category' => $this->faker->randomElement(['dispenser_errors', 'card_reader_errors', 'receipt_printer_errors', 'epp_errors', 'pc_core_errors', 'journal_printer_errors', 'recycling_module_errors', 'other']),
            'description' => $this->faker->paragraph(),
            'status' => $this->faker->randomElement(['pending', 'acknowledged', 'resolved']),
            'priority' => $this->faker->randomElement(['low', 'medium', 'high']),
        ];
    }
}
