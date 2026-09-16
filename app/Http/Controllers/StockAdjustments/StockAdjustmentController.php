<?php

namespace App\Http\Controllers\StockAdjustments;

use App\Http\Controllers\Controller;
use App\Http\Requests\StockAdjustment\StoreStockAdjustmentRequest;
use App\Models\Product;
use App\Models\ProductUnit;
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

        return Inertia::render('operations/Index', ['section' => 'adjustments', 'title' => 'Stock adjustments', 'description' => 'Record damaged, expired, missing or counted stock.', 'adjustments' => StockAdjustment::with(['product', 'user'])->latest('adjusted_at')->paginate(20), 'products' => Product::with(['category', 'units.stock'])->where('active', true)->orderBy('name')->get()]);
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
            $unit = ProductUnit::query()->where('product_id', $product->id)
                ->when($data['product_unit_id'] ?? null, fn ($query) => $query->whereKey($data['product_unit_id']))
                ->when(! ($data['product_unit_id'] ?? null), fn ($query) => $query->where('conversion', $data['unit_conversion']))
                ->firstOrFail();
            $data['product_unit_id'] = $unit->id;
            $data['unit_conversion'] = $unit->conversion;
            $change = $data['quantity'] * $unit->conversion;
            if ($data['adjustment_type'] === 'decrease') {
                $change *= -1;
            }
            if ($data['adjustment_type'] === 'count') {
                $currentQuantity = $unit->quantity_base;
                $change -= $currentQuantity;
            }
            $adjustment = StockAdjustment::create([...$data, 'quantity_base' => abs($change), 'user_id' => $userId, 'adjusted_at' => now()]);
            $inventory->change($unit, $change, 'adjustment', $userId, $adjustment, $data['reason']);
        });

        return to_route('adjustments.index')->with('success', 'Stock adjusted.');
    }

    public function show(StockAdjustment $adjustment): Response
    {
        $this->authorize('view', $adjustment);

        return Inertia::render('operations/Index', ['section' => 'adjustments', 'title' => 'Stock adjustment', 'description' => 'Adjustment details.', 'adjustment' => $adjustment->load(['product', 'unit', 'user'])]);
    }
}
