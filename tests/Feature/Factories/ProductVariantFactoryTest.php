<?php

use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Unit;

test('creates a variant', function () {
    $variant = ProductVariant::factory()
        ->forProduct(Product::factory()->create())
        ->withUnit(Unit::factory()->create())
        ->create();
    expect($variant)->toBeInstanceOf(ProductVariant::class);
    expect($variant->sku)->not->toBeEmpty();
});

test('creates inactive variant', function () {
    $variant = ProductVariant::factory()
        ->forProduct(Product::factory()->create())
        ->withUnit(Unit::factory()->create())
        ->inactive()
        ->create();
    expect($variant->is_active)->toBeFalse();
});
