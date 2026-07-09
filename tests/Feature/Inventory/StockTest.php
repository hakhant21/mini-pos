<?php

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Unit;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);

    $category = Category::factory()->create();
    $unit = Unit::factory()->create();
    $product = Product::factory()->forCategory($category)->create();

    $this->variant = ProductVariant::factory()
        ->forProduct($product)
        ->withUnit($unit)
        ->create([
            'stock_quantity' => 5,
            'min_stock_level' => 10,
            'cost_price' => 2.00,
        ]);
});

test('index loads inventory page', function () {
    $response = $this->get(route('inventory.index'));
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page->component('inventory/index'));
});

test('index shows low stock and out of stock variants', function () {
    $response = $this->get(route('inventory.index'));

    $response->assertInertia(fn ($page) => $page
        ->has('lowStockVariants')
        ->has('outOfStockVariants')
    );
});

test('create page loads', function () {
    $response = $this->get(route('inventory.create'));
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page->component('inventory/create'));
});

test('store adds stock and updates cost price', function () {
    $response = $this->post(route('inventory.store'), [
        'variant_id' => $this->variant->id,
        'quantity' => 10,
        'cost_price' => 3.00,
    ]);

    $response->assertRedirect(route('inventory.index'));
    $response->assertSessionHas('success');

    $this->variant->refresh();
    expect((float) $this->variant->stock_quantity)->toBe(15.0);
    expect((float) $this->variant->cost_price)->toBe(2.67);
});

test('store validates required fields', function () {
    $this->post(route('inventory.store'), [])
        ->assertSessionHasErrors(['variant_id', 'quantity', 'cost_price']);
});

test('guest is redirected', function () {
    auth()->logout();
    $this->get(route('inventory.index'))->assertRedirect(route('login'));
});
