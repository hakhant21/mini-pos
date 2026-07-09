<?php

use App\Http\Resources\ProductResource;
use App\Models\Category;
use App\Models\Product;

test('returns expected keys', function () {
    $product = Product::factory()->forCategory(Category::factory()->create())->create();
    $resource = ProductResource::make($product)->resolve(request());
    expect($resource)->toHaveKeys(['id', 'name', 'sku', 'image', 'image_url', 'brand', 'is_active', 'created_at', 'updated_at', 'deleted_at']);
});
