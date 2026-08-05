<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'enabled', 'name', 'address', 'phone_one', 'phone_two',
    'device_name', 'device_address', 'copies', 'auto_cut',
])]
class Printer extends Model
{
    protected function casts(): array
    {
        return [
            'enabled' => 'boolean',
            'copies' => 'integer',
            'auto_cut' => 'boolean',
        ];
    }

    public static function current(): self
    {
        return static::query()->firstOrCreate([], [
            'enabled' => false,
            'name' => '',
            'address' => '',
            'phone_one' => null,
            'phone_two' => null,
            'device_name' => null,
            'device_address' => null,
            'copies' => 2,
            'auto_cut' => true,
        ]);
    }
}
