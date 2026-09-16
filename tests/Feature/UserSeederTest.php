<?php

use App\Models\Category;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
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

test('database seeder creates category-specific product units', function () {
    $this->seed(DatabaseSeeder::class);

    $beer = Category::where('name', 'Beer')->firstOrFail()->products()->firstOrFail();
    $beerUnits = $beer->units()->orderBy('id')->get(['name', 'conversion']);

    expect($beer->price_mode)->toBe('single_package')
        ->and($beerUnits->pluck('name')->all())->toBe(['Big Bottle Package', 'Small Bottle Package', 'Long Can Package', 'Short Can Package'])
        ->and($beerUnits->pluck('conversion')->all())->toBe([24, 24, 24, 24]);

    foreach (['Soft Drink'] as $categoryName) {
        $product = Category::where('name', $categoryName)->firstOrFail()->products()->firstOrFail();
        $units = $product->units()->orderBy('conversion')->get(['name', 'conversion']);

        expect($product->price_mode)->toBe('single_package')
            ->and($units->pluck('conversion')->all())->toBe([24]);
    }

    $alcoholProduct = Category::where('name', 'Alcohol')->firstOrFail()->products()->firstOrFail();
    $alcoholUnits = $alcoholProduct->units()->orderBy('id')->get(['name', 'conversion', 'purchase_price', 'selling_price', 'package_price', 'single_unit_price']);

    expect($alcoholUnits->pluck('name')->all())->toBe(['1L Package', '750ML Package', '350ML Package', '50ML Package'])
        ->and($alcoholUnits->pluck('conversion')->all())->toBe([12, 12, 12, 12])
        ->and($alcoholUnits->pluck('purchase_price')->all())->toBe([120000, 96000, 54000, 12000])
        ->and($alcoholUnits->pluck('selling_price')->all())->toBe([144000, 120000, 72000, 18000])
        ->and($alcoholUnits->pluck('package_price')->all())->toBe([144000, 120000, 72000, 18000])
        ->and($alcoholUnits->pluck('single_unit_price')->all())->toBe([12000, 10000, 6000, 1500]);

    foreach (['Cigarettes', 'Cheroots'] as $categoryName) {
        $product = Category::where('name', $categoryName)->firstOrFail()->products()->firstOrFail();
        $units = $product->units()->orderBy('conversion')->get(['name', 'conversion', 'selling_price', 'package_price', 'single_unit_price']);

        expect($product->price_mode)->toBe('single_package_carton')
            ->and($units->pluck('name')->all())->toBe(['Package', 'Carton'])
            ->and($units->pluck('conversion')->all())->toBe([20, 200]);
        expect($units->pluck('package_price')->all())->toBe([1800, 1800])
            ->and($units->pluck('single_unit_price')->all())->toBe([100, 100])
            ->and($units->pluck('selling_price')->all())->toBe([18000, 18000]);
    }
});
