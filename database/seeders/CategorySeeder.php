<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                "id" => 1,
                "name" => "ဖက်ကြမ်း",
                "slug" => "paetkyan",
                "description" => "ဖက်ကြမ်း",
                "is_active" => true,
                "deleted_at" => null,
                "created_at" => "2026-07-20 15:52:21",
                "updated_at" => "2026-07-20 15:52:21"
            ],
            [
                "id" => 2,
                "name" => "စီးကရက်",
                "slug" => "cigarettes",
                "description" => "စီးကရက်",
                "is_active" => true,
                "deleted_at" => null,
                "created_at" => "2026-07-20 15:53:57",
                "updated_at" => "2026-07-20 15:55:14"
            ],
            [
                "id" => 3,
                "name" => "ဘီယာ",
                "slug" => "baiya",
                "description" => "ဘီယာ",
                "is_active" => true,
                "deleted_at" => null,
                "created_at" => "2026-07-20 15:54:31",
                "updated_at" => "2026-07-20 15:54:31"
            ],
            [
                "id" => 4,
                "name" => "အရက်",
                "slug" => "ayaet",
                "description" => "အရက်",
                "is_active" => true,
                "deleted_at" => null,
                "created_at" => "2026-07-20 15:54:35",
                "updated_at" => "2026-07-20 15:54:42"
            ],
            [
                "id" => 5,
                "name" => "အချိုရည်",
                "slug" => "akhyaoyai",
                "description" => "အချိုရည်",
                "is_active" => true,
                "deleted_at" => null,
                "created_at" => "2026-07-20 15:59:06",
                "updated_at" => "2026-07-20 15:59:06"
            ],
            [
                "id" => 6,
                "name" => "ဆိုလ်ဂျူး",
                "slug" => "saolgyau",
                "description" => "ဆိုလ်ဂျူး",
                "is_active" => true,
                "deleted_at" => null,
                "created_at" => "2026-07-20 16:03:33",
                "updated_at" => "2026-07-20 16:03:33"
            ],
            [
                "id" => 7,
                "name" => "ဝိုင်",
                "slug" => "waing",
                "description" => "ဝိုင်",
                "is_active" => true,
                "deleted_at" => null,
                "created_at" => "2026-07-20 16:03:46",
                "updated_at" => "2026-07-20 16:03:46"
            ],
            [
                "id" => 8,
                "name" => "ရေသန့်",
                "slug" => "yaethan",
                "description" => "ရေသန့်",
                "is_active" => true,
                "deleted_at" => null,
                "created_at" => "2026-07-20 16:06:11",
                "updated_at" => "2026-07-20 16:06:11"
            ],
            [
                "id" => 9,
                "name" => "ခေါက်ဆွဲခြောက်",
                "slug" => "khawetsawekhyauk",
                "description" => "ခေါက်ဆွဲခြောက်",
                "is_active" => true,
                "deleted_at" => null,
                "created_at" => "2026-07-20 16:07:25",
                "updated_at" => "2026-07-20 16:07:25"
            ],
            [
                "id" => 10,
                "name" => "မုန့်မျိုးစုံ",
                "slug" => "montmyosone",
                "description" => "မုန့်မျိုးစုံ",
                "is_active" => true,
                "deleted_at" => null,
                "created_at" => "2026-07-20 16:07:25",
                "updated_at" => "2026-07-20 16:07:25"
            ],
            [
                "id" => 11,
                "name" => "အခြား",
                "slug" => "acharr",
                "description" => "အခြား",
                "is_active" => true,
                "deleted_at" => null,
                "created_at" => "2026-07-20 16:07:25",
                "updated_at" => "2026-07-20 16:07:25"
            ]
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
