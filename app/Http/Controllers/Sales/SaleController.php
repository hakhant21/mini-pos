<?php

namespace App\Http\Controllers\Sales;

use App\Http\Controllers\Controller;
use App\Http\Requests\Checkout\CompleteCheckoutRequest;
use App\Http\Requests\Sale\AppendSaleItemsRequest;
use App\Http\Requests\Sale\CancelSaleRequest;
use App\Models\Category;
use App\Models\Product;
use App\Models\Sale;
use App\Services\Checkout\CheckoutService;
use App\Services\Sale\SaleService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SaleController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', Sale::class);

        return Inertia::render('operations/Index', [
            'section' => 'sales',
            'title' => 'Sales history',
            'description' => 'Review completed sales, receipts and payment methods.',
            'sales' => Sale::with('user')->latest('sold_at')->paginate(20),
        ]);
    }

    public function create(Request $request): Response
    {
        $this->authorize('create', Sale::class);

        $products = Inertia::scroll(fn () => Product::with(['category', 'units.stock'])
            ->where('active', true)
            ->orderBy('category_id')
            ->orderBy('id')
            ->paginate(20)
            ->through(fn (Product $product): array => [
                ...$product->toArray(),
                'price' => $product->units->first()?->single_unit_price ?? 0,
                'icon' => '📦',
            ]));

        $sale = $request->filled('sale_id') ? Sale::query()->findOrFail($request->integer('sale_id')) : null;

        if ($sale) {
            $this->authorize('view', $sale);
        }

        return Inertia::render('checkouts/Index', [
            'products' => $products,
            'categories' => Category::query()->orderBy('id')->pluck('name')->values(),
            'sale' => $sale?->only(['id', 'invoice_number', 'payment_method', 'total']),
        ]);
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

        return Inertia::render('operations/Index', [
            'section' => 'sales',
            'title' => 'Sale '.$sale->invoice_number,
            'description' => 'Receipt and payment details.',
            'sale' => $sale->load(['user', 'items.product', 'items.unit']),
        ]);
    }

    public function appendItems(AppendSaleItemsRequest $request, Sale $sale, CheckoutService $checkout): RedirectResponse
    {
        $this->authorize('view', $sale);
        $checkout->append($sale, $request->validated(), $request->user()->id);

        return to_route('sales.show', $sale)->with('success', 'Items added to sale.');
    }

    public function receipt(Sale $sale): Response
    {
        $this->authorize('view', $sale);

        return Inertia::render('sales/Receipt', [
            'sale' => $sale->load([
                'user',
                'items.product',
                'items.unit',
            ]),
        ]);
    }

    public function cancel(CancelSaleRequest $request, Sale $sale, SaleService $sales): RedirectResponse
    {
        $this->authorize('cancel', $sale);
        $sales->cancel($sale, $request->user()->id, $request->string('reason')->toString());

        return to_route('sales.show', $sale)->with('success', 'Sale cancelled and stock restored.');
    }
}
