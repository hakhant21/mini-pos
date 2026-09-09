<?php

namespace App\Models;

use Database\Factories\ProductVariantFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

#[Fillable([
    'product_id', 'unit_id', 'name', 'pricing_mode', 'image', 'sku',
    'units_per_package', 'cost_price', 'selling_price', 'per_unit_price',
    'pack_price', 'units_per_pack',
    'stock_quantity', 'min_stock_level', 'max_stock_level', 'is_active',
])]
class ProductVariant extends Model
{
    /** @use HasFactory<ProductVariantFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'units_per_package' => 'integer',
            'cost_price' => 'decimal:2',
            'selling_price' => 'decimal:2',
            'per_unit_price' => 'decimal:2',
            'pack_price' => 'decimal:2',
            'units_per_pack' => 'integer',
            'stock_quantity' => 'integer',
            'min_stock_level' => 'integer',
            'max_stock_level' => 'integer',
            'pricing_mode' => 'string',
            'is_active' => 'boolean',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    public function instockHistories(): HasMany
    {
        return $this->hasMany(StockHistory::class);
    }

    public function stockStatus(): Attribute
    {
        return Attribute::make(
            get: function () {
                if ($this->stock_quantity <= 0) {
                    return 'out_of_stock';
                }

                if ($this->stock_quantity <= $this->min_stock_level) {
                    return 'low_stock';
                }

                return 'in_stock';
            },
        );
    }

    public function imageUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->image ? Storage::url($this->image) : null,
        );
    }

    public function recalculateWeightedAverageCost(float $quantity, float $newCostPrice): void
    {
        $totalCost = ($this->stock_quantity * $this->cost_price) + ($quantity * $newCostPrice);
        $totalQuantity = $this->stock_quantity + $quantity;

        $this->cost_price = $totalQuantity > 0 ? round($totalCost / $totalQuantity, 2) : 0;
        $this->stock_quantity += $quantity;
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
