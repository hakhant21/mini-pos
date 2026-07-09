<?php

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;

test('has fillable attributes', function () {
    $category = new Category;
    expect($category->getFillable())->toBe(['name', 'description', 'image', 'is_active']);
});

test('has casts', function () {
    $category = new Category;
    expect($category->getCasts())->toHaveKey('is_active', 'boolean');
});

test('uses soft deletes', function () {
    $category = Category::factory()->create();
    $category->delete();
    expect(Category::find($category->id))->toBeNull();
    expect(Category::withTrashed()->find($category->id))->not->toBeNull();
});

test('generates slug on create', function () {
    $category = Category::factory()->create(['name' => 'Test Category!']);
    expect($category->slug)->toBe('test-category');
});

test('scope active filters correctly', function () {
    Category::factory()->create(['name' => 'Active Cat', 'is_active' => true]);
    Category::factory()->create(['name' => 'Inactive Cat', 'is_active' => false]);

    $active = Category::active()->get();
    expect($active)->toHaveCount(1);
    expect($active->first()->name)->toBe('Active Cat');
});

test('has products relation', function () {
    $category = Category::factory()->create();
    $product = Product::factory()->forCategory($category)->create();

    expect($category->products)->toHaveCount(1);
    expect($category->products->first()->id)->toBe($product->id);
});

test('image url returns null when no image', function () {
    $category = Category::factory()->create(['image' => null]);
    expect($category->image_url)->toBeNull();
});

test('image url returns storage url when image exists', function () {
    $category = Category::factory()->create(['image' => 'images/categories/test.jpg']);
    expect($category->image_url)->toContain('images/categories/test.jpg');
});

test('can create category with factory', function () {
    $category = Category::factory()->create();
    expect($category)->toBeInstanceOf(Category::class);
    expect($category->name)->not->toBeEmpty();
    expect($category->slug)->not->toBeEmpty();
});

test('inactive state works', function () {
    $category = Category::factory()->inactive()->create();
    expect($category->is_active)->toBeFalse();
});

test('has product variants count', function () {
    $category = Category::factory()->create();
    Product::factory()->forCategory($category)->count(3)->create();
    expect(Category::withCount('products')->find($category->id)->products_count)->toBe(3);
});
