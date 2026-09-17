<?php

use App\Models\Balance;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductUnit;
use App\Models\Sale;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

test('authenticated staff can create a product with selling units', function () {
    $user = User::factory()->create(['role' => 'admin']);
    $category = Category::create(['name' => 'Drinks', 'slug' => 'drinks']);

    $response = $this->actingAs($user)->post(route('products.store'), [
        'category_id' => $category->id,
        'name' => 'Cola',
        'sku' => 'COLA-001',
        'price_mode' => 'standard',
        'base_unit' => 'Can',
        'reorder_level' => 10,
        'units' => [['name' => 'Can', 'conversion' => 1, 'purchase_price' => 500, 'selling_price' => 1000, 'package_price' => 1000, 'single_unit_price' => 1000, 'package_quantity' => 0, 'loose_quantity' => 0]],
    ]);

    $response->assertRedirect(route('products.index'));
    expect(Product::where('sku', 'COLA-001')->first()->units)->toHaveCount(1);
    $this->assertDatabaseHas('product_units', ['purchase_price' => 500, 'selling_price' => 1000, 'quantity_base' => 0]);
});

test('staff can create a product with an image', function () {
    Storage::fake('public');
    $user = User::factory()->create(['role' => 'admin']);
    $category = Category::create(['name' => 'Images', 'slug' => 'images']);

    $response = $this->actingAs($user)->post(route('products.store'), [
        'category_id' => $category->id,
        'name' => 'Product with image',
        'sku' => 'IMAGE-001',
        'price_mode' => 'standard',
        'base_unit' => 'Piece',
        'reorder_level' => 10,
        'units' => [['name' => 'Piece', 'conversion' => 1, 'purchase_price' => 500, 'selling_price' => 1000, 'package_price' => 1000, 'single_unit_price' => 1000, 'package_quantity' => 0, 'loose_quantity' => 0]],
        'image' => UploadedFile::fake()->image('product.jpg'),
    ]);

    $response->assertRedirect(route('products.index'));
    $product = Product::where('sku', 'IMAGE-001')->firstOrFail();

    expect($product->image)->not->toBeNull();
    Storage::disk('public')->assertExists($product->image);
});

test('product edit exposes a host-relative image URL', function () {
    Storage::fake('public');
    $user = User::factory()->create(['role' => 'admin']);
    $category = Category::create(['name' => 'Edit images', 'slug' => 'edit-images']);
    Storage::disk('public')->put('products/edit-image.jpg', 'image contents');
    $product = Product::create([
        'category_id' => $category->id,
        'name' => 'Editable product',
        'sku' => 'EDIT-IMAGE-001',
        'base_unit' => 'Piece',
        'reorder_level' => 0,
        'image' => 'products/edit-image.jpg',
    ]);
    $product->units()->create(['name' => 'Piece', 'conversion' => 1]);

    $this->actingAs($user)->get(route('products.edit', $product))
        ->assertInertia(fn (Assert $page) => $page
            ->component('products/Edit')
            ->where('product.image_url', '/storage/products/edit-image.jpg'),
        );
});

test('a purchase increases base stock using the selected unit conversion', function () {
    $user = User::factory()->create(['role' => 'admin']);
    $category = Category::create(['name' => 'Beer', 'slug' => 'beer']);
    $product = Product::create(['category_id' => $category->id, 'name' => 'Beer', 'sku' => 'BEER-001', 'base_unit' => 'Bottle', 'reorder_level' => 5]);
    $unit = ProductUnit::create(['product_id' => $product->id, 'name' => 'Package', 'conversion' => 12, 'selling_price' => 12000]);
    $unit->stock()->create(['product_id' => $product->id]);

    $response = $this->actingAs($user)->post(route('purchases.store'), ['invoice_number' => 'PO-001', 'purchased_at' => now()->toDateTimeString(), 'items' => [['product_id' => $product->id, 'product_unit_id' => $unit->id, 'quantity' => 2, 'unit_cost' => 8000]]]);

    $response->assertRedirect();
    $this->assertDatabaseHas('product_units', ['id' => $unit->id, 'quantity_base' => 24]);
    $this->assertDatabaseHas('stock_transactions', ['product_id' => $product->id, 'quantity_base' => 24, 'type' => 'purchase']);
});

