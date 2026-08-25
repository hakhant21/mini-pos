<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Balance>
 */
class BalanceFactory extends Factory
{
    public function definition(): array
    {
        return [
            'opening_amount' => $this->faker->randomFloat(2, 0, 10000),
            'closing_amount' => $this->faker->randomFloat(2, 0, 10000),
            'total_sale_amount' => $this->faker->randomFloat(2, 0, 10000),
            'total_change_amount' => $this->faker->randomFloat(2, 0, 1000),
            'user_id' => User::factory(),
        ];
    }
}
