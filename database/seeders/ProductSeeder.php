<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $seasoning = Category::where('name', 'Sauces & Seasonings')->first();
        $tissue = Category::where('name', 'Tissue')->first();


        $products = [
            ['category_id' => $seasoning->id, 'sku' => 'SE-001', 'name' => 'Golden Mountain Oyster Sauce', 'image' => 'images/products/golden-moutain.jpg'],
            ['category_id' => $tissue->id, 'sku' => 'TI-001', 'name' => 'Shwe', 'image' => 'images/products/shwe.png'],
        ];

        foreach ($products as $product) {
            Product::create($product);
        }

        $productVariants = [
            ['product_id' => 1, 'unit_id' => 1, 'sku' => 'SE-001', 'cost_price' => 95000, 'selling_price' => '98000', 'per_unit_price' => 5400, 'units_per_package' => 24, 'stock_quantity' => 100, 'min_stock_level' => 10, 'max_stock_level' => 500],
            ['product_id' => 2, 'unit_id' => 1, 'sku' => 'TI-001', 'cost_price' => 6000, 'selling_price' => '6600', 'per_unit_price' => 2200, 'units_per_package' => 3, 'stock_quantity' => 300, 'min_stock_level' => 10, 'max_stock_level' => 500],
        ];

        foreach ($productVariants as $variant) {
            ProductVariant::create($variant);
        }
    }
}
