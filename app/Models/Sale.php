<?php

namespace App\Models;

use Database\Factories\SaleFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

#[Fillable([
    'invoice_number', 'total_amount', 'payment_method',
    'amount_paid', 'change', 'discount', 'tax', 'notes', 'user_id',
])]
class Sale extends Model
{
    /** @use HasFactory<SaleFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'total_amount' => 'decimal:2',
            'amount_paid' => 'decimal:2',
            'change' => 'decimal:2',
            'discount' => 'decimal:2',
            'tax' => 'decimal:2',
        ];
    }

    public static function generateInvoiceNumber(): string
    {
        $date = now()->format('Ymd');
        $last = static::whereDate('created_at', today())->count();

        return 'INV-'.$date.'-'.str_pad($last + 1, 4, '0', STR_PAD_LEFT);
    }

    public function items(): HasMany
    {
        return $this->hasMany(SaleItem::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
