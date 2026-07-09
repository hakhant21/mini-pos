<?php

use App\Models\Category;

test('creates a category', function () {
    $category = Category::factory()->create();
    expect($category)->toBeInstanceOf(Category::class);
    expect($category->name)->not->toBeEmpty();
    expect($category->slug)->not->toBeEmpty();
});

test('creates inactive category', function () {
    $category = Category::factory()->inactive()->create();
    expect($category->is_active)->toBeFalse();
});
