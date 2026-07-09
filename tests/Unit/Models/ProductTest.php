<?php

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;

test('has fillable attributes', function () {
    $product = new Product;
    expect($product->getFillable())->toBe(['category_id', 'name', 'sku', 'image', 'brand', 'is_active']);
});

test('has casts', function () {
    $product = new Product;
    expect($product->getCasts())->toHaveKey('is_active', 'boolean');
});

test('uses soft deletes', function () {
    $product = Product::factory()->create();
    $product->delete();
    expect(Product::find($product->id))->toBeNull();
    expect(Product::withTrashed()->find($product->id))->not->toBeNull();
});

test('belongs to category', function () {
    $category = Category::factory()->create();
    $product = Product::factory()->forCategory($category)->create();

    expect($product->category)->toBeInstanceOf(Category::class);
    expect($product->category->id)->toBe($category->id);
});

test('has many variants', function () {
    $product = Product::factory()->create();
    $variants = ProductVariant::factory()->forProduct($product)->count(3)->create();

    expect($product->variants)->toHaveCount(3);
});

test('scope active filters correctly', function () {
    Product::factory()->create(['name' => 'Active', 'is_active' => true]);
    Product::factory()->create(['name' => 'Inactive', 'is_active' => false]);

    expect(Product::active()->get())->toHaveCount(1);
});

test('image url returns null when no image', function () {
    $product = Product::factory()->create(['image' => null]);
    expect($product->image_url)->toBeNull();
});

test('image url returns url when image exists', function () {
    $product = Product::factory()->create(['image' => 'images/products/test.jpg']);
    expect($product->image_url)->toContain('images/products/test.jpg');
});

test('inactive state works', function () {
    $product = Product::factory()->inactive()->create();
    expect($product->is_active)->toBeFalse();
});

test('variants count attribute', function () {
    $product = Product::factory()->create();
    ProductVariant::factory()->forProduct($product)->count(2)->create();

    $productWithCount = Product::withCount('variants')->find($product->id);
    expect($productWithCount->variants_count)->toBe(2);
});
