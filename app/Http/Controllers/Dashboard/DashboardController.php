<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Http\Resources\ProductVariantResource;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Sale;
use App\Models\SaleItem;
use Illuminate\Support\Facades\DB;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $inventoryValue = round(
            ProductVariant::all()->sum(fn($v) => $v->stock_quantity * $v->cost_price),
            2
        );

        $lowStockVariants = ProductVariant::with(['product', 'unit'])
            ->where('stock_quantity', '>', 0)
            ->whereColumn('stock_quantity', '<=', 'min_stock_level')
            ->orderBy('stock_quantity')
            ->limit(10)
            ->get();

        // Calculate Profit/Loss from Sales
        $totalRevenue = Sale::sum('total_amount');
        $totalCost = SaleItem::sum('cost_price');
        $totalProfit = round($totalRevenue - $totalCost, 2);

        // Total sales count
        $totalSales = Sale::whereDate('created_at', today())->sum('total_amount');

        $recentSales = Sale::with('items')
            ->whereDate('created_at', today())
            ->orderBy('created_at', 'desc')
            ->get();

        // Most sold products with variants
        $mostSoldProductIds = SaleItem::select('product_variants.product_id', DB::raw('SUM(sale_items.quantity) as total_qty'))
            ->join('product_variants', 'sale_items.product_variant_id', '=', 'product_variants.id')
            ->groupBy('product_variants.product_id')
            ->orderByRaw('SUM(sale_items.quantity) desc')
            ->limit(10)
            ->pluck('product_variants.product_id');

        $mostSoldProducts = Product::with(['variants.unit', 'category'])
            ->whereIn('id', $mostSoldProductIds)
            ->get()
            ->map(function ($product) {
                $totalSold = SaleItem::whereHas('variant', function ($q) use ($product) {
                    $q->where('product_id', $product->id);
                })->sum('quantity');
                $product->total_sold = $totalSold;
                return $product;
            })
            ->sortByDesc('total_sold')
            ->values();

        return inertia('dashboard', [
            'inventoryValue' => $inventoryValue,
            'lowStockVariants' => ProductVariantResource::collection($lowStockVariants),
            'totalRevenue' => $totalRevenue,
            'totalCost' => $totalCost,
            'totalProfit' => $totalProfit,
            'totalSales' => $totalSales,
            'recentSales' => $recentSales,
            'mostSoldProducts' => ProductResource::collection($mostSoldProducts),
        ]);
    }
}
