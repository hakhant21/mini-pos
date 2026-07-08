<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Unit;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ProductVariantFactory extends Factory
{
    protected $model = ProductVariant::class;

    public function definition(): array
    {
        $costPrice = fake()->randomFloat(2, 1, 50);
        $sellingPrice = $costPrice * fake()->randomFloat(2, 1.1, 1.5);
        $stockQuantity = fake()->randomFloat(2, 0, 200);

        return [
            'product_id' => Product::factory(),
            'unit_id' => Unit::factory(),
            'name' => fake()->optional()->randomElement(['Small', 'Medium', 'Large', 'Family Size', 'Single', 'Twin Pack']),
            'sku' => strtoupper(Str::random(10)),
            'units_per_package' => fake()->randomFloat(2, 1, 24),
            'cost_price' => $costPrice,
            'selling_price' => round($sellingPrice, 2),
            'per_unit_price' => 0,
            'stock_quantity' => $stockQuantity,
            'min_stock_level' => fake()->randomFloat(2, 0, 20),
            'max_stock_level' => $stockQuantity > 0 ? $stockQuantity * fake()->randomFloat(2, 1.2, 2) : 100,
            'is_active' => true,
        ];
    }

    public function configure(): static
    {
        return $this->afterCreating(function (ProductVariant $variant) {
            $variant->recalculatePerUnitPrice();
            $variant->save();
        });
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    public function forProduct(Product $product): static
    {
        return $this->state(fn (array $attributes) => [
            'product_id' => $product->id,
        ]);
    }

    public function withUnit(Unit $unit): static
    {
        return $this->state(fn (array $attributes) => [
            'unit_id' => $unit->id,
        ]);
    }
}
