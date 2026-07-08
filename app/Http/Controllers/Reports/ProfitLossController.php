<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductVariant;
use Inertia\Response;

class ProfitLossController extends Controller
{
    public function index(): Response
    {
        $variants = ProductVariant::with(['product.category', 'unit'])
            ->orderBy('product_id')
            ->get()
            ->groupBy(fn ($v) => $v->product->name);

        $productData = $variants->map(function ($variants, $productName) {
            $product = $variants->first()->product;
            $totalStock = $variants->sum('stock_quantity');
            $totalValue = $variants->sum(fn ($v) => $v->stock_quantity * $v->cost_price);

            return [
                'product_name' => $productName,
                'category' => $product->category->name,
                'total_stock' => $totalStock,
                'total_value' => round($totalValue, 2),
                'variants' => $variants->map(fn ($v) => [
                    'id' => $v->id,
                    'sku' => $v->sku,
                    'unit' => $v->unit->abbreviation,
                    'stock_quantity' => $v->stock_quantity,
                    'cost_price' => $v->cost_price,
                    'selling_price' => $v->selling_price,
                    'stock_value' => round($v->stock_quantity * $v->cost_price, 2),
                ]),
            ];
        })->values();

        $totalSummary = [
            'total_products' => Product::count(),
            'total_variants' => ProductVariant::count(),
            'total_stock' => ProductVariant::sum('stock_quantity'),
            'total_inventory_value' => round(
                ProductVariant::all()->sum(fn ($v) => $v->stock_quantity * $v->cost_price),
                2
            ),
        ];

        return inertia('reports/profit-loss', [
            'products' => $productData,
            'summary' => $totalSummary,
        ]);
    }
}
