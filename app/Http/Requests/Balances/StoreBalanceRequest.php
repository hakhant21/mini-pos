<?php

namespace App\Http\Requests\Balances;

use Illuminate\Foundation\Http\FormRequest;

class StoreBalanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'opening_amount' => ['required', 'numeric', 'min:0'],
        ];
    }
}
