<?php

namespace App\Http\Controllers\Sales;

use App\Http\Controllers\Controller;
use App\Http\Requests\Checkout\CompleteCheckoutRequest;
use App\Http\Requests\Sale\CancelSaleRequest;
use App\Models\Product;
use App\Models\Sale;
use App\Services\Checkout\CheckoutService;
use App\Services\Sale\SaleService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SaleController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', Sale::class);

        return Inertia::render('operations/Index', ['section' => 'sales', 'title' => 'Sales history', 'description' => 'Review completed sales, receipts and payment methods.', 'sales' => Sale::with('user')->latest('sold_at')->paginate(20)]);
    }

    public function create(): Response
    {
        $this->authorize('create', Sale::class);

        $products = Product::with(['category', 'units', 'stock'])->where('active', true)->get()->map(fn (Product $product): array => [...$product->toArray(), 'price' => $product->units->first()?->selling_price ?? 0, 'icon' => '📦']);

        return Inertia::render('checkouts/Index', ['products' => $products]);
    }

    public function store(CompleteCheckoutRequest $request, CheckoutService $checkout): RedirectResponse
    {
        $this->authorize('create', Sale::class);
        $sale = $checkout->complete($request->validated(), $request->user()->id);

        return to_route('sales.show', $sale)->with('success', 'Sale completed.');
    }

    public function show(Sale $sale): Response
    {
        $this->authorize('view', $sale);

        return Inertia::render('operations/Index', ['section' => 'sales', 'title' => 'Sale '.$sale->invoice_number, 'description' => 'Receipt and payment details.', 'sale' => $sale->load(['user', 'items.product', 'items.unit'])]);
    }

    public function receipt(Sale $sale): Response
    {
        $this->authorize('view', $sale);

        return Inertia::render('sales/Receipt', ['sale' => $sale->load(['user', 'items.product', 'items.unit'])]);
    }

    public function cancel(CancelSaleRequest $request, Sale $sale, SaleService $sales): RedirectResponse
    {
        $this->authorize('cancel', $sale);
        $sales->cancel($sale, $request->user()->id, $request->string('reason')->toString());

        return to_route('sales.show', $sale)->with('success', 'Sale cancelled and stock restored.');
    }
}
