# Seeder Data

## UserSeeder

| # | Name | Email | Password | Role |
|---|------|-------|----------|------|
| 1 | Admin | admin@gmail.com | password (bcrypt) | admin |
| 2 | Cashier | cashier@gmail.com | password (bcrypt) | cashier |

## UnitSeeder

| ID | Name | Abbreviation | Created At | Updated At |
|----|------|--------------|------------|------------|
| 1 | အထုပ် | pack | 2026-07-20 16:47:12 | 2026-07-20 16:49:07 |
| 2 | ဘူး | can | 2026-07-20 16:47:18 | 2026-07-20 16:49:48 |
| 4 | လီတာ | li | 2026-07-20 16:47:37 | 2026-07-20 16:48:57 |
| 5 | မီလီ လီတာ | ml | 2026-07-20 16:47:50 | 2026-07-20 16:48:48 |
| 6 | ပက် | shot | 2026-07-20 16:47:50 | 2026-07-20 16:48:48 |
| 7 | လိပ် | lt | 2026-07-20 16:47:50 | 2026-07-20 16:48:48 |

## CategorySeeder

| ID | Name | Slug | Description | Image | Is Active | Deleted At | Created At | Updated At |
|----|------|------|-------------|-------|-----------|------------|------------|------------|
| 9 | ဖက်ကြမ်း | paetkyan | ဖက်ကြမ်း | null | true | null | 2026-07-20 15:52:21 | 2026-07-20 15:52:21 |
| 10 | စီးကရက် | cigarettes | စီးကရက် | null | true | null | 2026-07-20 15:53:57 | 2026-07-20 15:55:14 |
| 11 | ဘီယာ | baiya | ဘီယာ | null | true | null | 2026-07-20 15:54:31 | 2026-07-20 15:54:31 |
| 12 | အရက် | ayaet | အရက် | null | true | null | 2026-07-20 15:54:35 | 2026-07-20 15:54:42 |
| 13 | အချိုရည် | akhyaoyai | အချိုရည် | null | true | null | 2026-07-20 15:59:06 | 2026-07-20 15:59:06 |
| 14 | ဆိုလ်ဂျူး | saolgyau | ဆိုလ်ဂျူး | null | true | null | 2026-07-20 16:03:33 | 2026-07-20 16:03:33 |
| 15 | ဝိုင် | waing | ဝိုင် | null | true | null | 2026-07-20 16:03:46 | 2026-07-20 16:03:46 |
| 16 | ရေသန့် | yaethan | ရေသန့် | null | true | null | 2026-07-20 16:06:11 | 2026-07-20 16:06:11 |
| 17 | ခေါက်ဆွဲခြောက် | khawetsawekhyauk | ခေါက်ဆွဲခြောက် | null | true | null | 2026-07-20 16:07:25 | 2026-07-20 16:07:25 |
| 18 | မုန့်မျိုးစုံ | montmyosone | မုန့်မျိုးစုံ | null | true | null | 2026-07-20 16:07:25 | 2026-07-20 16:07:25 |
| 19 | အခြား | acharr | အခြား | null | true | null | 2026-07-20 16:07:25 | 2026-07-20 16:07:25 |

## ProductSeeder

> Category reference: 12 = အရက် (alcohol), 11 = ဘီယာ (beer), 14 = ဆိုလ်ဂျူး (soju), 15 = ဝိုင် (wine), 13 = အချိုရည် (softdrink).
> Note: `name` is derived as `brand - name` when brand differs from name.

### Alcohol (အရက်)