test('checkout deducts converted stock and rejects insufficient payment', function () {
    $user = User::factory()->create(['role' => 'cashier']);
    $category = Category::create(['name' => 'Snacks', 'slug' => 'snacks']);
    $product = Product::create(['category_id' => $category->id, 'name' => 'Chips', 'sku' => 'CHIP-001', 'base_unit' => 'Pack', 'reorder_level' => 2]);
    $unit = ProductUnit::create(['product_id' => $product->id, 'name' => 'Box', 'conversion' => 10, 'selling_price' => 5000]);
    $unit->update(['package_quantity' => 2, 'quantity_base' => 20]);
    $unit->stock()->create(['product_id' => $product->id]);

    $this->actingAs($user)->post(route('sales.store'), ['payment_method' => 'cash', 'received_amount' => 4999, 'items' => [['product_id' => $product->id, 'product_unit_id' => $unit->id, 'selling_mode' => 'Package', 'quantity' => 1]]])->assertSessionHasErrors('received_amount');
    $this->assertDatabaseHas('product_units', ['id' => $unit->id, 'quantity_base' => 20]);

    $response = $this->actingAs($user)->post(route('sales.store'), ['payment_method' => 'cash', 'received_amount' => 5000, 'items' => [['product_id' => $product->id, 'product_unit_id' => $unit->id, 'selling_mode' => 'Package', 'quantity' => 1]]]);
    $sale = Sale::query()->latest('id')->firstOrFail();
    $response->assertRedirect(route('sales.show', $sale));
    $this->assertDatabaseHas('product_units', ['id' => $unit->id, 'quantity_base' => 10]);
});

test('completed sales can receive additional items on the same invoice', function () {
    $user = User::factory()->create(['role' => 'cashier']);
    $category = Category::create(['name' => 'Add-ons', 'slug' => 'add-ons']);
    $product = Product::create(['category_id' => $category->id, 'name' => 'Add-on product', 'sku' => 'ADD-001', 'base_unit' => 'Piece']);
    $unit = ProductUnit::create(['product_id' => $product->id, 'name' => 'Piece', 'conversion' => 1, 'selling_price' => 1500, 'single_unit_price' => 1500, 'quantity_base' => 5]);
    $unit->stock()->create(['product_id' => $product->id]);

    $this->actingAs($user)->post(route('sales.store'), [
        'payment_method' => 'cash',
        'received_amount' => 1500,
        'items' => [['product_id' => $product->id, 'product_unit_id' => $unit->id, 'selling_mode' => 'Single', 'quantity' => 1]],
    ]);
    $sale = Sale::query()->latest('id')->firstOrFail();

    $response = $this->actingAs($user)->post(route('sales.items.store', $sale), [
        'payment_method' => 'cash',
        'received_amount' => 2000,
        'items' => [['product_id' => $product->id, 'product_unit_id' => $unit->id, 'selling_mode' => 'Single', 'quantity' => 1]],
    ]);

    $response->assertRedirect(route('sales.show', $sale));
    $this->assertDatabaseHas('sales', ['id' => $sale->id, 'subtotal' => 3000, 'total' => 3000, 'received_amount' => 3500, 'change_amount' => 500]);
    expect($sale->fresh()->items)->toHaveCount(2);
    $this->assertDatabaseHas('product_units', ['id' => $unit->id, 'quantity_base' => 3]);
});

test('checkout sells a package unit as a single item at its single-unit price', function () {
    $user = User::factory()->create(['role' => 'cashier']);
    $category = Category::create(['name' => 'Single-mode checkout', 'slug' => 'single-mode-checkout']);
    $product = Product::create(['category_id' => $category->id, 'name' => 'Single-mode product', 'sku' => 'SINGLE-MODE-001', 'price_mode' => 'single_package', 'base_unit' => 'Piece', 'reorder_level' => 1]);
    $unit = ProductUnit::create(['product_id' => $product->id, 'name' => 'Package', 'conversion' => 10, 'selling_price' => 5000, 'package_price' => 5000, 'single_unit_price' => 600]);
    $unit->update(['package_quantity' => 2, 'quantity_base' => 20]);
    $unit->stock()->create(['product_id' => $product->id]);

    $this->actingAs($user)->post(route('sales.store'), ['payment_method' => 'cash', 'received_amount' => 600, 'items' => [['product_id' => $product->id, 'product_unit_id' => $unit->id, 'selling_mode' => 'Single', 'quantity' => 1]]])->assertRedirect();

    $this->assertDatabaseHas('sales', ['total' => 600]);
    $this->assertDatabaseHas('sale_items', ['product_unit_id' => $unit->id, 'unit_price' => 600, 'base_quantity' => 1]);
    $this->assertDatabaseHas('product_units', ['id' => $unit->id, 'quantity_base' => 19]);

    $this->actingAs($user)->post(route('sales.store'), ['payment_method' => 'cash', 'received_amount' => 5000, 'items' => [['product_id' => $product->id, 'product_unit_id' => $unit->id, 'selling_mode' => 'Package', 'quantity' => 1]]])->assertRedirect();
    $this->assertDatabaseHas('sale_items', ['product_unit_id' => $unit->id, 'unit_price' => 5000, 'base_quantity' => 10]);
    $this->assertDatabaseHas('product_units', ['id' => $unit->id, 'quantity_base' => 9]);
});

