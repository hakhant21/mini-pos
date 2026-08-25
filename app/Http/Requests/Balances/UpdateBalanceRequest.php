<?php

namespace App\Http\Requests\Balances;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBalanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'opening_amount' => ['sometimes', 'required', 'numeric', 'min:0'],
            'closing_amount' => ['sometimes', 'required', 'numeric', 'min:0'],
            'total_sale_amount' => ['sometimes', 'required', 'numeric', 'min:0'],
            'total_change_amount' => ['sometimes', 'required', 'numeric', 'min:0'],
        ];
    }
}
