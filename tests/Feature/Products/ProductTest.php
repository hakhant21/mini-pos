<?php

use App\Models\Category;
use App\Models\Product;
use App\Models\Unit;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);

    $this->category = Category::factory()->create();
});

test('index loads products', function () {
    Product::factory()->count(3)->forCategory($this->category)->create();
    $this->get(route('products.index'))->assertOk();
});

test('create page loads with categories and units', function () {
    $response = $this->get(route('products.create'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('products/create')
        ->has('categories')
        ->has('units')
    );
});

test('store creates product', function () {
    $response = $this->post(route('products.store'), [
        'category_id' => $this->category->id,
        'name' => 'Test Product',
        'sku' => 'TST-001',
    ]);

    $response->assertRedirect();
    expect(Product::where('sku', 'TST-001')->exists())->toBeTrue();
});

test('store validates required fields', function () {
    $this->post(route('products.store'), [])
        ->assertSessionHasErrors(['category_id', 'name', 'sku']);
});

test('store validates unique sku', function () {
    Product::factory()->forCategory($this->category)->create(['sku' => 'DUP']);

    $this->post(route('products.store'), [
        'category_id' => $this->category->id,
        'name' => 'Test',
        'sku' => 'DUP',
    ])->assertSessionHasErrors('sku');
});

test('show displays product', function () {
    $product = Product::factory()->forCategory($this->category)->create();

    $response = $this->get(route('products.show', $product));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('products/show')
        ->where('product.id', $product->id)
    );
});

test('edit page loads with product', function () {
    $product = Product::factory()->forCategory($this->category)->create();

    $response = $this->get(route('products.edit', $product));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('products/edit')
        ->has('product')
        ->has('categories')
        ->has('units')
    );
});

test('update modifies product', function () {
    $product = Product::factory()->forCategory($this->category)->create(['name' => 'Old']);

    $this->patch(route('products.update', $product), [
        'category_id' => $this->category->id,
        'name' => 'Updated',
        'sku' => $product->sku,
    ]);

    expect($product->fresh()->name)->toBe('Updated');
});

test('update allows same sku', function () {
    $product = Product::factory()->forCategory($this->category)->create(['sku' => 'SAME']);

    $this->patch(route('products.update', $product), [
        'category_id' => $this->category->id,
        'name' => 'Test',
        'sku' => 'SAME',
    ])->assertSessionDoesntHaveErrors('sku');
});

test('destroy soft deletes product', function () {
    $product = Product::factory()->forCategory($this->category)->create();

    $this->delete(route('products.destroy', $product));

    expect(Product::find($product->id))->toBeNull();
    expect(Product::withTrashed()->find($product->id))->not->toBeNull();
});

test('restore brings back product', function () {
    $product = Product::factory()->forCategory($this->category)->create();
    $product->delete();

    $this->patch(route('products.restore', $product->id));

    expect(Product::find($product->id))->not->toBeNull();
});

test('toggle active flips status', function () {
    $product = Product::factory()->forCategory($this->category)->create(['is_active' => true]);

    $this->patch(route('products.toggle-active', $product));
    expect($product->fresh()->is_active)->toBeFalse();
});

test('guest is redirected', function () {
    auth()->logout();
    $this->get(route('products.index'))->assertRedirect(route('login'));
});
