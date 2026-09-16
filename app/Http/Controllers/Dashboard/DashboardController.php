<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Balance;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\Sale;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $lowStock = Product::query()->with('units')->where('active', true)->get()->filter(fn (Product $product): bool => $product->units->sum('quantity_base') < $product->reorder_level)->take(5);
        $recentSales = Sale::query()->where('status', 'completed')->latest('sold_at')->limit(8)->get();
        $balance = Balance::query()
            ->where('user_id', $request->user()->id)
            ->whereDate('created_at', today())
            ->latest('id')
            ->first();

        return Inertia::render('dashboards/Index', [
            'stats' => [
                ['label' => 'Total products', 'value' => (string) Product::where('active', true)->count(), 'change' => 'Active catalog', 'tone' => 'blue'],
                ['label' => 'Low stock items', 'value' => (string) $lowStock->count(), 'change' => 'Needs attention', 'tone' => 'amber'],
                ['label' => "Today's sales", 'value' => number_format(Sale::where('status', 'completed')->whereDate('sold_at', today())->sum('total')).' MMK', 'change' => 'Completed transactions', 'tone' => 'green'],
                ['label' => "Today's purchases", 'value' => number_format(Purchase::whereDate('purchased_at', today())->sum('total')).' MMK', 'change' => 'Received inventory', 'tone' => 'purple'],
            ],
            'currentDate' => now()->format('l, F j, Y'),
            'userName' => $request->user()->name,
            'balance' => $balance?->only(['opening_amount', 'closing_amount', 'total_sale_amount', 'total_change_amount']),
            'sales' => [],
            'lowStock' => $lowStock->map(fn (Product $product): array => ['name' => $product->name, 'sku' => $product->sku, 'stock' => $product->units->sum('quantity_base').' '.$product->base_unit, 'level' => $product->units->sum('quantity_base') <= 5 ? 'Critical' : 'Low'])->values(),
            'recentSales' => $recentSales->map(fn (Sale $sale): array => ['invoice' => $sale->invoice_number, 'customer' => 'Walk-in customer', 'amount' => number_format($sale->total).' MMK', 'time' => $sale->sold_at->diffForHumans(), 'status' => 'Paid'])->values(),
        ]);
    }
}
