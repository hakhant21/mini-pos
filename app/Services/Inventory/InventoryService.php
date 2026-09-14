<?php

namespace App\Services\Inventory;

use App\Models\InventoryStock;
use App\Models\Product;
use App\Models\StockTransaction;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class InventoryService
{
    public function change(Product $product, int $quantity, string $type, int $userId, ?Model $reference = null, ?string $notes = null): InventoryStock
    {
        return DB::transaction(function () use ($product, $quantity, $type, $userId, $reference, $notes): InventoryStock {
            Product::query()->whereKey($product->id)->lockForUpdate()->firstOrFail();
            $stock = InventoryStock::query()->lockForUpdate()->firstOrCreate(['product_id' => $product->id]);
            $newQuantity = $stock->quantity_base + $quantity;
            if ($newQuantity < 0) {
                throw new RuntimeException("Insufficient stock for {$product->name}.");
            }
            $stock->update(['quantity_base' => $newQuantity]);
            $transaction = StockTransaction::create(['product_id' => $product->id, 'user_id' => $userId, 'type' => $type, 'quantity_base' => $quantity, 'notes' => $notes]);
            if ($reference) {
                $transaction->reference()->associate($reference);
                $transaction->save();
            }

            return $stock;
        });
    }
}
