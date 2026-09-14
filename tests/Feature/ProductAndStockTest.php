<?php

use App\Models\Balance;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductUnit;
use App\Models\Sale;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('authenticated staff can create a product with selling units', function () {
    $user = User::factory()->create(['role' => 'admin']);
    $category = Category::create(['name' => 'Drinks', 'slug' => 'drinks']);

    $response = $this->actingAs($user)->post(route('products.store'), [
        'category_id' => $category->id,
        'name' => 'Cola',
        'sku' => 'COLA-001',
        'product_type' => 'standard',
        'base_unit' => 'Can',
        'purchase_price' => 500,
        'reorder_level' => 10,
        'units' => [['name' => 'Can', 'conversion' => 1, 'selling_price' => 1000]],
    ]);

    $response->assertRedirect(route('products.index'));
    expect(Product::where('sku', 'COLA-001')->first()->units)->toHaveCount(1);
    $this->assertDatabaseHas('inventory_stocks', ['quantity_base' => 0]);
});

test('staff can create a product with an image', function () {
    Storage::fake('public');
    $user = User::factory()->create(['role' => 'admin']);
    $category = Category::create(['name' => 'Images', 'slug' => 'images']);

    $response = $this->actingAs($user)->post(route('products.store'), [
        'category_id' => $category->id,
        'name' => 'Product with image',
        'sku' => 'IMAGE-001',
        'product_type' => 'standard',
        'base_unit' => 'Piece',
        'purchase_price' => 500,
        'reorder_level' => 10,
        'units' => [['name' => 'Piece', 'conversion' => 1, 'selling_price' => 1000]],
        'image' => UploadedFile::fake()->image('product.jpg'),
    ]);

    $response->assertRedirect(route('products.index'));
    $product = Product::where('sku', 'IMAGE-001')->firstOrFail();

    expect($product->image)->not->toBeNull();
    Storage::disk('public')->assertExists($product->image);
});

test('a purchase increases base stock using the selected unit conversion', function () {
    $user = User::factory()->create(['role' => 'admin']);
    $category = Category::create(['name' => 'Beer', 'slug' => 'beer']);
    $product = Product::create(['category_id' => $category->id, 'name' => 'Beer', 'sku' => 'BEER-001', 'base_unit' => 'Bottle', 'purchase_price' => 1000, 'reorder_level' => 5]);
    $unit = ProductUnit::create(['product_id' => $product->id, 'name' => 'Package', 'conversion' => 12, 'selling_price' => 12000]);
    $product->stock()->create(['quantity_base' => 0]);

    $response = $this->actingAs($user)->post(route('purchases.store'), ['invoice_number' => 'PO-001', 'purchased_at' => now()->toDateTimeString(), 'items' => [['product_id' => $product->id, 'product_unit_id' => $unit->id, 'quantity' => 2, 'unit_cost' => 8000]]]);

    $response->assertRedirect();
    $this->assertDatabaseHas('inventory_stocks', ['product_id' => $product->id, 'quantity_base' => 24]);
    $this->assertDatabaseHas('stock_transactions', ['product_id' => $product->id, 'quantity_base' => 24, 'type' => 'purchase']);
});

test('staff can create a stock adjustment with unit conversion', function () {
    $user = User::factory()->create(['role' => 'admin']);
    $category = Category::create(['name' => 'Supplies', 'slug' => 'supplies']);
    $product = Product::create(['category_id' => $category->id, 'name' => 'Boxes', 'sku' => 'BOX-001', 'base_unit' => 'Piece', 'purchase_price' => 100, 'reorder_level' => 5]);
    $product->stock()->create(['quantity_base' => 0]);

    $response = $this->actingAs($user)->post(route('adjustments.store'), [
        'product_id' => $product->id,
        'adjustment_type' => 'increase',
        'quantity' => 7,
        'unit_conversion' => 10,
        'reason' => 'Stock Update',
    ]);

    $response->assertRedirect(route('adjustments.index'));
    $this->assertDatabaseHas('stock_adjustments', [
        'product_id' => $product->id,
        'quantity' => 7,
        'unit_conversion' => 10,
        'quantity_base' => 70,
    ]);
    $this->assertDatabaseHas('inventory_stocks', [
        'product_id' => $product->id,
        'quantity_base' => 70,
    ]);
});

