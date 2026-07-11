<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        if (config('app.env' == 'production')) {
            $this->call([
                UserSeeder::class,
            ]);
        } else {
            $this->call([
                UserSeeder::class,
                CategorySeeder::class,
                UnitSeeder::class,
                ProductSeeder::class,
            ]);
        }
    }
}
