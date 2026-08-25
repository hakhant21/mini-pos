<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('balances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->decimal('opening_amount', 15, 2)->default(0);
            $table->decimal('closing_amount', 15, 2)->nullable()->default(0);
            $table->decimal('total_sale_amount', 15, 2)->nullable()->default(0);
            $table->decimal('total_change_amount', 15, 2)->nullable()->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('balances');
    }
};
