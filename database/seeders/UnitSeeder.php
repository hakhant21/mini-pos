<?php

namespace Database\Seeders;

use App\Models\Unit;
use Illuminate\Database\Seeder;

class UnitSeeder extends Seeder
{
    public function run(): void
    {
        $units = [
            ['name' => 'Piece', 'abbreviation' => 'pc'],
            ['name' => 'Kilogram', 'abbreviation' => 'kg'],
            ['name' => 'Gram', 'abbreviation' => 'g'],
            ['name' => 'Liter', 'abbreviation' => 'L'],
            ['name' => 'Milliliter', 'abbreviation' => 'mL'],
            ['name' => 'Box', 'abbreviation' => 'box'],
            ['name' => 'Pack', 'abbreviation' => 'pk'],
            ['name' => 'Bottle', 'abbreviation' => 'btl'],
            ['name' => 'Can', 'abbreviation' => 'can'],
            ['name' => 'Bag', 'abbreviation' => 'bag'],
        ];

        foreach ($units as $unit) {
            Unit::create($unit);
        }
    }
}
