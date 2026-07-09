<?php

use App\Http\Requests\Inventory\StoreStockRequest;

test('authorizes requests', function () {
    $request = new StoreStockRequest;
    expect($request->authorize())->toBeTrue();
});

test('has validation rules', function () {
    $request = new StoreStockRequest;
    $rules = $request->rules();

    expect($rules)->toHaveKeys(['variant_id', 'quantity', 'cost_price']);
    expect($rules['variant_id'])->toContain('required', 'exists:product_variants,id');
    expect($rules['quantity'])->toContain('required', 'numeric', 'min:0.01');
    expect($rules['cost_price'])->toContain('required', 'numeric', 'min:0');
});
