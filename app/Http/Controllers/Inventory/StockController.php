<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Http\Requests\Inventory\StoreStockRequest;
use App\Http\Resources\ProductVariantResource;
use App\Models\Product;
use App\Models\ProductVariant;
use Inertia\Response;

class StockController extends Controller
{
    public function index(): Response
    {
        $lowStockVariants = ProductVariant::with(['product.category', 'unit'])
            ->where('stock_quantity', '>', 0)
            ->whereColumn('stock_quantity', '<=', 'min_stock_level')
            ->orderBy('stock_quantity')
            ->get();

        $outOfStockVariants = ProductVariant::with(['product.category', 'unit'])
            ->where('stock_quantity', '<=', 0)
            ->orderBy('product_id')
            ->get();

        return inertia('inventory/index', [
            'lowStockVariants' => ProductVariantResource::collection($lowStockVariants)->resolve(request()),
            'outOfStockVariants' => ProductVariantResource::collection($outOfStockVariants)->resolve(request()),
        ]);
    }

    public function create(): Response
    {
        return inertia('inventory/create');
    }

    public function store(StoreStockRequest $request): \Illuminate\Http\RedirectResponse
    {
        $variant = ProductVariant::findOrFail($request->variant_id);
        $variant->recalculateWeightedAverageCost($request->quantity, $request->cost_price);
        $variant->save();

        return redirect()->route('inventory.index')
            ->with('success', 'Stock added successfully.');
    }

    public function searchProducts(): \Illuminate\Http\JsonResponse
    {
        $search = request('search');

        $products = Product::with(['variants.unit'])
            ->where('is_active', true)
            ->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%");
            })
            ->get();

        return response()->json($products);
    }
}
