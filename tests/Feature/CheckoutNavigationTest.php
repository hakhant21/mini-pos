<?php

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Sequence;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected from store operations', function (string $path) {
    $this->get($path)->assertRedirect(route('login'));
})->with(['/checkout', '/products', '/inventory', '/reports']);

test('authenticated users can open checkout and operations', function (string $path) {
    $user = User::factory()->create(['role' => 'manager']);

    $this->actingAs($user)->get($path)->assertOk();
})->with(['/checkout', '/products', '/inventory', '/sales']);

test('checkout loads products in pages of twenty', function () {
    $user = User::factory()->create(['role' => 'manager']);
    $category = Category::create(['name' => 'Checkout products', 'slug' => 'checkout-products']);
    $emptyCategory = Category::create(['name' => 'Empty category', 'slug' => 'empty-category']);

    Product::factory()
        ->count(21)
        ->sequence(fn (Sequence $sequence): array => [
            'name' => 'Checkout product '.$sequence->index,
            'sku' => 'CHECKOUT-'.$sequence->index,
        ])
        ->create([
            'category_id' => $category->id,
            'base_unit' => 'Piece',
            'purchase_price' => 100,
            'reorder_level' => 1,
            'active' => true,
        ]);

    $this->actingAs($user)
        ->get(route('checkout.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('checkouts/Index')
            ->has('products.data', 20)
            ->where('categories', [$category->name, $emptyCategory->name])
            ->where('products.per_page', 20),
        );
});

test('unknown store operations return not found', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->get('/not-a-store-section')->assertNotFound();
});

test('reports reject an invalid date range', function () {
    $user = User::factory()->create(['role' => 'manager']);

    $this->actingAs($user)
        ->get(route('reports.index', ['from' => '2026-09-10', 'to' => '2026-09-09']))
        ->assertSessionHasErrors('to');
});

test('cashiers cannot access store management screens', function (string $path) {
    $user = User::factory()->create(['role' => 'cashier']);

    $this->actingAs($user)->get($path)->assertForbidden();
})->with(['/categories', '/suppliers', '/purchases', '/adjustments', '/reports', '/products/create']);

test('admins can access cashier and management screens', function (string $path) {
    $user = User::factory()->create(['role' => 'admin']);

    $this->actingAs($user)->get($path)->assertOk();
})->with(['/checkout', '/sales', '/products', '/categories', '/suppliers', '/purchases', '/inventory', '/adjustments', '/reports', '/products/create', '/purchases/create', '/adjustments/create']);
