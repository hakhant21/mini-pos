<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('UPDATE product_variants SET stock_quantity = ROUND(stock_quantity * units_per_package), min_stock_level = ROUND(min_stock_level * units_per_package), max_stock_level = CASE WHEN max_stock_level IS NULL THEN NULL ELSE ROUND(max_stock_level * units_per_package) END, units_per_package = ROUND(units_per_package), units_per_pack = ROUND(units_per_pack)');

        Schema::table('product_variants', function (Blueprint $table) {
            $table->bigInteger('units_per_package')->default(1)->change();
            $table->bigInteger('units_per_pack')->default(1)->change();
            $table->bigInteger('stock_quantity')->default(0)->change();
            $table->bigInteger('min_stock_level')->default(0)->change();
            $table->bigInteger('max_stock_level')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('product_variants', function (Blueprint $table) {
            $table->decimal('units_per_package', 10, 2)->default(1)->change();
            $table->decimal('units_per_pack', 10, 2)->default(1)->change();
            $table->decimal('stock_quantity', 12, 2)->default(0)->change();
            $table->decimal('min_stock_level', 12, 2)->default(0)->change();
            $table->decimal('max_stock_level', 12, 2)->nullable()->change();
        });
    }
};
