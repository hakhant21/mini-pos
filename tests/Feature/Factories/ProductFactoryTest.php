<?php

use App\Models\Category;
use App\Models\Product;

test('creates a product', function () {
    $product = Product::factory()->forCategory(Category::factory()->create())->create();
    expect($product)->toBeInstanceOf(Product::class);
    expect($product->name)->not->toBeEmpty();
    expect($product->sku)->not->toBeEmpty();
});

test('creates inactive product', function () {
    $product = Product::factory()->forCategory(Category::factory()->create())->inactive()->create();
    expect($product->is_active)->toBeFalse();
});
