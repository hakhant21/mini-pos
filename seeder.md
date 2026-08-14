# Seeder Data

> Generated from the database using `User::all`, `Unit::all`, `Category::all`, `Product::all`, and `ProductVariant::all`.

## UserSeeder (`User::all`)

| ID | Name | Email | Role | Created At | Updated At |
|----|------|-------|------|------------|------------|
| 1 | Admin | admin@gmail.com | admin | 2026-08-14 07:50:38 | 2026-08-14 07:50:38 |
| 2 | Cashier | cashier@gmail.com | cashier | 2026-08-14 07:50:38 | 2026-08-14 07:50:38 |

## UnitSeeder (`Unit::all`)

| ID | Name | Abbreviation | Created At | Updated At |
|----|------|--------------|------------|------------|
| 1 | အထုပ် | pack | 2026-07-20 16:47:12 | 2026-07-20 16:49:07 |
| 2 | ဘူး | can | 2026-07-20 16:47:18 | 2026-07-20 16:49:48 |
| 4 | လီတာ | li | 2026-07-20 16:47:37 | 2026-07-20 16:48:57 |
| 5 | မီလီ လီတာ | ml | 2026-07-20 16:47:50 | 2026-07-20 16:48:48 |
| 6 | ပက် | shot | 2026-07-20 16:47:50 | 2026-07-20 16:48:48 |
| 7 | လိပ် | lt | 2026-07-20 16:47:50 | 2026-07-20 16:48:48 |

## CategorySeeder (`Category::all`)

| ID | Name | Slug | Description | Is Active | Deleted At | Created At | Updated At |
|----|------|------|-------------|-----------|------------|------------|------------|
| 1 | ဖက်ကြမ်း | paetkyan | ဖက်ကြမ်း | true |  | 2026-07-20 15:52:21 | 2026-07-20 15:52:21 |
| 2 | စီးကရက် | cigarettes | စီးကရက် | true |  | 2026-07-20 15:53:57 | 2026-07-20 15:55:14 |
| 3 | ဘီယာ | baiya | ဘီယာ | true |  | 2026-07-20 15:54:31 | 2026-07-20 15:54:31 |
| 4 | အရက် | ayaet | အရက် | true |  | 2026-07-20 15:54:35 | 2026-07-20 15:54:42 |
| 5 | အချိုရည် | akhyaoyai | အချိုရည် | true |  | 2026-07-20 15:59:06 | 2026-07-20 15:59:06 |
| 6 | ဆိုလ်ဂျူး | saolgyau | ဆိုလ်ဂျူး | true |  | 2026-07-20 16:03:33 | 2026-07-20 16:03:33 |
| 7 | ဝိုင် | waing | ဝိုင် | true |  | 2026-07-20 16:03:46 | 2026-07-20 16:03:46 |
| 8 | ရေသန့် | yaethan | ရေသန့် | true |  | 2026-07-20 16:06:11 | 2026-07-20 16:06:11 |
| 9 | ခေါက်ဆွဲခြောက် | khawetsawekhyauk | ခေါက်ဆွဲခြောက် | true |  | 2026-07-20 16:07:25 | 2026-07-20 16:07:25 |
| 10 | မုန့်မျိုးစုံ | montmyosone | မုန့်မျိုးစုံ | true |  | 2026-07-20 16:07:25 | 2026-07-20 16:07:25 |
| 11 | အခြား | acharr | အခြား | true |  | 2026-07-20 16:07:25 | 2026-07-20 16:07:25 |

## ProductSeeder (`Product::all`)

### ဖက်ကြမ်း (slug: paetkyan, id: 1)

| ID | SKU | Brand | Name | Variants Count | Is Active |
|----|-----|-------|------|----------------|-----------|
| 160 | KS-001 |  | ကြယ်နီ | 1 | true |
| 161 | LW-001 |  | လွင့် | 1 | true |
| 164 | MK-001 |  | မယ်ခွေ Strong | 2 | true |
| 165 | MK-002 |  | မယ်ခွေ Smooth | 2 | true |
| 163 | SC-001 |  | စကားဝါ | 0 | true |
| 162 | SM-001 |  | ရွှေဘားမား | 2 | true |
| 166 | SM-002 |  | ရွှေမန်းသူ | 2 | true |

### စီးကရက် (slug: cigarettes, id: 2)

| ID | SKU | Brand | Name | Variants Count | Is Active |
|----|-----|-------|------|----------------|-----------|
| 151 | BD-001 | Black Devil | Black Devil - Cigarettes | 0 | true |
| 152 | BF-001 | Black Fox | Black Fox - Cigarettes | 0 | true |
| 157 | CP-001 | Capital | Capital - Cigarettes | 4 | true |
| 150 | DH-001 | Dunhill | Dunhill - Red | 0 | true |
| 149 | LR-001 | Lord | Lord - Cigarettes | 2 | true |
| 147 | MV-001 | Mevius | Mevius - Sky Blue | 2 | true |
| 159 | NP-001 | Napoli | Napoli - Cigarettes | 5 | true |
| 158 | O3-001 | O3 | O3 - Cigarettes | 3 | true |
| 156 | OR-001 | Oris | Oris - Cigarettes | 15 | true |
| 154 | PG-001 | Premium Gold | Premium Gold - Cigarettes | 0 | true |
| 155 | RB-001 | Red and Blue | Red and Blue - Cigarettes | 0 | true |
| 153 | RU-001 | Red Ruby | Red Ruby - Cigarettes | 2 | true |
| 148 | WS-001 | Winston | Winston - Cigarettes | 3 | true |