test('checkout uses package and carton prices for carton products', function () {
    $user = User::factory()->create(['role' => 'cashier']);
    $category = Category::create(['name' => 'Tobacco pricing', 'slug' => 'tobacco-pricing']);
    $product = Product::create(['category_id' => $category->id, 'name' => 'Tobacco', 'sku' => 'TOBACCO-001', 'price_mode' => 'single_package_carton', 'base_unit' => 'Stick', 'reorder_level' => 1]);
    $unit = ProductUnit::create(['product_id' => $product->id, 'name' => 'Package', 'conversion' => 20, 'purchase_price' => 14000, 'selling_price' => 18000, 'package_price' => 1800, 'single_unit_price' => 100, 'package_quantity' => 1, 'quantity_base' => 20]);
    $unit->stock()->create(['product_id' => $product->id]);

    $this->actingAs($user)->post(route('sales.store'), ['payment_method' => 'cash', 'received_amount' => 1800, 'items' => [['product_id' => $product->id, 'product_unit_id' => $unit->id, 'selling_mode' => 'Package', 'quantity' => 1]]])->assertRedirect();
    $this->assertDatabaseHas('sale_items', ['unit_price' => 1800, 'base_quantity' => 20]);

    $unit->refresh()->update(['quantity_base' => 200]);
    $carton = ProductUnit::create(['product_id' => $product->id, 'name' => 'Carton', 'conversion' => 200, 'purchase_price' => 14000, 'selling_price' => 18000, 'package_price' => 1800, 'single_unit_price' => 100, 'quantity_base' => 200]);
    $carton->stock()->create(['product_id' => $product->id]);
    $this->actingAs($user)->post(route('sales.store'), ['payment_method' => 'cash', 'received_amount' => 18000, 'items' => [['product_id' => $product->id, 'product_unit_id' => $carton->id, 'selling_mode' => 'Carton', 'quantity' => 1]]])->assertRedirect();
    $this->assertDatabaseHas('sale_items', ['unit_price' => 18000, 'base_quantity' => 200]);
});

test('checkout updates the users daily balance calculation', function () {
    $user = User::factory()->create(['role' => 'cashier']);
    $category = Category::create(['name' => 'Daily Balance', 'slug' => 'daily-balance']);
    $product = Product::create(['category_id' => $category->id, 'name' => 'Daily Product', 'sku' => 'DAILY-001', 'base_unit' => 'Piece', 'reorder_level' => 1]);
    $unit = ProductUnit::create(['product_id' => $product->id, 'name' => 'Piece', 'conversion' => 1, 'selling_price' => 1000, 'single_unit_price' => 1000]);
    $unit->update(['package_quantity' => 5, 'quantity_base' => 5]);
    $unit->stock()->create(['product_id' => $product->id]);
    Balance::create(['user_id' => $user->id, 'opening_amount' => 5000, 'created_at' => now(), 'updated_at' => now()]);

    $this->actingAs($user)->post(route('sales.store'), ['payment_method' => 'cash', 'received_amount' => 1200, 'items' => [['product_id' => $product->id, 'product_unit_id' => $unit->id, 'selling_mode' => 'Single', 'quantity' => 1]]])->assertRedirect();

    $this->assertDatabaseHas('balances', ['user_id' => $user->id, 'opening_amount' => 5000, 'total_sale_amount' => 1000, 'total_change_amount' => 200, 'closing_amount' => 5800]);
});

