<?php

namespace App\Http\Controllers\Purchases;

use App\Http\Controllers\Controller;
use App\Http\Requests\Purchase\StorePurchaseRequest;
use App\Models\Product;
use App\Models\ProductUnit;
use App\Models\Purchase;
use App\Models\Supplier;
use App\Services\Inventory\InventoryService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PurchaseController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Purchase::class);
        $request->validate([
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
        ]);

        $startDate = $request->date('start_date');
        $endDate = $request->date('end_date');
        $purchases = Purchase::with(['supplier', 'user'])
            ->when($startDate, fn ($query) => $query->whereDate('purchased_at', '>=', $startDate))
            ->when($endDate, fn ($query) => $query->whereDate('purchased_at', '<=', $endDate))
            ->latest('purchased_at')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('operations/Index', ['section' => 'purchases', 'title' => 'Purchases', 'description' => 'Record supplier orders and receive stock into the store.', 'purchases' => $purchases, 'filters' => $request->only(['start_date', 'end_date'])]);
    }

    public function create(): Response
    {
        $this->authorize('create', Purchase::class);

        return Inertia::render('operations/Index', ['section' => 'purchases', 'title' => 'Create purchase', 'description' => 'Record supplier orders and receive stock into the store.', 'suppliers' => Supplier::where('active', true)->get(['id', 'name']), 'products' => Product::with('units.stock')->where('active', true)->get()]);
    }

    public function store(StorePurchaseRequest $request, InventoryService $inventory): RedirectResponse
    {
        $this->authorize('create', Purchase::class);
        $data = $request->validated();
        $userId = $request->user()->id;
        $purchase = DB::transaction(function () use ($data, $inventory, $userId): Purchase {
            $total = collect($data['items'])->sum(fn ($item) => $item['quantity'] * $item['unit_cost']);
            $purchase = Purchase::create(['supplier_id' => $data['supplier_id'] ?? null, 'user_id' => $userId, 'invoice_number' => $data['invoice_number'], 'purchased_at' => $data['purchased_at'], 'subtotal' => $total, 'total' => $total, 'notes' => $data['notes'] ?? null]);
            foreach ($data['items'] as $item) {
                $unit = ProductUnit::whereKey($item['product_unit_id'])->where('product_id', $item['product_id'])->firstOrFail();
                $baseQuantity = $item['quantity'] * $unit->conversion;
                $purchase->items()->create([...$item, 'base_quantity' => $baseQuantity]);
                $inventory->change($unit, $baseQuantity, 'purchase', $userId, $purchase);
            }

            return $purchase;
        });

        return to_route('purchases.show', $purchase)->with('success', 'Purchase received and stock updated.');
    }

    public function show(Purchase $purchase): Response
    {
        $this->authorize('view', $purchase);

        return Inertia::render('operations/Index', ['section' => 'purchases', 'title' => 'Purchase '.$purchase->invoice_number, 'description' => 'Purchase details and received stock.', 'purchase' => $purchase->load(['supplier', 'user', 'items.product', 'items.unit'])]);
    }
}
