<?php

use App\Http\Resources\SaleResource;
use App\Models\Sale;

test('returns expected keys', function () {
    $sale = Sale::factory()->create();
    $resource = SaleResource::make($sale)->resolve(request());
    expect($resource)->toHaveKeys(['id', 'invoice_number', 'total_amount', 'payment_method', 'amount_paid', 'change', 'discount', 'tax', 'notes', 'created_at']);
    expect($resource['invoice_number'])->toMatch('/^INV-/');
});
