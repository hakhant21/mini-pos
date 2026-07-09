<?php

use App\Http\Resources\CategoryResource;
use App\Models\Category;

test('returns expected keys', function () {
    $category = Category::factory()->create();
    $resource = CategoryResource::make($category)->resolve(request());
    expect($resource)->toHaveKeys(['id', 'name', 'slug', 'description', 'image', 'image_url', 'is_active', 'created_at', 'updated_at', 'deleted_at']);
});

test('returns null image url when no image', function () {
    $category = Category::factory()->create(['image' => null]);
    $resource = CategoryResource::make($category)->resolve(request());
    expect($resource['image_url'])->toBeNull();
});