| SKU | Brand | Name |
|-----|-------|------|
| GM-001 | Glan Master | Glan Master - အဝါ |
| GM-002 | Glan Master | Glan Master - အနီ |
| GM-003 | Glan Master | Glan Master - အပြာ |
| RC-001 | Royal Club | Royal Club - အစိမ်း |
| RC-002 | Royal Club | Royal Club - အပြာ |
| RC-003 | Royal Club | Royal Club - အဝါ |
| MA-001 | MacArthur's | MacArthur's - Whiskey |
| GR-001 | Grand Royal | Grand Royal - Double Gold |
| GR-002 | Grand Royal | Grand Royal - Sherry Cask |
| GR-003 | Grand Royal | Grand Royal - Shwe |
| GR-004 | Grand Royal | Grand Royal - Signature Blue |
| GR-005 | Grand Royal | Grand Royal - Smooth |
| EM-001 | Empire | Empire - Rum |
| GR-006 | Grand Royal | Grand Royal - Black |
| BR-001 | Brother | Brother - Smooth |
| MD-001 | Mandalay | Mandalay - Rum 5 Year |
| MD-002 | Mandalay | Mandalay - 3 Year Export |
| MD-003 | Mandalay | Mandalay - Coffee Rum |
| MD-004 | Mandalay | Mandalay - White Rum |
| MD-005 | Mandalay | Mandalay - Rum |
| MY-002 | Myanmar | Myanmar - Rum Celebration |
| MY-003 | Myanmar | Myanmar - Dry Gin |
| AR-001 | Army | Army - Rum |
| DG-001 | Dagon | Dagon - Rum |
| JW-001 | Johnnie Walker | Johnnie Walker - Blue Label |
| JW-002 | Johnnie Walker | Johnnie Walker - Double Black |
| JW-003 | Johnnie Walker | Johnnie Walker - Black Label |
| JW-004 | Johnnie Walker | Johnnie Walker - Red Label |
| CR-001 | Chivas Regal | Chivas Regal - 12 Year |
| BI-001 | Black Icon | Black Icon - Black Icon |
| DF-001 | Dunfife | Dunfife - အပြာ |
| DF-002 | Dunfife | Dunfife - အနီ |
| JM-001 | Jägermeister | Jägermeister - Jägermeister |

### Beer (ဘီယာ)

| SKU | Brand | Name |
|-----|-------|------|
| SE-001 | Sir Edward's | Sir Edward's - Smoky |
| SE-002 | Sir Edward's | Sir Edward's - Finest |
| SE-003 | Sir Edward's | Sir Edward's - Beer Reserve |
| KN-001 | Keen | Keen - Beer |
| MY-001 | Myanmar | Myanmar - Beer |
| BS-001 | Black Shield | Black Shield - Beer |
| AG-001 | Andaman Gold | Andaman Gold - Beer |
| CH-001 | Chang | Chang - Beer |
| DG-002 | Dagon | Dagon - Beer |
| AR-002 | Army | Army - Beer |
| TB-001 | Tuborg | Tuborg - Beer |
| CB-001 | Carlsberg | Carlsberg - Beer |
| YM-001 | Yoma | Yoma - Beer |
| BE-001 | Black Eagle | Black Eagle - Beer |
| TP-001 | Tapper | Tapper - Beer |
| DG-003 | Dagon | Dagon - Super Beer |
| YG-001 | Yagon | Yagon - Beer |
| MD-006 | Mandalay | Mandalay - Beer |
| BW-001 | Budweiser | Budweiser - Beer |
| CO-001 | Corona | Corona - Beer |
| SG-001 | Singha | Singha - Beer |
| LO-001 | Leo | Leo - Beer |
| HN-001 | Heineken | Heineken - Beer |
| AB-001 | ABC | ABC - Beer |
| TG-001 | Tiger | Tiger - Beer |
| TG-002 | Tiger | Tiger - Crystal |
| TG-003 | Tiger | Tiger - Super |
| BW-002 | Bawdar | Bawdar - Beer |

### Soju (ဆိုလ်ဂျူး)

| SKU | Brand | Name |
|-----|-------|------|
| BO-001 | Bora | Bora - Soju |
| JE-001 | Joei | Joei - Soju |
| GB-001 | Geonbae | Geonbae - Soju |
| CG-001 | Chingu | Chingu - Soju |

### Wine (ဝိုင်)

| SKU | Brand | Name |
|-----|-------|------|
| FM-001 | Fullmoon | Fullmoon - Wine |

### Soft Drink (အချိုရည်)

| SKU | Brand | Name |
|-----|-------|------|
| A1-001 | A1 | A1 - Energy Drink |
| BL-001 | Blink | Blink - Energy Drink |
| RRB-001 | RRB | RRB - Energy Drink |
| PP-001 | Pop | Pop - Soda |
| DG-004 | Dagon | Dagon - Soda |
| VM-001 | Vitamilk | Vitamilk - Soy Milk |
| EV-001 | Enervit | Enervit - Energy Drink |
| CL-001 | Color | Color - Drink |
| HG-001 | Honey Gold | Honey Gold - Drink |
| SK-001 | Sunkist | Sunkist - Soft Drink |
| MR-001 | Mirinda | Mirinda - Soft Drink |
| JP-001 | Jasper | Jasper - Water |
| M1-001 | M-150 | M-150 - Energy Drink |
| CRB-001 | Carabao | Carabao - Energy Drink |
| FD-001 | Fire Dragon | Fire Dragon - Energy Drink |
| SP-001 | Speed | Speed - Energy Drink |
| LP-001 | Lipo | Lipo - Energy Drink |
| CV-001 | C-Vitt | C-Vitt - Vitamin Drink |
| SH-001 | Shark | Shark - Energy Drink |
| LD-001 | Lucky Day | Lucky Day - Coffee |
| UF-001 | UFC | UFC - Drink |
| SD-001 | Sunday | Sunday - Drink |
| LS-001 | Lactasoy | Lactasoy - Soy Milk |
| ML-001 | Milo | Milo - Chocolate Malt |
| OV-001 | Ovaltine | Ovaltine - Chocolate Malt |
| VT-001 | Vito | Vito - Drink |
| YK-001 | Yoko | Yoko - Drink |

