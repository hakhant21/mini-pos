<?php

use App\Http\Requests\Categories\UpdateCategoryRequest;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Routing\Route;

test('authorizes requests', function () {
    $request = new UpdateCategoryRequest;
    expect($request->authorize())->toBeTrue();
});

test('has validation rules', function () {
    $category = Category::factory()->create();
    $route = new Route('PATCH', '/categories/{category}', fn () => null);
    $route->bind(Request::create('/categories/' . $category->id, 'PATCH'));

    $request = new UpdateCategoryRequest;
    $request->setRouteResolver(fn () => $route);

    $rules = $request->rules();

    expect($rules)->toHaveKeys(['name', 'description', 'image', 'is_active']);
    expect($rules['name'])->toContain('required');
    expect($rules['description'])->toContain('nullable');
    expect($rules['is_active'])->toContain('boolean');
});
