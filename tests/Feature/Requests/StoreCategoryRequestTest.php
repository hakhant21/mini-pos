<?php

use App\Http\Requests\Categories\StoreCategoryRequest;

test('authorizes requests', function () {
    $request = new StoreCategoryRequest;
    expect($request->authorize())->toBeTrue();
});

test('has validation rules', function () {
    $request = new StoreCategoryRequest;
    $rules = $request->rules();

    expect($rules)->toHaveKeys(['name', 'description', 'image', 'is_active']);
    expect($rules['name'])->toContain('required', 'unique:categories,name');
    expect($rules['description'])->toContain('nullable');
    expect($rules['image'])->toContain('nullable', 'image');
    expect($rules['is_active'])->toContain('boolean');
});
