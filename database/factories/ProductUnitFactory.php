<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\ProductUnit;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ProductUnit>
 */
class ProductUnitFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'name' => 'Single',
            'conversion' => 1,
            'purchase_price' => 0,
            'selling_price' => 0,
            'package_price' => 0,
            'single_unit_price' => 0,
            'package_quantity' => 0,
            'loose_quantity' => 0,
            'quantity_base' => 0,
            'active' => true,
        ];
    }
}
