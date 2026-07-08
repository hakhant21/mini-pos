import type { ProductVariant } from './product';

export type DashboardData = {
    totalStock: number;
    totalProducts: number;
    totalVariants: number;
    inventoryValue: number;
    lowStockVariants: ProductVariant[];
};
