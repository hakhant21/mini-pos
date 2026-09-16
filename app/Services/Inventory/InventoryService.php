<?php

namespace App\Services\Inventory;

use App\Models\InventoryStock;
use App\Models\ProductUnit;
use App\Models\StockTransaction;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class InventoryService
{
    public function set(ProductUnit $unit, int $packageQuantity, int $looseQuantity, int $userId, ?string $notes = null): InventoryStock
    {
        return DB::transaction(function () use ($unit, $packageQuantity, $looseQuantity, $userId, $notes): InventoryStock {
            $unit = ProductUnit::query()->whereKey($unit->id)->where('product_id', $unit->product_id)->lockForUpdate()->firstOrFail();
            $quantity = ($packageQuantity * $unit->conversion) + $looseQuantity;
            $stock = InventoryStock::query()->lockForUpdate()->firstOrCreate(['product_id' => $unit->product_id, 'product_unit_id' => $unit->id]);
            $change = $quantity - $unit->quantity_base;
            $unit->update(['package_quantity' => $packageQuantity, 'loose_quantity' => $looseQuantity, 'quantity_base' => $quantity]);
            if ($change !== 0) {
                StockTransaction::create(['product_id' => $unit->product_id, 'product_unit_id' => $unit->id, 'user_id' => $userId, 'type' => 'adjustment', 'quantity_base' => $change, 'notes' => $notes]);
            }

            return $stock;
        });
    }

    public function change(ProductUnit $unit, int $quantity, string $type, int $userId, ?Model $reference = null, ?string $notes = null): InventoryStock
    {
        return DB::transaction(function () use ($unit, $quantity, $type, $userId, $reference, $notes): InventoryStock {
            $unit = ProductUnit::query()->whereKey($unit->id)->where('product_id', $unit->product_id)->lockForUpdate()->firstOrFail();
            $stock = InventoryStock::query()->lockForUpdate()->firstOrCreate(['product_id' => $unit->product_id, 'product_unit_id' => $unit->id]);
            $newQuantity = $unit->quantity_base + $quantity;
            if ($newQuantity < 0) {
                throw new RuntimeException("Insufficient stock for {$unit->product->name} ({$unit->name}).");
            }
            $unit->update(['package_quantity' => intdiv($newQuantity, $unit->conversion), 'loose_quantity' => $newQuantity % $unit->conversion, 'quantity_base' => $newQuantity]);
            $transaction = StockTransaction::create(['product_id' => $unit->product_id, 'product_unit_id' => $unit->id, 'user_id' => $userId, 'type' => $type, 'quantity_base' => $quantity, 'notes' => $notes]);
            if ($reference) {
                $transaction->reference()->associate($reference);
                $transaction->save();
            }

            return $stock;
        });
    }
}
