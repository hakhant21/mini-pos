<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductVariantResource;
use App\Models\Product;
use App\Models\ProductVariant;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $totalStock = ProductVariant::sum('stock_quantity');
        $totalProducts = Product::count();
        $totalVariants = ProductVariant::count();

        $inventoryValue = round(
            ProductVariant::all()->sum(fn ($v) => $v->stock_quantity * $v->cost_price),
            2
        );

        $lowStockVariants = ProductVariant::with(['product', 'unit'])
            ->where('stock_quantity', '>', 0)
            ->whereColumn('stock_quantity', '<=', 'min_stock_level')
            ->orderBy('stock_quantity')
            ->limit(5)
            ->get();

        return inertia('dashboard', [
            'totalStock' => $totalStock,
            'totalProducts' => $totalProducts,
            'totalVariants' => $totalVariants,
            'inventoryValue' => $inventoryValue,
            'lowStockVariants' => ProductVariantResource::collection($lowStockVariants),
        ]);
    }
}
