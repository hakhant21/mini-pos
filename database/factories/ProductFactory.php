<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        $name = fake()->unique()->randomElement([
            'Spring Water', 'Cola Soda', 'Orange Juice', 'Potato Chips',
            'Chocolate Bar', 'Milk', 'Cheddar Cheese', 'White Bread',
            'All-Purpose Cleaner', 'Tomato Soup', 'Frozen Pizza',
            'Ketchup', 'Shampoo', 'Paper Towels', 'Mixed Nuts',
        ]);

        return [
            'category_id' => Category::factory(),
            'name' => $name,
            'sku' => strtoupper(Str::random(8)),
            'brand' => fake()->randomElement(['FreshMark', 'Quality Foods', 'Home Essentials', 'Nature\'s Best', 'Daily Goods']),
            'is_active' => true,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    public function forCategory(Category $category): static
    {
        return $this->state(fn (array $attributes) => [
            'category_id' => $category->id,
        ]);
    }
}
