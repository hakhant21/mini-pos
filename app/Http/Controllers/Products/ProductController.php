<?php

namespace App\Http\Controllers\Products;

use App\Http\Controllers\Controller;
use App\Http\Requests\Products\StoreProductRequest;
use App\Http\Requests\Products\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Unit;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(): Response
    {
        $products = Product::query()
            ->with(['category', 'variants.unit'])
            ->withCount('variants')
            ->orderBy('name')
            ->get();

        return inertia('products/index', [
            'products' => ProductResource::collection($products),
        ]);
    }

    public function create(): Response
    {
        return inertia('products/create', [
            'categories' => Category::active()->orderBy('name')->get(['id', 'name']),
            'units' => Unit::orderBy('name')->get(['id', 'name', 'abbreviation']),
        ]);
    }

    public function store(StoreProductRequest $request): RedirectResponse
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('images/products', 'public');
        }

        $data['sku'] = $this->generateSku($data['name']);

        $variants = $data['variants'] ?? [];
        unset($data['variants']);

        $product = Product::create($data);

        foreach ($variants as $variant) {
            $variant['sku'] = $this->generateVariantSku($product->sku, $variant['name'] ?? '');
            $product->variants()->create($variant);
        }

        return redirect()->route('products.show', $product)
            ->with('success', 'Product created successfully.');
    }

    public function show(Product $product): Response
    {
        $product->load(['category', 'variants.unit']);

        return inertia('products/show', [
            'product' => new ProductResource($product),
        ]);
    }

    public function edit(Product $product): Response
    {
        $product->load('variants.unit');

        return inertia('products/edit', [
            'product' => new ProductResource($product),
            'categories' => Category::active()->orderBy('name')->get(['id', 'name']),
            'units' => Unit::orderBy('name')->get(['id', 'name', 'abbreviation']),
        ]);
    }

    public function update(UpdateProductRequest $request, Product $product): RedirectResponse
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }
            $data['image'] = $request->file('image')->store('images/products', 'public');
        } else {
            unset($data['image']);
        }

        $product->update($data);

        return redirect()->back()->with('success', 'Product updated successfully.');
    }

    public function destroy(Product $product): RedirectResponse
    {
        $product->delete();

        return redirect()->back()->with('success', 'Product deleted successfully.');
    }

    public function restore(int $id): RedirectResponse
    {
        $product = Product::withTrashed()->findOrFail($id);
        $product->restore();

        return redirect()->back()->with('success', 'Product restored successfully.');
    }

    public function toggleActive(Product $product): RedirectResponse
    {
        $product->update(['is_active' => !$product->is_active]);

        return redirect()->back()->with('success', 'Product status updated successfully.');
    }

    private function generateSku(string $name): string
    {
        $prefix = strtoupper(substr(preg_replace('/[^A-Za-z]/', '', $name), 0, 3));
        $number = Product::count() + 1;

        return sprintf('%s-%04d', $prefix, $number);
    }

    private function generateVariantSku(string $productSku, string $variantName): string
    {
        $suffix = strtoupper(substr(preg_replace('/[^A-Za-z]/', '', $variantName), 0, 2));
        $variantCount = ProductVariant::where('sku', 'like', $productSku . '-%')->count();

        return sprintf('%s-%s%02d', $productSku, $suffix ?: 'VN', $variantCount + 1);
    }
}
