<?php

namespace Database\Factories;

use App\Models\Sale;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class SaleFactory extends Factory
{
    protected $model = Sale::class;

    public function definition(): array
    {
        return [
            'invoice_number' => Sale::generateInvoiceNumber(),
            'total_amount' => 0,
            'payment_method' => 'cash',
            'amount_paid' => 0,
            'change' => 0,
            'user_id' => User::factory(),
        ];
    }
}
