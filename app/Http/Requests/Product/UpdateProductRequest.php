<?php

namespace App\Http\Requests\Product;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\File;

class UpdateProductRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'category_id' => ['required', 'exists:categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'sku' => ['required', 'string', 'max:100', 'unique:products,sku,'.$this->route('product')->id],
            'barcode' => ['nullable', 'string', 'max:100', 'unique:products,barcode,'.$this->route('product')->id],
            'image' => ['nullable', File::image()->max(2048)],
            'product_type' => ['required', 'string', 'max:50'],
            'base_unit' => ['required', 'string', 'max:50'],
            'purchase_price' => ['required', 'integer', 'min:0'],
            'reorder_level' => ['required', 'integer', 'min:0'],
            'active' => ['sometimes', 'boolean'],
            'units' => ['required', 'array', 'min:1'],
            'units.*.name' => ['required', 'string', 'max:50'],
            'units.*.conversion' => ['required', 'integer', 'min:1'],
            'units.*.selling_price' => ['required', 'integer', 'min:0'],
            'units.*.barcode' => ['nullable', 'string', 'max:100'],
        ];
    }
}
