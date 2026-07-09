<?php

use App\Models\Sale;

test('creates a sale', function () {
    $sale = Sale::factory()->create();
    expect($sale)->toBeInstanceOf(Sale::class);
    expect($sale->invoice_number)->toMatch('/^INV-\d{8}-\d{4}$/');
    expect($sale->payment_method)->toBeIn(['cash', 'card', 'transfer']);
});
