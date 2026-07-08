<?php

namespace App\Services;

use App\Models\Product;
use App\Models\ProductVariant;

class DashboardService
{
    public function getStats(): array
    {
        $variants = ProductVariant::all();

        return [
            'total_products' => Product::count(),
            'total_variants' => $variants->count(),
            'total_stock' => $variants->sum('stock_quantity'),
            'inventory_value' => round(
                $variants->sum(fn ($v) => $v->stock_quantity * $v->cost_price),
                2
            ),
        ];
    }

    public function getLowStockVariants(int $limit = 5)
    {
        return ProductVariant::with(['product', 'unit'])
            ->where('stock_quantity', '>', 0)
            ->whereColumn('stock_quantity', '<=', 'min_stock_level')
            ->orderBy('stock_quantity')
            ->limit($limit)
            ->get();
    }
}
