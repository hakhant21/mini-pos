<?php

namespace Database\Seeders;

use App\Models\Unit;
use Illuminate\Database\Seeder;

class UnitSeeder extends Seeder
{
    public function run(): void
    {
        $units = [
            [
                'name' => 'Bottle',
                'abbreviation' => 'btl',
            ],
            [
                'name' => 'Can',
                'abbreviation' => 'can',
            ],
            [
                'name' => 'Pack',
                'abbreviation' => 'pack',
            ],
            [
                'name' => 'Piece',
                'abbreviation' => 'pc',
            ],
            [
                'name' => 'Roll',
                'abbreviation' => 'rl',
            ]
        ];

        foreach ($units as $unit) {
            Unit::create($unit);
        }
    }
}
