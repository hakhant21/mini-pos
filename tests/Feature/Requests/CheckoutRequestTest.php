<?php

use App\Http\Requests\Sales\CheckoutRequest;

test('authorizes requests', function () {
    $request = new CheckoutRequest;
    expect($request->authorize())->toBeTrue();
});

test('has validation rules', function () {
    $request = new CheckoutRequest;
    $rules = $request->rules();

    expect($rules)->toHaveKeys(['items', 'items.*.variant_id', 'items.*.quantity', 'payment_method', 'amount_paid']);
    expect($rules['items'])->toContain('required', 'array', 'min:1');
    expect($rules['items.*.variant_id'])->toContain('required', 'exists:product_variants,id');
    expect($rules['items.*.quantity'])->toContain('required', 'numeric', 'min:0.01');
    expect($rules['payment_method'])->toContain('required', 'in:cash,kbzpay');
    expect($rules['amount_paid'])->toContain('required', 'numeric', 'min:0');
    expect($rules['discount'])->toContain('nullable', 'numeric', 'min:0');
    expect($rules['tax'])->toContain('nullable', 'numeric', 'min:0');
    expect($rules['notes'])->toContain('nullable', 'string', 'max:1000');
});
