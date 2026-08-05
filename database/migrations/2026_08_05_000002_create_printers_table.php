<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('printer_settings');

        Schema::create('printers', function (Blueprint $table) {
            $table->id();
            $table->boolean('enabled')->default(false);
            $table->string('name');
            $table->string('address');
            $table->string('phone_one')->nullable();
            $table->string('phone_two')->nullable();
            $table->string('device_name')->nullable();
            $table->string('device_address')->nullable();
            $table->unsignedInteger('copies')->default(2);
            $table->boolean('auto_cut')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('printers');
    }
};
