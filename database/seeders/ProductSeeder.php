<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\Unit;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $pc = Unit::where('abbreviation', 'pc')->first();
        $kg = Unit::where('abbreviation', 'kg')->first();
        $g = Unit::where('abbreviation', 'g')->first();
        $l = Unit::where('abbreviation', 'L')->first();
        $ml = Unit::where('abbreviation', 'mL')->first();
        $box = Unit::where('abbreviation', 'box')->first();
        $pk = Unit::where('abbreviation', 'pk')->first();
        $btl = Unit::where('abbreviation', 'btl')->first();
        $can = Unit::where('abbreviation', 'can')->first();
        $bag = Unit::where('abbreviation', 'bag')->first();
        $case = Unit::where('abbreviation', 'case')->first();
        $ctn = Unit::where('abbreviation', 'ctn')->first();

        $products = [
            // ==================== LIQUOR PRODUCTS ====================
            
            // Whiskey
            [
                'category' => 'Whiskey', 'name' => 'Grand Royal Whiskey', 'brand' => 'Grand Royal',
                'variants' => [
                    ['unit' => $btl, 'name' => '750mL', 'sku_suffix' => '750', 'units_per_package' => 1, 'cost_price' => 25.00, 'selling_price' => 35.00, 'stock_quantity' => 50],
                    ['unit' => $l, 'name' => '1L', 'sku_suffix' => '1L', 'units_per_package' => 1, 'cost_price' => 32.00, 'selling_price' => 45.00, 'stock_quantity' => 30],
                ],
            ],
            [
                'category' => 'Whiskey', 'name' => 'Red Label', 'brand' => 'Johnnie Walker',
                'variants' => [
                    ['unit' => $btl, 'name' => '750mL', 'sku_suffix' => '750', 'units_per_package' => 1, 'cost_price' => 45.00, 'selling_price' => 65.00, 'stock_quantity' => 40],
                    ['unit' => $l, 'name' => '1L', 'sku_suffix' => '1L', 'units_per_package' => 1, 'cost_price' => 58.00, 'selling_price' => 85.00, 'stock_quantity' => 25],
                ],
            ],
            [
                'category' => 'Whiskey', 'name' => 'Black Label', 'brand' => 'Johnnie Walker',
                'variants' => [
                    ['unit' => $btl, 'name' => '750mL', 'sku_suffix' => '750', 'units_per_package' => 1, 'cost_price' => 85.00, 'selling_price' => 120.00, 'stock_quantity' => 30],
                ],
            ],
            
            // Brandy
            [
                'category' => 'Brandy', 'name' => 'Mandarin Napoleon', 'brand' => 'Mandarin',
                'variants' => [
                    ['unit' => $btl, 'name' => '750mL', 'sku_suffix' => '750', 'units_per_package' => 1, 'cost_price' => 18.00, 'selling_price' => 28.00, 'stock_quantity' => 60],
                ],
            ],
            [
                'category' => 'Brandy', 'name' => 'VSOP Brandy', 'brand' => 'St. Remy',
                'variants' => [
                    ['unit' => $btl, 'name' => '750mL', 'sku_suffix' => '750', 'units_per_package' => 1, 'cost_price' => 28.00, 'selling_price' => 40.00, 'stock_quantity' => 40],
                ],
            ],
            
            // Rum
            [
                'category' => 'Rum', 'name' => 'Mild Seven Rum', 'brand' => 'Mild Seven',
                'variants' => [
                    ['unit' => $btl, 'name' => '750mL', 'sku_suffix' => '750', 'units_per_package' => 1, 'cost_price' => 12.00, 'selling_price' => 18.00, 'stock_quantity' => 50],
                ],
            ],
            [
                'category' => 'Rum', 'name' => 'Captain Morgan', 'brand' => 'Captain Morgan',
                'variants' => [
                    ['unit' => $btl, 'name' => '750mL', 'sku_suffix' => '750', 'units_per_package' => 1, 'cost_price' => 25.00, 'selling_price' => 35.00, 'stock_quantity' => 30],
                ],
            ],
            
            // Gin
            [
                'category' => 'Gin', 'name' => 'Blue Riband Gin', 'brand' => 'Blue Riband',
                'variants' => [
                    ['unit' => $btl, 'name' => '750mL', 'sku_suffix' => '750', 'units_per_package' => 1, 'cost_price' => 15.00, 'selling_price' => 22.00, 'stock_quantity' => 40],
                ],
            ],
            [
                'category' => 'Gin', 'name' => 'Gordon\'s Gin', 'brand' => 'Gordon\'s',
                'variants' => [
                    ['unit' => $btl, 'name' => '750mL', 'sku_suffix' => '750', 'units_per_package' => 1, 'cost_price' => 22.00, 'selling_price' => 32.00, 'stock_quantity' => 35],
                ],
            ],
            
            // Vodka
            [
                'category' => 'Vodka', 'name' => 'Smirnoff Red', 'brand' => 'Smirnoff',
                'variants' => [
                    ['unit' => $btl, 'name' => '750mL', 'sku_suffix' => '750', 'units_per_package' => 1, 'cost_price' => 20.00, 'selling_price' => 30.00, 'stock_quantity' => 40],
                ],
            ],
            [
                'category' => 'Vodka', 'name' => 'Absolut Vodka', 'brand' => 'Absolut',
                'variants' => [
                    ['unit' => $btl, 'name' => '750mL', 'sku_suffix' => '750', 'units_per_package' => 1, 'cost_price' => 35.00, 'selling_price' => 50.00, 'stock_quantity' => 25],
                ],
            ],
            
            // Beer
            [
                'category' => 'Beer', 'name' => 'Myanmar Beer', 'brand' => 'Myanmar Beer',
                'variants' => [
                    ['unit' => $btl, 'name' => '650mL', 'sku_suffix' => '650', 'units_per_package' => 1, 'cost_price' => 1.50, 'selling_price' => 2.50, 'stock_quantity' => 200],
                    ['unit' => $can, 'name' => '330mL Can', 'sku_suffix' => 'CAN', 'units_per_package' => 1, 'cost_price' => 1.20, 'selling_price' => 2.00, 'stock_quantity' => 150],
                ],
            ],
            [
                'category' => 'Beer', 'name' => 'Mandarin Beer', 'brand' => 'Mandarin',
                'variants' => [
                    ['unit' => $btl, 'name' => '650mL', 'sku_suffix' => '650', 'units_per_package' => 1, 'cost_price' => 2.00, 'selling_price' => 3.00, 'stock_quantity' => 150],
                ],
            ],
            [
                'category' => 'Beer', 'name' => 'Heineken', 'brand' => 'Heineken',
                'variants' => [
                    ['unit' => $btl, 'name' => '650mL', 'sku_suffix' => '650', 'units_per_package' => 1, 'cost_price' => 3.00, 'selling_price' => 4.50, 'stock_quantity' => 100],
                    ['unit' => $can, 'name' => '330mL Can', 'sku_suffix' => 'CAN', 'units_per_package' => 1, 'cost_price' => 2.50, 'selling_price' => 3.50, 'stock_quantity' => 80],
                ],
            ],
            [
                'category' => 'Beer', 'name' => 'Tiger Beer', 'brand' => 'Tiger',
                'variants' => [
                    ['unit' => $btl, 'name' => '650mL', 'sku_suffix' => '650', 'units_per_package' => 1, 'cost_price' => 2.50, 'selling_price' => 3.80, 'stock_quantity' => 120],
                ],
            ],
            
            // Wine
            [
                'category' => 'Wine', 'name' => 'Red Wine', 'brand' => 'Grand Royal',
                'variants' => [
                    ['unit' => $btl, 'name' => '750mL', 'sku_suffix' => '750', 'units_per_package' => 1, 'cost_price' => 15.00, 'selling_price' => 22.00, 'stock_quantity' => 40],
                ],
            ],
            [
                'category' => 'Wine', 'name' => 'White Wine', 'brand' => 'Grand Royal',
                'variants' => [
                    ['unit' => $btl, 'name' => '750mL', 'sku_suffix' => '750', 'units_per_package' => 1, 'cost_price' => 14.00, 'selling_price' => 20.00, 'stock_quantity' => 40],
                ],
            ],
            
            // Liqueurs
            [
                'category' => 'Liqueurs', 'name' => 'Baileys', 'brand' => 'Baileys',
                'variants' => [
                    ['unit' => $btl, 'name' => '750mL', 'sku_suffix' => '750', 'units_per_package' => 1, 'cost_price' => 25.00, 'selling_price' => 38.00, 'stock_quantity' => 30],
                ],
            ],
            
            // Cocktail Mixers
            [
                'category' => 'Cocktail Mixers', 'name' => 'Soda Water', 'brand' => 'Schweppes',
                'variants' => [
                    ['unit' => $btl, 'name' => '300mL', 'sku_suffix' => '300', 'units_per_package' => 1, 'cost_price' => 0.80, 'selling_price' => 1.20, 'stock_quantity' => 100],
                    ['unit' => $btl, 'name' => '1L', 'sku_suffix' => '1L', 'units_per_package' => 1, 'cost_price' => 1.50, 'selling_price' => 2.20, 'stock_quantity' => 60],
                ],
            ],
            [
                'category' => 'Cocktail Mixers', 'name' => 'Tonic Water', 'brand' => 'Schweppes',
                'variants' => [
                    ['unit' => $btl, 'name' => '300mL', 'sku_suffix' => '300', 'units_per_package' => 1, 'cost_price' => 0.90, 'selling_price' => 1.40, 'stock_quantity' => 80],
                    ['unit' => $btl, 'name' => '1L', 'sku_suffix' => '1L', 'units_per_package' => 1, 'cost_price' => 1.80, 'selling_price' => 2.80, 'stock_quantity' => 50],
                ],
            ],
            [
                'category' => 'Cocktail Mixers', 'name' => 'Cola Mix', 'brand' => 'Schweppes',
                'variants' => [
                    ['unit' => $btl, 'name' => '300mL', 'sku_suffix' => '300', 'units_per_package' => 1, 'cost_price' => 0.70, 'selling_price' => 1.10, 'stock_quantity' => 100],
                    ['unit' => $btl, 'name' => '1L', 'sku_suffix' => '1L', 'units_per_package' => 1, 'cost_price' => 1.30, 'selling_price' => 2.00, 'stock_quantity' => 60],
                ],
            ],
            
            // ==================== SNACKS PRODUCTS ====================
            
            // Chips & Crisps
            [
                'category' => 'Chips & Crisps', 'name' => 'Lays Classic', 'brand' => 'Lays',
                'variants' => [
                    ['unit' => $g, 'name' => '40g', 'sku_suffix' => '40G', 'units_per_package' => 1, 'cost_price' => 0.80, 'selling_price' => 1.20, 'stock_quantity' => 200],
                    ['unit' => $g, 'name' => '100g', 'sku_suffix' => '100G', 'units_per_package' => 1, 'cost_price' => 1.50, 'selling_price' => 2.20, 'stock_quantity' => 150],
                ],
            ],
            [
                'category' => 'Chips & Crisps', 'name' => 'Lays Sour Cream', 'brand' => 'Lays',
                'variants' => [
                    ['unit' => $g, 'name' => '40g', 'sku_suffix' => '40G', 'units_per_package' => 1, 'cost_price' => 0.85, 'selling_price' => 1.30, 'stock_quantity' => 180],
                ],
            ],
            [
                'category' => 'Chips & Crisps', 'name' => 'Pringles', 'brand' => 'Pringles',
                'variants' => [
                    ['unit' => $can, 'name' => '170g', 'sku_suffix' => '170G', 'units_per_package' => 1, 'cost_price' => 2.50, 'selling_price' => 3.50, 'stock_quantity' => 100],
                ],
            ],
            [
                'category' => 'Chips & Crisps', 'name' => 'Hwalli Corn Chips', 'brand' => 'Hwalli',
                'variants' => [
                    ['unit' => $g, 'name' => '50g', 'sku_suffix' => '50G', 'units_per_package' => 1, 'cost_price' => 0.50, 'selling_price' => 0.80, 'stock_quantity' => 250],
                ],
            ],
            
            // Nuts & Seeds
            [
                'category' => 'Nuts & Seeds', 'name' => 'Peanuts', 'brand' => 'Local',
                'variants' => [
                    ['unit' => $g, 'name' => '200g', 'sku_suffix' => '200G', 'units_per_package' => 1, 'cost_price' => 2.50, 'selling_price' => 3.80, 'stock_quantity' => 100],
                    ['unit' => $g, 'name' => '500g', 'sku_suffix' => '500G', 'units_per_package' => 1, 'cost_price' => 5.00, 'selling_price' => 7.50, 'stock_quantity' => 60],
                ],
            ],
            [
                'category' => 'Nuts & Seeds', 'name' => 'Cashew Nuts', 'brand' => 'Quality',
                'variants' => [
                    ['unit' => $g, 'name' => '200g', 'sku_suffix' => '200G', 'units_per_package' => 1, 'cost_price' => 4.00, 'selling_price' => 6.00, 'stock_quantity' => 80],
                ],
            ],
            [
                'category' => 'Nuts & Seeds', 'name' => 'Sunflower Seeds', 'brand' => 'Nature',
                'variants' => [
                    ['unit' => $g, 'name' => '100g', 'sku_suffix' => '100G', 'units_per_package' => 1, 'cost_price' => 1.50, 'selling_price' => 2.20, 'stock_quantity' => 100],
                ],
            ],
            [
                'category' => 'Nuts & Seeds', 'name' => 'Pumpkin Seeds', 'brand' => 'Nature',
                'variants' => [
                    ['unit' => $g, 'name' => '100g', 'sku_suffix' => '100G', 'units_per_package' => 1, 'cost_price' => 2.00, 'selling_price' => 3.00, 'stock_quantity' => 80],
                ],
            ],
            
            // Chocolate
            [
                'category' => 'Chocolate', 'name' => 'Dairy Milk', 'brand' => 'Cadbury',
                'variants' => [
                    ['unit' => $g, 'name' => '45g', 'sku_suffix' => '45G', 'units_per_package' => 1, 'cost_price' => 1.20, 'selling_price' => 1.80, 'stock_quantity' => 200],
                    ['unit' => $g, 'name' => '100g', 'sku_suffix' => '100G', 'units_per_package' => 1, 'cost_price' => 2.00, 'selling_price' => 3.00, 'stock_quantity' => 150],
                    ['unit' => $g, 'name' => '200g', 'sku_suffix' => '200G', 'units_per_package' => 1, 'cost_price' => 3.50, 'selling_price' => 5.00, 'stock_quantity' => 100],
                ],
            ],
            [
                'category' => 'Chocolate', 'name' => '5 Star', 'brand' => 'Cadbury',
                'variants' => [
                    ['unit' => $g, 'name' => '42g', 'sku_suffix' => '42G', 'units_per_package' => 1, 'cost_price' => 0.80, 'selling_price' => 1.20, 'stock_quantity' => 250],
                ],
            ],
            [
                'category' => 'Chocolate', 'name' => 'Kit Kat', 'brand' => 'Nestle',
                'variants' => [
                    ['unit' => $g, 'name' => '42g', 'sku_suffix' => '42G', 'units_per_package' => 2, 'cost_price' => 1.00, 'selling_price' => 1.50, 'stock_quantity' => 200],
                ],
            ],
            [
                'category' => 'Chocolate', 'name' => 'Munch', 'brand' => 'Nestle',
                'variants' => [
                    ['unit' => $g, 'name' => '45g', 'sku_suffix' => '45G', 'units_per_package' => 1, 'cost_price' => 0.70, 'selling_price' => 1.00, 'stock_quantity' => 250],
                ],
            ],
            
            // Biscuits & Cookies
            [
                'category' => 'Biscuits & Cookies', 'name' => 'Marie Biscuits', 'brand' => 'PepsiCo',
                'variants' => [
                    ['unit' => $g, 'name' => '100g', 'sku_suffix' => '100G', 'units_per_package' => 1, 'cost_price' => 0.80, 'selling_price' => 1.20, 'stock_quantity' => 200],
                    ['unit' => $g, 'name' => '200g', 'sku_suffix' => '200G', 'units_per_package' => 1, 'cost_price' => 1.50, 'selling_price' => 2.20, 'stock_quantity' => 150],
                ],
            ],
            [
                'category' => 'Biscuits & Cookies', 'name' => 'Cream Cracker', 'brand' => 'PepsiCo',
                'variants' => [
                    ['unit' => $g, 'name' => '100g', 'sku_suffix' => '100G', 'units_per_package' => 1, 'cost_price' => 0.60, 'selling_price' => 0.90, 'stock_quantity' => 250],
                ],
            ],
            [
                'category' => 'Biscuits & Cookies', 'name' => 'Digestive Biscuits', 'brand' => 'McVities',
                'variants' => [
                    ['unit' => $g, 'name' => '200g', 'sku_suffix' => '200G', 'units_per_package' => 1, 'cost_price' => 1.50, 'selling_price' => 2.20, 'stock_quantity' => 120],
                ],
            ],
            [
                'category' => 'Biscuits & Cookies', 'name' => 'Chocolate Chip Cookies', 'brand' => 'Local',
                'variants' => [
                    ['unit' => $g, 'name' => '100g', 'sku_suffix' => '100G', 'units_per_package' => 1, 'cost_price' => 1.20, 'selling_price' => 1.80, 'stock_quantity' => 150],
                ],
            ],
            
            // Candy & Gum
            [
                'category' => 'Candy & Gum', 'name' => 'Mentos', 'brand' => 'Peren',
                'variants' => [
                    ['unit' => $pc, 'name' => 'Roll', 'sku_suffix' => 'ROLL', 'units_per_package' => 14, 'cost_price' => 0.10, 'selling_price' => 0.20, 'stock_quantity' => 500],
                ],
            ],
            [
                'category' => 'Candy & Gum', 'name' => 'Chupa Chups', 'brand' => 'Chupa Chups',
                'variants' => [
                    ['unit' => $pc, 'name' => 'Lollipop', 'sku_suffix' => 'LOL', 'units_per_package' => 1, 'cost_price' => 0.30, 'selling_price' => 0.50, 'stock_quantity' => 300],
                ],
            ],
            [
                'category' => 'Candy & Gum', 'name' => 'Bubble Gum', 'brand' => 'Doublemint',
                'variants' => [
                    ['unit' => $pc, 'name' => '5 Pieces', 'sku_suffix' => '5PC', 'units_per_package' => 5, 'cost_price' => 0.20, 'selling_price' => 0.40, 'stock_quantity' => 400],
                ],
            ],
            
            // Instant Noodles
            [
                'category' => 'Instant Noodles', 'name' => 'Mama', 'brand' => 'Mama',
                'variants' => [
                    ['unit' => $pc, 'name' => 'Chicken', 'sku_suffix' => 'CHK', 'units_per_package' => 1, 'cost_price' => 0.60, 'selling_price' => 0.90, 'stock_quantity' => 300],
                    ['unit' => $pc, 'name' => 'Pork', 'sku_suffix' => 'PRK', 'units_per_package' => 1, 'cost_price' => 0.65, 'selling_price' => 1.00, 'stock_quantity' => 250],
                    ['unit' => $pc, 'name' => 'Seafood', 'sku_suffix' => 'SFD', 'units_per_package' => 1, 'cost_price' => 0.65, 'selling_price' => 1.00, 'stock_quantity' => 250],
                    ['unit' => $ctn, 'name' => 'Carton (30 packs)', 'sku_suffix' => 'CTN', 'units_per_package' => 30, 'cost_price' => 15.00, 'selling_price' => 22.00, 'stock_quantity' => 20],
                ],
            ],
            [
                'category' => 'Instant Noodles', 'name' => 'Yum Yum', 'brand' => 'Yum Yum',
                'variants' => [
                    ['unit' => $pc, 'name' => 'Chicken', 'sku_suffix' => 'CHK', 'units_per_package' => 1, 'cost_price' => 0.50, 'selling_price' => 0.75, 'stock_quantity' => 300],
                ],
            ],
            [
                'category' => 'Instant Noodles', 'name' => 'A1 Steak', 'brand' => 'A1',
                'variants' => [
                    ['unit' => $pc, 'name' => 'Beef', 'sku_suffix' => 'BEEF', 'units_per_package' => 1, 'cost_price' => 0.70, 'selling_price' => 1.10, 'stock_quantity' => 200],
                ],
            ],
            
            // Crackers
            [
                'category' => 'Crackers', 'name' => 'Jacob\'s Cream Crackers', 'brand' => 'Jacob\'s',
                'variants' => [
                    ['unit' => $g, 'name' => '100g', 'sku_suffix' => '100G', 'units_per_package' => 1, 'cost_price' => 1.00, 'selling_price' => 1.50, 'stock_quantity' => 200],
                    ['unit' => $g, 'name' => '200g', 'sku_suffix' => '200G', 'units_per_package' => 1, 'cost_price' => 1.80, 'selling_price' => 2.50, 'stock_quantity' => 150],
                ],
            ],
            [
                'category' => 'Crackers', 'name' => 'Ritz Crackers', 'brand' => 'Ritz',
                'variants' => [
                    ['unit' => $g, 'name' => '100g', 'sku_suffix' => '100G', 'units_per_package' => 1, 'cost_price' => 1.20, 'selling_price' => 1.80, 'stock_quantity' => 180],
                ],
            ],
            
            // Dried Fruits
            [
                'category' => 'Dried Fruits', 'name' => 'Raisins', 'brand' => 'Nature',
                'variants' => [
                    ['unit' => $g, 'name' => '200g', 'sku_suffix' => '200G', 'units_per_package' => 1, 'cost_price' => 3.00, 'selling_price' => 4.50, 'stock_quantity' => 80],
                ],
            ],
            [
                'category' => 'Dried Fruits', 'name' => 'Dried Apricots', 'brand' => 'Nature',
                'variants' => [
                    ['unit' => $g, 'name' => '200g', 'sku_suffix' => '200G', 'units_per_package' => 1, 'cost_price' => 4.00, 'selling_price' => 6.00, 'stock_quantity' => 60],
                ],
            ],
            [
                'category' => 'Dried Fruits', 'name' => 'Mixed Dried Fruits', 'brand' => 'Nature',
                'variants' => [
                    ['unit' => $g, 'name' => '250g', 'sku_suffix' => '250G', 'units_per_package' => 1, 'cost_price' => 5.00, 'selling_price' => 7.50, 'stock_quantity' => 50],
                ],
            ],
            
            // Popcorn
            [
                'category' => 'Popcorn', 'name' => 'Butter Popcorn', 'brand' => 'Orion',
                'variants' => [
                    ['unit' => $g, 'name' => '100g', 'sku_suffix' => '100G', 'units_per_package' => 1, 'cost_price' => 1.50, 'selling_price' => 2.20, 'stock_quantity' => 100],
                ],
            ],
            [
                'category' => 'Popcorn', 'name' => 'Cheese Popcorn', 'brand' => 'Orion',
                'variants' => [
                    ['unit' => $g, 'name' => '100g', 'sku_suffix' => '100G', 'units_per_package' => 1, 'cost_price' => 1.60, 'selling_price' => 2.40, 'stock_quantity' => 90],
                ],
            ],
            [
                'category' => 'Popcorn', 'name' => 'Caramel Popcorn', 'brand' => 'Orion',
                'variants' => [
                    ['unit' => $g, 'name' => '100g', 'sku_suffix' => '100G', 'units_per_package' => 1, 'cost_price' => 1.70, 'selling_price' => 2.50, 'stock_quantity' => 80],
                ],
            ],
            
            // Cigarettes
            [
                'category' => 'Cigarettes', 'name' => 'Red Ruby', 'brand' => 'Red Ruby',
                'variants' => [
                    ['unit' => $pk, 'name' => 'Pack of 20', 'sku_suffix' => '20S', 'units_per_package' => 20, 'cost_price' => 2.00, 'selling_price' => 3.00, 'stock_quantity' => 200],
                    ['unit' => $ctn, 'name' => 'Carton (10 packs)', 'sku_suffix' => 'CTN', 'units_per_package' => 10, 'cost_price' => 18.00, 'selling_price' => 27.00, 'stock_quantity' => 20],
                ],
            ],
            [
                'category' => 'Cigarettes', 'name' => 'London', 'brand' => 'London',
                'variants' => [
                    ['unit' => $pk, 'name' => 'Pack of 20', 'sku_suffix' => '20S', 'units_per_package' => 20, 'cost_price' => 1.80, 'selling_price' => 2.80, 'stock_quantity' => 200],
                    ['unit' => $ctn, 'name' => 'Carton (10 packs)', 'sku_suffix' => 'CTN', 'units_per_package' => 10, 'cost_price' => 16.00, 'selling_price' => 25.00, 'stock_quantity' => 20],
                ],
            ],
            [
                'category' => 'Cigarettes', 'name' => 'Seven Stars', 'brand' => 'Seven Stars',
                'variants' => [
                    ['unit' => $pk, 'name' => 'Pack of 20', 'sku_suffix' => '20S', 'units_per_package' => 20, 'cost_price' => 1.50, 'selling_price' => 2.50, 'stock_quantity' => 250],
                    ['unit' => $ctn, 'name' => 'Carton (10 packs)', 'sku_suffix' => 'CTN', 'units_per_package' => 10, 'cost_price' => 14.00, 'selling_price' => 22.00, 'stock_quantity' => 25],
                ],
            ],
        ];

        foreach ($products as $productData) {
            $category = Category::where('name', $productData['category'])->first();
            $product = Product::create([
                'category_id' => $category->id,
                'name' => $productData['name'],
                'sku' => strtoupper(substr(preg_replace('/[^a-zA-Z]/', '', $productData['name']), 0, 3)) . '-' . fake()->unique()->randomNumber(5),
                'brand' => $productData['brand'],
                'is_active' => true,
            ]);

            foreach ($productData['variants'] as $variantData) {
                $variant = $product->variants()->create([
                    'unit_id' => $variantData['unit']->id,
                    'name' => $variantData['name'],
                    'sku' => $product->sku . '-' . $variantData['sku_suffix'],
                    'units_per_package' => $variantData['units_per_package'],
                    'cost_price' => $variantData['cost_price'],
                    'selling_price' => $variantData['selling_price'],
                    'per_unit_price' => 0,
                    'stock_quantity' => $variantData['stock_quantity'],
                    'min_stock_level' => 10,
                    'max_stock_level' => $variantData['stock_quantity'] * 2,
                    'is_active' => true,
                ]);
                $variant->recalculatePerUnitPrice();
                $variant->save();
            }
        }
    }
}