## Product Variants

Source: `variants-two-burmese.md` (authoritative variant list per product).

> Variant names are listed as written in the source (Burmese package names kept as-is). `—` means no variants are listed in the source.

### Package type glossary

| Burmese | Meaning |
|---------|---------|
| ပုလင်း / ပုလင်းရှည် / ပုလင်းတို | bottle / long bottle / short bottle |
| ပုလင်းမဲပါ | bottle with black cap |
| သံဘူး / သံရှည် / သံတို | can / long can / short can |
| ကော်ဘူး | plastic (PET) bottle |
| ကန် | can |
| အထုပ် | pack |
| ၂ ပတ် | 2-pack |

### Alcohol (အရက် / Whisky)

| Product SKU | Brand - Name | Variants |
|-------------|--------------|----------|
| GM-001 | Glan Master - အဝါ | 1L, 0.7L, 350ml, 175ml, 2ပတ် |
| GM-002 | Glan Master - အနီ | 1L, 0.7L, 350ml, 175ml, 2ပတ် |
| GM-003 | Glan Master - အပြာ | 1L, 0.7L, 350ml, 175ml, 2ပတ် |
| RC-001 | Royal Club - အစိမ်း | 1L, 0.7L, 350ml, 175ml, 2ပတ် |
| RC-002 | Royal Club - အပြာ | 1L, 0.7L, 350ml, 175ml, 2ပတ် |
| RC-003 | Royal Club - အဝါ | 1L, 0.7L, 350ml, 175ml, 2ပတ် |
| MA-001 | MacArthur's - Whiskey | — |
| GR-001 | Grand Royal - Double Gold | — |
| GR-002 | Grand Royal - Sherry Cask | 0.7L, 350ml, 175ml |
| GR-003 | Grand Royal - Shwe | 0.7L, 350ml, 175ml |
| GR-004 | Grand Royal - Signature Blue | 0.7L, 350ml, 175ml |
| GR-005 | Grand Royal - Smooth | 1L, 0.7L, 350ml, 175ml, 2ပတ် |
| EM-001 | Empire - Rum | 0.7L |
| GR-006 | Grand Royal - Black | 1L, 0.7L, 350ml, 175ml |
| BR-001 | Brother - Smooth | 0.7L, 350ml, 175ml, 200ml |
| MD-001 | Mandalay - Rum 5 Year | 0.7L, 350ml |
| MD-002 | Mandalay - 3 Year Export | 0.7L, 350ml |
| MD-003 | Mandalay - Coffee Rum | 1L, 0.7L, 350ml |
| MD-004 | Mandalay - White Rum | 1L, 0.7L, 350ml |
| MD-005 | Mandalay - Rum | 0.7L |
| MY-002 | Myanmar - Rum Celebration | — |
| MY-003 | Myanmar - Dry Gin | — |
| AR-001 | Army - Rum | 1L |
| DG-001 | Dagon - Rum | 1L |
| JW-001 | Johnnie Walker - Blue Label | 1L |
| JW-002 | Johnnie Walker - Double Black | 1L |
| JW-003 | Johnnie Walker - Black Label | 1L |
| JW-004 | Johnnie Walker - Red Label | 1L |
| CR-001 | Chivas Regal - 12 Year | 0.7L |
| BI-001 | Black Icon - Black Icon | 1L |
| DF-001 | Dunfife - အပြာ | 0.7L |
| DF-002 | Dunfife - အနီ | 0.7L |
| JM-001 | Jägermeister - Jägermeister | 1L, 0.7L |

### Beer (ဘီယာ)

