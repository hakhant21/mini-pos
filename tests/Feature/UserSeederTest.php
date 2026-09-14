<?php

use App\Models\User;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

uses(RefreshDatabase::class);

test('user seeder creates admin and cashier accounts', function () {
    $this->seed(UserSeeder::class);

    $admin = User::where('email', 'admin@gmail.com')->firstOrFail();
    $cashier = User::where('email', 'cashier@gmail.com')->firstOrFail();

    expect($admin->role)->toBe('admin')
        ->and($cashier->role)->toBe('cashier')
        ->and(Hash::check('password', $admin->password))->toBeTrue()
        ->and(Hash::check('password', $cashier->password))->toBeTrue();
});

test('user seeder can be run repeatedly without duplicate accounts', function () {
    $this->seed(UserSeeder::class);
    $this->seed(UserSeeder::class);

    expect(User::whereIn('email', ['admin@gmail.com', 'cashier@gmail.com'])->count())->toBe(2);
});