### ဘီယာ (slug: baiya, id: 3)

| ID | SKU | Brand | Name | Variants Count | Is Active |
|----|-----|-------|------|----------------|-----------|
| 61 | AB-001 | ABC | ABC - Beer | 2 | true |
| 44 | AG-001 | Andaman Gold | Andaman Gold - Beer | 6 | true |
| 47 | AR-002 | Army | Army - Beer | 2 | true |
| 51 | BE-001 | Black Eagle | Black Eagle - Beer | 1 | true |
| 43 | BS-001 | Black Shield | Black Shield - Beer | 2 | true |
| 66 | BV-001 | Bavaria | Bavaria - Beer | 3 | true |
| 56 | BW-001 | Budweiser | Budweiser - Beer | 1 | true |
| 69 | BW-002 | Bawdar | Bawdar - Beer | 0 | true |
| 49 | CB-001 | Carlsberg | Carlsberg - Beer | 4 | true |
| 45 | CH-001 | Chang | Chang - Beer | 3 | true |
| 57 | CO-001 | Corona | Corona - Beer | 1 | true |
| 46 | DG-002 | Dagon | Dagon - Beer | 6 | true |
| 53 | DG-003 | Dagon | Dagon - Super Beer | 1 | true |
| 60 | HN-001 | Heineken | Heineken - Beer | 4 | true |
| 41 | KN-001 | Keen | Keen - Beer | 4 | true |
| 59 | LO-001 | Leo | Leo - Beer | 2 | true |
| 55 | MD-006 | Mandalay | Mandalay - Beer | 8 | true |
| 42 | MY-001 | Myanmar | Myanmar - Beer | 5 | true |
| 67 | R7-001 | R7 | R7 - အပြာ | 2 | true |
| 68 | R7-002 | R7 | R7 - အနီ | 2 | true |
| 38 | SE-001 | Sir Edward's | Sir Edward's - Smoky | 0 | true |
| 39 | SE-002 | Sir Edward's | Sir Edward's - Finest | 0 | true |
| 40 | SE-003 | Sir Edward's | Sir Edward's - Beer Reserve | 0 | true |
| 58 | SG-001 | Singha | Singha - Beer | 2 | true |
| 48 | TB-001 | Tuborg | Tuborg - Beer | 3 | true |
| 62 | TG-001 | Tiger | Tiger - Beer | 4 | true |
| 63 | TG-002 | Tiger | Tiger - Crystal | 2 | true |
| 64 | TG-003 | Tiger | Tiger - Super | 2 | true |
| 65 | TG-004 | Tiger | Tiger - Soju | 2 | true |
| 52 | TP-001 | Tapper | Tapper - Beer | 2 | true |
| 54 | YG-001 | Yagon | Yagon - Beer | 2 | true |
| 50 | YM-001 | Yoma | Yoma - Beer | 4 | true |

### အရက် (slug: ayaet, id: 4)

| ID | SKU | Brand | Name | Variants Count | Is Active |
|----|-----|-------|------|----------------|-----------|
| 24 | AR-001 | Army | Army - Rum | 1 | true |
| 31 | BI-001 | Black Icon | Black Icon | 1 | true |
| 15 | BR-001 | Brother | Brother - Smooth | 4 | true |
| 30 | CR-001 | Chivas Regal | Chivas Regal - 12 Year | 1 | true |
| 32 | DF-001 | Dunfife | Dunfife - အပြာ | 1 | true |
| 33 | DF-002 | Dunfife | Dunfife - အနီ | 1 | true |
| 25 | DG-001 | Dagon | Dagon - Rum | 1 | true |
| 13 | EM-001 | Empire | Empire - Rum | 1 | true |
| 1 | GM-001 | Glan Master | Glan Master - အဝါ | 5 | true |
| 2 | GM-002 | Glan Master | Glan Master - အနီ | 5 | true |
| 3 | GM-003 | Glan Master | Glan Master - အပြာ | 5 | true |
| 8 | GR-001 | Grand Royal | Grand Royal - Double Gold | 0 | true |
| 9 | GR-002 | Grand Royal | Grand Royal - Sherry Cask | 3 | true |
| 10 | GR-003 | Grand Royal | Grand Royal - Shwe | 3 | true |
| 11 | GR-004 | Grand Royal | Grand Royal - Signature Blue | 3 | true |
| 12 | GR-005 | Grand Royal | Grand Royal - Smooth | 5 | true |
| 14 | GR-006 | Grand Royal | Grand Royal - Black | 4 | true |
| 34 | JM-001 | Jägermeister | Jägermeister | 2 | true |
| 26 | JW-001 | Johnnie Walker | Johnnie Walker - Blue Label | 1 | true |
| 27 | JW-002 | Johnnie Walker | Johnnie Walker - Double Black | 1 | true |
| 28 | JW-003 | Johnnie Walker | Johnnie Walker - Black Label | 1 | true |
| 29 | JW-004 | Johnnie Walker | Johnnie Walker - Red Label | 1 | true |
| 35 | KH-001 |  | ခေါင်ရည်ဘုရင် ၂ဆ | 0 | true |
| 36 | KT-001 |  | ကိုးတောင်ကျား | 1 | true |
| 7 | MA-001 | MacArthur's | MacArthur's - Whiskey | 0 | true |
| 16 | MD-001 | Mandalay | Mandalay - Rum Sherry | 2 | true |
| 17 | MD-002 | Mandalay | Mandalay - 3 Year Export | 2 | true |
| 18 | MD-003 | Mandalay | Mandalay - Coffee Rum | 3 | true |
| 19 | MD-004 | Mandalay | Mandalay - White Rum | 3 | true |
| 20 | MD-005 | Mandalay | Mandalay - Rum | 1 | true |
| 21 | MD-007 | Mandalay | Mandalay - Rum Gold | 2 | true |
| 22 | MY-002 | Myanmar | Myanmar - Rum Celebration | 0 | true |
| 23 | MY-003 | Myanmar | Myanmar - Dry Gin | 0 | true |
| 4 | RC-001 | Royal Club | Royal Club - အစိမ်း | 5 | true |
| 5 | RC-002 | Royal Club | Royal Club - အပြာ | 5 | true |
| 6 | RC-003 | Royal Club | Royal Club - အဝါ | 5 | true |
| 37 | SM-003 |  | စစ်မြင်း | 2 | true |

