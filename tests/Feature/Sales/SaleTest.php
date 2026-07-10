<?php

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Unit;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);

    $category = Category::factory()->create(['name' => 'Beverages']);
    $unit = Unit::factory()->create(['name' => 'Bottle', 'abbreviation' => 'btl']);

    $this->product = Product::factory()
        ->forCategory($category)
        ->create(['name' => 'Cola Soda', 'sku' => 'COLA001', 'is_active' => true]);

    $this->variant = ProductVariant::factory()
        ->forProduct($this->product)
        ->withUnit($unit)
        ->create([
            'name' => 'Regular',
            'sku' => 'COLA001-REG',
            'selling_price' => 2.50,
            'cost_price' => 1.00,
            'stock_quantity' => 50,
            'min_stock_level' => 10,
            'is_active' => true,
        ]);
});

test('sales page loads with sales data', function () {
    $response = $this->get(route('sales.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('sales/index')
        ->has('sales')
        ->has('summary')
    );
});

test('sales page redirects guests to login', function () {
    auth()->logout();

    $response = $this->get(route('sales.index'));
    $response->assertRedirect(route('login'));
});

test('checkout creates sale and reduces stock', function () {
    $response = $this->post(route('sales.checkout'), [
        'items' => [
            ['variant_id' => $this->variant->id, 'quantity' => 3],
        ],
        'payment_method' => 'cash',
        'amount_paid' => 10.00,
        'discount' => 0,
        'tax' => 0,
    ]);

    $response->assertRedirect(route('sales.index'));

    $this->assertDatabaseHas('sales', [
        'total_amount' => 7.50,
        'payment_method' => 'cash',
        'amount_paid' => 10.00,
        'change' => 2.50,
        'user_id' => $this->user->id,
    ]);

    $this->assertDatabaseHas('sale_items', [
        'product_variant_id' => $this->variant->id,
        'quantity' => 3,
        'unit_price' => 2.50,
        'cost_price' => 1.00,
        'total_price' => 7.50,
        'product_name' => 'Cola Soda',
    ]);

    $this->variant->refresh();
    expect((float) $this->variant->stock_quantity)->toBe(47.0);
});

test('checkout with discount and tax', function () {
    $response = $this->post(route('sales.checkout'), [
        'items' => [
            ['variant_id' => $this->variant->id, 'quantity' => 2],
        ],
        'payment_method' => 'kbzpay',
        'amount_paid' => 6.00,
        'discount' => 0.50,
        'tax' => 0.30,
    ]);

    $response->assertRedirect(route('sales.index'));

    $this->assertDatabaseHas('sales', [
        'total_amount' => 4.80,
        'payment_method' => 'kbzpay',
        'amount_paid' => 6.00,
        'change' => 1.20,
        'discount' => 0.50,
        'tax' => 0.30,
    ]);
});

test('checkout fails with insufficient stock', function () {
    $response = $this->post(route('sales.checkout'), [
        'items' => [
            ['variant_id' => $this->variant->id, 'quantity' => 999],
        ],
        'payment_method' => 'cash',
        'amount_paid' => 9999,
    ]);

    $response->assertSessionHasErrors('items');
});

test('checkout validates required fields', function () {
    $response = $this->post(route('sales.checkout'), [
        'items' => [],
        'payment_method' => '',
        'amount_paid' => '',
    ]);

    $response->assertSessionHasErrors(['items', 'payment_method', 'amount_paid']);
});

test('checkout creates invoice number', function () {
    $this->post(route('sales.checkout'), [
        'items' => [
            ['variant_id' => $this->variant->id, 'quantity' => 1],
        ],
        'payment_method' => 'cash',
        'amount_paid' => 5.00,
    ]);

    $sale = \App\Models\Sale::first();

    expect($sale->invoice_number)->toMatch('/^INV-\d{8}-\d{4}$/');
});
