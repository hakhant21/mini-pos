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
        $bottle = Unit::where('name', 'Bottle')->first();
        $can = Unit::where('name', 'Can')->first();
        $pack = Unit::where('name', 'Pack')->first();
        $piece = Unit::where('name', 'Piece')->first();
        $roll = Unit::where('name', 'Roll')->first();

        $products = [
            // Alcohol
            [
                'name' => 'Johnnie Walker Black Label',
                'brand' => 'Johnnie Walker',
                'category' => 'Alcohol',
                'image' => 'images/products/johnnie-walker.jpg',
                'variants' => [
                    ['name' => '750ml', 'unit' => $bottle, 'sku_suffix' => '750ML', 'units_per_package' => 1, 'cost_price' => 45000.00, 'selling_price' => 55000.00, 'stock_quantity' => 24],
                ],
            ],
            [
                'name' => 'Bacardi White Rum',
                'brand' => 'Bacardi',
                'category' => 'Alcohol',
                'image' => 'images/products/bacardi.jpg',
                'variants' => [
                    ['name' => '750ml', 'unit' => $bottle, 'sku_suffix' => '750ML', 'units_per_package' => 1, 'cost_price' => 28000.00, 'selling_price' => 35000.00, 'stock_quantity' => 30],
                ],
            ],
            [
                'name' => 'Corona Extra Beer',
                'brand' => 'Corona',
                'category' => 'Alcohol',
                'image' => 'images/products/corona.jpg',
                'variants' => [
                    ['name' => '330ml', 'unit' => $can, 'sku_suffix' => '330ML', 'units_per_package' => 1, 'cost_price' => 3500.00, 'selling_price' => 5000.00, 'stock_quantity' => 48],
                    ['name' => '330ml 6-Pack', 'unit' => $pack, 'sku_suffix' => '330ML6PK', 'units_per_package' => 6, 'cost_price' => 18000.00, 'selling_price' => 27000.00, 'stock_quantity' => 20],
                ],
            ],
            [
                'name' => 'Barefoot Moscato',
                'brand' => 'Barefoot',
                'category' => 'Alcohol',
                'image' => 'images/products/barefoot.jpg',
                'variants' => [
                    ['name' => '750ml', 'unit' => $bottle, 'sku_suffix' => '750ML', 'units_per_package' => 1, 'cost_price' => 12000.00, 'selling_price' => 18000.00, 'stock_quantity' => 36],
                ],
            ],

            // Chips & Crisps
            [
                'name' => 'Lays Classic Salted',
                'brand' => 'Lays',
                'category' => 'Chips & Crisps',
                'image' => 'images/products/lays.jpg',
                'variants' => [
                    ['name' => 'Small', 'unit' => $piece, 'sku_suffix' => 'SM', 'units_per_package' => 1, 'cost_price' => 500.00, 'selling_price' => 1000.00, 'stock_quantity' => 100],
                    ['name' => 'Family Size', 'unit' => $piece, 'sku_suffix' => 'LG', 'units_per_package' => 1, 'cost_price' => 2500.00, 'selling_price' => 4000.00, 'stock_quantity' => 50],
                ],
            ],
            [
                'name' => 'Doritos Nacho Cheese',
                'brand' => 'Doritos',
                'category' => 'Chips & Crisps',
                'image' => 'images/products/doritos.jpg',
                'variants' => [
                    ['name' => '150g', 'unit' => $piece, 'sku_suffix' => '150G', 'units_per_package' => 1, 'cost_price' => 1500.00, 'selling_price' => 2500.00, 'stock_quantity' => 80],
                ],
            ],
            [
                'name' => 'Pringles Original',
                'brand' => 'Pringles',
                'category' => 'Chips & Crisps',
                'image' => 'images/products/pringles.jpg',
                'variants' => [
                    ['name' => '110g', 'unit' => $piece, 'sku_suffix' => '110G', 'units_per_package' => 1, 'cost_price' => 2000.00, 'selling_price' => 3500.00, 'stock_quantity' => 60],
                    ['name' => '165g', 'unit' => $piece, 'sku_suffix' => '165G', 'units_per_package' => 1, 'cost_price' => 3000.00, 'selling_price' => 4500.00, 'stock_quantity' => 40],
                ],
            ],

            // Cigarettes
            [
                'name' => 'Marlboro Red',
                'brand' => 'Marlboro',
                'category' => 'Cigarettes',
                'image' => 'images/products/marlboro-red.jpg',
                'variants' => [
                    ['name' => 'Single Pack', 'unit' => $pack, 'sku_suffix' => '1PK', 'units_per_package' => 1, 'cost_price' => 15000.00, 'selling_price' => 20000.00, 'stock_quantity' => 100],
                    ['name' => 'Carton', 'unit' => $pack, 'sku_suffix' => 'CTN', 'units_per_package' => 10, 'cost_price' => 140000.00, 'selling_price' => 200000.00, 'stock_quantity' => 30],
                ],
            ],
            [
                'name' => 'Marlboro Gold',
                'brand' => 'Marlboro',
                'category' => 'Cigarettes',
                'image' => 'images/products/marlboro-gold.jpg',
                'variants' => [
                    ['name' => 'Single Pack', 'unit' => $pack, 'sku_suffix' => '1PK', 'units_per_package' => 1, 'cost_price' => 16000.00, 'selling_price' => 22000.00, 'stock_quantity' => 80],
                ],
            ],
            [
                'name' => 'Winston Red',
                'brand' => 'Winston',
                'category' => 'Cigarettes',
                'image' => 'images/products/winston.jpg',
                'variants' => [
                    ['name' => 'Single Pack', 'unit' => $pack, 'sku_suffix' => '1PK', 'units_per_package' => 1, 'cost_price' => 10000.00, 'selling_price' => 15000.00, 'stock_quantity' => 90],
                ],
            ],

            // Mixed units - multi-unit products
            [
                'name' => 'San Miguel Pale Pilsen',
                'brand' => 'San Miguel',
                'category' => 'Alcohol',
                'image' => 'images/products/san-miguel.jpg',
                'variants' => [
                    ['name' => '330ml', 'unit' => $can, 'sku_suffix' => '330ML', 'units_per_package' => 1, 'cost_price' => 2500.00, 'selling_price' => 4000.00, 'stock_quantity' => 60],
                    ['name' => '500ml', 'unit' => $bottle, 'sku_suffix' => '500ML', 'units_per_package' => 1, 'cost_price' => 4500.00, 'selling_price' => 7000.00, 'stock_quantity' => 48],
                    ['name' => '330ml 12-Pack', 'unit' => $pack, 'sku_suffix' => '330ML12PK', 'units_per_package' => 12, 'cost_price' => 25000.00, 'selling_price' => 40000.00, 'stock_quantity' => 15],
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
                'image' => $productData['image'] ?? null,
                'is_active' => true,
            ]);

            foreach ($productData['variants'] as $variantData) {
                $perUnitPrice = $variantData['units_per_package'] > 0
                    ? $variantData['cost_price'] / $variantData['units_per_package']
                    : 0;

                $product->variants()->create([
                    'unit_id' => $variantData['unit']->id,
                    'name' => $variantData['name'],
                    'sku' => $product->sku . '-' . $variantData['sku_suffix'],
                    'units_per_package' => $variantData['units_per_package'],
                    'cost_price' => $variantData['cost_price'],
                    'selling_price' => $variantData['selling_price'],
                    'per_unit_price' => $perUnitPrice,
                    'stock_quantity' => $variantData['stock_quantity'],
                    'min_stock_level' => 10,
                    'max_stock_level' => $variantData['stock_quantity'] * 2,
                    'is_active' => true,
                ]);
            }
        }
    }
}
