<?php

use App\Models\ProductVariant;
use App\Models\Sale;
use App\Models\SaleItem;

test('has fillable attributes', function () {
    $saleItem = new SaleItem;
    expect($saleItem->getFillable())->toBe([
        'sale_id', 'product_variant_id', 'product_name', 'variant_name',
        'unit_name', 'quantity', 'unit_price', 'cost_price', 'total_price',
    ]);
});

test('has decimal casts', function () {
    $item = new SaleItem;
    expect($item->getCasts())->toHaveKey('quantity', 'decimal:2');
    expect($item->getCasts())->toHaveKey('unit_price', 'decimal:2');
    expect($item->getCasts())->toHaveKey('cost_price', 'decimal:2');
    expect($item->getCasts())->toHaveKey('total_price', 'decimal:2');
});

test('belongs to sale', function () {
    $sale = Sale::factory()->create();
    $item = SaleItem::factory()->create(['sale_id' => $sale->id]);

    expect($item->sale)->toBeInstanceOf(Sale::class);
    expect($item->sale->id)->toBe($sale->id);
});

test('belongs to variant', function () {
    $variant = ProductVariant::factory()->create();
    $item = SaleItem::factory()->create(['product_variant_id' => $variant->id]);

    expect($item->variant)->toBeInstanceOf(ProductVariant::class);
    expect($item->variant->id)->toBe($variant->id);
});

test('can create sale item with factory', function () {
    $item = SaleItem::factory()->create();
    expect($item)->toBeInstanceOf(SaleItem::class);
    expect($item->product_name)->not->toBeEmpty();
    expect((float) $item->quantity)->toBeGreaterThan(0);
    expect((float) $item->total_price)->toBeGreaterThan(0);
});
