<?php

use App\Http\Resources\ProductVariantResource;
use App\Models\ProductVariant;

test('returns expected keys', function () {
    $variant = ProductVariant::factory()->create();
    $resource = ProductVariantResource::make($variant)->resolve(request());
    expect($resource)->toHaveKeys([
        'id', 'product_id', 'unit_id', 'name', 'image', 'image_url', 'sku',
        'units_per_package', 'cost_price', 'selling_price', 'per_unit_price',
        'stock_quantity', 'min_stock_level', 'max_stock_level',
        'is_active', 'stock_status', 'created_at', 'updated_at',
    ]);
});