test('cancelling a sale reverses its daily balance calculation', function () {
    $user = User::factory()->create(['role' => 'manager']);
    $category = Category::create(['name' => 'Balance Reversal', 'slug' => 'balance-reversal']);
    $product = Product::create(['category_id' => $category->id, 'name' => 'Reversible Product', 'sku' => 'REVERSAL-001', 'base_unit' => 'Piece', 'reorder_level' => 1]);
    $unit = ProductUnit::create(['product_id' => $product->id, 'name' => 'Piece', 'conversion' => 1, 'selling_price' => 1000, 'single_unit_price' => 1000]);
    $unit->update(['package_quantity' => 5, 'quantity_base' => 5]);
    $unit->stock()->create(['product_id' => $product->id]);
    Balance::create(['user_id' => $user->id, 'opening_amount' => 5000, 'created_at' => now(), 'updated_at' => now()]);

    $this->actingAs($user)->post(route('sales.store'), ['payment_method' => 'cash', 'received_amount' => 1200, 'items' => [['product_id' => $product->id, 'product_unit_id' => $unit->id, 'selling_mode' => 'Single', 'quantity' => 1]]]);
    $sale = Sale::query()->latest('id')->firstOrFail();

    $this->actingAs($user)->post(route('sales.cancel', $sale), ['reason' => 'Returned'])->assertRedirect();

    $this->assertDatabaseHas('balances', ['user_id' => $user->id, 'total_sale_amount' => 0, 'total_change_amount' => 0, 'closing_amount' => 5000]);
});

test('a manager can cancel a sale and restore its base stock', function () {
    $manager = User::factory()->create(['role' => 'manager']);
    $category = Category::create(['name' => 'Water', 'slug' => 'water']);
    $product = Product::create(['category_id' => $category->id, 'name' => 'Water', 'sku' => 'WATER-001', 'base_unit' => 'Bottle', 'reorder_level' => 2]);
    $unit = ProductUnit::create(['product_id' => $product->id, 'name' => 'Pack', 'conversion' => 6, 'selling_price' => 3000]);
    $unit->update(['package_quantity' => 2, 'quantity_base' => 12]);
    $unit->stock()->create(['product_id' => $product->id]);
    $this->actingAs($manager)->post(route('sales.store'), ['payment_method' => 'cash', 'received_amount' => 3000, 'items' => [['product_id' => $product->id, 'product_unit_id' => $unit->id, 'selling_mode' => 'Package', 'quantity' => 1]]]);
    $sale = Sale::query()->latest('id')->firstOrFail();

    $this->actingAs($manager)->post(route('sales.cancel', $sale), ['reason' => 'Customer returned item'])->assertRedirect();
    $this->assertDatabaseHas('sales', ['id' => $sale->id, 'status' => 'cancelled']);
    $this->assertDatabaseHas('product_units', ['id' => $unit->id, 'quantity_base' => 12]);
});

test('a cashier cannot create purchases', function () {
    $cashier = User::factory()->create(['role' => 'cashier']);

    $purchaseResponse = $this->actingAs($cashier)->post(route('purchases.store'), []);

    $purchaseResponse->assertForbidden();
});

test('cancelling a sale twice restores stock only once', function () {
    $manager = User::factory()->create(['role' => 'manager']);
    $category = Category::create(['name' => 'Juice', 'slug' => 'juice']);
    $product = Product::create(['category_id' => $category->id, 'name' => 'Juice', 'sku' => 'JUICE-001', 'base_unit' => 'Bottle', 'reorder_level' => 2]);
    $unit = ProductUnit::create(['product_id' => $product->id, 'name' => 'Bottle', 'conversion' => 1, 'selling_price' => 1000, 'single_unit_price' => 1000]);
    $unit->update(['package_quantity' => 5, 'quantity_base' => 5]);
    $unit->stock()->create(['product_id' => $product->id]);
    $this->actingAs($manager)->post(route('sales.store'), ['payment_method' => 'cash', 'received_amount' => 1000, 'items' => [['product_id' => $product->id, 'product_unit_id' => $unit->id, 'selling_mode' => 'Single', 'quantity' => 1]]]);
    $sale = Sale::query()->latest('id')->firstOrFail();

    $this->actingAs($manager)->post(route('sales.cancel', $sale), ['reason' => 'Returned']);
    $this->actingAs($manager)->post(route('sales.cancel', $sale), ['reason' => 'Retried']);

    expect($sale->fresh()->status)->toBe('cancelled');
    expect($unit->fresh()->quantity_base)->toBe(5);
    expect($sale->items()->count())->toBe(1);
    expect($sale->load('items')->items->first()->base_quantity)->toBe(1);
    $this->assertDatabaseCount('stock_transactions', 2);
});

