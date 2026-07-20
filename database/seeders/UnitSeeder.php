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
                "id" => 1,
                "name" => "အထုပ်",
                "abbreviation" => "pack",
                "created_at" => "2026-07-20 16:47:12",
                "updated_at" => "2026-07-20 16:49:07"
            ],
            [
                "id" => 2,
                "name" => "ဘူး",
                "abbreviation" => "can",
                "created_at" => "2026-07-20 16:47:18",
                "updated_at" => "2026-07-20 16:49:48"
            ],
            [
                "id" => 4,
                "name" => "လီတာ",
                "abbreviation" => "li",
                "created_at" => "2026-07-20 16:47:37",
                "updated_at" => "2026-07-20 16:48:57"
            ],
            [
                "id" => 5,
                "name" => "မီလီ လီတာ",
                "abbreviation" => "ml",
                "created_at" => "2026-07-20 16:47:50",
                "updated_at" => "2026-07-20 16:48:48"
            ]
        ];

        foreach ($units as $unit) {
            Unit::create($unit);
        }
    }
}
