<?php

namespace App\Http\Requests\StockAdjustment;

use App\Models\StockAdjustment;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

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
            'adjustment_type' => ['required', 'in:increase,decrease,count'],
            'quantity' => ['required', 'integer', 'min:0'],
            'unit_conversion' => ['required', 'integer', 'min:1'],
            'reason' => ['required', 'string', 'max:100'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
