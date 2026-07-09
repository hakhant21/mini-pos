<?php

use App\Http\Requests\Products\StoreProductRequest;

test('authorizes requests', function () {
    $request = new StoreProductRequest;
    expect($request->authorize())->toBeTrue();
});

test('has validation rules', function () {
    $request = new StoreProductRequest;
    $rules = $request->rules();

    expect($rules)->toHaveKeys(['category_id', 'name', 'sku', 'image', 'brand', 'is_active']);
    expect($rules['category_id'])->toContain('required', 'exists:categories,id');
    expect($rules['name'])->toContain('required');
    expect($rules['sku'])->toContain('required', 'unique:products,sku');
    expect($rules['image'])->toContain('nullable', 'image');
    expect($rules['brand'])->toContain('nullable');
    expect($rules['is_active'])->toContain('boolean');
});
