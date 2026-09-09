<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Http\Resources\ProductVariantResource;
use App\Models\Balance;
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
        $todayStart = today()->startOfDay();
        $todayEnd = today()->endOfDay();

        $lowStockVariants = ProductVariant::with(['product', 'unit'])
            ->where('stock_quantity', '>', 0)
            ->whereColumn('stock_quantity', '<=', 'min_stock_level')
            ->orderBy('stock_quantity')
            ->limit(10)
            ->get();

        // Calculate Profit/Loss from Sales
        $totalRevenue = Sale::sum('total_amount') ?? 0;

        $totalCost = SaleItem::select(
            DB::raw('SUM(product_variants.cost_price * sale_items.quantity) as total_cost')
        )
            ->join('product_variants', 'sale_items.product_variant_id', '=', 'product_variants.id')
            ->value('total_cost') ?? 0;
        $totalProfit =  $totalRevenue - $totalCost;

        // Total sales count
        $totalSales = Sale::whereBetween('created_at', [$todayStart, $todayEnd])->sum('total_amount');

        $recentSales = Sale::with('items')
            ->whereBetween('created_at', [$todayStart, $todayEnd])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        // Most sold products with variants
        $mostSoldProductsById = SaleItem::select('product_variants.product_id', DB::raw('SUM(sale_items.quantity) as total_qty'))
            ->join('product_variants', 'sale_items.product_variant_id', '=', 'product_variants.id')
            ->groupBy('product_variants.product_id')
            ->orderByRaw('SUM(sale_items.quantity) desc')
            ->limit(10)
            ->get()
            ->keyBy('product_id');

        $mostSoldProducts = Product::with(['variants.unit', 'category'])
            ->whereIn('id', $mostSoldProductsById->keys())
            ->get()
            ->each(function ($product) use ($mostSoldProductsById) {
                $product->total_sold = $mostSoldProductsById[$product->id]->total_qty;
            })
            ->sortByDesc('total_sold')
            ->values();

        $hasBalanceToday = Balance::whereBetween('created_at', [$todayStart, $todayEnd])->exists();

        $openingAmount = Balance::whereBetween('created_at', [$todayStart, $todayEnd])->sum('opening_amount');

        $totalChange = Sale::whereBetween('created_at', [$todayStart, $todayEnd])->sum('change');

        return inertia('dashboard', [
            'lowStockVariants' => ProductVariantResource::collection($lowStockVariants),
            'totalRevenue' => $totalRevenue,
            'totalCost' => $totalCost,
            'totalProfit' => $totalProfit,
            'totalSales' => $totalSales,
            'recentSales' => $recentSales,
            'mostSoldProducts' => ProductResource::collection($mostSoldProducts),
            'hasBalanceToday' => $hasBalanceToday,
            'openingAmount' => $openingAmount,
            'totalChange' => $totalChange,
        ]);
    }
}
