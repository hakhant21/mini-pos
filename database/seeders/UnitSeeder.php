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
                "name" => "ပါကင်",
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
                "id" => 3,
                "name" => "ပုလင်း",
                "abbreviation" => "bottle",
                "created_at" => "2026-07-20 16:47:24",
                "updated_at" => "2026-07-20 16:50:10"
            ],
            [
                "id" => 4,
                "name" => "ကီလိုဂရမ်",
                "abbreviation" => "kg",
                "created_at" => "2026-07-20 16:47:30",
                "updated_at" => "2026-07-20 16:50:31"
            ],
            [
                "id" => 5,
                "name" => "ဂရမ်",
                "abbreviation" => "g",
                "created_at" => "2026-07-20 16:47:36",
                "updated_at" => "2026-07-20 16:50:51"
            ],
            [
                "id" => 6,
                "name" => "ထုပ်",
                "abbreviation" => "bundle",
                "created_at" => "2026-07-20 16:47:42",
                "updated_at" => "2026-07-20 16:51:11"
            ]
        ];

        foreach ($units as $unit) {
            Unit::create($unit);
        }
    }
}
