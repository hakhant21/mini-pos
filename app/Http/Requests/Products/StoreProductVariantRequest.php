<?php

namespace App\Http\Requests\Products;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductVariantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'unit_id' => ['required', 'exists:units,id'],
            'name' => ['nullable', 'string', 'max:255'],
            'pricing_mode' => ['nullable', 'string', 'in:single,pack,package,both,single_pack'],
            'image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
            'units_per_package' => ['required', 'integer', 'min:1'],
            'cost_price' => ['required', 'numeric', 'min:0'],
            'selling_price' => ['required', 'numeric', 'min:0'],
            'per_unit_price' => ['nullable', 'numeric', 'min:0'],
            'pack_price' => ['nullable', 'numeric', 'min:0'],
            'units_per_pack' => ['nullable', 'integer', 'min:1'],
            'min_stock_level' => ['required', 'integer', 'min:0'],
            'max_stock_level' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
        ];
    }
}
