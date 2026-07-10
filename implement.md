# Mini POS — Implementation Status

## Objective
Convert the existing Laravel Breeze inventory starter into a full-featured Point-of-Sale system with two-column layout, Myanmar Kyat (Ks) currency display, complete Myanmar (my) localization, and comprehensive test coverage.

---

## ✅ Done

### 1. Sales Feature (POS)

| File | Status |
|------|--------|
| `database/migrations/2025_07_09_000001_create_sales_table.php` | Done |
| `database/migrations/2025_07_09_000002_create_sale_items_table.php` | Done |
| `app/Models/Sale.php` | Done — `belongsTo(User)`, `hasMany(SaleItem)`, `decimal:2` casts |
| `app/Models/SaleItem.php` | Done — `belongsTo(Sale)`, `belongsTo(ProductVariant)`, `decimal:2` casts |
| `app/Http/Requests/Sales/CheckoutRequest.php` | Done — validates items array, payment_method, amount_paid, discount, tax, notes |
| `app/Http/Controllers/Sales/SaleController.php` | Done — `index()` returns products+variants+categories, `checkout()` creates Sale+SaleItems in transaction, decrements stock |
| `app/Http/Resources/SaleResource.php` | Done |
| `app/Http/Resources/SaleItemResource.php` | Done |
| `routes/sales.php` | Done — `GET /sales` (sales.index), `POST /sales/checkout` (sales.checkout), both auth+sanctum |
| `routes/web.php` | Done — `Route::get('/sales', ...)` Inertia render point |

### 2. POS Frontend

| File | Status |
|------|--------|
| `resources/js/pages/sales/index.tsx` | Done — two-column layout (product grid + cart/checkout sidebar) with category filtering, search, cart management, discount/tax, cash/card/transfer payment, amount-paid/change calculation, transaction notes, processing state; product cards show 4:3 image with hover zoom, fallback placeholder |
| `resources/js/types/sale.ts` | Done — `CartItem`, `Sale`, `SaleItem` TypeScript interfaces |

### 3. Currency Formatting (`ks()` helper)

- `resources/js/pages/sales/index.tsx` — `ks()` returns `Number(n).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })` (plain number string without currency symbol)
- The "Ks" prefix is rendered in JSX as `Ks{ks(val)}` so negative values display correctly (e.g. `-Ks 0.50` instead of `Ks -0.50`)

**Still needed:** Extract `ks()` to a shared module (`@/lib/utils.ts` or `@/lib/i18n.ts`) and apply to 5 other pages that render raw `$` prices (dashboard, products/edit, products/show, reports/profit-loss, inventory/create).

### 4. Myanmar Localization

| Component | Files |
|-----------|-------|
| Translation data | `lang/my.json` — 66 keys for POS, dashboard, products, categories, units, inventory, reports, common actions |
| Frontend hook | `resources/js/lib/i18n.ts` — `tn()` pure function, `useTranslation()` React hook, `setLocale()` cookie helper |
| Locale switcher | `resources/js/components/locale-switcher.tsx` — dropdown in sidebar footer toggles `my`/`en` via cookie + page reload |
| Backend middleware | `app/Http/Middleware/HandleInertiaRequests.php` — shares `locale` (default "my") and full `translations` object with every Inertia page |
| Sidebar integration | `resources/js/components/app-sidebar.tsx` — imported and rendered `LocaleSwitcher` in footer |
| Translated page | `resources/js/pages/sales/index.tsx` — all UI strings wrapped with `t()` |

**Still needed:** Translate the remaining 19 pages (dashboard, categories, products CRUD, inventory, units, reports, auth, settings).

### 5. Test Suite

All new tests pass (118 Feature + 4 skipped = 122 total). The only Feature failure is the pre-existing `ProductTest::show displays product`.

