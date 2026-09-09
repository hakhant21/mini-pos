<?php

namespace App\Http\Requests\Products;

use Illuminate\Foundation\Http\FormRequest;

class UpdateStockPriceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'stock_quantity' => ['required', 'integer', 'min:0'],
            'units_per_package' => ['required', 'integer', 'min:1'],
            'min_stock_level' => ['nullable', 'numeric', 'min:0'],
            'cost_price' => ['required', 'numeric', 'min:0'],
            'selling_price' => ['required', 'numeric', 'min:0'],
            'per_unit_price' => ['nullable', 'numeric', 'min:0'],
            'pack_price' => ['nullable', 'numeric', 'min:0'],
        ];
    }
}
