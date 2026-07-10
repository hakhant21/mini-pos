<?php

namespace App\Http\Requests\Products;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category_id' => ['required', 'exists:categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
            'brand' => ['nullable', 'string', 'max:255'],
            'is_active' => ['boolean'],
            'variants' => ['nullable', 'array'],
            'variants.*.unit_id' => ['required_with:variants', 'exists:units,id'],
            'variants.*.name' => ['nullable', 'string', 'max:255'],
            'variants.*.units_per_package' => ['nullable', 'numeric', 'min:0.01'],
            'variants.*.cost_price' => ['required_with:variants', 'numeric', 'min:0'],
            'variants.*.selling_price' => ['required_with:variants', 'numeric', 'min:0'],
            'variants.*.min_stock_level' => ['nullable', 'numeric', 'min:0'],
            'variants.*.max_stock_level' => ['nullable', 'numeric', 'min:0'],
        ];
    }
}