test('an invalid purchase unit is rejected without creating a purchase', function () {
    $manager = User::factory()->create(['role' => 'manager']);
    $category = Category::create(['name' => 'Milk', 'slug' => 'milk']);
    $firstProduct = Product::create(['category_id' => $category->id, 'name' => 'Milk', 'sku' => 'MILK-001', 'base_unit' => 'Bottle', 'reorder_level' => 2]);
    $secondProduct = Product::create(['category_id' => $category->id, 'name' => 'Tea', 'sku' => 'TEA-001', 'base_unit' => 'Box', 'reorder_level' => 2]);
    $unit = ProductUnit::create(['product_id' => $secondProduct->id, 'name' => 'Box', 'conversion' => 1, 'selling_price' => 1000]);

    $response = $this->actingAs($manager)->post(route('purchases.store'), ['invoice_number' => 'PO-INVALID', 'purchased_at' => now()->toDateTimeString(), 'items' => [['product_id' => $firstProduct->id, 'product_unit_id' => $unit->id, 'quantity' => 1, 'unit_cost' => 500]]]);

    $response->assertSessionHasErrors('items.0.product_unit_id');
    $this->assertDatabaseMissing('purchases', ['invoice_number' => 'PO-INVALID']);
});

test('a manager can update product units through the product update endpoint', function () {
    $manager = User::factory()->create(['role' => 'manager']);
    $category = Category::create(['name' => 'Inline Updates', 'slug' => 'inline-updates']);
    $product = Product::create(['category_id' => $category->id, 'name' => 'Quick Product', 'sku' => 'QUICK-001', 'base_unit' => 'Piece', 'reorder_level' => 2]);
    $unit = ProductUnit::create(['product_id' => $product->id, 'name' => 'Pack', 'conversion' => 10, 'selling_price' => 5000]);
    $unit->update(['package_quantity' => 2, 'quantity_base' => 20]);
    $unit->stock()->create(['product_id' => $product->id]);

    $response = $this->actingAs($manager)->patch(route('products.update', $product), [
        'category_id' => $category->id,
        'name' => $product->name,
        'sku' => $product->sku,
        'price_mode' => 'standard',
        'base_unit' => $product->base_unit,
        'reorder_level' => $product->reorder_level,
        'units' => [['id' => $unit->id, 'name' => $unit->name, 'conversion' => $unit->conversion, 'purchase_price' => 400, 'selling_price' => 6500, 'package_price' => 6500, 'single_unit_price' => 500, 'package_quantity' => 3, 'loose_quantity' => 5]],
    ]);

    $response->assertRedirect(route('products.index'));
    $this->assertDatabaseHas('product_units', ['id' => $unit->id, 'quantity_base' => 35]);
    $this->assertDatabaseHas('product_units', ['id' => $unit->id, 'selling_price' => 6500]);
    $this->assertDatabaseHas('product_units', ['id' => $unit->id, 'purchase_price' => 400, 'package_quantity' => 3, 'loose_quantity' => 5]);
    $this->assertDatabaseHas('stock_transactions', ['product_id' => $product->id, 'quantity_base' => 15, 'type' => 'adjustment']);
});

test('stock movements share one product stock row across selling units', function () {
    $user = User::factory()->create(['role' => 'admin']);
    $category = Category::create(['name' => 'Independent stock', 'slug' => 'independent-stock']);
    $product = Product::create(['category_id' => $category->id, 'name' => 'Independent', 'sku' => 'INDEPENDENT-001', 'base_unit' => 'Piece']);
    $pack = ProductUnit::create(['product_id' => $product->id, 'name' => 'Pack', 'conversion' => 10, 'selling_price' => 5000]);
    $piece = ProductUnit::create(['product_id' => $product->id, 'name' => 'Piece', 'conversion' => 1, 'selling_price' => 500]);
    $pack->update(['package_quantity' => 2, 'quantity_base' => 20]);
    $pack->stock()->create(['product_id' => $product->id]);
    $piece->stock()->create(['product_id' => $product->id]);

    $this->actingAs($user)->post(route('purchases.store'), ['invoice_number' => 'PO-INDEPENDENT', 'purchased_at' => now()->toDateTimeString(), 'items' => [['product_id' => $product->id, 'product_unit_id' => $pack->id, 'quantity' => 1, 'unit_cost' => 4000]]])->assertRedirect();

    $this->assertDatabaseHas('product_units', ['id' => $pack->id, 'quantity_base' => 30]);
    $this->assertDatabaseCount('inventory_stocks', 2);
});
