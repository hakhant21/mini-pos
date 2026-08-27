<?php

namespace App\Http\Controllers\Products;

use App\Http\Controllers\Controller;
use App\Models\StockHistory;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StockHistoryController extends Controller
{
    public function index(Request $request, Product $product, ProductVariant $variant): Response
    {
        $histories = StockHistory::query()
            ->where('product_variant_id', $variant->id)
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('products/instock-history', [
            'product' => $product,
            'variant' => $variant,
            'histories' => $histories,
        ]);
    }

    public function store(Request $request, Product $product, ProductVariant $variant): RedirectResponse
    {
        $data = $request->validate([
            'quantity' => ['required', 'numeric'],
            'notes' => ['nullable', 'string'],
        ]);

        $previousStock = (float) $variant->stock_quantity;
        $quantity = (float) $data['quantity'];
        $newStock = $previousStock + $quantity;

        $variant->update(['stock_quantity' => $newStock]);

        StockHistory::create([
            'product_variant_id' => $variant->id,
            'user_id' => $request->user()->id,
            'quantity' => $quantity,
            'previous_stock' => $previousStock,
            'new_stock' => $newStock,
            'cost_price' => $variant->cost_price,
            'selling_price' => $variant->selling_price,
            'total_amount' => $quantity * (float) $variant->cost_price,
            'notes' => $data['notes'] ?? null,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Stock updated successfully.']);

        return redirect()->back();
    }
}
