<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
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
        ];

        foreach ($users as $user) {
            User::create($user);
        }
    }
}
