<?php

use App\Models\Category;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Sequence;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected from store operations', function (string $path) {
    $this->get($path)->assertRedirect(route('login'));
})->with(['/checkout', '/products', '/reports']);

test('authenticated users can open checkout and operations', function (string $path) {
    $user = User::factory()->create(['role' => 'manager']);

    $this->actingAs($user)->get($path)->assertOk();
})->with(['/checkout', '/products', '/sales']);

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

test('products can be filtered by category', function () {
    $user = User::factory()->create(['role' => 'manager']);
    $includedCategory = Category::create(['name' => 'Included', 'slug' => 'included']);
    $excludedCategory = Category::create(['name' => 'Excluded', 'slug' => 'excluded']);
    Product::factory()->create(['category_id' => $includedCategory->id, 'name' => 'Included product', 'sku' => 'INCLUDED', 'base_unit' => 'Piece', 'active' => true]);
    Product::factory()->create(['category_id' => $excludedCategory->id, 'name' => 'Excluded product', 'sku' => 'EXCLUDED', 'base_unit' => 'Piece', 'active' => true]);

    $this->actingAs($user)->get(route('products.index', ['category_id' => $includedCategory->id]))
        ->assertInertia(fn (Assert $page) => $page->where('products.data.0.name', 'Included product')->where('products.total', 1));
});

test('products can be filtered by search term', function () {
    $user = User::factory()->create(['role' => 'manager']);
    $category = Category::create(['name' => 'Search products', 'slug' => 'search-products']);
    Product::factory()->create(['category_id' => $category->id, 'name' => 'Searchable Cola', 'sku' => 'COLA-SEARCH', 'base_unit' => 'Piece', 'active' => true]);
    Product::factory()->create(['category_id' => $category->id, 'name' => 'Other Drink', 'sku' => 'OTHER-SEARCH', 'base_unit' => 'Piece', 'active' => true]);

    $this->actingAs($user)->get(route('products.index', ['search' => 'Searchable']))
        ->assertInertia(fn (Assert $page) => $page->where('products.data.0.name', 'Searchable Cola')->where('products.total', 1));
});

test('purchases can be filtered by date range', function () {
    $user = User::factory()->create(['role' => 'manager']);
    Purchase::create(['user_id' => $user->id, 'invoice_number' => 'IN-RANGE', 'purchased_at' => '2026-09-10 10:00:00', 'subtotal' => 100, 'total' => 100]);
    Purchase::create(['user_id' => $user->id, 'invoice_number' => 'OUT-RANGE', 'purchased_at' => '2026-09-20 10:00:00', 'subtotal' => 200, 'total' => 200]);

    $this->actingAs($user)->get(route('purchases.index', ['start_date' => '2026-09-09', 'end_date' => '2026-09-11']))
        ->assertInertia(fn (Assert $page) => $page->where('purchases.data.0.invoice_number', 'IN-RANGE')->where('purchases.total', 1));
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
})->with(['/categories', '/suppliers', '/purchases', '/reports', '/products/create']);

test('admins can access cashier and management screens', function (string $path) {
    $user = User::factory()->create(['role' => 'admin']);

    $this->actingAs($user)->get($path)->assertOk();
})->with(['/checkout', '/sales', '/products', '/categories', '/suppliers', '/purchases', '/reports', '/products/create', '/purchases/create']);
