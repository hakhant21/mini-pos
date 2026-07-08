<?php

namespace App\Services;

use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Support\Str;

class SkuService
{
    public function generateProductSku(string $productName, ?string $brand = null): string
    {
        $prefix = $brand
            ? strtoupper(Str::substr($brand, 0, 3))
            : strtoupper(Str::substr($productName, 0, 3));

        $random = strtoupper(Str::random(5));

        return "{$prefix}-{$random}";
    }

    public function generateVariantSku(Product $product, string $variantName): string
    {
        $productPrefix = Str::substr(preg_replace('/[^A-Za-z0-9]/', '', $product->sku), 0, 4);
        $variantCode = strtoupper(Str::substr(preg_replace('/[^A-Za-z0-9]/', '', $variantName), 0, 3));
        $random = strtoupper(Str::random(3));

        return "{$productPrefix}-{$variantCode}-{$random}";
    }
}
