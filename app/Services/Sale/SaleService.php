<?php

namespace App\Services\Sale;

use App\Models\Balance;
use App\Models\Sale;
use App\Services\Inventory\InventoryService;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class SaleService
{
    public function __construct(private readonly InventoryService $inventory) {}

    public function cancel(Sale $sale, int $userId, string $reason): Sale
    {
        return DB::transaction(function () use ($sale, $userId, $reason): Sale {
            $sale = Sale::query()->lockForUpdate()->with('items.product')->findOrFail($sale->id);
            if ($sale->status === 'cancelled') {
                return $sale;
            }
            if ($sale->status !== 'completed') {
                throw new RuntimeException('Only completed sales can be cancelled.');
            }
            foreach ($sale->items as $item) {
                $this->inventory->change($item->product, $item->base_quantity, 'sale_cancellation', $userId, $sale, $reason);
            }
            $balance = Balance::query()
                ->where('user_id', $sale->user_id)
                ->whereDate('created_at', $sale->sold_at)
                ->latest('id')
                ->lockForUpdate()
                ->first();

            if ($balance) {
                $balance->total_sale_amount -= $sale->total;
                $balance->total_change_amount -= $sale->change_amount;
                $balance->closing_amount = $balance->opening_amount + $balance->total_sale_amount - $balance->total_change_amount;
                $balance->save();
            }

            $sale->update(['status' => 'cancelled', 'cancelled_at' => now(), 'cancellation_reason' => $reason]);

            return $sale;
        });
    }
}
