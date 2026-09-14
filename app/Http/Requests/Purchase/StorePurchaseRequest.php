<?php

namespace App\Http\Requests\Purchase;

use App\Models\ProductUnit;
use App\Models\Purchase;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StorePurchaseRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('create', Purchase::class) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'supplier_id' => ['nullable', 'exists:suppliers,id'],
            'invoice_number' => ['required', 'string', 'max:100', 'unique:purchases,invoice_number'],
            'purchased_at' => ['required', 'date'],
            'notes' => ['nullable', 'string'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'exists:products,id,active,1'],
            'items.*.product_unit_id' => ['required', 'exists:product_units,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.unit_cost' => ['required', 'integer', 'min:0'],
        ];
    }

    /**
     * Ensure each selected unit belongs to its product before the transaction.
     */
    public function after(): array
    {
        return [function (Validator $validator): void {
            foreach (is_array($this->input('items')) ? $this->input('items') : [] as $index => $item) {
                if (! isset($item['product_id'], $item['product_unit_id'])) {
                    continue;
                }

                $belongsToProduct = ProductUnit::query()
                    ->whereKey($item['product_unit_id'])
                    ->where('product_id', $item['product_id'])
                    ->where('active', true)
                    ->exists();

                if (! $belongsToProduct) {
                    $validator->errors()->add("items.{$index}.product_unit_id", 'The selected unit is invalid for this product.');
                }
            }
        }];
    }
}
