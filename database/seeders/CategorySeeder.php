<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            // Liquor Categories
            ['name' => 'Whiskey', 'description' => 'Premium whiskey brands', 'is_active' => true],
            ['name' => 'Brandy', 'description' => 'Local and imported brandy', 'is_active' => true],
            ['name' => 'Rum', 'description' => 'White and dark rum varieties', 'is_active' => true],
            ['name' => 'Gin', 'description' => 'Gin and tonic spirits', 'is_active' => true],
            ['name' => 'Vodka', 'description' => 'Premium vodka brands', 'is_active' => true],
            ['name' => 'Beer', 'description' => 'Local and imported beers', 'is_active' => true],
            ['name' => 'Wine', 'description' => 'Red, white, and sparkling wines', 'is_active' => true],
            ['name' => 'Liqueurs', 'description' => 'Flavored liqueurs and cordials', 'is_active' => true],
            ['name' => 'Cocktail Mixers', 'description' => 'Soda, tonic, and juice mixers', 'is_active' => true],
            
            // Snacks Categories
            ['name' => 'Chips & Crisps', 'description' => 'Potato chips, corn chips, and crispy snacks', 'is_active' => true],
            ['name' => 'Nuts & Seeds', 'description' => 'Peanuts, cashews, almonds, and mixed nuts', 'is_active' => true],
            ['name' => 'Chocolate', 'description' => 'Chocolate bars, truffles, and candies', 'is_active' => true],
            ['name' => 'Biscuits & Cookies', 'description' => 'Sweet and savory biscuits', 'is_active' => true],
            ['name' => 'Candy & Gum', 'description' => 'Hard candy, chewy candy, and chewing gum', 'is_active' => true],
            ['name' => 'Instant Noodles', 'description' => 'Cup noodles and packet noodles', 'is_active' => true],
            ['name' => 'Crackers', 'description' => 'Salted, flavored, and cream crackers', 'is_active' => true],
            ['name' => 'Dried Fruits', 'description' => 'Raisins, apricots, and mixed dried fruits', 'is_active' => true],
            ['name' => 'Popcorn', 'description' => 'Butter, cheese, and caramel popcorn', 'is_active' => true],
            ['name' => 'Cigarettes', 'description' => 'Tobacco products', 'is_active' => true],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
