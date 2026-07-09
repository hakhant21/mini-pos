<?php

use App\Models\SaleItem;

test('creates a sale item', function () {
    $item = SaleItem::factory()->create();
    expect($item)->toBeInstanceOf(SaleItem::class);
    expect($item->product_name)->not->toBeEmpty();
    expect((float) $item->quantity)->toBeGreaterThan(0);
    expect((float) $item->total_price)->toBeGreaterThan(0);
});
