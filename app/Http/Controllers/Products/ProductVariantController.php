<?php

namespace App\Http\Controllers\Products;

use App\Http\Controllers\Controller;
use App\Http\Requests\Products\StoreProductVariantRequest;
use App\Http\Requests\Products\UpdateProductVariantRequest;
use App\Http\Requests\Products\UpdateStockPriceRequest;
use App\Models\StockHistory;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Traits\HasImage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductVariantController extends Controller
{
    use HasImage;

    public function store(StoreProductVariantRequest $request, Product $product): RedirectResponse
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            $data['image'] = $this->uploadImage('images/variants', $request->file('image'));
        }

        $data['sku'] = $this->generateVariantSku($product->sku, $data['name'] ?? '');

        $product->variants()->create($data);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Variant added successfully.']);

        return redirect()->back();
    }

    public function update(UpdateProductVariantRequest $request, Product $product, ProductVariant $variant): RedirectResponse
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            if ($variant->image) {
                $this->deleteImage($variant->image);
            }

            $data['image'] = $this->uploadImage('images/variants', $request->file('image'));
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
        $previousStock = (float) $variant->stock_quantity;
        $newStock = (float) ($data['stock_quantity'] ?? $previousStock);

        $variant->update($data);

        if ($newStock !== $previousStock) {
            $quantity = $newStock - $previousStock;
            StockHistory::create([
                'product_variant_id' => $variant->id,
                'user_id' => $request->user()->id,
                'quantity' => $quantity,
                'previous_stock' => $previousStock,
                'new_stock' => $newStock,
                'cost_price' => $variant->cost_price,
                'selling_price' => $variant->selling_price,
                'total_amount' => $quantity * (float) $variant->cost_price,
                'notes' => 'Stock & price update',
            ]);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Stock & price updated successfully.']);

        return redirect()->back();
    }

    private function generateVariantSku(string $productSku, string $variantName): string
    {
        $suffix = strtoupper(substr(preg_replace('/[^A-Za-z]/', '', $variantName), 0, 2));
        $variantCount = ProductVariant::where('sku', 'like', $productSku.'-%')->count();

        return sprintf('%s-%s%02d', $productSku, $suffix ?: 'VN', $variantCount + 1);
    }
}
