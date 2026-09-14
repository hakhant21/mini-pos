<?php

namespace App\Http\Controllers\StockAdjustments;

use App\Http\Controllers\Controller;
use App\Http\Requests\StockAdjustment\StoreStockAdjustmentRequest;
use App\Models\Product;
use App\Models\StockAdjustment;
use App\Services\Inventory\InventoryService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class StockAdjustmentController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', StockAdjustment::class);

        return Inertia::render('operations/Index', ['section' => 'adjustments', 'title' => 'Stock adjustments', 'description' => 'Record damaged, expired, missing or counted stock.', 'adjustments' => StockAdjustment::with(['product', 'user'])->latest('adjusted_at')->paginate(20)]);
    }

    public function create(): Response
    {
        $this->authorize('create', StockAdjustment::class);

        return Inertia::render('operations/Index', ['section' => 'adjustments', 'title' => 'Create adjustment', 'description' => 'Record damaged, expired, missing or counted stock.', 'products' => Product::with('units')->where('active', true)->get()]);
    }

    public function store(StoreStockAdjustmentRequest $request, InventoryService $inventory): RedirectResponse
    {
        $this->authorize('create', StockAdjustment::class);
        $data = $request->validated();
        $userId = $request->user()->id;
        DB::transaction(function () use ($data, $inventory, $userId): void {
            $product = Product::query()->lockForUpdate()->findOrFail($data['product_id']);
            $change = $data['quantity'] * $data['unit_conversion'];
            if ($data['adjustment_type'] === 'decrease') {
                $change *= -1;
            }
            if ($data['adjustment_type'] === 'count') {
                $currentQuantity = $product->stock()->lockForUpdate()->value('quantity_base') ?? 0;
                $change -= $currentQuantity;
            }
            $adjustment = StockAdjustment::create([...$data, 'quantity_base' => abs($change), 'user_id' => $userId, 'adjusted_at' => now()]);
            $inventory->change($product, $change, 'adjustment', $userId, $adjustment, $data['reason']);
        });

        return to_route('adjustments.index')->with('success', 'Stock adjusted.');
    }

    public function show(StockAdjustment $adjustment): Response
    {
        $this->authorize('view', $adjustment);

        return Inertia::render('operations/Index', ['section' => 'adjustments', 'title' => 'Stock adjustment', 'description' => 'Adjustment details.', 'adjustment' => $adjustment->load(['product', 'user'])]);
    }
}
