<?php

use App\Http\Resources\SaleItemResource;
use App\Models\SaleItem;

test('returns expected keys', function () {
    $item = SaleItem::factory()->create();
    $resource = SaleItemResource::make($item)->resolve(request());
    expect($resource)->toHaveKeys(['id', 'product_variant_id', 'product_name', 'variant_name', 'unit_name', 'quantity', 'unit_price', 'cost_price', 'total_price']);
    expect($resource['product_name'])->not->toBeEmpty();
});