### အချိုရည် (slug: akhyaoyai, id: 5)

| ID | SKU | Brand | Name | Variants Count | Is Active |
|----|-----|-------|------|----------------|-----------|
| 76 | A1-001 | A1 | A1 - Drink | 4 | true |
| 112 | AD-001 | Asia Delight | Asia Delight - Drink | 0 | true |
| 105 | AL-001 | Alpine | Alpine - Drink | 2 | true |
| 113 | AS-001 | Asia | Asia - ပင်မည့် | 0 | true |
| 114 | AS-002 | Asia | Asia - လိုင်ချီး | 0 | true |
| 77 | BL-001 | Blink | Blink - Energy Drink | 0 | true |
| 111 | BM-001 | Blue Mountain | Blue Mountain - Drink | 2 | true |
| 83 | CL-001 | Color | Color - Cola | 4 | true |
| 88 | CRB-001 | Carabao | Carabao - Energy Drink | 1 | true |
| 92 | CV-001 | C-Vitt | C-Vitt - Vitamin Drink | 1 | true |
| 80 | DG-004 | Dagon | Dagon - Soda | 0 | true |
| 104 | DP-001 | D-POP | D-POP - Drink | 1 | true |
| 82 | EV-001 | Enervit | Enervit - Energy Drink | 0 | true |
| 89 | FD-001 | Fire Dragon | Fire Dragon - Energy Drink | 3 | true |
| 117 | HE-001 |  | Hello အရေခဲချောင်း | 0 | true |
| 84 | HG-001 | Honey Gold | Honey Gold - Drink | 0 | true |
| 106 | HK-001 | Hikari | Hikari - Drink | 0 | true |
| 121 | JK-001 |  | ဂျော်ကီ | 1 | true |
| 94 | LD-001 | Lucky Day | Lucky Day - Coffee | 0 | true |
| 91 | LP-001 | Lipo | Lipo - Energy Drink | 1 | true |
| 97 | LS-001 | Lactasoy | Lactasoy - Soy Milk | 2 | true |
| 87 | M1-001 | M-150 | M-150 - Energy Drink | 0 | true |
| 98 | ML-001 | Milo | Milo - Chocolate Malt | 2 | true |
| 120 | MM-001 |  | မန်းမန်ကျည်း | 2 | true |
| 86 | MR-001 | Mirinda | Mirinda - Soft Drink | 1 | true |
| 119 | MS-001 |  | မန်းရှယ် | 1 | true |
| 102 | MX-001 | Max Plus | Max Plus - Drink | 3 | true |
| 99 | OV-001 | Ovaltine | Ovaltine - Chocolate Malt | 2 | true |
| 109 | PE-001 | Pepsi | Pepsi - Cola | 3 | true |
| 79 | PP-001 | Pop | Pop - Soda | 0 | true |
| 107 | RD-001 | Royal-D | Royal-D - Drink | 0 | true |
| 108 | RG-001 | Regen-D | Regen-D - Drink | 0 | true |
| 78 | RRB-001 | RRB | RRB - Energy Drink | 0 | true |
| 123 | SA-001 | Sandar Aung | Sandar Aung - Drink | 2 | true |
| 96 | SD-001 | Sunday | Sunday - Drink | 0 | true |
| 93 | SH-001 | Shark | Shark - Energy Drink | 2 | true |
| 85 | SK-001 | Sunkist | Sunkist - Soft Drink | 3 | true |
| 90 | SP-001 | Speed | Speed - Energy Drink | 2 | true |
| 110 | ST-001 | Sting | Sting - Energy Drink | 2 | true |
| 116 | STM-001 |  | သူဌေးမင်း | 3 | true |
| 95 | UF-001 | UFC | UFC - Drink | 0 | true |
| 103 | VC-001 | V Cola | V Cola - Cola | 2 | true |
| 81 | VM-001 | Vitamilk | Vitamilk - Soy Milk | 0 | true |
| 100 | VT-001 | Vita | Vita - Drink | 2 | true |
| 118 | WH-001 |  | ဝါးဟားဟား | 3 | true |
| 101 | YK-001 | Yoko | Yoko - Drink | 1 | true |
| 115 | YS-001 | Yoshi | Yoshi - Drink | 0 | true |
| 122 | ZE-001 |  | ဇေ | 2 | true |

### ဆိုလ်ဂျူး (slug: saolgyau, id: 6)