| Product SKU | Brand - Name | Variants |
|-------------|--------------|----------|
| SE-001 | Sir Edward's - Smoky | Smokey |
| SE-002 | Sir Edward's - Finest | Finest |
| SE-003 | Sir Edward's - Beer Reserve | Beer Reserve |
| KN-001 | Keen - Beer | ပုလင်းရှည်, ပုလင်းတို, သံရှည်, သံတို |
| MY-001 | Myanmar - Beer | ပုလင်း, ပုလင်းမဲပါ, သံရှည်, သံတို, scout |
| BS-001 | Black Shield - Beer | ပုလင်း, သံတို |
| AG-001 | Andaman Gold - Beer | နီ: သံရှည်/သံတို; ခဲမဲ: သံရှည်/သံတို; ပြာ: သံရှည်/သံတို |
| CH-001 | Chang - Beer | ပုလင်း, သံရှည်, သံတို |
| DG-002 | Dagon - Beer | စိမ်း: ပုလင်း/သံရှည်/သံတို; နီ: ပုလင်း/သံရှည်/သံတို |
| AR-002 | Army - Beer | တပ်နီ: သံဘူး; တပ်စိမ်း: သံဘူး |
| TB-001 | Tuborg - Beer | ပုလင်း, သံရှည်, သံတို |
| CB-001 | Carlsberg - Beer | ပုလင်းရှည်, ပုလင်းတို, သံရှည်, သံတို |
| YM-001 | Yoma - Beer | နီ: သံရှည်/သံတို; ဝါ: သံရှည်/သံတို |
| BE-001 | Black Eagle - Beer | သံတို |
| TP-001 | Tapper - Beer | သံရှည်, သံတို |
| DG-003 | Dagon - Super Beer | သံဘူး |
| YG-001 | Yagon - Beer | သံရှည်, သံတို |
| MD-006 | Mandalay - Beer | အပြာ: ပုလင်းရှည်/ပုလင်းတို/သံရှည်/သံတို; အနီ: ပုလင်းရှည်/ပုလင်းတို/သံရှည်/သံတို |
| BW-001 | Budweiser - Beer | ပုလင်း |
| CO-001 | Corona - Beer | ပုလင်း |
| SG-001 | Singha - Beer | သံရှည်, သံတို |
| LO-001 | Leo - Beer | သံရှည်, သံတို |
| HN-001 | Heineken - Beer | ပုလင်းရှည်, ပုလင်းတို, သံရှည်, သံတို |
| AB-001 | ABC - Beer | ပုလင်း, သံဘူး |
| TG-001 | Tiger - Beer | ပုလင်းရှည်, ပုလင်းတို, သံရှည်, သံတို |
| TG-002 | Tiger - Crystal | ပုလင်း, သံဘူး |
| TG-003 | Tiger - Super | ပုလင်း, သံဘူး |
| BW-002 | Bawdar - Beer | — (not in variants-two-burmese.md) |

### Soju (ဆိုလ်ဂျူး)

| Product SKU | Brand - Name | Variants |
|-------------|--------------|----------|
| BO-001 | Bora - Soju | — |
| JE-001 | Joei - Soju | — |
| GB-001 | Geonbae - Soju | — |
| CG-001 | Chingu - Soju | — |

### Wine (ဝိုင်)

| Product SKU | Brand - Name | Variants |
|-------------|--------------|----------|
| FM-001 | Fullmoon - Wine | — |

### Soft Drink (အချိုရည်)

| Product SKU | Brand - Name | Variants |
|-------------|--------------|----------|
| A1-001 | A1 - Energy Drink | မန်ကျည်း ပုလင်း, ရှန်ပိန် ပုလင်း, စပျင် ပုလင်း, သံပရာ ပုလင်း |
| BL-001 | Blink - Energy Drink | — |
| RRB-001 | RRB - Energy Drink | — |
| PP-001 | Pop - Soda | — |
| DG-004 | Dagon - Soda | — |
| VM-001 | Vitamilk - Soy Milk | — |
| EV-001 | Enervit - Energy Drink | — |
| CL-001 | Color - Drink | 1.25L, 500ml, 350ml, 200ml |
| HG-001 | Honey Gold - Drink | — |
| SK-001 | Sunkist - Soft Drink | 1.5L, Can (ကန်), 350ml |
| MR-001 | Mirinda - Soft Drink | Can (ကန်) |
| JP-001 | Jasper - Water | — |
| M1-001 | M-150 - Energy Drink | — |
| CRB-001 | Carabao - Energy Drink | Can (ကန်) |
| FD-001 | Fire Dragon - Energy Drink | သံဘူးတိုး, ကော်ဘူး (ကလစ်), ကော်ဘူး |
| SP-001 | Speed - Energy Drink | သံဘူးကြီး, ကော်ဘူး |
| LP-001 | Lipo - Energy Drink | ပုလင်း |
| CV-001 | C-Vitt - Vitamin Drink | ပုလင်း |
| SH-001 | Shark - Energy Drink | ပုလင်း, သံဘူး |
| LD-001 | Lucky Day - Coffee | — |
| UF-001 | UFC - Drink | — |
| SD-001 | Sunday - Drink | — |
| LS-001 | Lactasoy - Soy Milk | 300ml, 1000ml |
| ML-001 | Milo - Chocolate Malt | 165ml, 110ml |
| OV-001 | Ovaltine - Chocolate Malt | 165ml, 110ml |
| VT-001 | Vito - Drink | ဘူးသေး (125ml), ကော်ဘူး (350ml) |
| YK-001 | Yoko - Drink | ဘူးသေး |

