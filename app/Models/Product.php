<?php

namespace App\Models;

use Database\Factories\ProductFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class Product extends Model
{
    /** @use HasFactory<ProductFactory> */
    use HasFactory;

    protected $guarded = [];

    protected $appends = ['image_url', 'stock'];

    public function getImageUrlAttribute(): ?string
    {
        return $this->image ? Storage::disk('public')->url($this->image) : null;
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function units(): HasMany
    {
        return $this->hasMany(ProductUnit::class)->orderBy('id');
    }

    public function stocks(): HasMany
    {
        return $this->hasMany(InventoryStock::class);
    }

    /**
     * Expose an aggregate for legacy product-level summaries without storing product stock.
     * All source values remain owned by the product units.
     */
    public function getStockAttribute(): ?array
    {
        if (! $this->relationLoaded('units')) {
            return null;
        }

        return ['quantity_base' => $this->units->sum(fn (ProductUnit $unit): int => ($unit->package_quantity * $unit->conversion) + $unit->loose_quantity)];
    }
}