| ID | SKU | Brand | Name | Variants Count | Is Active |
|----|-----|-------|------|----------------|-----------|
| 70 | BO-001 | Bora | Bora - Soju | 0 | true |
| 73 | CG-001 | Chingu | Chingu - Soju | 0 | true |
| 72 | GB-001 | Geonbae | Geonbae - Soju | 0 | true |
| 71 | JE-001 | Joei | Joei - Soju | 0 | true |

### ဝိုင် (slug: waing, id: 7)

| ID | SKU | Brand | Name | Variants Count | Is Active |
|----|-----|-------|------|----------------|-----------|
| 74 | FM-001 | Fullmoon | Fullmoon - Wine | 0 | true |
| 75 | MW-001 | MayMyoWine | MayMyoWine - Wine | 0 | true |

### ရေသန့် (slug: yaethan, id: 8)

| ID | SKU | Brand | Name | Variants Count | Is Active |
|----|-----|-------|------|----------------|-----------|
| 124 | JP-001 | Jasper | Jasper - Water | 0 | true |
| 125 | LF-001 | Life | Life - Water | 2 | true |

### ခေါက်ဆွဲခြောက် (slug: khawetsawekhyauk, id: 9)

| ID | SKU | Brand | Name | Variants Count | Is Active |
|----|-----|-------|------|----------------|-----------|
| 138 | JB-001 | Jumbo | Jumbo - Noodle | 0 | true |
| 141 | MZ-001 | MAMA | MAMA - Noodle | 3 | true |
| 137 | ND-001 |  | ယိုးဒယား မျက်လုံး | 0 | true |
| 144 | ND-002 |  | ယိုးဒယား ကြာဇံ | 0 | true |
| 140 | OG-001 | OMG | OMG - Noodle | 0 | true |
| 145 | SS-001 | Shin Shin | Shin Shin - ကြာဇံ | 0 | true |
| 146 | UV-001 | Ultra | Ultra - Volcano | 0 | true |
| 139 | XC-001 | X-cite | X-cite - Noodle | 0 | true |
| 143 | XX-001 | XOXO | XOXO - Noodle | 0 | true |
| 142 | YY-001 | Yum Yum | Yum Yum - Noodle | 1 | true |

### မုန့်မျိုးစုံ (slug: montmyosone, id: 10)

| ID | SKU | Brand | Name | Variants Count | Is Active |
|----|-----|-------|------|----------------|-----------|
| 168 | -0168 | လေးကျော် | လေးကျော် | 2 | true |
| 169 | -0169 | အပျိုကြီး | အပျိုကြီး | 2 | true |
| 126 | MC-001 | My Chip | My Chip - Chips | 3 | true |
| 127 | OS-001 | Oshi | Oshi - Snack | 0 | true |
| 129 | PT-001 |  | ၂၀၀ တန် | 6 | true |
| 130 | PT-002 |  | ၃၀၀ တန် | 0 | true |
| 131 | PT-003 |  | ၆၀၀ တန် | 6 | true |
| 132 | PT-004 |  | ၇၀၀ တန် | 0 | true |
| 133 | PT-005 |  | ၈၀၀ တန် | 1 | true |
| 134 | PT-006 |  | ၁၀၀၀ တန် | 6 | true |
| 135 | PT-007 |  | ၁၂၀၀ တန် | 1 | true |
| 136 | PT-008 |  | ၁၅၀၀ တန် | 2 | true |
| 128 | TK-001 | 3+2 | 3+2 - Biscuit | 0 | true |

### အခြား (slug: acharr, id: 11)

| ID | SKU | Brand | Name | Variants Count | Is Active |
|----|-----|-------|------|----------------|-----------|
| 167 | TS-001 |  | Tissue | 1 | true |

## Product Variants (`ProductVariant::all`)

