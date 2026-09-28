<?php

use App\Models\Category;
use App\Models\Product;
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
    $alcoholUnits = $alcoholProduct->units()->orderBy('id')->get(['name', 'conversion', 'purchase_price', 'selling_price', 'package_price', 'single_unit_price', 'package_quantity', 'quantity_base']);

    expect($alcoholUnits->pluck('name')->all())->toBe(['1L Package', '750ML Package', '350ML Package', '50ML Package'])
        ->and($alcoholUnits->pluck('conversion')->all())->toBe([12, 12, 12, 12])
        ->and($alcoholUnits->pluck('purchase_price')->all())->toBe([120000, 96000, 54000, 12000])
        ->and($alcoholUnits->pluck('selling_price')->all())->toBe([144000, 120000, 72000, 18000])
        ->and($alcoholUnits->pluck('package_price')->all())->toBe([144000, 120000, 72000, 18000])
        ->and($alcoholUnits->pluck('single_unit_price')->all())->toBe([12000, 10000, 6000, 1500])
        ->and($alcoholUnits->pluck('package_quantity')->all())->toBe([10, 10, 10, 10])
        ->and($alcoholUnits->pluck('quantity_base')->all())->toBe([120, 120, 120, 120]);

    foreach (['Cigarettes', 'Cheroots'] as $categoryName) {
        $product = Category::where('name', $categoryName)->firstOrFail()->products()->firstOrFail();
        $units = $product->units()->orderBy('conversion')->get(['name', 'conversion', 'selling_price', 'package_price', 'single_unit_price', 'package_quantity', 'quantity_base']);

        expect($product->price_mode)->toBe('single_package_carton')
            ->and($units->pluck('name')->all())->toBe(['Package'])
            ->and($units->pluck('conversion')->all())->toBe([20]);
        expect($units->pluck('package_price')->all())->toBe([1800])
            ->and($units->pluck('single_unit_price')->all())->toBe([100])
            ->and($units->pluck('selling_price')->all())->toBe([18000])
            ->and($units->pluck('package_quantity')->all())->toBe([10])
            ->and($units->pluck('quantity_base')->all())->toBe([200]);
    }
});

test('database seeder can be rerun without duplicating products or resetting stock', function () {
    $this->seed(DatabaseSeeder::class);

    $product = Category::where('name', 'Cigarettes')->firstOrFail()->products()->where('sku', 'MV-001')->firstOrFail();
    $package = $product->units()->where('name', 'Package')->firstOrFail();
    $package->update(['package_quantity' => 3, 'loose_quantity' => 4, 'quantity_base' => 64]);

    $this->seed(DatabaseSeeder::class);

    expect(Category::where('name', 'Cigarettes')->count())->toBe(1)
        ->and(Product::where('sku', 'MV-001')->count())->toBe(1)
        ->and($package->fresh()->package_quantity)->toBe(3)
        ->and($package->fresh()->loose_quantity)->toBe(4)
        ->and($package->fresh()->quantity_base)->toBe(64);
});

test('production database seeding clears demo prices and stock', function () {
    config(['app.env' => 'production']);

    $this->seed(DatabaseSeeder::class);

    $unit = Category::where('name', 'Cigarettes')->firstOrFail()->products()->firstOrFail()->units()->firstOrFail();

    expect($unit->purchase_price)->toBe(0)
        ->and($unit->selling_price)->toBe(0)
        ->and($unit->package_price)->toBe(0)
        ->and($unit->single_unit_price)->toBe(0)
        ->and($unit->package_quantity)->toBe(0)
        ->and($unit->loose_quantity)->toBe(0)
        ->and($unit->quantity_base)->toBe(0);
});
