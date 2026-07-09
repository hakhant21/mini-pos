<?php

use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Unit;

test('has fillable attributes', function () {
    $variant = new ProductVariant;
    expect($variant->getFillable())->toBe([
        'product_id', 'unit_id', 'name', 'image', 'sku',
        'units_per_package', 'cost_price', 'selling_price', 'per_unit_price',
        'stock_quantity', 'min_stock_level', 'max_stock_level', 'is_active',
    ]);
});

test('belongs to product', function () {
    $product = Product::factory()->create();
    $variant = ProductVariant::factory()->forProduct($product)->create();

    expect($variant->product)->toBeInstanceOf(Product::class);
    expect($variant->product->id)->toBe($product->id);
});

test('belongs to unit', function () {
    $unit = Unit::factory()->create();
    $variant = ProductVariant::factory()->withUnit($unit)->create();

    expect($variant->unit)->toBeInstanceOf(Unit::class);
    expect($variant->unit->id)->toBe($unit->id);
});

test('recalculates per unit price', function () {
    $variant = ProductVariant::factory()->create([
        'selling_price' => 100.00,
        'units_per_package' => 4,
        'per_unit_price' => 0,
    ]);

    $variant->recalculatePerUnitPrice();
    $variant->save();

    expect((float) $variant->per_unit_price)->toBe(25.0);
});

test('recalculates weighted average cost', function () {
    $variant = ProductVariant::factory()->create([
        'stock_quantity' => 10,
        'cost_price' => 5.00,
    ]);

    $variant->recalculateWeightedAverageCost(5, 10.00);

    expect((float) $variant->cost_price)->toBe(6.67);
    expect((float) $variant->stock_quantity)->toBe(15.0);
});

test('stock status is out of stock when quantity is zero', function () {
    $variant = ProductVariant::factory()->create([
        'stock_quantity' => 0,
        'min_stock_level' => 5,
    ]);

    expect($variant->stock_status)->toBe('out_of_stock');
});

test('stock status is low stock when quantity is at or below min', function () {
    $variant = ProductVariant::factory()->create([
        'stock_quantity' => 3,
        'min_stock_level' => 5,
    ]);

    expect($variant->stock_status)->toBe('low_stock');
});

test('stock status is in stock when quantity is above min', function () {
    $variant = ProductVariant::factory()->create([
        'stock_quantity' => 50,
        'min_stock_level' => 10,
    ]);

    expect($variant->stock_status)->toBe('in_stock');
});

test('scope active filters correctly', function () {
    ProductVariant::factory()->create(['sku' => 'ACTIVE-1', 'is_active' => true]);
    ProductVariant::factory()->create(['sku' => 'INACTIVE-1', 'is_active' => false]);

    expect(ProductVariant::active()->get())->toHaveCount(1);
});

test('inactive state works', function () {
    $variant = ProductVariant::factory()->inactive()->create();
    expect($variant->is_active)->toBeFalse();
});

test('image url returns null when no image', function () {
    $variant = ProductVariant::factory()->create(['image' => null]);
    expect($variant->image_url)->toBeNull();
});

test('create variant with factory', function () {
    $variant = ProductVariant::factory()->create();
    expect($variant)->toBeInstanceOf(ProductVariant::class);
    expect($variant->sku)->not->toBeEmpty();
});

test('per unit price is recalculated after create', function () {
    $variant = ProductVariant::factory()->create([
        'selling_price' => 50.00,
        'units_per_package' => 5,
    ]);
    expect((float) $variant->per_unit_price)->toBe(10.0);
});