| Category | Tests | Files |
|----------|-------|-------|
| Resources (6) | 12 passed | `CategoryResourceTest`, `ProductResourceTest`, `ProductVariantResourceTest`, `SaleResourceTest`, `SaleItemResourceTest`, `UnitResourceTest` |
| Request validation (8) | 16 passed | `CheckoutRequestTest`, `StoreCategoryRequestTest`, `StoreProductRequestTest`, `StoreStockRequestTest`, `StoreUnitRequestTest`, `UpdateCategoryRequestTest`, `UpdateProductRequestTest`, `UpdateUnitRequestTest` |
| Factories (7) | 7 passed | `CategoryFactoryTest`, `ProductFactoryTest`, `ProductVariantFactoryTest`, `SaleFactoryTest`, `SaleItemFactoryTest`, `UnitFactoryTest`, `UserFactoryTest` |
| Middleware (1) | 4 passed | `HandleInertiaRequestsTest` — locale, app name, auth user, sidebar state |
| Inventory feature (1) | 5 passed | `StockTest` — index page, stock entry, weighted cost calc, validation, guest redirect |
| Reports feature (1) | 3 passed | `ProfitLossTest` — page load, product data, summary totals |
| Sales feature (1) | 3 passed | `SaleTest` — checkout, cart empty validation, guest redirect |

**Bug fixes applied to tests:**
- Removed `fake()->unique()` from `CategoryFactory` and `ProductFactory` to prevent overflow when multiple tests create many categories/products in parallel
- Update request tests rewritten to use real `Illuminate\Routing\Route` with `Request::create()` binding instead of mock `setParameter()` calls
- Fixed `CheckoutRequestTest` to expect `in:cash,kbzpay` after payment_method change

### 6. Lint & Code Quality Fixes
- Removed 15+ unused imports across 7 files (app-sidebar, categories, inventory/create, products/create, products/index, products/show, units/index)
- Fixed `ProductController::edit()` to eager-load `variants.unit` so unit column displays correctly on edit page
- Removed `productsToggleActive` unused import from products index
- Payment methods reduced to Cash + KBZ Pay (removed Card, Transfer)

### 7. Pre-existing Failures (not introduced by this session)
1. `Tests\Feature\Products\ProductTest > show displays product` — 1 failure
2. `Tests\Unit` — 43 failures (all unit tests lack `RefreshDatabase` trait for DB-dependent assertions)

---

## 🔄 In Progress

### Bug Fixes (2026-07-10)
| # | Severity | File | Issue | Fix |
|---|----------|------|-------|-----|
| 1 | HIGH | `resources/js/pages/inventory/create.tsx:32` | Inventory search URL uses `&search=` instead of `?search=` — produces malformed URL, search always fails | Change `&` to `?` |
| 2 | HIGH | `resources/js/pages/products/edit.tsx` | No UI control to toggle `is_active` — users cannot activate/deactivate products from edit page | Add `is_active` toggle switch |
| 3 | HIGH | `resources/js/pages/products/index.tsx` | Search input is cosmetic — `search` state never filters `productsData.data` | Add client-side filter with `useMemo` |
| 4 | HIGH | `resources/js/pages/products/index.tsx` | No active/inactive toggle button — `productsToggleActive` route exists but is unused | Add toggle button per row |
| 5 | HIGH | `app/Http/Resources/ProductResource.php:20` | `new CategoryResource($this->whenLoaded('category'))` crashes when category is null | Use conditional: `$this->whenLoaded('category') ? new CategoryResource($this->category) : null` |
| 6 | HIGH | `app/Http/Resources/ProductVariantResource.php:30` | Same null crash for unit resource | Same conditional fix |
| 7 | HIGH | `app/Http/Controllers/Reports/ProfitLossController.php:26,32` | Null pointer on `$product->category->name` and `$v->unit->abbreviation` | Use null-safe operator `?->` with fallback |
| 8 | MED | `resources/js/pages/products/edit.tsx` | Missing `category_id` validation error display | Add `{formErrors.category_id && ...}` |
| 9 | MED | `resources/js/pages/reports/profit-loss.tsx:63` | Product name used as React key (not unique) | Use `${product.product_name}-${idx}` |
| 10 | LOW | `resources/js/pages/dashboard.tsx:44` | `DollarSign` icon inconsistent with Ks currency | Changed to `Banknote` icon |
| 11 | MED | 5 pages (`products/edit`, `products/show`, `dashboard`, `inventory/create`, `reports/profit-loss`) | Prices display with `$` instead of `Ks` | Import `ks()` from shared util, wrap prices |
| 12 | LOW | `resources/js/pages/sales/index.tsx` + 5 other pages | `ks()` defined locally, not shared | Extract to `@/lib/utils.ts` |