### Additional products in variants-two-burmese.md (not in ProductSeeder)

| Product | Variants |
|---------|----------|
| Bavaria | ပုလင်း, သံရှည်, သံတို |
| R7 အပြာ | သံရှည်, သံတို |
| R7 အနီ | သံရှည်, သံတို |
| မန်းရှယ် | ပုလင်း |
| မန်းမန်ကျည်း | ပုလင်း, ကော်ဘူး |
| ဂျော်ကီ | ပုလင်း |
| ဇေ (ရိုးရိုး + သံပုရာ) | ပုလင်း, ကော်ဘူး |
| Sandar Aung | ပုလင်း, ကော်ဘူး |
| MayMyoWine | — |
| ခေါင်ရည်ဘုရင် ၂ဆ | — |
| ကိုးတောင်ကျား | ဘူး |
| စစ်မြင်း | အရက်, ဆိုဂျူး |
| Cola (ကိုလာ) | 1.25L, 500ml, 350ml, 200ml |
| Alpine | Energy Drink, Vitamin C |
| Hikari | — |
| Royal-D | — |
| Regen-D | — |
| Pepsi | သံဘူး, 350ml ကော်ဘူး, Zero Sugar |
| Sting | နီ, ဝါ |
| Blue Mountain | 350ml, 200ml |
| Asia Delight အရသာစုံ | — |
| Asia ပင်မည့် | — |
| Asia လိုင်ချီး | — |
| Yoshi အရသာစုံ | — |
| သူဌေးမင်း | သီးစုံ ဗူး, ကတော့, ဘူးလတ် |
| Hello အရေခဲချောင်း အရသာစုံ | — |
| ဝါးဟားဟား | ကန်တော့ပုံ, နနတ်သီး, ရေခဲမုန့် |
| Life ရေသန့် | 1L, 0.6L |
| My Chip | ဘူးကြီး, ဘူးသေး, အထုပ် |
| Oshi အစုံ | — |
| 3+2 ပေါင်မုန့် | — |
| Jumbo Noodle | — |
| X-cite | — |
| OMG | — |
| MAMA | ချဉ်စပ်, ဆီချက်, တုံယမ်း |
| Yum Yum | ချဉ်စပ် |
| XOXO Noodle | — |
| Shin Shin ကြာဇံ | — |
| Ultra (Volcano) | — |
| Mevius (Sky Blue) | အဝါ, အပြာ |
| Winston | Caster, Double Blue, Purple |
| Lord | Crystal, Premium |
| Dunhill Red | — |
| Black Devil | — |
| Black Fox | — |
| Red Ruby | အနီ, အဝါ |
| Premium Gold | — |
| Red and Blue | — |
| Oris | ခဲ, ရွှေ, ပြာ, နီ, သခွား, Iceplus, Elite Blue, Berry Mix, Super Slim ပြာ, Cool Fizz, Purple Fizz, Purple Fizz သေး, Summer, Deep Mix, Tropical Dew |
| Capital | ပြာ, နီ, နက်, စိမ်း |
| O3 | ဟောင်းပြာ, သစ်ပြာ, ဟောင်းဝါ |
| Napoli | ခဲ, ရွှေ, ပြာ, နီ, မဲ |
| ကြယ်နီ | အထုပ် |
| လွင့် | အထုပ် |
| ရွှေဘားမား | အထုပ်, ဘူး |
| စကားဝါ | — |
| မယ်ခွေ Strong | 4 rolls, 10 rolls |
| မယ်ခွေ Smooth | 4 rolls, 10 rolls |
| ရွှေမန်းသူ | ဘူး, အထုပ် |
| Tissue | ကြီး |
