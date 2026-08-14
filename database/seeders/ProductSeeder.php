<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        ProductVariant::query()->delete();

        $alcohol = Category::where('name', 'like', '%အရက်%')->first();
        $beer = Category::where('name', 'like', '%ဘီယာ%')->first();
        $soju = Category::where('name', 'like', '%ဆိုလ်ဂျူး%')->first();
        $wine = Category::where('name', 'like', '%ဝိုင်%')->first();
        $softdrink = Category::where('name', 'like', '%အချိုရည်%')->first();
        $water = Category::where('name', 'like', '%ရေသန့်%')->first();
        $noodles = Category::where('name', 'like', '%ခေါက်ဆွဲခြောက်%')->first();
        $snacks = Category::where('name', 'like', '%မုန့်မျိုးစုံ%')->first();
        $cigarettes = Category::where('name', 'like', '%စီးကရက်%')->first();
        $paan = Category::where('name', 'like', '%ဖက်ကြမ်း%')->first();
        $other = Category::where('name', 'like', '%အခြား%')->first();

        // Unit ids from UnitSeeder: 1 = အထုပ် (pack), 2 = ဘူး (can), 4 = လီတာ (li), 5 = မီလီ လီတာ (ml), 7 = လိပ် (roll)
        // Each variant is [name, unit_id].
        $products = [
            // ---------- Alcohol (အရက်) ----------
            ['category_id' => $alcohol->id, 'sku' => 'GM-001', 'brand' => 'Glan Master', 'name' => 'အဝါ', 'variants' => [['1L', 4], ['0.7L', 4], ['350ml', 5], ['175ml', 5], ['2ပတ်', 1]]],
            ['category_id' => $alcohol->id, 'sku' => 'GM-002', 'brand' => 'Glan Master', 'name' => 'အနီ', 'variants' => [['1L', 4], ['0.7L', 4], ['350ml', 5], ['175ml', 5], ['2ပတ်', 1]]],
            ['category_id' => $alcohol->id, 'sku' => 'GM-003', 'brand' => 'Glan Master', 'name' => 'အပြာ', 'variants' => [['1L', 4], ['0.7L', 4], ['350ml', 5], ['175ml', 5], ['2ပတ်', 1]]],
            ['category_id' => $alcohol->id, 'sku' => 'RC-001', 'brand' => 'Royal Club', 'name' => 'အစိမ်း', 'variants' => [['1L', 4], ['0.7L', 4], ['350ml', 5], ['175ml', 5], ['2ပတ်', 1]]],
            ['category_id' => $alcohol->id, 'sku' => 'RC-002', 'brand' => 'Royal Club', 'name' => 'အပြာ', 'variants' => [['1L', 4], ['0.7L', 4], ['350ml', 5], ['175ml', 5], ['2ပတ်', 1]]],
            ['category_id' => $alcohol->id, 'sku' => 'RC-003', 'brand' => 'Royal Club', 'name' => 'အဝါ', 'variants' => [['1L', 4], ['0.7L', 4], ['350ml', 5], ['175ml', 5], ['2ပတ်', 1]]],
            ['category_id' => $alcohol->id, 'sku' => 'MA-001', 'brand' => 'MacArthur\'s', 'name' => 'Whiskey', 'variants' => []],
            ['category_id' => $alcohol->id, 'sku' => 'GR-001', 'brand' => 'Grand Royal', 'name' => 'Double Gold', 'variants' => []],
            ['category_id' => $alcohol->id, 'sku' => 'GR-002', 'brand' => 'Grand Royal', 'name' => 'Sherry Cask', 'variants' => [['0.7L', 4], ['350ml', 5], ['175ml', 5]]],
            ['category_id' => $alcohol->id, 'sku' => 'GR-003', 'brand' => 'Grand Royal', 'name' => 'Shwe', 'variants' => [['0.7L', 4], ['350ml', 5], ['175ml', 5]]],
            ['category_id' => $alcohol->id, 'sku' => 'GR-004', 'brand' => 'Grand Royal', 'name' => 'Signature Blue', 'variants' => [['0.7L', 4], ['350ml', 5], ['175ml', 5]]],
            ['category_id' => $alcohol->id, 'sku' => 'GR-005', 'brand' => 'Grand Royal', 'name' => 'Smooth', 'variants' => [['1L', 4], ['0.7L', 4], ['350ml', 5], ['175ml', 5], ['2ပတ်', 1]]],
            ['category_id' => $alcohol->id, 'sku' => 'EM-001', 'brand' => 'Empire', 'name' => 'Rum', 'variants' => [['0.7L', 4]]],
            ['category_id' => $alcohol->id, 'sku' => 'GR-006', 'brand' => 'Grand Royal', 'name' => 'Black', 'variants' => [['1L', 4], ['0.7L', 4], ['350ml', 5], ['175ml', 5]]],
            ['category_id' => $alcohol->id, 'sku' => 'BR-001', 'brand' => 'Brother', 'name' => 'Smooth', 'variants' => [['0.7L', 4], ['350ml', 5], ['175ml', 5], ['200ml', 5]]],
            ['category_id' => $alcohol->id, 'sku' => 'MD-001', 'brand' => 'Mandalay', 'name' => 'Rum Sherry', 'variants' => [['0.7L', 4], ['350ml', 5]]],
            ['category_id' => $alcohol->id, 'sku' => 'MD-002', 'brand' => 'Mandalay', 'name' => '3 Year Export', 'variants' => [['0.7L', 4], ['350ml', 5]]],
            ['category_id' => $alcohol->id, 'sku' => 'MD-003', 'brand' => 'Mandalay', 'name' => 'Coffee Rum', 'variants' => [['1L', 4], ['0.7L', 4], ['350ml', 5]]],
            ['category_id' => $alcohol->id, 'sku' => 'MD-004', 'brand' => 'Mandalay', 'name' => 'White Rum', 'variants' => [['1L', 4], ['0.7L', 4], ['350ml', 5]]],
            ['category_id' => $alcohol->id, 'sku' => 'MD-005', 'brand' => 'Mandalay', 'name' => 'Rum', 'variants' => [['0.7L', 4]]],
            ['category_id' => $alcohol->id, 'sku' => 'MD-007', 'brand' => 'Mandalay', 'name' => 'Rum Gold', 'variants' => [['0.7L', 4], ['350ml', 5]]],
            ['category_id' => $alcohol->id, 'sku' => 'MY-002', 'brand' => 'Myanmar', 'name' => 'Rum Celebration', 'variants' => []],
            ['category_id' => $alcohol->id, 'sku' => 'MY-003', 'brand' => 'Myanmar', 'name' => 'Dry Gin', 'variants' => []],
            ['category_id' => $alcohol->id, 'sku' => 'AR-001', 'brand' => 'Army', 'name' => 'Rum', 'variants' => [['1L', 4]]],
            ['category_id' => $alcohol->id, 'sku' => 'DG-001', 'brand' => 'Dagon', 'name' => 'Rum', 'variants' => [['1L', 4]]],
            ['category_id' => $alcohol->id, 'sku' => 'JW-001', 'brand' => 'Johnnie Walker', 'name' => 'Blue Label', 'variants' => [['1L', 4]]],
            ['category_id' => $alcohol->id, 'sku' => 'JW-002', 'brand' => 'Johnnie Walker', 'name' => 'Double Black', 'variants' => [['1L', 4]]],
            ['category_id' => $alcohol->id, 'sku' => 'JW-003', 'brand' => 'Johnnie Walker', 'name' => 'Black Label', 'variants' => [['1L', 4]]],
            ['category_id' => $alcohol->id, 'sku' => 'JW-004', 'brand' => 'Johnnie Walker', 'name' => 'Red Label', 'variants' => [['1L', 4]]],
            ['category_id' => $alcohol->id, 'sku' => 'CR-001', 'brand' => 'Chivas Regal', 'name' => '12 Year', 'variants' => [['0.7L', 4]]],
            ['category_id' => $alcohol->id, 'sku' => 'BI-001', 'brand' => 'Black Icon', 'name' => 'Black Icon', 'variants' => [['1L', 4]]],
            ['category_id' => $alcohol->id, 'sku' => 'DF-001', 'brand' => 'Dunfife', 'name' => 'အပြာ', 'variants' => [['0.7L', 4]]],
            ['category_id' => $alcohol->id, 'sku' => 'DF-002', 'brand' => 'Dunfife', 'name' => 'အနီ', 'variants' => [['0.7L', 4]]],
            ['category_id' => $alcohol->id, 'sku' => 'JM-001', 'brand' => 'Jägermeister', 'name' => 'Jägermeister', 'variants' => [['1L', 4], ['0.7L', 4]]],
            ['category_id' => $alcohol->id, 'sku' => 'KH-001', 'brand' => '', 'name' => 'ခေါင်ရည်ဘုရင် ၂ဆ', 'variants' => []],
            ['category_id' => $alcohol->id, 'sku' => 'KT-001', 'brand' => '', 'name' => 'ကိုးတောင်ကျား', 'variants' => [['ဘူး', 2]]],
            ['category_id' => $alcohol->id, 'sku' => 'SM-003', 'brand' => '', 'name' => 'စစ်မြင်း', 'variants' => [['အရက်', 2], ['ဆိုဂျူး', 2]]],

            // ---------- Beer (ဘီယာ) ----------
            ['category_id' => $beer->id, 'sku' => 'SE-001', 'brand' => 'Sir Edward\'s', 'name' => 'Smoky', 'variants' => []],
            ['category_id' => $beer->id, 'sku' => 'SE-002', 'brand' => 'Sir Edward\'s', 'name' => 'Finest', 'variants' => []],
            ['category_id' => $beer->id, 'sku' => 'SE-003', 'brand' => 'Sir Edward\'s', 'name' => 'Beer Reserve', 'variants' => []],
            ['category_id' => $beer->id, 'sku' => 'KN-001', 'brand' => 'Keen', 'name' => 'Beer', 'variants' => [['ပုလင်းရှည်', 2], ['ပုလင်းတို', 2], ['သံရှည်', 2], ['သံတို', 2]]],
            ['category_id' => $beer->id, 'sku' => 'MY-001', 'brand' => 'Myanmar', 'name' => 'Beer', 'variants' => [['ပုလင်း', 2], ['ပုလင်းမဲပါ', 2], ['သံရှည်', 2], ['သံတို', 2], ['scout', 2]]],
            ['category_id' => $beer->id, 'sku' => 'BS-001', 'brand' => 'Black Shield', 'name' => 'Beer', 'variants' => [['ပုလင်း', 2], ['သံတို', 2]]],
            ['category_id' => $beer->id, 'sku' => 'AG-001', 'brand' => 'Andaman Gold', 'name' => 'Beer', 'variants' => [['နီ သံရှည်', 2], ['နီ သံတို', 2], ['ခဲမဲ သံရှည်', 2], ['ခဲမဲ သံတို', 2], ['ပြာ သံရှည်', 2], ['ပြာ သံတို', 2]]],
            ['category_id' => $beer->id, 'sku' => 'CH-001', 'brand' => 'Chang', 'name' => 'Beer', 'variants' => [['ပုလင်း', 2], ['သံရှည်', 2], ['သံတို', 2]]],
            ['category_id' => $beer->id, 'sku' => 'DG-002', 'brand' => 'Dagon', 'name' => 'Beer', 'variants' => [['စိမ်း ပုလင်း', 2], ['စိမ်း သံရှည်', 2], ['စိမ်း သံတို', 2], ['နီ ပုလင်း', 2], ['နီ သံရှည်', 2], ['နီ သံတို', 2]]],
            ['category_id' => $beer->id, 'sku' => 'AR-002', 'brand' => 'Army', 'name' => 'Beer', 'variants' => [['တပ်နီ သံဘူး', 2], ['တပ်စိမ်း သံဘူး', 2]]],
            ['category_id' => $beer->id, 'sku' => 'TB-001', 'brand' => 'Tuborg', 'name' => 'Beer', 'variants' => [['ပုလင်း', 2], ['သံရှည်', 2], ['သံတို', 2]]],
            ['category_id' => $beer->id, 'sku' => 'CB-001', 'brand' => 'Carlsberg', 'name' => 'Beer', 'variants' => [['ပုလင်းရှည်', 2], ['ပုလင်းတို', 2], ['သံရှည်', 2], ['သံတို', 2]]],
            ['category_id' => $beer->id, 'sku' => 'YM-001', 'brand' => 'Yoma', 'name' => 'Beer', 'variants' => [['နီ သံရှည်', 2], ['နီ သံတို', 2], ['ဝါ သံရှည်', 2], ['ဝါ သံတို', 2]]],
            ['category_id' => $beer->id, 'sku' => 'BE-001', 'brand' => 'Black Eagle', 'name' => 'Beer', 'variants' => [['သံတို', 2]]],
            ['category_id' => $beer->id, 'sku' => 'TP-001', 'brand' => 'Tapper', 'name' => 'Beer', 'variants' => [['သံရှည်', 2], ['သံတို', 2]]],
            ['category_id' => $beer->id, 'sku' => 'DG-003', 'brand' => 'Dagon', 'name' => 'Super Beer', 'variants' => [['သံဘူး', 2]]],
            ['category_id' => $beer->id, 'sku' => 'YG-001', 'brand' => 'Yagon', 'name' => 'Beer', 'variants' => [['သံရှည်', 2], ['သံတို', 2]]],
            ['category_id' => $beer->id, 'sku' => 'MD-006', 'brand' => 'Mandalay', 'name' => 'Beer', 'variants' => [['အပြာ ပုလင်းရှည်', 2], ['အပြာ ပုလင်းတို', 2], ['အပြာ သံရှည်', 2], ['အပြာ သံတို', 2], ['အနီ ပုလင်းရှည်', 2], ['အနီ ပုလင်းတို', 2], ['အနီ သံရှည်', 2], ['အနီ သံတို', 2]]],
            ['category_id' => $beer->id, 'sku' => 'BW-001', 'brand' => 'Budweiser', 'name' => 'Beer', 'variants' => [['ပုလင်း', 2]]],
            ['category_id' => $beer->id, 'sku' => 'CO-001', 'brand' => 'Corona', 'name' => 'Beer', 'variants' => [['ပုလင်း', 2]]],
            ['category_id' => $beer->id, 'sku' => 'SG-001', 'brand' => 'Singha', 'name' => 'Beer', 'variants' => [['သံရှည်', 2], ['သံတို', 2]]],
            ['category_id' => $beer->id, 'sku' => 'LO-001', 'brand' => 'Leo', 'name' => 'Beer', 'variants' => [['သံရှည်', 2], ['သံတို', 2]]],
            ['category_id' => $beer->id, 'sku' => 'HN-001', 'brand' => 'Heineken', 'name' => 'Beer', 'variants' => [['ပုလင်းရှည်', 2], ['ပုလင်းတို', 2], ['သံရှည်', 2], ['သံတို', 2]]],
            ['category_id' => $beer->id, 'sku' => 'AB-001', 'brand' => 'ABC', 'name' => 'Beer', 'variants' => [['ပုလင်း', 2], ['သံဘူး', 2]]],
            ['category_id' => $beer->id, 'sku' => 'TG-001', 'brand' => 'Tiger', 'name' => 'Beer', 'variants' => [['ပုလင်းရှည်', 2], ['ပုလင်းတို', 2], ['သံရှည်', 2], ['သံတို', 2]]],
            ['category_id' => $beer->id, 'sku' => 'TG-002', 'brand' => 'Tiger', 'name' => 'Crystal', 'variants' => [['ပုလင်း', 2], ['သံဘူး', 2]]],
            ['category_id' => $beer->id, 'sku' => 'TG-003', 'brand' => 'Tiger', 'name' => 'Super', 'variants' => [['ပုလင်း', 2], ['သံဘူး', 2]]],
            ['category_id' => $beer->id, 'sku' => 'TG-004', 'brand' => 'Tiger', 'name' => 'Soju', 'variants' => [['ပုလင်း', 2], ['သံဘူး', 2]]],
            ['category_id' => $beer->id, 'sku' => 'BV-001', 'brand' => 'Bavaria', 'name' => 'Beer', 'variants' => [['ပုလင်း', 2], ['သံရှည်', 2], ['သံတို', 2]]],
            ['category_id' => $beer->id, 'sku' => 'R7-001', 'brand' => 'R7', 'name' => 'အပြာ', 'variants' => [['သံရှည်', 2], ['သံတို', 2]]],
            ['category_id' => $beer->id, 'sku' => 'R7-002', 'brand' => 'R7', 'name' => 'အနီ', 'variants' => [['သံရှည်', 2], ['သံတို', 2]]],
            ['category_id' => $beer->id, 'sku' => 'BW-002', 'brand' => 'Bawdar', 'name' => 'Beer', 'variants' => []],

            // ---------- Soju (ဆိုလ်ဂျူး) ----------
            ['category_id' => $soju->id, 'sku' => 'BO-001', 'brand' => 'Bora', 'name' => 'Soju', 'variants' => []],
            ['category_id' => $soju->id, 'sku' => 'JE-001', 'brand' => 'Joei', 'name' => 'Soju', 'variants' => []],
            ['category_id' => $soju->id, 'sku' => 'GB-001', 'brand' => 'Geonbae', 'name' => 'Soju', 'variants' => []],
            ['category_id' => $soju->id, 'sku' => 'CG-001', 'brand' => 'Chingu', 'name' => 'Soju', 'variants' => []],

            // ---------- Wine (ဝိုင်) ----------
            ['category_id' => $wine->id, 'sku' => 'FM-001', 'brand' => 'Fullmoon', 'name' => 'Wine', 'variants' => []],
            ['category_id' => $wine->id, 'sku' => 'MW-001', 'brand' => 'MayMyoWine', 'name' => 'Wine', 'variants' => []],

            // ---------- Soft Drink (အချိုရည်) ----------
            ['category_id' => $softdrink->id, 'sku' => 'A1-001', 'brand' => 'A1', 'name' => 'Drink', 'variants' => [['မန်ကျည်း ပုလင်း', 2], ['ရှန်ပိန် ပုလင်း', 2], ['စပျင် ပုလင်း', 2], ['သံပရာ ပုလင်း', 2]]],
            ['category_id' => $softdrink->id, 'sku' => 'BL-001', 'brand' => 'Blink', 'name' => 'Energy Drink', 'variants' => []],
            ['category_id' => $softdrink->id, 'sku' => 'RRB-001', 'brand' => 'RRB', 'name' => 'Energy Drink', 'variants' => []],
            ['category_id' => $softdrink->id, 'sku' => 'PP-001', 'brand' => 'Pop', 'name' => 'Soda', 'variants' => []],
            ['category_id' => $softdrink->id, 'sku' => 'DG-004', 'brand' => 'Dagon', 'name' => 'Soda', 'variants' => []],
            ['category_id' => $softdrink->id, 'sku' => 'VM-001', 'brand' => 'Vitamilk', 'name' => 'Soy Milk', 'variants' => []],
            ['category_id' => $softdrink->id, 'sku' => 'EV-001', 'brand' => 'Enervit', 'name' => 'Energy Drink', 'variants' => []],
            ['category_id' => $softdrink->id, 'sku' => 'CL-001', 'brand' => 'Color', 'name' => 'Cola', 'variants' => [['1.25L', 4], ['500ml', 5], ['350ml', 5], ['200ml', 5]]],
            ['category_id' => $softdrink->id, 'sku' => 'HG-001', 'brand' => 'Honey Gold', 'name' => 'Drink', 'variants' => []],
            ['category_id' => $softdrink->id, 'sku' => 'SK-001', 'brand' => 'Sunkist', 'name' => 'Soft Drink', 'variants' => [['1.5L', 4], ['Can', 2], ['350ml', 5]]],
            ['category_id' => $softdrink->id, 'sku' => 'MR-001', 'brand' => 'Mirinda', 'name' => 'Soft Drink', 'variants' => [['Can', 2]]],
            ['category_id' => $softdrink->id, 'sku' => 'M1-001', 'brand' => 'M-150', 'name' => 'Energy Drink', 'variants' => []],
            ['category_id' => $softdrink->id, 'sku' => 'CRB-001', 'brand' => 'Carabao', 'name' => 'Energy Drink', 'variants' => [['Can', 2]]],
            ['category_id' => $softdrink->id, 'sku' => 'FD-001', 'brand' => 'Fire Dragon', 'name' => 'Energy Drink', 'variants' => [['သံဘူးတိုး', 2], ['ကော်ဘူး ကလစ်', 2], ['ကော်ဘူး', 2]]],
            ['category_id' => $softdrink->id, 'sku' => 'SP-001', 'brand' => 'Speed', 'name' => 'Energy Drink', 'variants' => [['သံဘူးကြီး', 2], ['ကော်ဘူး', 2]]],
            ['category_id' => $softdrink->id, 'sku' => 'LP-001', 'brand' => 'Lipo', 'name' => 'Energy Drink', 'variants' => [['ပုလင်း', 2]]],
            ['category_id' => $softdrink->id, 'sku' => 'CV-001', 'brand' => 'C-Vitt', 'name' => 'Vitamin Drink', 'variants' => [['ပုလင်း', 2]]],
            ['category_id' => $softdrink->id, 'sku' => 'SH-001', 'brand' => 'Shark', 'name' => 'Energy Drink', 'variants' => [['ပုလင်း', 2], ['သံဘူး', 2]]],
            ['category_id' => $softdrink->id, 'sku' => 'LD-001', 'brand' => 'Lucky Day', 'name' => 'Coffee', 'variants' => []],
            ['category_id' => $softdrink->id, 'sku' => 'UF-001', 'brand' => 'UFC', 'name' => 'Drink', 'variants' => []],
            ['category_id' => $softdrink->id, 'sku' => 'SD-001', 'brand' => 'Sunday', 'name' => 'Drink', 'variants' => []],
            ['category_id' => $softdrink->id, 'sku' => 'LS-001', 'brand' => 'Lactasoy', 'name' => 'Soy Milk', 'variants' => [['300ml', 5], ['1000ml', 5]]],
            ['category_id' => $softdrink->id, 'sku' => 'ML-001', 'brand' => 'Milo', 'name' => 'Chocolate Malt', 'variants' => [['165ml', 5], ['110ml', 5]]],
            ['category_id' => $softdrink->id, 'sku' => 'OV-001', 'brand' => 'Ovaltine', 'name' => 'Chocolate Malt', 'variants' => [['165ml', 5], ['110ml', 5]]],
            ['category_id' => $softdrink->id, 'sku' => 'VT-001', 'brand' => 'Vita', 'name' => 'Drink', 'variants' => [['ဘူးသေး 125ml', 5], ['ကော်ဘူး 350ml', 5]]],
            ['category_id' => $softdrink->id, 'sku' => 'YK-001', 'brand' => 'Yoko', 'name' => 'Drink', 'variants' => [['ဘူးသေး', 2]]],
            ['category_id' => $softdrink->id, 'sku' => 'MX-001', 'brand' => 'Max Plus', 'name' => 'Drink', 'variants' => [['200ml', 5], ['250ml', 5], ['500ml', 5]]],
            ['category_id' => $softdrink->id, 'sku' => 'VC-001', 'brand' => 'V Cola', 'name' => 'Cola', 'variants' => [['330ml', 5], ['1.25L', 4]]],
            ['category_id' => $softdrink->id, 'sku' => 'DP-001', 'brand' => 'D-POP', 'name' => 'Drink', 'variants' => [['350ml', 5]]],
            ['category_id' => $softdrink->id, 'sku' => 'AL-001', 'brand' => 'Alpine', 'name' => 'Drink', 'variants' => [['Energy Drink', 2], ['Vitamin C', 2]]],
            ['category_id' => $softdrink->id, 'sku' => 'HK-001', 'brand' => 'Hikari', 'name' => 'Drink', 'variants' => []],
            ['category_id' => $softdrink->id, 'sku' => 'RD-001', 'brand' => 'Royal-D', 'name' => 'Drink', 'variants' => []],
            ['category_id' => $softdrink->id, 'sku' => 'RG-001', 'brand' => 'Regen-D', 'name' => 'Drink', 'variants' => []],
            ['category_id' => $softdrink->id, 'sku' => 'PE-001', 'brand' => 'Pepsi', 'name' => 'Cola', 'variants' => [['သံဘူး', 2], ['ကော်ဘူး 350ml', 5], ['Zero Sugar', 2]]],
            ['category_id' => $softdrink->id, 'sku' => 'ST-001', 'brand' => 'Sting', 'name' => 'Energy Drink', 'variants' => [['နီ', 2], ['ဝါ', 2]]],
            ['category_id' => $softdrink->id, 'sku' => 'BM-001', 'brand' => 'Blue Mountain', 'name' => 'Drink', 'variants' => [['350ml', 5], ['200ml', 5]]],
            ['category_id' => $softdrink->id, 'sku' => 'AD-001', 'brand' => 'Asia Delight', 'name' => 'Drink', 'variants' => []],
            ['category_id' => $softdrink->id, 'sku' => 'AS-001', 'brand' => 'Asia', 'name' => 'ပင်မည့်', 'variants' => []],
            ['category_id' => $softdrink->id, 'sku' => 'AS-002', 'brand' => 'Asia', 'name' => 'လိုင်ချီး', 'variants' => []],
            ['category_id' => $softdrink->id, 'sku' => 'YS-001', 'brand' => 'Yoshi', 'name' => 'Drink', 'variants' => []],
            ['category_id' => $softdrink->id, 'sku' => 'STM-001', 'brand' => '', 'name' => 'သူဌေးမင်း', 'variants' => [['သီးစုံ ဗူး', 2], ['ကတော့', 2], ['ဘူးလတ်', 2]]],
            ['category_id' => $softdrink->id, 'sku' => 'HE-001', 'brand' => '', 'name' => 'Hello အရေခဲချောင်း', 'variants' => []],
            ['category_id' => $softdrink->id, 'sku' => 'WH-001', 'brand' => '', 'name' => 'ဝါးဟားဟား', 'variants' => [['ကန်တော့ပုံ', 2], ['နနတ်သီး', 2], ['ရေခဲမုန့်', 2]]],
            ['category_id' => $softdrink->id, 'sku' => 'MS-001', 'brand' => '', 'name' => 'မန်းရှယ်', 'variants' => [['ပုလင်း', 2]]],
            ['category_id' => $softdrink->id, 'sku' => 'MM-001', 'brand' => '', 'name' => 'မန်းမန်ကျည်း', 'variants' => [['ပုလင်း', 2], ['ကော်ဘူး', 2]]],
            ['category_id' => $softdrink->id, 'sku' => 'JK-001', 'brand' => '', 'name' => 'ဂျော်ကီ', 'variants' => [['ပုလင်း', 2]]],
            ['category_id' => $softdrink->id, 'sku' => 'ZE-001', 'brand' => '', 'name' => 'ဇေ', 'variants' => [['ပုလင်း', 2], ['ကော်ဘူး', 2]]],
            ['category_id' => $softdrink->id, 'sku' => 'SA-001', 'brand' => 'Sandar Aung', 'name' => 'Drink', 'variants' => [['ပုလင်း', 2], ['ကော်ဘူး', 2]]],

            // ---------- Water (ရေသန့်) ----------
            ['category_id' => $water->id, 'sku' => 'JP-001', 'brand' => 'Jasper', 'name' => 'Water', 'variants' => []],
            ['category_id' => $water->id, 'sku' => 'LF-001', 'brand' => 'Life', 'name' => 'Water', 'variants' => [['1L', 4], ['0.6L', 4]]],

            // ---------- Snacks (မုန့်မျိုးစုံ) ----------
            ['category_id' => $snacks->id, 'sku' => 'MC-001', 'brand' => 'My Chip', 'name' => 'Chips', 'variants' => [['ဘူးကြီး', 2], ['ဘူးသေး', 2], ['အထုပ်', 1]]],
            ['category_id' => $snacks->id, 'sku' => 'OS-001', 'brand' => 'Oshi', 'name' => 'Snack', 'variants' => []],
            ['category_id' => $snacks->id, 'sku' => 'TK-001', 'brand' => '3+2', 'name' => 'Biscuit', 'variants' => []],
            ['category_id' => $snacks->id, 'sku' => 'PT-001', 'brand' => '', 'name' => '၂၀၀ တန်', 'variants' => []],
            ['category_id' => $snacks->id, 'sku' => 'PT-002', 'brand' => '', 'name' => '၃၀၀ တန်', 'variants' => []],
            ['category_id' => $snacks->id, 'sku' => 'PT-003', 'brand' => '', 'name' => '၆၀၀ တန်', 'variants' => []],
            ['category_id' => $snacks->id, 'sku' => 'PT-004', 'brand' => '', 'name' => '၇၀၀ တန်', 'variants' => []],
            ['category_id' => $snacks->id, 'sku' => 'PT-005', 'brand' => '', 'name' => '၈၀၀ တန်', 'variants' => []],
            ['category_id' => $snacks->id, 'sku' => 'PT-006', 'brand' => '', 'name' => '၁၀၀၀ တန်', 'variants' => []],
            ['category_id' => $snacks->id, 'sku' => 'PT-007', 'brand' => '', 'name' => '၁၂၀၀ တန်', 'variants' => []],
            ['category_id' => $snacks->id, 'sku' => 'PT-008', 'brand' => '', 'name' => '၁၅၀၀ တန်', 'variants' => []],

            // ---------- Noodles (ခေါက်ဆွဲခြောက်) ----------
            ['category_id' => $noodles->id, 'sku' => 'ND-001', 'brand' => '', 'name' => 'ယိုးဒယား မျက်လုံး', 'variants' => []],
            ['category_id' => $noodles->id, 'sku' => 'JB-001', 'brand' => 'Jumbo', 'name' => 'Noodle', 'variants' => []],
            ['category_id' => $noodles->id, 'sku' => 'XC-001', 'brand' => 'X-cite', 'name' => 'Noodle', 'variants' => []],
            ['category_id' => $noodles->id, 'sku' => 'OG-001', 'brand' => 'OMG', 'name' => 'Noodle', 'variants' => []],
            ['category_id' => $noodles->id, 'sku' => 'MZ-001', 'brand' => 'MAMA', 'name' => 'Noodle', 'variants' => [['ချဉ်စပ်', 1], ['ဆီချက်', 1], ['တုံယမ်း', 1]]],
            ['category_id' => $noodles->id, 'sku' => 'YY-001', 'brand' => 'Yum Yum', 'name' => 'Noodle', 'variants' => [['ချဉ်စပ်', 1]]],
            ['category_id' => $noodles->id, 'sku' => 'XX-001', 'brand' => 'XOXO', 'name' => 'Noodle', 'variants' => []],
            ['category_id' => $noodles->id, 'sku' => 'ND-002', 'brand' => '', 'name' => 'ယိုးဒယား ကြာဇံ', 'variants' => []],
            ['category_id' => $noodles->id, 'sku' => 'SS-001', 'brand' => 'Shin Shin', 'name' => 'ကြာဇံ', 'variants' => []],
            ['category_id' => $noodles->id, 'sku' => 'UV-001', 'brand' => 'Ultra', 'name' => 'Volcano', 'variants' => []],

            // ---------- Cigarettes (စီးကရက်) ----------
            ['category_id' => $cigarettes->id, 'sku' => 'MV-001', 'brand' => 'Mevius', 'name' => 'Sky Blue', 'variants' => [['အဝါ', 1], ['အပြာ', 1]]],
            ['category_id' => $cigarettes->id, 'sku' => 'WS-001', 'brand' => 'Winston', 'name' => 'Cigarettes', 'variants' => [['Caster', 1], ['Double Blue', 1], ['Purple', 1]]],
            ['category_id' => $cigarettes->id, 'sku' => 'LR-001', 'brand' => 'Lord', 'name' => 'Cigarettes', 'variants' => [['Crystal', 1], ['Premium', 1]]],
            ['category_id' => $cigarettes->id, 'sku' => 'DH-001', 'brand' => 'Dunhill', 'name' => 'Red', 'variants' => []],
            ['category_id' => $cigarettes->id, 'sku' => 'BD-001', 'brand' => 'Black Devil', 'name' => 'Cigarettes', 'variants' => []],
            ['category_id' => $cigarettes->id, 'sku' => 'BF-001', 'brand' => 'Black Fox', 'name' => 'Cigarettes', 'variants' => []],
            ['category_id' => $cigarettes->id, 'sku' => 'RU-001', 'brand' => 'Red Ruby', 'name' => 'Cigarettes', 'variants' => [['အနီ', 1], ['အဝါ', 1]]],
            ['category_id' => $cigarettes->id, 'sku' => 'PG-001', 'brand' => 'Premium Gold', 'name' => 'Cigarettes', 'variants' => []],
            ['category_id' => $cigarettes->id, 'sku' => 'RB-001', 'brand' => 'Red and Blue', 'name' => 'Cigarettes', 'variants' => []],
            ['category_id' => $cigarettes->id, 'sku' => 'OR-001', 'brand' => 'Oris', 'name' => 'Cigarettes', 'variants' => [['ခဲ', 1], ['ရွှေ', 1], ['ပြာ', 1], ['နီ', 1], ['သခွား', 1], ['Iceplus', 1], ['Elite Blue', 1], ['Berry Mix', 1], ['Super Slim ပြာ', 1], ['Cool Fizz', 1], ['Purple Fizz', 1], ['Purple Fizz သေး', 1], ['Summer', 1], ['Deep Mix', 1], ['Tropical Dew', 1]]],
            ['category_id' => $cigarettes->id, 'sku' => 'CP-001', 'brand' => 'Capital', 'name' => 'Cigarettes', 'variants' => [['ပြာ', 1], ['နီ', 1], ['နက်', 1], ['စိမ်း', 1]]],
            ['category_id' => $cigarettes->id, 'sku' => 'O3-001', 'brand' => 'O3', 'name' => 'Cigarettes', 'variants' => [['ဟောင်းပြာ', 1], ['သစ်ပြာ', 1], ['ဟောင်းဝါ', 1]]],
            ['category_id' => $cigarettes->id, 'sku' => 'NP-001', 'brand' => 'Napoli', 'name' => 'Cigarettes', 'variants' => [['ခဲ', 1], ['ရွှေ', 1], ['ပြာ', 1], ['နီ', 1], ['မဲ', 1]]],

            // ---------- Paan (ဖက်ကြမ်း) ----------
            ['category_id' => $paan->id, 'sku' => 'KS-001', 'brand' => '', 'name' => 'ကြယ်နီ', 'variants' => [['အထုပ်', 1]]],
            ['category_id' => $paan->id, 'sku' => 'LW-001', 'brand' => '', 'name' => 'လွင့်', 'variants' => [['အထုပ်', 1]]],
            ['category_id' => $paan->id, 'sku' => 'SM-001', 'brand' => '', 'name' => 'ရွှေဘားမား', 'variants' => [['အထုပ်', 1], ['ဘူး', 2]]],
            ['category_id' => $paan->id, 'sku' => 'SC-001', 'brand' => '', 'name' => 'စကားဝါ', 'variants' => []],
            ['category_id' => $paan->id, 'sku' => 'MK-001', 'brand' => '', 'name' => 'မယ်ခွေ Strong', 'variants' => [['4 rolls', 7], ['10 rolls', 7]]],
            ['category_id' => $paan->id, 'sku' => 'MK-002', 'brand' => '', 'name' => 'မယ်ခွေ Smooth', 'variants' => [['4 rolls', 7], ['10 rolls', 7]]],
            ['category_id' => $paan->id, 'sku' => 'SM-002', 'brand' => '', 'name' => 'ရွှေမန်းသူ', 'variants' => [['ဘူး', 2], ['အထုပ်', 1]]],

            // ---------- Other (အခြား) ----------
            ['category_id' => $other->id, 'sku' => 'TS-001', 'brand' => '', 'name' => 'Tissue', 'variants' => [['ကြီး', 2]]],
        ];

        foreach ($products as $product) {
            $variants = $product['variants'];
            unset($product['variants']);

            if (($product['brand'] ?? '') !== ($product['name'] ?? '')) {
                $product['name'] = trim(($product['brand'] ?? '').' - '.($product['name'] ?? ''), ' -');
            }

            $created = Product::updateOrCreate(['sku' => $product['sku']], $product);

            $usedCodes = [];
            foreach ($variants as $i => $variant) {
                [$variantName, $unitId] = $variant;
                $code = $this->variantCode($variantName);
                if ($code === null || in_array($code, $usedCodes, true)) {
                    $code = 'V'.($i + 1);
                }
                $usedCodes[] = $code;

                ProductVariant::updateOrCreate(
                    ['product_id' => $created->id, 'name' => $variantName],
                    [
                        'unit_id' => $unitId,
                        'image' => '',
                        'sku' => $created->sku.'-'.$code,
                        'units_per_package' => 1,
                        'cost_price' => 0,
                        'selling_price' => 0,
                        'per_unit_price' => 0,
                        'stock_quantity' => 0,
                        'min_stock_level' => 0,
                        'max_stock_level' => null,
                        'is_active' => true,
                    ]
                );
            }

            if (empty($variants)) {
                ProductVariant::where('product_id', $created->id)->delete();
            } else {
                ProductVariant::where('product_id', $created->id)
                    ->whereNotIn('name', array_column($variants, 0))
                    ->delete();
            }
        }
    }

    private function variantCode(string $name): ?string
    {
        $code = strtoupper(preg_replace('/[^A-Za-z0-9.]/', '', $name) ?? '');

        return $code === '' ? null : $code;
    }
}