| ID | Product SKU | Name | Unit | Variant SKU | Units/Pkg | Cost Price | Selling Price | Per Unit Price | Stock Qty | Min Stock | Max Stock | Is Active |
|----|-------------|------|------|-------------|-----------|------------|---------------|----------------|-----------|-----------|-----------|-----------|
| 1 | GM-001 | 1L | li | GM-001-1L | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 2 | GM-001 | 0.7L | li | GM-001-0.7L | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 3 | GM-001 | 350ml | ml | GM-001-350ML | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 4 | GM-001 | 175ml | ml | GM-001-175ML | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 5 | GM-001 | 2ပတ် | pack | GM-001-2 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 6 | GM-002 | 1L | li | GM-002-1L | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 7 | GM-002 | 0.7L | li | GM-002-0.7L | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 8 | GM-002 | 350ml | ml | GM-002-350ML | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 9 | GM-002 | 175ml | ml | GM-002-175ML | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 10 | GM-002 | 2ပတ် | pack | GM-002-2 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 11 | GM-003 | 1L | li | GM-003-1L | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 12 | GM-003 | 0.7L | li | GM-003-0.7L | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 13 | GM-003 | 350ml | ml | GM-003-350ML | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 14 | GM-003 | 175ml | ml | GM-003-175ML | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 15 | GM-003 | 2ပတ် | pack | GM-003-2 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 16 | RC-001 | 1L | li | RC-001-1L | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 17 | RC-001 | 0.7L | li | RC-001-0.7L | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 18 | RC-001 | 350ml | ml | RC-001-350ML | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 19 | RC-001 | 175ml | ml | RC-001-175ML | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 20 | RC-001 | 2ပတ် | pack | RC-001-2 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 21 | RC-002 | 1L | li | RC-002-1L | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 22 | RC-002 | 0.7L | li | RC-002-0.7L | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 23 | RC-002 | 350ml | ml | RC-002-350ML | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 24 | RC-002 | 175ml | ml | RC-002-175ML | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 25 | RC-002 | 2ပတ် | pack | RC-002-2 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 26 | RC-003 | 1L | li | RC-003-1L | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 27 | RC-003 | 0.7L | li | RC-003-0.7L | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 28 | RC-003 | 350ml | ml | RC-003-350ML | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 29 | RC-003 | 175ml | ml | RC-003-175ML | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 30 | RC-003 | 2ပတ် | pack | RC-003-2 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 31 | GR-002 | 0.7L | li | GR-002-0.7L | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 32 | GR-002 | 350ml | ml | GR-002-350ML | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 33 | GR-002 | 175ml | ml | GR-002-175ML | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 34 | GR-003 | 0.7L | li | GR-003-0.7L | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 35 | GR-003 | 350ml | ml | GR-003-350ML | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 36 | GR-003 | 175ml | ml | GR-003-175ML | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 37 | GR-004 | 0.7L | li | GR-004-0.7L | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 38 | GR-004 | 350ml | ml | GR-004-350ML | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 39 | GR-004 | 175ml | ml | GR-004-175ML | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 40 | GR-005 | 1L | li | GR-005-1L | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 41 | GR-005 | 0.7L | li | GR-005-0.7L | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 42 | GR-005 | 350ml | ml | GR-005-350ML | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 43 | GR-005 | 175ml | ml | GR-005-175ML | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 44 | GR-005 | 2ပတ် | pack | GR-005-2 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 45 | EM-001 | 0.7L | li | EM-001-0.7L | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 46 | GR-006 | 1L | li | GR-006-1L | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 47 | GR-006 | 0.7L | li | GR-006-0.7L | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 48 | GR-006 | 350ml | ml | GR-006-350ML | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 49 | GR-006 | 175ml | ml | GR-006-175ML | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 50 | BR-001 | 0.7L | li | BR-001-0.7L | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 51 | BR-001 | 350ml | ml | BR-001-350ML | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 52 | BR-001 | 175ml | ml | BR-001-175ML | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 53 | BR-001 | 200ml | ml | BR-001-200ML | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 54 | MD-001 | 0.7L | li | MD-001-0.7L | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 55 | MD-001 | 350ml | ml | MD-001-350ML | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 56 | MD-002 | 0.7L | li | MD-002-0.7L | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 57 | MD-002 | 350ml | ml | MD-002-350ML | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 58 | MD-003 | 1L | li | MD-003-1L | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 59 | MD-003 | 0.7L | li | MD-003-0.7L | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 60 | MD-003 | 350ml | ml | MD-003-350ML | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 61 | MD-004 | 1L | li | MD-004-1L | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 62 | MD-004 | 0.7L | li | MD-004-0.7L | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 63 | MD-004 | 350ml | ml | MD-004-350ML | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 64 | MD-005 | 0.7L | li | MD-005-0.7L | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 65 | MD-007 | 0.7L | li | MD-007-0.7L | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 66 | MD-007 | 350ml | ml | MD-007-350ML | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 67 | AR-001 | 1L | li | AR-001-1L | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 68 | DG-001 | 1L | li | DG-001-1L | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 69 | JW-001 | 1L | li | JW-001-1L | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 70 | JW-002 | 1L | li | JW-002-1L | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 71 | JW-003 | 1L | li | JW-003-1L | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 72 | JW-004 | 1L | li | JW-004-1L | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 73 | CR-001 | 0.7L | li | CR-001-0.7L | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 74 | BI-001 | 1L | li | BI-001-1L | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 75 | DF-001 | 0.7L | li | DF-001-0.7L | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 76 | DF-002 | 0.7L | li | DF-002-0.7L | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 77 | JM-001 | 1L | li | JM-001-1L | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 78 | JM-001 | 0.7L | li | JM-001-0.7L | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 79 | KT-001 | ဘူး | can | KT-001-V1 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 80 | SM-003 | အရက် | can | SM-003-V1 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 81 | SM-003 | ဆိုဂျူး | can | SM-003-V2 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 82 | KN-001 | ပုလင်းရှည် | can | KN-001-V1 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 83 | KN-001 | ပုလင်းတို | can | KN-001-V2 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 84 | KN-001 | သံရှည် | can | KN-001-V3 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 85 | KN-001 | သံတို | can | KN-001-V4 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 86 | MY-001 | ပုလင်း | can | MY-001-V1 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 87 | MY-001 | ပုလင်းမဲပါ | can | MY-001-V2 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 88 | MY-001 | သံရှည် | can | MY-001-V3 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 89 | MY-001 | သံတို | can | MY-001-V4 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 90 | MY-001 | scout | can | MY-001-SCOUT | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 91 | BS-001 | ပုလင်း | can | BS-001-V1 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 92 | BS-001 | သံတို | can | BS-001-V2 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 93 | AG-001 | နီ သံရှည် | can | AG-001-V1 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 94 | AG-001 | နီ သံတို | can | AG-001-V2 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 95 | AG-001 | ခဲမဲ သံရှည် | can | AG-001-V3 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 96 | AG-001 | ခဲမဲ သံတို | can | AG-001-V4 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 97 | AG-001 | ပြာ သံရှည် | can | AG-001-V5 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 98 | AG-001 | ပြာ သံတို | can | AG-001-V6 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 99 | CH-001 | ပုလင်း | can | CH-001-V1 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 100 | CH-001 | သံရှည် | can | CH-001-V2 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 101 | CH-001 | သံတို | can | CH-001-V3 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 102 | DG-002 | စိမ်း ပုလင်း | can | DG-002-V1 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 103 | DG-002 | စိမ်း သံရှည် | can | DG-002-V2 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 104 | DG-002 | စိမ်း သံတို | can | DG-002-V3 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 105 | DG-002 | နီ ပုလင်း | can | DG-002-V4 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 106 | DG-002 | နီ သံရှည် | can | DG-002-V5 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 107 | DG-002 | နီ သံတို | can | DG-002-V6 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 108 | AR-002 | တပ်နီ သံဘူး | can | AR-002-V1 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 109 | AR-002 | တပ်စိမ်း သံဘူး | can | AR-002-V2 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 110 | TB-001 | ပုလင်း | can | TB-001-V1 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 111 | TB-001 | သံရှည် | can | TB-001-V2 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 112 | TB-001 | သံတို | can | TB-001-V3 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 113 | CB-001 | ပုလင်းရှည် | can | CB-001-V1 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 114 | CB-001 | ပုလင်းတို | can | CB-001-V2 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 115 | CB-001 | သံရှည် | can | CB-001-V3 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 116 | CB-001 | သံတို | can | CB-001-V4 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 117 | YM-001 | နီ သံရှည် | can | YM-001-V1 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 118 | YM-001 | နီ သံတို | can | YM-001-V2 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 119 | YM-001 | ဝါ သံရှည် | can | YM-001-V3 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 120 | YM-001 | ဝါ သံတို | can | YM-001-V4 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 121 | BE-001 | သံတို | can | BE-001-V1 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 122 | TP-001 | သံရှည် | can | TP-001-V1 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 123 | TP-001 | သံတို | can | TP-001-V2 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 124 | DG-003 | သံဘူး | can | DG-003-V1 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 125 | YG-001 | သံရှည် | can | YG-001-V1 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 126 | YG-001 | သံတို | can | YG-001-V2 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 127 | MD-006 | အပြာ ပုလင်းရှည် | can | MD-006-V1 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 128 | MD-006 | အပြာ ပုလင်းတို | can | MD-006-V2 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 129 | MD-006 | အပြာ သံရှည် | can | MD-006-V3 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 130 | MD-006 | အပြာ သံတို | can | MD-006-V4 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 131 | MD-006 | အနီ ပုလင်းရှည် | can | MD-006-V5 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 132 | MD-006 | အနီ ပုလင်းတို | can | MD-006-V6 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 133 | MD-006 | အနီ သံရှည် | can | MD-006-V7 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 134 | MD-006 | အနီ သံတို | can | MD-006-V8 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 135 | BW-001 | ပုလင်း | can | BW-001-V1 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 136 | CO-001 | ပုလင်း | can | CO-001-V1 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 137 | SG-001 | သံရှည် | can | SG-001-V1 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 138 | SG-001 | သံတို | can | SG-001-V2 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 139 | LO-001 | သံရှည် | can | LO-001-V1 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 140 | LO-001 | သံတို | can | LO-001-V2 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 141 | HN-001 | ပုလင်းရှည် | can | HN-001-V1 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 142 | HN-001 | ပုလင်းတို | can | HN-001-V2 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 143 | HN-001 | သံရှည် | can | HN-001-V3 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 144 | HN-001 | သံတို | can | HN-001-V4 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 145 | AB-001 | ပုလင်း | can | AB-001-V1 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 146 | AB-001 | သံဘူး | can | AB-001-V2 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 147 | TG-001 | ပုလင်းရှည် | can | TG-001-V1 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 148 | TG-001 | ပုလင်းတို | can | TG-001-V2 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 149 | TG-001 | သံရှည် | can | TG-001-V3 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 150 | TG-001 | သံတို | can | TG-001-V4 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 151 | TG-002 | ပုလင်း | can | TG-002-V1 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 152 | TG-002 | သံဘူး | can | TG-002-V2 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 153 | TG-003 | ပုလင်း | can | TG-003-V1 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 154 | TG-003 | သံဘူး | can | TG-003-V2 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 155 | TG-004 | ပုလင်း | can | TG-004-V1 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 156 | TG-004 | သံဘူး | can | TG-004-V2 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 157 | BV-001 | ပုလင်း | can | BV-001-V1 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 158 | BV-001 | သံရှည် | can | BV-001-V2 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 159 | BV-001 | သံတို | can | BV-001-V3 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 160 | R7-001 | သံရှည် | can | R7-001-V1 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 161 | R7-001 | သံတို | can | R7-001-V2 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 162 | R7-002 | သံရှည် | can | R7-002-V1 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 163 | R7-002 | သံတို | can | R7-002-V2 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 164 | A1-001 | မန်ကျည်း ပုလင်း | can | A1-001-V1 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 165 | A1-001 | ရှန်ပိန် ပုလင်း | can | A1-001-V2 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 166 | A1-001 | စပျင် ပုလင်း | can | A1-001-V3 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 167 | A1-001 | သံပရာ ပုလင်း | can | A1-001-V4 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 168 | CL-001 | 1.25L | li | CL-001-1.25L | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 169 | CL-001 | 500ml | ml | CL-001-500ML | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 170 | CL-001 | 350ml | ml | CL-001-350ML | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 171 | CL-001 | 200ml | ml | CL-001-200ML | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 172 | SK-001 | 1.5L | li | SK-001-1.5L | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 173 | SK-001 | Can | can | SK-001-CAN | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 174 | SK-001 | 350ml | ml | SK-001-350ML | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 175 | MR-001 | Can | can | MR-001-CAN | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 176 | CRB-001 | Can | can | CRB-001-CAN | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 177 | FD-001 | သံဘူးတိုး | can | FD-001-V1 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 178 | FD-001 | ကော်ဘူး ကလစ် | can | FD-001-V2 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 179 | FD-001 | ကော်ဘူး | can | FD-001-V3 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 180 | SP-001 | သံဘူးကြီး | can | SP-001-V1 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 181 | SP-001 | ကော်ဘူး | can | SP-001-V2 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 182 | LP-001 | ပုလင်း | can | LP-001-V1 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 183 | CV-001 | ပုလင်း | can | CV-001-V1 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 184 | SH-001 | ပုလင်း | can | SH-001-V1 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 185 | SH-001 | သံဘူး | can | SH-001-V2 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 186 | LS-001 | 300ml | ml | LS-001-300ML | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 187 | LS-001 | 1000ml | ml | LS-001-1000ML | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 188 | ML-001 | 165ml | ml | ML-001-165ML | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 189 | ML-001 | 110ml | ml | ML-001-110ML | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 190 | OV-001 | 165ml | ml | OV-001-165ML | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 191 | OV-001 | 110ml | ml | OV-001-110ML | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 192 | VT-001 | ဘူးသေး 125ml | ml | VT-001-125ML | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 193 | VT-001 | ကော်ဘူး 350ml | ml | VT-001-350ML | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 194 | YK-001 | ဘူးသေး | can | YK-001-V1 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 195 | MX-001 | 200ml | ml | MX-001-200ML | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 196 | MX-001 | 250ml | ml | MX-001-250ML | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 197 | MX-001 | 500ml | ml | MX-001-500ML | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 198 | VC-001 | 330ml | ml | VC-001-330ML | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 199 | VC-001 | 1.25L | li | VC-001-1.25L | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 200 | DP-001 | 350ml | ml | DP-001-350ML | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 201 | AL-001 | Energy Drink | can | AL-001-ENERGYDRINK | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 202 | AL-001 | Vitamin C | can | AL-001-VITAMINC | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 203 | PE-001 | သံဘူး | can | PE-001-V1 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 204 | PE-001 | ကော်ဘူး 350ml | ml | PE-001-350ML | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 205 | PE-001 | Zero Sugar | can | PE-001-ZEROSUGAR | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 206 | ST-001 | နီ | can | ST-001-V1 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 207 | ST-001 | ဝါ | can | ST-001-V2 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 208 | BM-001 | 350ml | ml | BM-001-350ML | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 209 | BM-001 | 200ml | ml | BM-001-200ML | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 210 | STM-001 | သီးစုံ ဗူး | can | STM-001-V1 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 211 | STM-001 | ကတော့ | can | STM-001-V2 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 212 | STM-001 | ဘူးလတ် | can | STM-001-V3 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 213 | WH-001 | ကန်တော့ပုံ | can | WH-001-V1 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 214 | WH-001 | နနတ်သီး | can | WH-001-V2 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 215 | WH-001 | ရေခဲမုန့် | can | WH-001-V3 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 216 | MS-001 | ပုလင်း | can | MS-001-V1 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 217 | MM-001 | ပုလင်း | can | MM-001-V1 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 218 | MM-001 | ကော်ဘူး | can | MM-001-V2 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 219 | JK-001 | ပုလင်း | can | JK-001-V1 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 220 | ZE-001 | ပုလင်း | can | ZE-001-V1 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 221 | ZE-001 | ကော်ဘူး | can | ZE-001-V2 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 222 | SA-001 | ပုလင်း | can | SA-001-V1 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 223 | SA-001 | ကော်ဘူး | can | SA-001-V2 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 224 | LF-001 | 1L | li | LF-001-1L | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 225 | LF-001 | 0.6L | li | LF-001-0.6L | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 226 | MC-001 | ဘူးကြီး | can | MC-001-V1 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 227 | MC-001 | ဘူးသေး | can | MC-001-V2 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 228 | MC-001 | အထုပ် | pack | MC-001-V3 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 229 | MZ-001 | ချဉ်စပ် | pack | MZ-001-V1 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 230 | MZ-001 | ဆီချက် | pack | MZ-001-V2 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 231 | MZ-001 | တုံယမ်း | pack | MZ-001-V3 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 232 | YY-001 | ချဉ်စပ် | pack | YY-001-V1 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 233 | MV-001 | အဝါ | pack | MV-001-V1 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 234 | MV-001 | အပြာ | pack | MV-001-V2 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 235 | WS-001 | Caster | pack | WS-001-CASTER | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 236 | WS-001 | Double Blue | pack | WS-001-DOUBLEBLUE | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 237 | WS-001 | Purple | pack | WS-001-PURPLE | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 238 | LR-001 | Crystal | pack | LR-001-CRYSTAL | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 239 | LR-001 | Premium | pack | LR-001-PREMIUM | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 240 | RU-001 | အနီ | pack | RU-001-V1 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 241 | RU-001 | အဝါ | pack | RU-001-V2 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 242 | OR-001 | ခဲ | pack | OR-001-V1 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 243 | OR-001 | ရွှေ | pack | OR-001-V2 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 244 | OR-001 | ပြာ | pack | OR-001-V3 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 245 | OR-001 | နီ | pack | OR-001-V4 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 246 | OR-001 | သခွား | pack | OR-001-V5 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 247 | OR-001 | Iceplus | pack | OR-001-ICEPLUS | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 248 | OR-001 | Elite Blue | pack | OR-001-ELITEBLUE | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 249 | OR-001 | Berry Mix | pack | OR-001-BERRYMIX | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 250 | OR-001 | Super Slim ပြာ | pack | OR-001-SUPERSLIM | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 251 | OR-001 | Cool Fizz | pack | OR-001-COOLFIZZ | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 252 | OR-001 | Purple Fizz | pack | OR-001-PURPLEFIZZ | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 253 | OR-001 | Purple Fizz သေး | pack | OR-001-V12 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 254 | OR-001 | Summer | pack | OR-001-SUMMER | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 255 | OR-001 | Deep Mix | pack | OR-001-DEEPMIX | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 256 | OR-001 | Tropical Dew | pack | OR-001-TROPICALDEW | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 257 | CP-001 | ပြာ | pack | CP-001-V1 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 258 | CP-001 | နီ | pack | CP-001-V2 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 259 | CP-001 | နက် | pack | CP-001-V3 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 260 | CP-001 | စိမ်း | pack | CP-001-V4 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 261 | O3-001 | ဟောင်းပြာ | pack | O3-001-V1 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 262 | O3-001 | သစ်ပြာ | pack | O3-001-V2 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 263 | O3-001 | ဟောင်းဝါ | pack | O3-001-V3 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 264 | NP-001 | ခဲ | pack | NP-001-V1 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 265 | NP-001 | ရွှေ | pack | NP-001-V2 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 266 | NP-001 | ပြာ | pack | NP-001-V3 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 267 | NP-001 | နီ | pack | NP-001-V4 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 268 | NP-001 | မဲ | pack | NP-001-V5 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 269 | KS-001 | အထုပ် | pack | KS-001-V1 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 270 | LW-001 | အထုပ် | pack | LW-001-V1 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 271 | SM-001 | အထုပ် | pack | SM-001-V1 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 272 | SM-001 | ဘူး | can | SM-001-V2 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 273 | MK-001 | 4 rolls | lt | MK-001-4ROLLS | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 274 | MK-001 | 10 rolls | lt | MK-001-10ROLLS | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 275 | MK-002 | 4 rolls | lt | MK-002-4ROLLS | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 276 | MK-002 | 10 rolls | lt | MK-002-10ROLLS | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 277 | SM-002 | ဘူး | can | SM-002-V1 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 278 | SM-002 | အထုပ် | pack | SM-002-V2 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 279 | TS-001 | ကြီး | can | TS-001-V1 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 280 | PT-006 | ငါးကလေးကြော် | pack | PT-006-VN01 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 281 | PT-006 | မောင်ကောင်း ဆိတ်လက်ဖက် | pack | PT-006-VN02 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 282 | PT-006 | ပြည့်စုံမွန် | pack | PT-006-VN03 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 283 | PT-006 | တို့ဗူးကြော် | pack | PT-006-VN04 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 284 | PT-006 | သျိုင်း နေကြာစေ့ | pack | PT-006-VN05 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 285 | PT-006 | Gar Gar ငါးမုန့်ကြော် | pack | PT-006-GA06 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 286 | -0168 | အစုံ | pack | -0168-VN01 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 287 | -0168 | ဆိတ်လက်ဖက် | pack | -0168-VN02 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 288 | -0169 | အချို | pack | -0169-VN01 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 289 | -0169 | အစပ် | pack | -0169-VN02 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 290 | PT-007 | ဝါရှင်တန် အာလူးကြော် | pack | PT-007-VN01 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 291 | PT-008 | ဝက်ခေါက်ကြီး | pack | PT-008-VN01 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 292 | PT-005 | ဝက်ခေါက်သေး | pack | PT-005-VN01 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 293 | PT-008 | Yo Friend မုန့် | pack | PT-008-YO02 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 294 | PT-003 | လပြည့်မြေပဲပွ | pack | PT-003-VN01 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 295 | PT-003 | ဝါရှင်တန် မြေပဲပွ | pack | PT-003-VN02 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 296 | PT-003 | လက်ပံပွင့်ကြော် | pack | PT-003-VN03 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 297 | PT-003 | နှမ်းယို+ မြေပဲယို | pack | PT-003-VN04 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 298 | PT-003 | ပွင့်ဖြူ မြေပဲ | pack | PT-003-VN05 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 299 | PT-003 | ပွင့်ဖြူ ငါးကလေး ပဲစုံကြော် | pack | PT-003-VN06 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 300 | PT-001 | ခွန်သံချို | pack | PT-001-VN01 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 301 | PT-001 | မွှေးမွှေး ငပိ | pack | PT-001-VN02 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 302 | PT-001 | ရှူးရှဲ လက်ဖက် | pack | PT-001-VN03 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 303 | PT-001 | အစေ့လွတ် | pack | PT-001-VN04 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 304 | PT-001 | ဉီးဉီး မရမ်း အစပ်သေး | pack | PT-001-VN05 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
| 305 | PT-001 | ဉီးဉီး မရမ်း အချိုသေး | pack | PT-001-VN06 | 1 | 0 | 0 | 0 | 0 | 0 |  | true |
