<?php

use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\User;

test('has fillable attributes', function () {
    $sale = new Sale;
    expect($sale->getFillable())->toBe([
        'invoice_number', 'total_amount', 'payment_method',
        'amount_paid', 'change', 'discount', 'tax', 'notes', 'user_id',
    ]);
});

test('has decimal casts', function () {
    $sale = new Sale;
    expect($sale->getCasts())->toHaveKey('total_amount', 'decimal:2');
    expect($sale->getCasts())->toHaveKey('amount_paid', 'decimal:2');
    expect($sale->getCasts())->toHaveKey('change', 'decimal:2');
    expect($sale->getCasts())->toHaveKey('discount', 'decimal:2');
    expect($sale->getCasts())->toHaveKey('tax', 'decimal:2');
});

test('generates invoice number with correct format', function () {
    $number = Sale::generateInvoiceNumber();
    expect($number)->toMatch('/^INV-\d{8}-\d{4}$/');
});

test('invoice number increments for same day', function () {
    $sale1 = Sale::factory()->create(['created_at' => now()]);
    $sale2 = Sale::factory()->create(['created_at' => now()]);

    expect($sale2->invoice_number)->toMatch('/-\d{4}$/');
});

test('belongs to user', function () {
    $user = User::factory()->create();
    $sale = Sale::factory()->create(['user_id' => $user->id]);

    expect($sale->user)->toBeInstanceOf(User::class);
    expect($sale->user->id)->toBe($user->id);
});

test('has many items', function () {
    $sale = Sale::factory()->create();
    SaleItem::factory()->count(3)->create(['sale_id' => $sale->id]);

    expect($sale->items)->toHaveCount(3);
});

test('can create sale with factory', function () {
    $sale = Sale::factory()->create();
    expect($sale)->toBeInstanceOf(Sale::class);
    expect($sale->invoice_number)->not->toBeEmpty();
});
