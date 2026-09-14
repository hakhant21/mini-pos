<?php

namespace App\Http\Requests\Product;

use App\Models\Product;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class QuickUpdateProductRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('product')) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'stock_unit_id' => ['required', 'integer', 'exists:product_units,id'],
            'package_quantity' => ['required', 'integer', 'min:0'],
            'loose_quantity' => ['required', 'integer', 'min:0'],
            'unit_prices' => ['required', 'array', 'min:1'],
            'unit_prices.*.id' => ['required', 'integer', 'exists:product_units,id'],
            'unit_prices.*.selling_price' => ['required', 'integer', 'min:0'],
        ];
    }

    /**
     * Ensure the submitted units belong to the product being updated.
     */
    public function after(): array
    {
        return [function (Validator $validator): void {
            $product = $this->route('product');

            foreach ($this->input('unit_prices', []) as $index => $unitPrice) {
                if (! isset($unitPrice['id']) || ! $product instanceof Product) {
                    continue;
                }

                if (! $product->units()->whereKey($unitPrice['id'])->exists()) {
                    $validator->errors()->add("unit_prices.{$index}.id", 'The selected unit is invalid for this product.');
                }
            }

            $product = $this->route('product');
            if ($product instanceof Product && $this->filled('stock_unit_id') && ! $product->units()->whereKey($this->integer('stock_unit_id'))->exists()) {
                $validator->errors()->add('stock_unit_id', 'The selected stock unit is invalid for this product.');
            }
        }];
    }
}
