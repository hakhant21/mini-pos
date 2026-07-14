<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'sku' => $this->sku,
            'image' => $this->image,
            'image_url' => $this->image_url,
            'brand' => $this->brand,
            'is_active' => $this->is_active,
            'category' => $this->whenLoaded('category') ? new CategoryResource($this->category) : null,
            'variants' => $this->whenLoaded('variants') ? ProductVariantResource::collection($this->variants) : null,
            'variants_count' => $this->whenCounted('variants'),
            'total_sold' => $this->when(isset($this->total_sold), $this->total_sold),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'deleted_at' => $this->deleted_at,
        ];
    }
}
