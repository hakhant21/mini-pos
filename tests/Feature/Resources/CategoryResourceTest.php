<?php

use App\Http\Resources\CategoryResource;
use App\Models\Category;

test('returns expected keys', function () {
    $category = Category::factory()->create();
    $resource = CategoryResource::make($category)->resolve(request());
    expect($resource)->toHaveKeys(['id', 'name', 'slug', 'description', 'is_active', 'created_at', 'updated_at', 'deleted_at']);
});
