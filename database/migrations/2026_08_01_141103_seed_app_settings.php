<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (env('IS_MOBILE_APP') === false) {
            return;
        }

        DB::table('users')->insert([
            [
                'name' => 'Admin',
                'email' => 'admin@gmail.com',
                'password' => bcrypt('password'),
                'role' => 'admin'
            ],
            [
                'name' => 'Cashier',
                'email' => 'cashier@gmail.com',
                'password' => bcrypt('password'),
                'role' => 'cashier'
            ]
        ]);

        DB::table('categories')->insert([
            ['name' => 'Sauces & Seasonings', 'slug' => 'SAS-001', 'description' => 'Condiments and flavoring agents'],
            ['name' => 'Tissue', 'slug' => 'TIS-001', 'description' => 'Paper products for cleaning and hygiene'],
        ]);

        DB::table('units')->insert([
            ['name' => 'ပါကင်', 'abbreviation' => 'pack'],
            ['name' => 'ဘူး', 'abbreviation' => 'can'],
            ['name' => 'ပုလင်း', 'abbreviation' => 'bottle'],
            ['name' => 'ကီလိုဂရမ်', 'abbreviation' => 'kg'],
            ['name' => 'ဂရမ်', 'abbreviation' => 'g'],
            ['name' => 'ထုပ်', 'abbreviation' => 'bundle'],
        ]);

        DB::table('products')->insert([
            ['category_id' => 1, 'sku' => 'SE-001', 'name' => 'Golden Mountain Oyster Sauce', 'image' => 'storage/images/products/golden-moutain.jpg'],
            ['category_id' => 2, 'sku' => 'TI-001', 'name' => 'Shwe', 'image' => 'storage/images/products/shwe.png'],
        ]);

        DB::table('product_variants')->insert([
            ['product_id' => 1, 'unit_id' => 1, 'sku' => 'SE-001', 'cost_price' => 95000, 'selling_price' => '98000', 'per_unit_price' => 5400, 'units_per_package' => 24, 'stock_quantity' => 100, 'min_stock_level' => 10, 'max_stock_level' => 500],
            ['product_id' => 2, 'unit_id' => 1, 'sku' => 'TI-001', 'cost_price' => 6000, 'selling_price' => '6600', 'per_unit_price' => 2200, 'units_per_package' => 3, 'stock_quantity' => 300, 'min_stock_level' => 10, 'max_stock_level' => 500],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
