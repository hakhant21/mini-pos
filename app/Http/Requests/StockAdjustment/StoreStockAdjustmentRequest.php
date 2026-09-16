<?php

namespace App\Http\Requests\StockAdjustment;

use App\Models\Product;
use App\Models\StockAdjustment;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreStockAdjustmentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('create', StockAdjustment::class) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'product_id' => ['required', 'exists:products,id,active,1'],
            'product_unit_id' => ['nullable', 'integer', 'exists:product_units,id'],
            'adjustment_type' => ['required', 'in:increase,decrease,count'],
            'quantity' => ['required', 'integer', 'min:0'],
            'unit_conversion' => ['required', 'integer', 'min:1'],
            'reason' => ['required', 'string', 'max:100'],
            'notes' => ['nullable', 'string'],
        ];
    }

    public function after(): array
    {
        return [function (Validator $validator): void {
            $product = Product::query()->find($this->integer('product_id'));
            if ($product && $this->filled('product_unit_id') && ! $product->units()->whereKey($this->integer('product_unit_id'))->exists()) {
                $validator->errors()->add('product_unit_id', 'The selected unit is invalid for this product.');
            }
        }];
    }
}
