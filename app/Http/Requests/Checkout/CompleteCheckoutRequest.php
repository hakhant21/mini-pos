<?php

namespace App\Http\Requests\Checkout;

use App\Models\Product;
use App\Models\ProductUnit;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class CompleteCheckoutRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $this->merge([
            'items' => collect($this->input('items', []))->map(fn (array $item): array => [
                ...$item,
                'selling_mode' => $item['selling_mode'] ?? 'Single',
            ])->all(),
        ]);
    }

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
            'payment_method' => ['required', Rule::in(['cash', 'card', 'mobile_wallet'])],
            'received_amount' => ['required', 'integer', 'min:0'],
            'discount' => ['nullable', 'integer', 'min:0'],
            'tax' => ['nullable', 'integer', 'min:0'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'exists:products,id'],
            'items.*.product_unit_id' => ['required', 'exists:product_units,id'],
            'items.*.selling_mode' => ['required', Rule::in(['Single', 'Package', 'Carton'])],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ];
    }

    public function after(): array
    {
        return [function (Validator $validator): void {
            foreach ($this->input('items', []) as $index => $item) {
                if (! isset($item['product_id'], $item['product_unit_id'])) {
                    continue;
                }

                $product = Product::query()->find($item['product_id']);
                $modeAllowed = match ($product?->price_mode) {
                    'single_package' => in_array($item['selling_mode'] ?? null, ['Single', 'Package'], true),
                    'single_package_carton' => in_array($item['selling_mode'] ?? null, ['Single', 'Package', 'Carton'], true),
                    default => ($item['selling_mode'] ?? null) === 'Single',
                };

                if (! $modeAllowed || ! ProductUnit::query()->whereKey($item['product_unit_id'])->where('product_id', $item['product_id'])->where('active', true)->exists()) {
                    $validator->errors()->add("items.{$index}.product_unit_id", 'The selected unit is invalid for this product.');
                }
            }
        }];
    }
}
