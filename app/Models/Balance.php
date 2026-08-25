<?php

namespace App\Models;

use Database\Factories\BalanceFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'opening_amount',
    'closing_amount',
    'total_sale_amount',
    'total_change_amount',
    'user_id',
])]
class Balance extends Model
{
    /** @use HasFactory<BalanceFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'opening_amount' => 'decimal:2',
            'closing_amount' => 'decimal:2',
            'total_sale_amount' => 'decimal:2',
            'total_change_amount' => 'decimal:2',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