test('checkout deducts converted stock and rejects insufficient payment', function () {
    $user = User::factory()->create(['role' => 'cashier']);
    $category = Category::create(['name' => 'Snacks', 'slug' => 'snacks']);
    $product = Product::create(['category_id' => $category->id, 'name' => 'Chips', 'sku' => 'CHIP-001', 'base_unit' => 'Pack', 'purchase_price' => 500, 'reorder_level' => 2]);
    $unit = ProductUnit::create(['product_id' => $product->id, 'name' => 'Box', 'conversion' => 10, 'selling_price' => 5000]);
    $product->stock()->create(['quantity_base' => 20]);

    $this->actingAs($user)->post(route('sales.store'), ['payment_method' => 'cash', 'received_amount' => 4999, 'items' => [['product_id' => $product->id, 'product_unit_id' => $unit->id, 'quantity' => 1]]])->assertSessionHasErrors('received_amount');
    $this->assertDatabaseHas('inventory_stocks', ['product_id' => $product->id, 'quantity_base' => 20]);

    $response = $this->actingAs($user)->post(route('sales.store'), ['payment_method' => 'cash', 'received_amount' => 5000, 'items' => [['product_id' => $product->id, 'product_unit_id' => $unit->id, 'quantity' => 1]]]);
    $response->assertRedirect();
    $this->assertDatabaseHas('inventory_stocks', ['product_id' => $product->id, 'quantity_base' => 10]);
});

test('checkout updates the users daily balance calculation', function () {
    $user = User::factory()->create(['role' => 'cashier']);
    $category = Category::create(['name' => 'Daily Balance', 'slug' => 'daily-balance']);
    $product = Product::create(['category_id' => $category->id, 'name' => 'Daily Product', 'sku' => 'DAILY-001', 'base_unit' => 'Piece', 'purchase_price' => 100, 'reorder_level' => 1]);
    $unit = ProductUnit::create(['product_id' => $product->id, 'name' => 'Piece', 'conversion' => 1, 'selling_price' => 1000]);
    $product->stock()->create(['quantity_base' => 5]);
    Balance::create(['user_id' => $user->id, 'opening_amount' => 5000, 'created_at' => now(), 'updated_at' => now()]);

    $this->actingAs($user)->post(route('sales.store'), ['payment_method' => 'cash', 'received_amount' => 1200, 'items' => [['product_id' => $product->id, 'product_unit_id' => $unit->id, 'quantity' => 1]]])->assertRedirect();

    $this->assertDatabaseHas('balances', ['user_id' => $user->id, 'opening_amount' => 5000, 'total_sale_amount' => 1000, 'total_change_amount' => 200, 'closing_amount' => 5800]);
});

test('cancelling a sale reverses its daily balance calculation', function () {
    $user = User::factory()->create(['role' => 'manager']);
    $category = Category::create(['name' => 'Balance Reversal', 'slug' => 'balance-reversal']);
    $product = Product::create(['category_id' => $category->id, 'name' => 'Reversible Product', 'sku' => 'REVERSAL-001', 'base_unit' => 'Piece', 'purchase_price' => 100, 'reorder_level' => 1]);
    $unit = ProductUnit::create(['product_id' => $product->id, 'name' => 'Piece', 'conversion' => 1, 'selling_price' => 1000]);
    $product->stock()->create(['quantity_base' => 5]);
    Balance::create(['user_id' => $user->id, 'opening_amount' => 5000, 'created_at' => now(), 'updated_at' => now()]);

    $this->actingAs($user)->post(route('sales.store'), ['payment_method' => 'cash', 'received_amount' => 1200, 'items' => [['product_id' => $product->id, 'product_unit_id' => $unit->id, 'quantity' => 1]]]);
    $sale = Sale::query()->latest('id')->firstOrFail();

    $this->actingAs($user)->post(route('sales.cancel', $sale), ['reason' => 'Returned'])->assertRedirect();

    $this->assertDatabaseHas('balances', ['user_id' => $user->id, 'total_sale_amount' => 0, 'total_change_amount' => 0, 'closing_amount' => 5000]);
});

test('a manager can cancel a sale and restore its base stock', function () {
    $manager = User::factory()->create(['role' => 'manager']);
    $category = Category::create(['name' => 'Water', 'slug' => 'water']);
    $product = Product::create(['category_id' => $category->id, 'name' => 'Water', 'sku' => 'WATER-001', 'base_unit' => 'Bottle', 'purchase_price' => 500, 'reorder_level' => 2]);
    $unit = ProductUnit::create(['product_id' => $product->id, 'name' => 'Pack', 'conversion' => 6, 'selling_price' => 3000]);
    $product->stock()->create(['quantity_base' => 12]);
    $this->actingAs($manager)->post(route('sales.store'), ['payment_method' => 'cash', 'received_amount' => 3000, 'items' => [['product_id' => $product->id, 'product_unit_id' => $unit->id, 'quantity' => 1]]]);
    $sale = Sale::query()->latest('id')->firstOrFail();

    $this->actingAs($manager)->post(route('sales.cancel', $sale), ['reason' => 'Customer returned item'])->assertRedirect();
    $this->assertDatabaseHas('sales', ['id' => $sale->id, 'status' => 'cancelled']);
    $this->assertDatabaseHas('inventory_stocks', ['product_id' => $product->id, 'quantity_base' => 12]);
});

