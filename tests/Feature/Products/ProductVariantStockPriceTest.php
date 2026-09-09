<?php

use App\Models\ProductVariant;
use App\Models\User;

beforeEach(function () {
    $this->actingAs(User::factory()->create(['role' => 'admin']));
});

test('stock price update modifies units per package', function () {
    $variant = ProductVariant::factory()->create([
        'units_per_package' => 1,
    ]);

    $this->patch(route('variants.update-stock-price', [
        'product' => $variant->product,
        'variant' => $variant,
    ]), [
        'stock_quantity' => 209,
        'units_per_package' => 12,
        'cost_price' => $variant->cost_price,
        'selling_price' => $variant->selling_price,
    ])->assertRedirect();

    expect((float) $variant->fresh()->units_per_package)->toBe(12.0);
    expect((int) $variant->fresh()->stock_quantity)->toBe(209);
});

test('stock price update requires a positive units per package value', function () {
    $variant = ProductVariant::factory()->create();

    $this->patch(route('variants.update-stock-price', [
        'product' => $variant->product,
        'variant' => $variant,
    ]), [
        'stock_quantity' => $variant->stock_quantity,
        'units_per_package' => 0,
        'cost_price' => $variant->cost_price,
        'selling_price' => $variant->selling_price,
    ])->assertSessionHasErrors('units_per_package');
});
