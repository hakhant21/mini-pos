<?php

namespace App\Http\Controllers\Products;

use App\Http\Controllers\Controller;
use App\Http\Requests\Products\StoreProductVariantRequest;
use App\Http\Requests\Products\UpdateProductVariantRequest;
use App\Http\Resources\ProductVariantResource;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\RedirectResponse;

class ProductVariantController extends Controller
{
    public function store(StoreProductVariantRequest $request, Product $product): RedirectResponse
    {
        $data = $request->validated();
        $data['sku'] = $this->generateVariantSku($product->sku, $data['name'] ?? '');

        $variant = $product->variants()->create($data);
        $variant->recalculatePerUnitPrice();
        $variant->save();

        return redirect()->back()->with('success', 'Variant added successfully.');
    }

    public function update(UpdateProductVariantRequest $request, Product $product, ProductVariant $variant): RedirectResponse
    {
        $variant->update($request->validated());
        $variant->recalculatePerUnitPrice();
        $variant->save();

        return redirect()->back()->with('success', 'Variant updated successfully.');
    }

    public function destroy(Product $product, ProductVariant $variant): RedirectResponse
    {
        $variant->delete();

        return redirect()->back()->with('success', 'Variant deleted successfully.');
    }

    private function generateVariantSku(string $productSku, string $variantName): string
    {
        $suffix = strtoupper(substr(preg_replace('/[^A-Za-z]/', '', $variantName), 0, 2));
        $variantCount = ProductVariant::where('sku', 'like', $productSku . '-%')->count();

        return sprintf('%s-%s%02d', $productSku, $suffix ?: 'VN', $variantCount + 1);
    }
}
