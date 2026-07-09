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
    $product = Product::factory()->forCategory($category)->create(['name' => 'Test Product']);

    ProductVariant::factory()
        ->forProduct($product)
        ->withUnit($unit)
        ->create([
            'stock_quantity' => 10,
            'cost_price' => 5.00,
            'selling_price' => 10.00,
        ]);
});

test('report page loads', function () {
    $response = $this->get(route('reports.profit-loss'));
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page->component('reports/profit-loss'));
});

test('report shows product data', function () {
    $response = $this->get(route('reports.profit-loss'));

    $response->assertInertia(fn ($page) => $page
        ->has('products', 1)
        ->has('summary')
    );
});

test('report shows summary totals', function () {
    $response = $this->get(route('reports.profit-loss'));

    $response->assertInertia(fn ($page) => $page
        ->where('summary.total_products', 1)
        ->where('summary.total_variants', 1)
        ->where('summary.total_stock', 10)
    );
});

test('guest is redirected', function () {
    auth()->logout();
    $this->get(route('reports.profit-loss'))->assertRedirect(route('login'));
});
