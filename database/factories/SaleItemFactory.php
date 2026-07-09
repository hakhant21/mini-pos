<?php

namespace Database\Factories;

use App\Models\ProductVariant;
use App\Models\Sale;
use App\Models\SaleItem;
use Illuminate\Database\Eloquent\Factories\Factory;

class SaleItemFactory extends Factory
{
    protected $model = SaleItem::class;

    public function definition(): array
    {
        $variant = ProductVariant::factory()->create();
        $quantity = fake()->randomFloat(2, 1, 10);

        return [
            'sale_id' => Sale::factory(),
            'product_variant_id' => $variant->id,
            'product_name' => $variant->product->name,
            'variant_name' => $variant->name,
            'unit_name' => $variant->unit?->abbreviation,
            'quantity' => $quantity,
            'unit_price' => $variant->selling_price,
            'cost_price' => $variant->cost_price,
            'total_price' => round($quantity * $variant->selling_price, 2),
        ];
    }
}
