# Features

## 1. Authentication

**Status:** Complete

- Laravel Breeze auth scaffold (login, forgot password, reset password, verify email, confirm password)
- Session-based authentication with "Remember me"
- Cookie-based locale persistence (Myanmar/English)

## 2. Role-Based Access Control

**Status:** Implemented (Basic)

- Two roles: `admin` and `cashier`
- `EnsureUserIsAdmin` middleware blocks non-admin users from inventory/settings routes
- Cashier users can only access: Dashboard, POS, Sales History
- Frontend conditionally hides "Inventory" nav section for cashiers
- Settings "Users" tab only visible to admins

## 3. Dashboard

**Status:** Complete

- Inventory Value card (sum of all variant stock_quantity * cost_price)
- Profit/Loss card (totalRevenue - totalCost across all sales)
- Today's Total Sales card (sum of today's sale total_amount)
- Most Sold Products table (top 10 products by quantity sold)
- Low Stock Variants table (variants where stock > 0 but <= min_stock_level)
- Recent Sales table (today's sales with invoice, items count, payment method, amount)

## 4. Category Management

**Status:** Complete

- Single-page CRUD with inline Dialogs (create, edit, delete confirmation)
- Image upload with preview
- Active/Inactive toggle
- Soft delete with restore capability (backend only, no UI for restore)
- Search by name/description
- Filter by status (active/inactive/all)
- Product count per category
- Cannot delete category with associated products

## 5. Unit Management

**Status:** Complete

- Single-page CRUD with inline Dialogs (create, edit, delete confirmation)
- Name and abbreviation fields
- Search by name/abbreviation
- Product variant count per unit
- Cannot delete unit in use by variants

## 6. Product Management

**Status:** Complete

- Index page: Table with category filter dropdown, search by name/SKU/brand, toggle active status
- Create page: Form with category select, name, brand, image upload, inline variant creation (add multiple variants with unit, name, units_per_package, cost_price, selling_price, per_unit_price, min_stock, max_stock)
- Show page: Read-only view of product details (SKU, brand, category) + variants table with stock status badges
- Edit page: Edit product details form + variants table with inline add new variant, edit variant (dialog), delete variant
- SKU auto-generation: Product SKU = first 3 letters of name + dash + sequential 4-digit number. Variant SKU = product SKU + first 2 letters of variant name + 2-digit count
- Soft delete with restore capability (backend only, no UI for restore)
- Toggle active status
- Image upload with Storage disk

## 7. Product Variant Management

**Status:** Complete (via Product CRUD + Stock/Price Update page)

- Created, updated, deleted as part of product create/edit flows
- Dedicated endpoints for variant store, update, destroy
- Stock & Price Update page (`/stock-price-update`): Bulk editing interface for all active product variants. Inline editable fields for stock_quantity, cost_price, selling_price, per_unit_price with per-row save button. Category filter, unit filter, search, pagination (20 per page). Auto-calculates per_unit_price when cost_price or units_per_package changes

## 8. Point of Sale (POS) / Checkout

**Status:** Complete

- Product grid with images, category filter, search
- Each product card shows variants with stock, price, +/- quantity buttons
- Out-of-stock variants shown but disabled (opacity 40%, "Out" badge)
- Low stock indicator ("(Low)" label)
- Cart sidebar (right side on desktop, bottom sticky bar on mobile):
  - Add/remove items, +/- quantity, per-item subtotals
  - Stock validation (cannot exceed available quantity)
  - Discount and Tax inputs (on new sales only)
  - Subtotal/discount/tax/total breakdown
  - Payment method selector (Cash, KBZ Pay)
  - Amount paid input with auto-change calculation
  - Optional notes field
  - "Charge" button with total amount display
- Edit existing sale: Can load a sale into checkout page to add more items. Shows existing items, allows adding new items with additional payment. Button says "Add Items" instead of "Charge"
- Stock decrement: On checkout, variant stock_quantity is decremented within a DB transaction with row-level locking (lockForUpdate)
- Invoice number: Auto-generated format INV-YYYYMMDD-XXXX
- Cost price snapshot: Each sale_item stores the variant's cost_price at time of sale

## 9. Sales History

**Status:** Complete

- Today's transactions by default, or filter by date range (start/end date)
- Paginated (15 per page) with page navigation (ellipsis for large page counts)
- Summary cards: Total Sales, Total Change
- Search by invoice number or notes
- Expandable rows: Click to expand and see line items (product name, variant, unit, qty, price, total)
- Each expanded row has an "Edit" button linking to POS checkout in edit mode
- Payment method display with icons (Banknote for Cash, Smartphone for KBZ Pay)
- Shows invoice, time, paid amount, receive amount, change, payment method, discount, tax

## 10. User Management

**Status:** Complete

- Admin users page: List all users (except self), search by name/email/role
- Create user page: Full-page form with name, email, password, password_confirmation, role (admin/cashier)
- Edit user: Inline dialog with name, email, password (optional), password_confirmation, role
- Delete user: Confirmation dialog (cannot delete self)
- Role display with colored badges (blue for admin, gray for cashier)

## 11. Profile Settings

**Status:** Complete

- Edit name and email
- Email verification re-send
- Delete account (with password confirmation)

## 12. Security Settings

**Status:** Complete

- Change password (current password, new password, confirm)
- Rate-limited (6 attempts per minute)
- Requires password confirmation to access page

## 13. Appearance Settings

**Status:** Complete

- Light/Dark/System theme toggle

## 14. Internationalization (i18n)

**Status:** Complete

- Cookie-based locale switching (Myanmar/English)
- All UI text wrapped in translation function
- Server-side loads translation JSON file based on cookie locale
- Locale switcher in sidebar footer
- Language stored in cookie, page reloads on switch

---

## UI Flow

## Navigation Structure

**Active Layout:** Top navbar (desktop) + hamburger menu (mobile)

### Navbar Items

- **Dashboard** — `/dashboard`
- **POS** — `/sales/checkout`
- **Sales History** — `/sales`
- **Inventory** (dropdown, hidden for cashiers):
  - Categories — `/categories`
  - Units — `/units`
  - Products — `/products`
  - Stock & Price Update — `/stock-price-update`

### User Menu (top right)

- User avatar + name
- Settings link
- Log out

### Settings Sidebar (under `/settings/*`)

- Profile — `/settings/profile`
- Security — `/settings/security`
- Appearance — `/settings/appearance`
- Users (admin only) — `/settings/users`

## Complete User Journeys

### Journey 1: Login

```folders
/ (redirect) → /login → [email + password + remember me]
  ├─ Forgot password → /forgot-password → email sent
  └─ Success → /dashboard
```

### Journey 2: Dashboard

```folders
/dashboard
  ├─ View KPIs: Inventory Value, Profit/Loss, Today's Sales
  ├─ Most Sold Products table (top 10)
  ├─ Low Stock Variants table (limit 10)
  ├─ Recent Sales table (today's)
  └─ Navigate to any section via navbar
```

### Journey 3: POS / Checkout (Primary cashier screen)

```folders
/sales/checkout
  ├─ Browse products by category (click category tabs)
  ├─ Search products by name
  ├─ Click variant to add to cart
  │   └─ Out-of-stock variants: shown but disabled (opacity + "Out" badge)
  ├─ Cart sidebar (desktop right / mobile bottom sticky):
  │   ├─ +/- quantity per item
  │   ├─ Remove item
  │   ├─ Set discount & tax (new sales only)
  │   ├─ Payment method: Cash / KBZ Pay
  │   ├─ Amount paid → auto-calculate change
  │   ├─ Optional notes
  │   └─ "Charge" button → Creates sale → redirects to Sales History
  └─ Edit mode (from Sales History):
      └─ Load existing sale → add more items → "Add Items" button
```

### Journey 4: Sales History

```folders
/sales
  ├─ Default: today's transactions
  ├─ Filter: date range (start/end)
  ├─ Search: invoice number or notes
  ├─ Summary cards: Total Sales, Total Change
  ├─ Expandable rows → see line items
  │   └─ "Edit" button → /sales/checkout (edit mode)
  └─ Pagination (15 per page)
```

### Journey 5: Category Management (Admin)

```folders
/categories
  ├─ View all categories (table with product counts)
  ├─ Search by name/description
  ├─ Filter: active/inactive/all
  ├─ Create → Dialog: name, description, image → Save
  ├─ Edit → Dialog: update fields → Save
  ├─ Toggle active/inactive
  └─ Delete → Confirmation dialog (blocked if has products)
```

### Journey 6: Unit Management (Admin)

```folders
/units
  ├─ View all units (table with variant counts)
  ├─ Search by name/abbreviation
  ├─ Create → Dialog: name, abbreviation → Save
  ├─ Edit → Dialog: update fields → Save
  └─ Delete → Confirmation dialog (blocked if in use)
```

### Journey 7: Product Management (Admin)

```folders
/products
  ├─ Index: Table with category filter, search (name/SKU/brand)
  ├─ Create → /products/create
  │   ├─ Product info: category, name, brand, image
  │   └─ Variants: add multiple (unit, name, units_per_package, cost_price, selling_price, min/max stock)
  │       └─ Auto-calculates per_unit_price = cost_price / units_per_package
  ├─ Show → /products/{id}
  │   └─ Read-only view: details + variants table with stock status badges
  ├─ Edit → /products/{id}/edit
  │   ├─ Product info form
  │   └─ Variants table: add new, edit (dialog), delete
  ├─ Toggle active/inactive
  └─ Delete → Soft delete
```

### Journey 8: Stock & Price Update (Admin)

```folders
/stock-price-update
  ├─ Bulk table of all active product variants
  ├─ Inline edit: stock_quantity, cost_price, selling_price, per_unit_price
  ├─ Per-row save button (enabled only when values differ)
  ├─ Filters: category, unit, text search
  └─ Pagination (20 per page, client-side)
```

### Journey 9: User Management (Admin)

```folders
/settings/users
  ├─ List all users (except self) with search
  ├─ Create → /settings/users/create
  │   └─ Form: name, email, password, confirm password, role
  ├─ Edit → Inline dialog: name, email, password (optional), role
  └─ Delete → Confirmation dialog (cannot delete self)
```

### Journey 10: Profile Settings

```folders
/settings/profile
  ├─ Edit name and email
  ├─ Email verification re-send
  └─ Delete account (with password confirmation)
```

### Journey 11: Security Settings

```folders
/settings/security
  ├─ Requires password confirmation to access
  └─ Change password: current password, new password, confirm
```

### Journey 12: Appearance Settings

```folders
/settings/appearance
  └─ Toggle: Light / Dark / System theme
```

---

## Data Relationships

```text
Category (1) ──── (N) Product (1) ──── (N) ProductVariant (N) ──── (1) Unit
                              ProductVariant (1) ──── (N) SaleItem (N) ──── (1) Sale (N) ──── (1) User
```

---

## Planned / Incomplete Features

- **Profit & Loss Report Page** — Dashboard has basic profit calculation but no dedicated P&L report page with month selector, per-product breakdown, COGS, margin percentage
- **Advanced RBAC** — Only basic admin/cashier roles. No permission system, no policies, no Manager role
- **Stock Adjustment** — Increase/decrease with reason tracking (not implemented)
- **Stock Transfer** — Between locations (not implemented, no multi-location support)
- **Stock Take / Inventory Count** — Not implemented
- **Out-of-stock filtering on POS** — Currently shows disabled; no toggle to hide
- **Restore UI for Categories/Products** — Backend routes exist but no UI buttons
- **Two-Factor Authentication** — Columns exist on users table but 2FA UI/logic not implemented
- **Email Verification** — `MustVerifyEmail` is commented out in User model
- **Weighted Average Cost Price** — Method exists in model but never called in controllers
- **Sidebar Layout** — Component exists but is commented out; app uses navbar layout exclusively
