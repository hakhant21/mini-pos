<?php

namespace App\Http\Controllers\Sales;

use App\Http\Controllers\Controller;
use App\Http\Requests\Sales\CheckoutRequest;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Sale;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Response;

class SaleController extends Controller
{
    public function index(): Response
    {
        $products = Product::with(['category', 'variants' => function ($q) {
            $q->where('is_active', true)->with('unit');
        }])
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return inertia('sales/index', [
            'products' => $products,
        ]);
    }

    public function checkout(CheckoutRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $userId = $request->user()->id;

        $sale = DB::transaction(function () use ($data, $userId) {
            $totalAmount = 0;
            $saleItems = [];

            foreach ($data['items'] as $item) {
                $variant = ProductVariant::lockForUpdate()->findOrFail($item['variant_id']);

                if ($variant->stock_quantity < $item['quantity']) {
                    throw ValidationException::withMessages([
                        'items' => "Insufficient stock for {$variant->product->name} ({$variant->name}). Available: {$variant->stock_quantity}",
                    ]);
                }

                $lineTotal = round($item['quantity'] * $variant->selling_price, 2);
                $totalAmount += $lineTotal;

                $saleItems[] = [
                    'product_variant_id' => $variant->id,
                    'product_name' => $variant->product->name,
                    'variant_name' => $variant->name,
                    'unit_name' => $variant->unit?->abbreviation,
                    'quantity' => $item['quantity'],
                    'unit_price' => $variant->selling_price,
                    'cost_price' => $variant->cost_price,
                    'total_price' => $lineTotal,
                ];

                $variant->decrement('stock_quantity', $item['quantity']);
            }

            $discount = $data['discount'] ?? 0;
            $tax = $data['tax'] ?? 0;
            $totalAmount = round($totalAmount - $discount + $tax, 2);

            $sale = Sale::create([
                'invoice_number' => Sale::generateInvoiceNumber(),
                'total_amount' => $totalAmount,
                'payment_method' => $data['payment_method'],
                'amount_paid' => $data['amount_paid'],
                'change' => round(max(0, $data['amount_paid'] - $totalAmount), 2),
                'discount' => $discount,
                'tax' => $tax,
                'notes' => $data['notes'] ?? null,
                'user_id' => $userId,
            ]);

            $sale->items()->createMany($saleItems);

            return $sale;
        });

        return redirect()->route('sales.index')
            ->with('success', "Sale {$sale->invoice_number} completed successfully.");
    }
}
