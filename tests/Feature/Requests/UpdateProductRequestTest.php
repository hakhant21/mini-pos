<?php

use App\Http\Requests\Products\UpdateProductRequest;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Routing\Route;

test('authorizes requests', function () {
    $request = new UpdateProductRequest;
    expect($request->authorize())->toBeTrue();
});

test('has validation rules', function () {
    $category = Category::factory()->create();
    $product = Product::factory()->forCategory($category)->create();
    $route = new Route('PATCH', '/products/{product}', fn () => null);
    $route->bind(Request::create('/products/' . $product->id, 'PATCH'));

    $request = new UpdateProductRequest;
    $request->setRouteResolver(fn () => $route);

    $rules = $request->rules();

    expect($rules)->toHaveKeys(['category_id', 'name', 'sku', 'image', 'brand', 'is_active']);
    expect($rules['category_id'])->toContain('required', 'exists:categories,id');
    expect($rules['name'])->toContain('required');
    expect($rules['sku'])->toContain('required');
    expect($rules['image'])->toContain('nullable', 'image');
    expect($rules['is_active'])->toContain('boolean');
});