test('a cashier cannot create purchases or stock adjustments', function () {
    $cashier = User::factory()->create(['role' => 'cashier']);

    $purchaseResponse = $this->actingAs($cashier)->post(route('purchases.store'), []);
    $adjustmentResponse = $this->actingAs($cashier)->post(route('adjustments.store'), []);

    $purchaseResponse->assertForbidden();
    $adjustmentResponse->assertForbidden();
});

test('cancelling a sale twice restores stock only once', function () {
    $manager = User::factory()->create(['role' => 'manager']);
    $category = Category::create(['name' => 'Juice', 'slug' => 'juice']);
    $product = Product::create(['category_id' => $category->id, 'name' => 'Juice', 'sku' => 'JUICE-001', 'base_unit' => 'Bottle', 'purchase_price' => 500, 'reorder_level' => 2]);
    $unit = ProductUnit::create(['product_id' => $product->id, 'name' => 'Bottle', 'conversion' => 1, 'selling_price' => 1000]);
    $product->stock()->create(['quantity_base' => 5]);
    $this->actingAs($manager)->post(route('sales.store'), ['payment_method' => 'cash', 'received_amount' => 1000, 'items' => [['product_id' => $product->id, 'product_unit_id' => $unit->id, 'quantity' => 1]]]);
    $sale = Sale::query()->latest('id')->firstOrFail();

    $this->actingAs($manager)->post(route('sales.cancel', $sale), ['reason' => 'Returned']);
    $this->actingAs($manager)->post(route('sales.cancel', $sale), ['reason' => 'Retried']);

    expect($sale->fresh()->status)->toBe('cancelled');
    expect($product->stock()->value('quantity_base'))->toBe(5);
    expect($sale->items()->count())->toBe(1);
    expect($sale->load('items')->items->first()->base_quantity)->toBe(1);
    $this->assertDatabaseCount('stock_transactions', 2);
});

test('an invalid purchase unit is rejected without creating a purchase', function () {
    $manager = User::factory()->create(['role' => 'manager']);
    $category = Category::create(['name' => 'Milk', 'slug' => 'milk']);
    $firstProduct = Product::create(['category_id' => $category->id, 'name' => 'Milk', 'sku' => 'MILK-001', 'base_unit' => 'Bottle', 'purchase_price' => 500, 'reorder_level' => 2]);
    $secondProduct = Product::create(['category_id' => $category->id, 'name' => 'Tea', 'sku' => 'TEA-001', 'base_unit' => 'Box', 'purchase_price' => 500, 'reorder_level' => 2]);
    $unit = ProductUnit::create(['product_id' => $secondProduct->id, 'name' => 'Box', 'conversion' => 1, 'selling_price' => 1000]);

    $response = $this->actingAs($manager)->post(route('purchases.store'), ['invoice_number' => 'PO-INVALID', 'purchased_at' => now()->toDateTimeString(), 'items' => [['product_id' => $firstProduct->id, 'product_unit_id' => $unit->id, 'quantity' => 1, 'unit_cost' => 500]]]);

    $response->assertSessionHasErrors('items.0.product_unit_id');
    $this->assertDatabaseMissing('purchases', ['invoice_number' => 'PO-INVALID']);
});

test('a manager can quickly update product stock and selling prices', function () {
    $manager = User::factory()->create(['role' => 'manager']);
    $category = Category::create(['name' => 'Quick Updates', 'slug' => 'quick-updates']);
    $product = Product::create(['category_id' => $category->id, 'name' => 'Quick Product', 'sku' => 'QUICK-001', 'base_unit' => 'Piece', 'purchase_price' => 500, 'reorder_level' => 2]);
    $unit = ProductUnit::create(['product_id' => $product->id, 'name' => 'Pack', 'conversion' => 10, 'selling_price' => 5000]);
    $product->stock()->create(['quantity_base' => 20]);

    $response = $this->actingAs($manager)->patch(route('products.quick-update', $product), [
        'stock_unit_id' => $unit->id,
        'package_quantity' => 3,
        'loose_quantity' => 5,
        'unit_prices' => [['id' => $unit->id, 'selling_price' => 6500]],
    ]);

    $response->assertRedirect(route('products.index'));
    $this->assertDatabaseHas('inventory_stocks', ['product_id' => $product->id, 'quantity_base' => 35]);
    $this->assertDatabaseHas('product_units', ['id' => $unit->id, 'selling_price' => 6500]);
    $this->assertDatabaseHas('stock_transactions', ['product_id' => $product->id, 'quantity_base' => 15, 'type' => 'adjustment']);
});
