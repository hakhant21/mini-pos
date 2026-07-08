<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Beverages', 'description' => 'Drinks and refreshments', 'is_active' => true],
            ['name' => 'Snacks', 'description' => 'Chips, nuts, and quick bites', 'is_active' => true],
            ['name' => 'Dairy', 'description' => 'Milk, cheese, yogurt, and eggs', 'is_active' => true],
            ['name' => 'Bakery', 'description' => 'Bread, pastries, and baked goods', 'is_active' => true],
            ['name' => 'Cleaning Supplies', 'description' => 'Household cleaning products', 'is_active' => true],
            ['name' => 'Canned Goods', 'description' => 'Canned vegetables, soups, and meats', 'is_active' => true],
            ['name' => 'Frozen Foods', 'description' => 'Frozen meals, vegetables, and ice cream', 'is_active' => true],
            ['name' => 'Condiments', 'description' => 'Sauces, dressings, and spreads', 'is_active' => true],
            ['name' => 'Personal Care', 'description' => 'Soap, shampoo, and hygiene products', 'is_active' => true],
            ['name' => 'Household', 'description' => 'Paper products, bags, and wraps', 'is_active' => true],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
