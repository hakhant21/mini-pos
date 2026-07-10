<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductVariantResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'unit_id' => $this->unit_id,
            'name' => $this->name,
            'image' => $this->image,
            'image_url' => $this->image_url,
            'sku' => $this->sku,
            'units_per_package' => $this->units_per_package,
            'cost_price' => $this->cost_price,
            'selling_price' => $this->selling_price,
            'per_unit_price' => $this->per_unit_price,
            'stock_quantity' => $this->stock_quantity,
            'min_stock_level' => $this->min_stock_level,
            'max_stock_level' => $this->max_stock_level,
            'is_active' => $this->is_active,
            'stock_status' => $this->stock_status,
            'product' => new ProductResource($this->whenLoaded('product')),
            'unit' => $this->whenLoaded('unit') ? new UnitResource($this->unit) : null,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
