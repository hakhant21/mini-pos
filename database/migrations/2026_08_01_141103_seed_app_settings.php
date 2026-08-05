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
                'role' => 'admin',
            ],
            [
                'name' => 'Cashier',
                'email' => 'cashier@gmail.com',
                'password' => bcrypt('password'),
                'role' => 'cashier',
            ],
        ]);

        DB::table('categories')->insert([
            ['name' => 'အချိုရည်', 'slug' => 'soft-drinks', 'description' => 'အချိုရည်'],
            ['name' => 'ကော်ဖီ', 'slug' => 'coffee', 'description' => 'ကော်ဖီ'],
            ['name' => 'ခရုဆီ', 'slug' => 'oyster-sauce', 'description' => 'ခရုဆီ'],
            ['name' => 'တစ်ရူး', 'slug' => 'tissue', 'description' => 'တစ်ရူး'],
        ]);

        DB::table('units')->insert([
            ['name' => 'ဖာ', 'abbreviation' => 'far'],
            ['name' => 'အိတ်', 'abbreviation' => 'အိတ်'],
            ['name' => 'ပါကင်', 'abbreviation' => 'ပါကင်'],
            ['name' => 'ဘူး', 'abbreviation' => 'ဘူး'],
            ['name' => 'ပုလင်း', 'abbreviation' => 'ပုလင်း'],
            ['name' => 'ကီလိုဂရမ်', 'abbreviation' => 'ကီလိုဂရမ်'],
            ['name' => 'ဂရမ်', 'abbreviation' => 'gဂရမ်'],
            ['name' => 'ထုပ်', 'abbreviation' => 'ထုပ်'],
            ['name' => 'လီတာ', 'abbreviation' => 'လိတာ'],
            ['name' => 'မီလီလီတာ', 'abbreviation' => 'မီလီလီတာ'],
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
