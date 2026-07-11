<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Alcohol', 'description' => 'Alcohol beverages including rum, wine and beer', 'is_active' => true],
            ['name' => 'Chips & Crisps', 'description' => 'Potato chips, corn chips and snacks', 'is_active' => true],
            ['name' => 'Cigarettes', 'description' => 'Tobacco products', 'is_active' => true],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
