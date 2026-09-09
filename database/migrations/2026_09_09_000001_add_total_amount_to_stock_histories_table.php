<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('stock_histories', 'total_amount')) {
            Schema::table('stock_histories', function (Blueprint $table) {
                $table->decimal('total_amount', 12, 2)->nullable()->after('selling_price');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('stock_histories', 'total_amount')) {
            Schema::table('stock_histories', function (Blueprint $table) {
                $table->dropColumn('total_amount');
            });
        }
    }
};
