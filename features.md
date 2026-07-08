# Features

## 1. User Management

**Status:** Basic (needs expansion)

- User registration and authentication (Laravel default)
- Profile management
- **Planned:** Role-based access control, user listing, CRUD

## 2. Role & Permission Management

**Status:**

- **Planned:** Define roles (e.g., Admin, Cashier, Manager)
- **Planned:** Assign permissions to roles
- **Planned:** Assign roles to users
- **Planned:** Gate/Policy-based authorization checks across all features

## 3. Category Management

**Status:**

- Create, Read, Update, Soft Delete categories
- Categories are hierarchical to products
- Toggle active/inactive status
- Prevent deletion when category has associated products
- Pagination with "Load More"

## 4. Unit Management

**Status:**

- Create, Read, Update, Delete units (e.g., Bottle, Can, Pack, Carton, etc.)
- Units are assigned to product variants
- Prevent deletion when unit is in use by a variant

## 5. Product Management

**Status:**

- Create, Read, Update, Soft Delete products
- Each product belongs to a category
- Each product has one or more variants
- Product details: name, SKU, brand, category
- SKU auto-generation
- Search by name, SKU, or category
- Toggle active/inactive
- Prevent deletion when product has sale records

## 6. Variant (ProductVariant) Management

**Status:**

- Each product supports multiple variants (e.g., same beer in Bottle vs Can)
- Variant details: unit, units per package, cost price, selling price, per-unit price
- Stock tracking: current quantity, minimum stock level, maximum stock level
- Stock status indicators: In Stock, Low Stock, Out of Stock (with color-coded labels)
- Stock increment/decrement/adjustment methods
- Weighted average cost price recalculation on stock additions

## 7. Sale Management

**Status:**

- Create new sales with product search and variant selection
- Cart management: add items, increase/decrease quantity, remove items
- Support for selling by package or single unit
- Payment: multiple payment methods, amount paid with auto-change calculation
- Invoice number auto-generation (format: INV-YYYYMMDD-XXXX)
- Discount, tax, and notes per sale
- Daily and monthly sales totals
- View sale history with pagination
- View individual sale detail
- Cost price is snapshotted to each sale item at time of sale — future price changes don't affect historical records

## 8. Inventory Management

**Status:**

### Stock In (Add Stock)

- Product search and variant selection
- Add stock quantity with cost price update
- Weighted average cost price recalculation
- Low stock variant alerts

### Stock Status Monitoring

- **In Stock:** Stock quantity > min stock level
- **Low Stock:** Stock quantity > 0 but ≤ min stock level
- **Out of Stock:** Stock quantity = 0

### Cost Price Tracking

- When a sale is completed, the variant's current cost price is snapshotted to `sale_items.cost_price`
- Future stock additions that change the weighted average cost price do not affect historical COGS
- Profit/Loss reports use the snapshotted `sale_items.cost_price`, falling back to the variant's current cost price if missing (backwards compatibility)

### Planned Enhancements

- Stock adjustment (increase/decrease with reason)
- Stock transfer between locations
- Stock take / inventory count
- Out-of-stock product filtering on sales screen

## 9. Profit & Loss Reporting

**Status:**

- Month selector for date range filtering
- Per-product breakdown: items sold, quantity, revenue
- Cost of Goods Sold (COGS) calculation
- Profit = Revenue - COGS
- Margin percentage = (Profit / Revenue) × 100
- Summary row with totals
- Data source: sale items with variant cost prices

## 10. Dashboard

**Status:**

- Total stock count (sum of all variant stock quantities)
- Today's sales count
- Today's revenue (total sales amount)
- Total inventory value (stock quantity × cost price)
- Low stock variant alerts (quick view)
- Recent 5 sales (quick reference)

## 11. Data Relationships

```text

Category (1) ──── (N) Product (1) ──── (N) ProductVariant (N) ──── (1) Unit
                              ProductVariant (1) ──── (N) SaleItem (N) ──── (1) Sale
```

- **Cost Price:** stored on `product_variants.cost_price` (current weighted average) and snapshotted to `sale_items.cost_price` at sale time
- **Sell Price:** stored on `product_variants.selling_price` and copied to `sale_items.unit_price` at time of sale
- **Profit/Loss:** calculated in reports as `SUM(sale_items.total_price) - SUM(sale_items.quantity * sale_items.cost_price)`, falling back to `product_variants.cost_price` if snapshot is missing
- **Stock Status:** computed attribute on ProductVariant based on `stock_quantity` vs `min_stock_level` thresholds
