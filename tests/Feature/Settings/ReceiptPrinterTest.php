<?php

use App\Models\Category;
use App\Models\Printer;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Unit;
use App\Models\User;
use App\Services\ReceiptPrinter;

function createReceiptSale(): Sale
{
    $user = User::factory()->create(['name' => 'Tester']);

    $category = Category::factory()->create(['name' => 'Beverages', 'slug' => 'beverages']);
    $product = Product::factory()
        ->forCategory($category)
        ->create(['name' => 'Cola Soda']);
    $unit = Unit::factory()->create(['name' => 'Bottle', 'abbreviation' => 'btl']);
    $variant = ProductVariant::factory()
        ->forProduct($product)
        ->withUnit($unit)
        ->create([
            'name' => 'Regular',
            'units_per_package' => 1,
            'selling_price' => 2.50,
            'cost_price' => 1.00,
        ]);

    $sale = Sale::factory()->create([
        'user_id' => $user->id,
        'invoice_number' => 'INV-20260805-0001',
        'total_amount' => 5.00,
        'amount_paid' => 10.00,
        'change' => 5.00,
    ]);

    SaleItem::create([
        'sale_id' => $sale->id,
        'product_variant_id' => $variant->id,
        'product_name' => 'Cola Soda',
        'variant_name' => 'Regular',
        'unit_name' => 'btl',
        'quantity' => 2,
        'unit_price' => 2.50,
        'cost_price' => 1.00,
        'total_price' => 5.00,
    ]);

    return $sale->load(['items', 'user']);
}

test('build outputs a single printable receipt', function () {
    $receipt = app(ReceiptPrinter::class)->build(createReceiptSale());

    expect($receipt)->toStartWith(ReceiptPrinter::INIT)
        ->and($receipt)->toContain('INV-20260805-0001')
        ->and($receipt)->toContain('Cola Soda')
        ->and($receipt)->toContain('TOTAL 5')
        ->and($receipt)->toContain('Thank you!');
});

test('buildCopies duplicates the receipt and cuts per copy', function () {
    $receipt = app(ReceiptPrinter::class)->buildCopies(createReceiptSale(), copies: 2, autoCut: true);

    expect(substr_count($receipt, ReceiptPrinter::INIT))->toBe(2)
        ->and(substr_count($receipt, ReceiptPrinter::FEED_AND_CUT))->toBe(2)
        ->and(substr_count($receipt, ReceiptPrinter::CUT))->toBe(0);
});

test('buildCopies skips the cut command when autoCut is disabled', function () {
    $receipt = app(ReceiptPrinter::class)->buildCopies(createReceiptSale(), copies: 1, autoCut: false);

    expect(substr_count($receipt, ReceiptPrinter::FEED_AND_CUT))->toBe(0);
});

test('printSale does nothing when printing is disabled', function () {
    Printer::current()->update(['enabled' => false]);

    app(ReceiptPrinter::class)->printSale(createReceiptSale());

    expect(true)->toBeTrue();
});

test('build outputs shop information from printer settings', function () {
    Printer::current()->update([
        'name' => 'U Sein Win',
        'address' => 'Mingalar Market, Yangon',
        'phone_one' => '09 123 456 789',
        'phone_two' => '09 987 654 321',
    ]);

    $receipt = app(ReceiptPrinter::class)->build(createReceiptSale());

    expect($receipt)->toContain('U Sein Win')
        ->and($receipt)->toContain('Mingalar Market, Yangon')
        ->and($receipt)->toContain('Tel: 09 123 456 789 / 09 987 654 321');
});

test('build omits phones when none are set', function () {
    Printer::current()->update([
        'name' => 'U Sein Win',
        'address' => 'Mingalar Market, Yangon',
        'phone_one' => null,
        'phone_two' => null,
    ]);

    $receipt = app(ReceiptPrinter::class)->build(createReceiptSale());

    expect($receipt)->toContain('U Sein Win')
        ->and($receipt)->not->toContain('Tel:');
});
