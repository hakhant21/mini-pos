<?php

namespace App\Services;

use App\Models\ProductVariant;

class StockService
{
    public function addStock(ProductVariant $variant, float $quantity, float $costPrice): void
    {
        $variant->recalculateWeightedAverageCost($quantity, $costPrice);
        $variant->save();
    }

    public function getStockStatus(ProductVariant $variant): string
    {
        if ($variant->stock_quantity <= 0) {
            return 'out_of_stock';
        }

        if ($variant->stock_quantity <= $variant->min_stock_level) {
            return 'low_stock';
        }

        return 'in_stock';
    }
}