### Sales Restructure (2026-07-10)
| Change | Details |
|--------|---------|
| Renamed POS page | `sales/index.tsx` → `sales/checkout.tsx` (component: `SalesCheckout`) |
| New sales history page | `sales/index.tsx` — daily sales table with summary cards, expandable rows, search |
| Backend | `SaleController::index()` → sales history + summary; `SaleController::checkoutPage()` → POS products |
| Routes | Added `GET /sales/checkout` (POS page); `GET /sales` (history); `POST /sales/checkout` (process) |
| Sidebar | Added "Sales" (history) + kept "POS" (checkout) as separate nav items |
| Translations | Added 16 new Myanmar keys for sales history UI |

---

## 📋 Remaining Work

### High Priority
1. [x] Show product images in Sales POS grid (4:3 aspect ratio, hover zoom, first variant fallback, placeholder icon)
2. [x] Fix products edit page not showing variant units (missing `variants.unit` eager load)
3. [x] Clear all lint errors (unused imports across 7 files)
4. [x] Reduce payment methods to Cash + KBZ Pay
5. [x] Extract `ks()` to shared utility (`@/lib/utils.ts`)
6. [x] Apply `ks()` to price displays in 5 pages: `dashboard.tsx`, `products/edit.tsx`, `products/show.tsx`, `reports/profit-loss.tsx`, `inventory/create.tsx`
7. [ ] Translate remaining 19 pages with `t()` calls (dashboard, categories, products CRUD, inventory, units, reports, auth, settings)

### Medium Priority
8. [ ] Fix pre-existing `tsconfig.json` TS5103 error (invalid `--ignoreDeprecations`)
9. [ ] Fix pre-existing `ProductTest::show` failure
10. [ ] Install xdebug/pcov for coverage reporting (`php vendor/bin/pest --coverage --testsuite=Feature`)

### Low Priority
8. [ ] Add `Sale`/`SaleItem` Unit model tests (non-DB model structure)
9. [ ] Add frontend component tests for POS cart/checkout
10. [ ] Add snapshot tests for resource API output

---

## Architecture Notes

### Currency Convention
- **Backend:** `decimal:2` cast returns string when serialized to JSON — frontend must use `num()` before arithmetic and `ks()` for display
- **Frontend:** `ks()` = display formatting only (commas + 2 decimals), "Ks" prefix in JSX template
- **Negative values:** `-Ks 0.50` rendered as `{"-Ks "}{ks(-0.50)}` (prefix outside the numeric format)

### Localization Convention
- `lang/my.json` is a flat key-value JSON, loaded entirely via Inertia shared props
- `tn(key, translations, replacements?)` — pure function with `:param` replacement support
- `useTranslation()` — React hook returning `{ t, locale, setLocale }`
- Fallback to English key if Myanmar translation is missing
- Locale persisted in `locale` cookie (read/written in middleware)

### Route Structure
- Inertia page routes in `routes/web.php`
- API/JSON routes in `routes/sales.php` (auth + sanctum middleware)
- Wayfinder auto-generates from route files — run `php artisan wayfinder:generate` or `npm run build`

### Test Structure
- `tests/Feature/` — DB-dependent integration tests (uses `RefreshDatabase`)
- `tests/Unit/` — Pure logic tests (no DB)
- `tests/Feature/Resources/` — Resource structure tests
- `tests/Feature/Requests/` — Form request validation rule tests
- `tests/Feature/Factories/` — Factory creation tests
- `tests/Feature/Inventory/` — Stock management feature tests
- `tests/Feature/Reports/` — Report page feature tests
- `tests/Feature/Middleware/` — Shared prop middleware tests

---

## Verification Commands

```bash
# Run all Feature tests (our work)
php vendor/bin/pest --testsuite=Feature

# Run a specific test file
php vendor/bin/pest tests/Feature/Resources/SaleResourceTest.php

# Build frontend
npm run build

# TypeScript check (may fail with pre-existing TS5103)
npm run types:check

# Lint
npm run lint

# Coverage (requires xdebug/pcov)
php vendor/bin/pest --coverage --testsuite=Feature
```
