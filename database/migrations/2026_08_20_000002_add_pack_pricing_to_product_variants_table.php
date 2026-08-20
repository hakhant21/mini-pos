<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('product_variants', function (Blueprint $table) {
            $table->decimal('pack_price', 15, 2)->default(0)->after('per_unit_price');
            $table->decimal('units_per_pack', 10, 2)->default(1)->after('units_per_package');
        });
    }

    public function down(): void
    {
        Schema::table('product_variants', function (Blueprint $table) {
            $table->dropColumn(['pack_price', 'units_per_pack']);
        });
    }
};
