<?php

namespace App\Http\Controllers\Products;

use App\Http\Controllers\Controller;
use App\Http\Requests\Product\QuickUpdateProductRequest;
use App\Http\Requests\Product\StoreProductRequest;
use App\Http\Requests\Product\UpdateProductRequest;
use App\Models\Category;
use App\Models\Product;
use App\Services\Inventory\InventoryService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Product::class);
        $search = $request->string('search')->trim()->value();
        $products = Product::with(['category', 'units', 'stock'])->when($search, fn ($query) => $query->where(fn ($query) => $query->where('name', 'like', "%{$search}%")->orWhere('sku', 'like', "%{$search}%")->orWhere('barcode', 'like', "%{$search}%")))->latest()->paginate(20)->withQueryString();

        return Inertia::render('products/Index', ['products' => $products, 'categories' => Category::query()->where('active', true)->orderBy('name')->get(['id', 'name']), 'filters' => $request->only('search')]);
    }

    public function create(): Response
    {
        $this->authorize('create', Product::class);

        return Inertia::render('products/Create', ['categories' => Category::query()->where('active', true)->orderBy('name')->get(['id', 'name'])]);
    }

    public function store(StoreProductRequest $request): RedirectResponse
    {
        $this->authorize('create', Product::class);
        $data = $request->validated();
        $imagePath = $request->file('image')?->store('products', 'public');
        unset($data['image']);

        DB::transaction(function () use ($data, $imagePath): void {
            if ($imagePath) {
                $data['image'] = $imagePath;
            }

            $product = Product::create(collect($data)->except('units')->all());
            $product->units()->createMany($data['units']);
            $product->stock()->create(['quantity_base' => 0]);
        });

        return to_route('products.index')->with('success', 'Product created.');
    }

    public function show(Product $product): Response
    {
        $this->authorize('view', $product);

        return Inertia::render('products/Show', ['product' => $product->load(['category', 'units', 'stock'])]);
    }

    public function edit(Product $product): Response
    {
        $this->authorize('update', $product);

        $product->load('units');
        $product->setAttribute('image_url', $product->image ? Storage::disk('public')->url($product->image) : null);

        return Inertia::render('products/Edit', ['product' => $product, 'categories' => Category::query()->where('active', true)->orderBy('name')->get(['id', 'name'])]);
    }

    public function update(UpdateProductRequest $request, Product $product): RedirectResponse
    {
        $this->authorize('update', $product);
        $data = $request->validated();
        $imagePath = $request->file('image')?->store('products', 'public');
        unset($data['image']);

        DB::transaction(function () use ($data, $imagePath, $product): void {
            $oldImage = $product->image;
            if ($imagePath) {
                $data['image'] = $imagePath;
            }

            $product->update(collect($data)->except('units')->all());
            $product->units()->delete();
            $product->units()->createMany($data['units']);

            if ($imagePath && $oldImage) {
                Storage::disk('public')->delete($oldImage);
            }
        });

        return to_route('products.index')->with('success', 'Product updated.');
    }

    public function quickUpdate(QuickUpdateProductRequest $request, Product $product, InventoryService $inventory): RedirectResponse
    {
        $this->authorize('update', $product);
        $data = $request->validated();

        DB::transaction(function () use ($data, $inventory, $product, $request): void {
            $stockUnit = $product->units()->whereKey($data['stock_unit_id'])->firstOrFail();
            $stock = $product->stock()->lockForUpdate()->firstOrCreate([], ['quantity_base' => 0]);
            $desiredStock = ($data['package_quantity'] * $stockUnit->conversion) + $data['loose_quantity'];
            $change = $desiredStock - $stock->quantity_base;

            if ($change !== 0) {
                $inventory->change($product, $change, 'adjustment', $request->user()->id, null, 'Quick product update');
            }

            foreach ($data['unit_prices'] as $unitPrice) {
                $product->units()->whereKey($unitPrice['id'])->update(['selling_price' => $unitPrice['selling_price']]);
            }
        });

        return to_route('products.index')->with('success', 'Product stock and prices updated.');
    }

    public function destroy(Product $product): RedirectResponse
    {
        $this->authorize('delete', $product);
        $product->update(['active' => false]);

        return to_route('products.index')->with('success', 'Product archived.');
    }
}
