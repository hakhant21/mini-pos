<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@gmail.com'],
            [
                'name' => 'Admin',
                'password' => 'password',
                'role' => 'admin',
                'locale' => 'my',
                'email_verified_at' => now(),
            ],
        );

        User::updateOrCreate(
            ['email' => 'cashier@gmail.com'],
            [
                'name' => 'Cashier',
                'password' => 'password',
                'role' => 'cashier',
                'locale' => 'my',
                'email_verified_at' => now(),
            ],
        );
    }
}
