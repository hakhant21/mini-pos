<?php

use App\Models\ProductVariant;
use App\Models\Unit;

test('has fillable attributes', function () {
    $unit = new Unit;
    expect($unit->getFillable())->toBe(['name', 'abbreviation']);
});

test('has product variants relation', function () {
    $unit = Unit::factory()->create();
    $variant = ProductVariant::factory()->withUnit($unit)->create();

    expect($unit->productVariants)->toHaveCount(1);
    expect($unit->productVariants->first()->id)->toBe($variant->id);
});

test('can create unit with factory', function () {
    $unit = Unit::factory()->create();
    expect($unit)->toBeInstanceOf(Unit::class);
    expect($unit->name)->not->toBeEmpty();
    expect($unit->abbreviation)->not->toBeEmpty();
});

test('product variants count', function () {
    $unit = Unit::factory()->create();
    ProductVariant::factory()->withUnit($unit)->count(3)->create();

    $unitWithCount = Unit::withCount('productVariants')->find($unit->id);
    expect($unitWithCount->product_variants_count)->toBe(3);
});
