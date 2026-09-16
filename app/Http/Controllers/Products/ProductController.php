<?php

namespace App\Http\Controllers\Products;

use App\Http\Controllers\Controller;
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
        $categoryId = $request->integer('category_id');
        $products = Product::with(['category', 'units.stock'])
            ->when($search, fn ($query) => $query->where(fn ($query) => $query->where('name', 'like', "%{$search}%")->orWhere('sku', 'like', "%{$search}%")->orWhere('barcode', 'like', "%{$search}%")))
            ->when($categoryId > 0, fn ($query) => $query->where('category_id', $categoryId))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('products/Index', ['products' => $products, 'categories' => Category::query()->where('active', true)->orderBy('name')->get(['id', 'name']), 'filters' => $request->only(['search', 'category_id'])]);
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
            foreach ($data['units'] as $unitData) {
                $unit = $product->units()->create([...$unitData, 'quantity_base' => ($unitData['package_quantity'] * $unitData['conversion']) + $unitData['loose_quantity']]);
                $unit->stock()->create(['product_id' => $product->id]);
            }
        });

        return to_route('products.index')->with('success', 'Product created.');
    }

    public function show(Product $product): Response
    {
        $this->authorize('view', $product);

        return Inertia::render('products/Show', ['product' => $product->load(['category', 'units.stock'])]);
    }

    public function edit(Product $product): Response
    {
        $this->authorize('update', $product);

        $product->load('units');
        $product->setAttribute('image_url', $product->image ? Storage::disk('public')->url($product->image) : null);

        return Inertia::render('products/Edit', ['product' => $product, 'categories' => Category::query()->where('active', true)->orderBy('name')->get(['id', 'name'])]);
    }

    public function update(UpdateProductRequest $request, Product $product, InventoryService $inventory): RedirectResponse
    {
        $this->authorize('update', $product);
        $data = $request->validated();
        $imagePath = $request->file('image')?->store('products', 'public');
        unset($data['image']);

        DB::transaction(function () use ($data, $imagePath, $product, $inventory, $request): void {
            $oldImage = $product->image;
            if ($imagePath) {
                $data['image'] = $imagePath;
            }

            $product->update(collect($data)->except('units')->all());
            $submittedUnitIds = collect($data['units'])->pluck('id')->filter()->all();
            $product->units()->whereNotIn('id', $submittedUnitIds)->delete();
            foreach ($data['units'] as $unitData) {
                $unit = $product->units()->updateOrCreate(['id' => $unitData['id'] ?? null], collect($unitData)->except(['id', 'package_quantity', 'loose_quantity'])->all());
                $unit->stock()->firstOrCreate(['product_id' => $product->id]);
                $inventory->set($unit, $unitData['package_quantity'], $unitData['loose_quantity'], $request->user()->id, 'Product update');
            }

            if ($imagePath && $oldImage) {
                Storage::disk('public')->delete($oldImage);
            }
        });

        return to_route('products.index')->with('success', 'Product updated.');
    }

    public function destroy(Product $product): RedirectResponse
    {
        $this->authorize('delete', $product);
        $product->update(['active' => false]);

        return to_route('products.index')->with('success', 'Product archived.');
    }
}
