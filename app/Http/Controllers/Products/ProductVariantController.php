<?php

namespace App\Http\Controllers\Products;

use App\Http\Controllers\Controller;
use App\Http\Requests\Products\StoreProductVariantRequest;
use App\Http\Requests\Products\UpdateProductVariantRequest;
use App\Http\Requests\Products\UpdateStockPriceRequest;
use App\Http\Resources\ProductVariantResource;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class ProductVariantController extends Controller
{
    public function store(StoreProductVariantRequest $request, Product $product): RedirectResponse
    {
        $data = $request->validated();
        $data['sku'] = $this->generateVariantSku($product->sku, $data['name'] ?? '');

        if (empty($data['per_unit_price']) && $data['units_per_package'] > 0) {
            $data['per_unit_price'] = $data['cost_price'] / $data['units_per_package'];
        }

        $product->variants()->create($data);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Variant added successfully.']);

        return redirect()->back();
    }

    public function update(UpdateProductVariantRequest $request, Product $product, ProductVariant $variant): RedirectResponse
    {
        $data = $request->validated();

        if (empty($data['per_unit_price']) && $data['units_per_package'] > 0) {
            $data['per_unit_price'] = $data['cost_price'] / $data['units_per_package'];
        }

        $variant->update($data);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Variant updated successfully.']);

        return redirect()->back();
    }

    public function destroy(Product $product, ProductVariant $variant): RedirectResponse
    {
        $variant->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Variant deleted successfully.']);

        return redirect()->back();
    }

    public function updateStockPrice(UpdateStockPriceRequest $request, Product $product, ProductVariant $variant): RedirectResponse
    {
        $data = $request->validated();

        if (empty($data['per_unit_price']) && $variant->units_per_package > 0) {
            $data['per_unit_price'] = $data['cost_price'] / $variant->units_per_package;
        }

        $variant->update($data);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Stock & price updated successfully.']);

        return redirect()->back();
    }

    private function generateVariantSku(string $productSku, string $variantName): string
    {
        $suffix = strtoupper(substr(preg_replace('/[^A-Za-z]/', '', $variantName), 0, 2));
        $variantCount = ProductVariant::where('sku', 'like', $productSku . '-%')->count();

        return sprintf('%s-%s%02d', $productSku, $suffix ?: 'VN', $variantCount + 1);
    }
}
