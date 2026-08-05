<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Sauces & Seasonings', 'slug' => 'SAS-001', 'description' => 'Condiments and flavoring agents'],
            ['name' => 'Tissue', 'slug' => 'TIS-001', 'description' => 'Paper products for cleaning and hygiene'],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
