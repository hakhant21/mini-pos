<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $alcohol = Category::where('name', 'like', '%အရက်%')->first();
        $beer = Category::where('name', 'like', '%ဘီယာ%')->first();
        $soju = Category::where('name', 'like', '%ဆိုလ်ဂျူး%')->first();
        $wine = Category::where('name', 'like', '%ဝိုင်%')->first();
        $softdrink = Category::where('name', 'like', '%အချိုရည်%')->first();
        $wine = Category::where('name', 'like', '%ဝိုင်%')->first();

        $products = [
            ['category_id' => $alcohol->id, 'sku' => 'GM-001', 'brand' => 'Glan Master', 'name' => 'အဝါ'],
            ['category_id' => $alcohol->id, 'sku' => 'GM-002', 'brand' => 'Glan Master', 'name' => 'အနီ'],
            ['category_id' => $alcohol->id, 'sku' => 'GM-003', 'brand' => 'Glan Master', 'name' => 'အပြာ'],
            ['category_id' => $alcohol->id, 'sku' => 'RC-001', 'brand' => 'Royal Club', 'name' => 'အစိမ်း'],
            ['category_id' => $alcohol->id, 'sku' => 'RC-002', 'brand' => 'Royal Club', 'name' => 'အပြာ'],
            ['category_id' => $alcohol->id, 'sku' => 'RC-003', 'brand' => 'Royal Club', 'name' => 'အဝါ'],
            ['category_id' => $alcohol->id, 'sku' => 'MA-001', 'brand' => 'MacArthur\'s', 'name' => 'Whiskey'],
            ['category_id' => $alcohol->id, 'sku' => 'GR-001', 'brand' => 'Grand Royal', 'name' => 'Double Gold'],
            ['category_id' => $alcohol->id, 'sku' => 'GR-002', 'brand' => 'Grand Royal', 'name' => 'Sherry Cask'],
            ['category_id' => $alcohol->id, 'sku' => 'GR-003', 'brand' => 'Grand Royal', 'name' => 'Shwe'],
            ['category_id' => $alcohol->id, 'sku' => 'GR-004', 'brand' => 'Grand Royal', 'name' => 'Signature Blue'],
            ['category_id' => $alcohol->id, 'sku' => 'GR-005', 'brand' => 'Grand Royal', 'name' => 'Smooth'],

            ['category_id' => $alcohol->id, 'sku' => 'EM-001', 'brand' => 'Empire', 'name' => 'Rum'],

            ['category_id' => $alcohol->id, 'sku' => 'GR-006', 'brand' => 'Grand Royal', 'name' => 'Black'],
            ['category_id' => $alcohol->id, 'sku' => 'BR-001', 'brand' => 'Brother', 'name' => 'Smooth'],

            ['category_id' => $alcohol->id, 'sku' => 'MD-001', 'brand' => 'Mandalay', 'name' => 'Rum 5 Year'],
            ['category_id' => $alcohol->id, 'sku' => 'MD-002', 'brand' => 'Mandalay', 'name' => '3 Year Export'],
            ['category_id' => $alcohol->id, 'sku' => 'MD-003', 'brand' => 'Mandalay', 'name' => 'Coffee Rum'],
            ['category_id' => $alcohol->id, 'sku' => 'MD-004', 'brand' => 'Mandalay', 'name' => 'White Rum'],
            ['category_id' => $alcohol->id, 'sku' => 'MD-005', 'brand' => 'Mandalay', 'name' => 'Rum'],

            ['category_id' => $alcohol->id, 'sku' => 'MY-002', 'brand' => 'Myanmar', 'name' => 'Rum Celebration'],
            ['category_id' => $alcohol->id, 'sku' => 'MY-003', 'brand' => 'Myanmar', 'name' => 'Dry Gin'],

            ['category_id' => $alcohol->id, 'sku' => 'AR-001', 'brand' => 'Army', 'name' => 'Rum'],
            ['category_id' => $alcohol->id, 'sku' => 'DG-001', 'brand' => 'Dagon', 'name' => 'Rum'],

            ['category_id' => $alcohol->id, 'sku' => 'JW-001', 'brand' => 'Johnnie Walker', 'name' => 'Blue Label'],
            ['category_id' => $alcohol->id, 'sku' => 'JW-002', 'brand' => 'Johnnie Walker', 'name' => 'Double Black'],
            ['category_id' => $alcohol->id, 'sku' => 'JW-003', 'brand' => 'Johnnie Walker', 'name' => 'Black Label'],
            ['category_id' => $alcohol->id, 'sku' => 'JW-004', 'brand' => 'Johnnie Walker', 'name' => 'Red Label'],

            ['category_id' => $alcohol->id, 'sku' => 'CR-001', 'brand' => 'Chivas Regal', 'name' => '12 Year'],

            ['category_id' => $alcohol->id, 'sku' => 'BI-001', 'brand' => 'Black Icon', 'name' => 'Black Icon'],
            ['category_id' => $alcohol->id, 'sku' => 'DF-001', 'brand' => 'Dunfife', 'name' => 'အပြာ'],
            ['category_id' => $alcohol->id, 'sku' => 'DF-002', 'brand' => 'Dunfife', 'name' => 'အနီ'],

            ['category_id' => $alcohol->id, 'sku' => 'JM-001', 'brand' => 'Jägermeister', 'name' => 'Jägermeister'],

            ['category_id' => $beer->id, 'sku' => 'SE-001', 'brand' => 'Sir Edward\'s', 'name' => 'Smoky'],
            ['category_id' => $beer->id, 'sku' => 'SE-002', 'brand' => 'Sir Edward\'s', 'name' => 'Finest'],
            ['category_id' => $beer->id, 'sku' => 'SE-003', 'brand' => 'Sir Edward\'s', 'name' => 'Beer Reserve'],

            ['category_id' => $beer->id, 'sku' => 'KN-001', 'brand' => 'Keen', 'name' => 'Beer'],
            ['category_id' => $beer->id, 'sku' => 'MY-001', 'brand' => 'Myanmar', 'name' => 'Beer'],
            ['category_id' => $beer->id, 'sku' => 'BS-001', 'brand' => 'Black Shield', 'name' => 'Beer'],
            ['category_id' => $beer->id, 'sku' => 'AG-001', 'brand' => 'Andaman Gold', 'name' => 'Beer'],
            ['category_id' => $beer->id, 'sku' => 'CH-001', 'brand' => 'Chang', 'name' => 'Beer'],

            ['category_id' => $beer->id, 'sku' => 'DG-002', 'brand' => 'Dagon', 'name' => 'Beer'],
            ['category_id' => $beer->id, 'sku' => 'AR-002', 'brand' => 'Army', 'name' => 'Beer'],
            ['category_id' => $beer->id, 'sku' => 'TB-001', 'brand' => 'Tuborg', 'name' => 'Beer'],
            ['category_id' => $beer->id, 'sku' => 'CB-001', 'brand' => 'Carlsberg', 'name' => 'Beer'],
            ['category_id' => $beer->id, 'sku' => 'YM-001', 'brand' => 'Yoma', 'name' => 'Beer'],

            ['category_id' => $beer->id, 'sku' => 'BE-001', 'brand' => 'Black Eagle', 'name' => 'Beer'],
            ['category_id' => $beer->id, 'sku' => 'TP-001', 'brand' => 'Tapper', 'name' => 'Beer'],
            ['category_id' => $beer->id, 'sku' => 'DG-003', 'brand' => 'Dagon', 'name' => 'Super Beer'],
            ['category_id' => $beer->id, 'sku' => 'YG-001', 'brand' => 'Yagon', 'name' => 'Beer'],
            ['category_id' => $beer->id, 'sku' => 'MD-006', 'brand' => 'Mandalay', 'name' => 'Beer'],
            ['category_id' => $beer->id, 'sku' => 'BW-001', 'brand' => 'Budweiser', 'name' => 'Beer'],
            ['category_id' => $beer->id, 'sku' => 'CO-001', 'brand' => 'Corona', 'name' => 'Beer'],
            ['category_id' => $beer->id, 'sku' => 'SG-001', 'brand' => 'Singha', 'name' => 'Beer'],
            ['category_id' => $beer->id, 'sku' => 'LO-001', 'brand' => 'Leo', 'name' => 'Beer'],

            ['category_id' => $beer->id, 'sku' => 'HN-001', 'brand' => 'Heineken', 'name' => 'Beer'],
            ['category_id' => $beer->id, 'sku' => 'AB-001', 'brand' => 'ABC', 'name' => 'Beer'],
            ['category_id' => $beer->id, 'sku' => 'TG-001', 'brand' => 'Tiger', 'name' => 'Beer'],
            ['category_id' => $beer->id, 'sku' => 'TG-002', 'brand' => 'Tiger', 'name' => 'Crystal'],
            ['category_id' => $beer->id, 'sku' => 'TG-003', 'brand' => 'Tiger', 'name' => 'Super'],
            ['category_id' => $beer->id, 'sku' => 'BW-002', 'brand' => 'Bawdar', 'name' => 'Beer'],

            ['category_id' => $soju->id, 'sku' => 'BO-001', 'brand' => 'Bora', 'name' => 'Soju'],
            ['category_id' => $soju->id, 'sku' => 'JE-001', 'brand' => 'Joei', 'name' => 'Soju'],
            ['category_id' => $soju->id, 'sku' => 'GB-001', 'brand' => 'Geonbae', 'name' => 'Soju'],
            ['category_id' => $soju->id, 'sku' => 'CG-001', 'brand' => 'Chingu', 'name' => 'Soju'],

            ['category_id' => $wine->id, 'sku' => 'FM-001', 'brand' => 'Fullmoon', 'name' => 'Wine'],

            ['category_id' => $softdrink->id, 'sku' => 'A1-001', 'brand' => 'A1', 'name' => 'Energy Drink'],
            ['category_id' => $softdrink->id, 'sku' => 'BL-001', 'brand' => 'Blink', 'name' => 'Energy Drink'],
            ['category_id' => $softdrink->id, 'sku' => 'RRB-001', 'brand' => 'RRB', 'name' => 'Energy Drink'],
            ['category_id' => $softdrink->id, 'sku' => 'PP-001', 'brand' => 'Pop', 'name' => 'Soda'],
            ['category_id' => $softdrink->id, 'sku' => 'DG-004', 'brand' => 'Dagon', 'name' => 'Soda'],
            ['category_id' => $softdrink->id, 'sku' => 'VM-001', 'brand' => 'Vitamilk', 'name' => 'Soy Milk'],
            ['category_id' => $softdrink->id, 'sku' => 'EV-001', 'brand' => 'Enervit', 'name' => 'Energy Drink'],
            ['category_id' => $softdrink->id, 'sku' => 'CL-001', 'brand' => 'Color', 'name' => 'Drink'],
            ['category_id' => $softdrink->id, 'sku' => 'HG-001', 'brand' => 'Honey Gold', 'name' => 'Drink'],

            ['category_id' => $softdrink->id, 'sku' => 'SK-001', 'brand' => 'Sunkist', 'name' => 'Soft Drink'],
            ['category_id' => $softdrink->id, 'sku' => 'MR-001', 'brand' => 'Mirinda', 'name' => 'Soft Drink'],
            ['category_id' => $softdrink->id, 'sku' => 'JP-001', 'brand' => 'Jasper', 'name' => 'Water'],
            ['category_id' => $softdrink->id, 'sku' => 'M1-001', 'brand' => 'M-150', 'name' => 'Energy Drink'],
            ['category_id' => $softdrink->id, 'sku' => 'CRB-001', 'brand' => 'Carabao', 'name' => 'Energy Drink'],
            ['category_id' => $softdrink->id, 'sku' => 'FD-001', 'brand' => 'Fire Dragon', 'name' => 'Energy Drink'],
            ['category_id' => $softdrink->id, 'sku' => 'SP-001', 'brand' => 'Speed', 'name' => 'Energy Drink'],
            ['category_id' => $softdrink->id, 'sku' => 'LP-001', 'brand' => 'Lipo', 'name' => 'Energy Drink'],
            ['category_id' => $softdrink->id, 'sku' => 'CV-001', 'brand' => 'C-Vitt', 'name' => 'Vitamin Drink'],

            ['category_id' => $softdrink->id, 'sku' => 'SH-001', 'brand' => 'Shark', 'name' => 'Energy Drink'],
            ['category_id' => $softdrink->id, 'sku' => 'LD-001', 'brand' => 'Lucky Day', 'name' => 'Coffee'],
            ['category_id' => $softdrink->id, 'sku' => 'UF-001', 'brand' => 'UFC', 'name' => 'Drink'],
            ['category_id' => $softdrink->id, 'sku' => 'SD-001', 'brand' => 'Sunday', 'name' => 'Drink'],
            ['category_id' => $softdrink->id, 'sku' => 'LS-001', 'brand' => 'Lactasoy', 'name' => 'Soy Milk'],
            ['category_id' => $softdrink->id, 'sku' => 'ML-001', 'brand' => 'Milo', 'name' => 'Chocolate Malt'],
            ['category_id' => $softdrink->id, 'sku' => 'OV-001', 'brand' => 'Ovaltine', 'name' => 'Chocolate Malt'],
            ['category_id' => $softdrink->id, 'sku' => 'VT-001', 'brand' => 'Vito', 'name' => 'Drink'],
            ['category_id' => $softdrink->id, 'sku' => 'YK-001', 'brand' => 'Yoko', 'name' => 'Drink'],
        ];

        foreach ($products as $product) {
            if ($product['brand'] !== $product['name']) {
                $product['name'] = $product['brand'] . ' - ' . $product['name'];
            }
            Product::create($product);
        }
    }
}
