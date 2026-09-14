<?php

namespace App\Services\Checkout;

use App\Models\Balance;
use App\Models\Product;
use App\Models\ProductUnit;
use App\Models\Sale;
use App\Services\Inventory\InventoryService;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CheckoutService
{
    public function __construct(private readonly InventoryService $inventory) {}

    public function complete(array $data, int $userId): Sale
    {
        return DB::transaction(function () use ($data, $userId): Sale {
            $lines = collect($data['items'])->map(function (array $item): array {
                $product = Product::query()->lockForUpdate()->findOrFail($item['product_id']);
                $unit = ProductUnit::query()->whereKey($item['product_unit_id'])->where('product_id', $product->id)->firstOrFail();

                return ['product' => $product, 'product_id' => $product->id, 'product_unit_id' => $unit->id, 'quantity' => $item['quantity'], 'unit_price' => $unit->selling_price, 'base_quantity' => $item['quantity'] * $unit->conversion];
            });
            $subtotal = $lines->sum(fn (array $line): int => $line['unit_price'] * $line['quantity']);
            $discount = (int) ($data['discount'] ?? 0);
            $tax = (int) ($data['tax'] ?? 0);
            $total = max(0, $subtotal - $discount + $tax);
            if ((int) $data['received_amount'] < $total) {
                throw ValidationException::withMessages(['received_amount' => 'Received amount is less than the total.']);
            }
            $sale = Sale::create(['user_id' => $userId, 'invoice_number' => 'INV-'.now()->format('YmdHis').'-'.random_int(100, 999), 'sold_at' => now(), 'payment_method' => $data['payment_method'], 'received_amount' => $data['received_amount'], 'change_amount' => $data['received_amount'] - $total, 'subtotal' => $subtotal, 'discount' => $discount, 'tax' => $tax, 'total' => $total]);
            $balance = Balance::query()
                ->where('user_id', $userId)
                ->whereDate('created_at', today())
                ->latest('id')
                ->lockForUpdate()
                ->first();

            if ($balance) {
                $balance->total_sale_amount += $sale->total;
                $balance->total_change_amount += $sale->change_amount;
                $balance->closing_amount = $balance->opening_amount + $balance->total_sale_amount - $balance->total_change_amount;
                $balance->save();
            }

            foreach ($lines as $line) {
                $sale->items()->create(collect($line)->except('product')->all());
                $this->inventory->change($line['product'], -$line['base_quantity'], 'sale', $userId, $sale);
            }

            return $sale;
        });
    }
}
