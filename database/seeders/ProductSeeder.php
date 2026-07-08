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

        $products = [
            [
                'category' => 'Beverages', 'name' => 'Spring Water', 'brand' => 'FreshMark',
                'variants' => [
                    ['unit' => $btl, 'name' => '500mL', 'sku_suffix' => '500', 'units_per_package' => 1, 'cost_price' => 0.50, 'selling_price' => 0.80, 'stock_quantity' => 500],
                    ['unit' => $btl, 'name' => '1L', 'sku_suffix' => '1L', 'units_per_package' => 1, 'cost_price' => 0.80, 'selling_price' => 1.20, 'stock_quantity' => 300],
                    ['unit' => $btl, 'name' => '1.5L', 'sku_suffix' => '15L', 'units_per_package' => 1, 'cost_price' => 1.00, 'selling_price' => 1.50, 'stock_quantity' => 200],
                ],
            ],
            [
                'category' => 'Beverages', 'name' => 'Cola Soda', 'brand' => 'FreshMark',
                'variants' => [
                    ['unit' => $can, 'name' => '355mL Can', 'sku_suffix' => 'CAN', 'units_per_package' => 1, 'cost_price' => 0.60, 'selling_price' => 1.00, 'stock_quantity' => 400],
                    ['unit' => $btl, 'name' => '2L Bottle', 'sku_suffix' => '2L', 'units_per_package' => 1, 'cost_price' => 1.50, 'selling_price' => 2.50, 'stock_quantity' => 150],
                ],
            ],
            [
                'category' => 'Beverages', 'name' => 'Orange Juice', 'brand' => 'Nature\'s Best',
                'variants' => [
                    ['unit' => $l, 'name' => '1L', 'sku_suffix' => '1L', 'units_per_package' => 1, 'cost_price' => 2.00, 'selling_price' => 3.50, 'stock_quantity' => 100],
                ],
            ],
            [
                'category' => 'Snacks', 'name' => 'Potato Chips', 'brand' => 'Quality Foods',
                'variants' => [
                    ['unit' => $g, 'name' => '50g', 'sku_suffix' => '50G', 'units_per_package' => 1, 'cost_price' => 0.80, 'selling_price' => 1.50, 'stock_quantity' => 300],
                    ['unit' => $g, 'name' => '150g', 'sku_suffix' => '150G', 'units_per_package' => 1, 'cost_price' => 1.50, 'selling_price' => 2.50, 'stock_quantity' => 200],
                ],
            ],
            [
                'category' => 'Snacks', 'name' => 'Chocolate Bar', 'brand' => 'Quality Foods',
                'variants' => [
                    ['unit' => $pc, 'name' => 'Standard', 'sku_suffix' => 'STD', 'units_per_package' => 1, 'cost_price' => 1.20, 'selling_price' => 2.00, 'stock_quantity' => 250],
                    ['unit' => $pc, 'name' => 'King Size', 'sku_suffix' => 'KING', 'units_per_package' => 1, 'cost_price' => 2.00, 'selling_price' => 3.50, 'stock_quantity' => 100],
                ],
            ],
            [
                'category' => 'Snacks', 'name' => 'Mixed Nuts', 'brand' => 'Nature\'s Best',
                'variants' => [
                    ['unit' => $g, 'name' => '200g', 'sku_suffix' => '200G', 'units_per_package' => 1, 'cost_price' => 3.00, 'selling_price' => 5.00, 'stock_quantity' => 80],
                ],
            ],
            [
                'category' => 'Dairy', 'name' => 'Fresh Milk', 'brand' => 'Daily Goods',
                'variants' => [
                    ['unit' => $l, 'name' => '1L', 'sku_suffix' => '1L', 'units_per_package' => 1, 'cost_price' => 1.50, 'selling_price' => 2.20, 'stock_quantity' => 150],
                    ['unit' => $l, 'name' => '2L', 'sku_suffix' => '2L', 'units_per_package' => 1, 'cost_price' => 2.50, 'selling_price' => 3.80, 'stock_quantity' => 100],
                ],
            ],
            [
                'category' => 'Dairy', 'name' => 'Cheddar Cheese', 'brand' => 'Daily Goods',
                'variants' => [
                    ['unit' => $g, 'name' => '200g', 'sku_suffix' => '200G', 'units_per_package' => 1, 'cost_price' => 3.00, 'selling_price' => 4.50, 'stock_quantity' => 60],
                ],
            ],
            [
                'category' => 'Dairy', 'name' => 'Yogurt', 'brand' => 'Daily Goods',
                'variants' => [
                    ['unit' => $pc, 'name' => 'Strawberry', 'sku_suffix' => 'STR', 'units_per_package' => 4, 'cost_price' => 0.50, 'selling_price' => 0.90, 'stock_quantity' => 200],
                    ['unit' => $pc, 'name' => 'Vanilla', 'sku_suffix' => 'VNL', 'units_per_package' => 4, 'cost_price' => 0.50, 'selling_price' => 0.90, 'stock_quantity' => 180],
                ],
            ],
            [
                'category' => 'Bakery', 'name' => 'White Bread', 'brand' => 'Home Essentials',
                'variants' => [
                    ['unit' => $pk, 'name' => 'Sliced Loaf', 'sku_suffix' => 'SLD', 'units_per_package' => 1, 'cost_price' => 1.00, 'selling_price' => 1.80, 'stock_quantity' => 100],
                ],
            ],
            [
                'category' => 'Bakery', 'name' => 'Croissant', 'brand' => 'Home Essentials',
                'variants' => [
                    ['unit' => $pc, 'name' => 'Butter', 'sku_suffix' => 'BTR', 'units_per_package' => 1, 'cost_price' => 0.60, 'selling_price' => 1.20, 'stock_quantity' => 80],
                    ['unit' => $pc, 'name' => 'Chocolate', 'sku_suffix' => 'CHOC', 'units_per_package' => 1, 'cost_price' => 0.80, 'selling_price' => 1.50, 'stock_quantity' => 60],
                ],
            ],
            [
                'category' => 'Cleaning Supplies', 'name' => 'All-Purpose Cleaner', 'brand' => 'Home Essentials',
                'variants' => [
                    ['unit' => $ml, 'name' => '500mL Spray', 'sku_suffix' => '500', 'units_per_package' => 1, 'cost_price' => 1.80, 'selling_price' => 3.00, 'stock_quantity' => 90],
                    ['unit' => $l, 'name' => '1L Refill', 'sku_suffix' => '1L', 'units_per_package' => 1, 'cost_price' => 2.50, 'selling_price' => 4.00, 'stock_quantity' => 70],
                ],
            ],
            [
                'category' => 'Cleaning Supplies', 'name' => 'Dish Soap', 'brand' => 'Home Essentials',
                'variants' => [
                    ['unit' => $ml, 'name' => '500mL', 'sku_suffix' => '500', 'units_per_package' => 1, 'cost_price' => 1.20, 'selling_price' => 2.00, 'stock_quantity' => 120],
                ],
            ],
            [
                'category' => 'Canned Goods', 'name' => 'Tomato Soup', 'brand' => 'Quality Foods',
                'variants' => [
                    ['unit' => $can, 'name' => 'Standard', 'sku_suffix' => 'STD', 'units_per_package' => 1, 'cost_price' => 0.90, 'selling_price' => 1.50, 'stock_quantity' => 200],
                ],
            ],
            [
                'category' => 'Canned Goods', 'name' => 'Corned Beef', 'brand' => 'Quality Foods',
                'variants' => [
                    ['unit' => $can, 'name' => 'Standard', 'sku_suffix' => 'STD', 'units_per_package' => 1, 'cost_price' => 2.50, 'selling_price' => 4.00, 'stock_quantity' => 100],
                ],
            ],
            [
                'category' => 'Frozen Foods', 'name' => 'Frozen Pizza', 'brand' => 'Quality Foods',
                'variants' => [
                    ['unit' => $pc, 'name' => 'Pepperoni', 'sku_suffix' => 'PEP', 'units_per_package' => 1, 'cost_price' => 3.00, 'selling_price' => 5.00, 'stock_quantity' => 50],
                    ['unit' => $pc, 'name' => 'Margherita', 'sku_suffix' => 'MARG', 'units_per_package' => 1, 'cost_price' => 2.80, 'selling_price' => 4.50, 'stock_quantity' => 40],
                ],
            ],
            [
                'category' => 'Frozen Foods', 'name' => 'Vanilla Ice Cream', 'brand' => 'Daily Goods',
                'variants' => [
                    ['unit' => $l, 'name' => '1L Tub', 'sku_suffix' => '1L', 'units_per_package' => 1, 'cost_price' => 3.50, 'selling_price' => 5.50, 'stock_quantity' => 30],
                ],
            ],
            [
                'category' => 'Condiments', 'name' => 'Ketchup', 'brand' => 'Quality Foods',
                'variants' => [
                    ['unit' => $ml, 'name' => '500mL', 'sku_suffix' => '500', 'units_per_package' => 1, 'cost_price' => 1.50, 'selling_price' => 2.50, 'stock_quantity' => 120],
                ],
            ],
            [
                'category' => 'Condiments', 'name' => 'Mayonnaise', 'brand' => 'Quality Foods',
                'variants' => [
                    ['unit' => $ml, 'name' => '250mL', 'sku_suffix' => '250', 'units_per_package' => 1, 'cost_price' => 1.80, 'selling_price' => 3.00, 'stock_quantity' => 90],
                ],
            ],
            [
                'category' => 'Personal Care', 'name' => 'Shampoo', 'brand' => 'Home Essentials',
                'variants' => [
                    ['unit' => $ml, 'name' => '200mL', 'sku_suffix' => '200', 'units_per_package' => 1, 'cost_price' => 2.00, 'selling_price' => 3.50, 'stock_quantity' => 80],
                    ['unit' => $ml, 'name' => '400mL', 'sku_suffix' => '400', 'units_per_package' => 1, 'cost_price' => 3.50, 'selling_price' => 5.50, 'stock_quantity' => 50],
                ],
            ],
            [
                'category' => 'Personal Care', 'name' => 'Bath Soap', 'brand' => 'Home Essentials',
                'variants' => [
                    ['unit' => $pc, 'name' => 'Original', 'sku_suffix' => 'ORG', 'units_per_package' => 3, 'cost_price' => 0.50, 'selling_price' => 0.90, 'stock_quantity' => 300],
                ],
            ],
            [
                'category' => 'Household', 'name' => 'Paper Towels', 'brand' => 'Home Essentials',
                'variants' => [
                    ['unit' => $pk, 'name' => '2-Pack', 'sku_suffix' => '2PK', 'units_per_package' => 1, 'cost_price' => 2.00, 'selling_price' => 3.50, 'stock_quantity' => 60],
                    ['unit' => $pk, 'name' => '6-Pack', 'sku_suffix' => '6PK', 'units_per_package' => 1, 'cost_price' => 5.00, 'selling_price' => 8.00, 'stock_quantity' => 30],
                ],
            ],
            [
                'category' => 'Household', 'name' => 'Trash Bags', 'brand' => 'Home Essentials',
                'variants' => [
                    ['unit' => $box, 'name' => '30-Pack', 'sku_suffix' => '30', 'units_per_package' => 1, 'cost_price' => 3.00, 'selling_price' => 4.50, 'stock_quantity' => 40],
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
                    'min_stock_level' => 20,
                    'max_stock_level' => $variantData['stock_quantity'] * 2,
                    'is_active' => true,
                ]);
                $variant->recalculatePerUnitPrice();
                $variant->save();
            }
        }
    }
}
