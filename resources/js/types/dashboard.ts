import type { ProductVariant } from './product';
import type { Sale } from './sale';

export type DashboardData = {
    totalStock: number;
    totalProducts: number;
    totalVariants: number;
    inventoryValue: number;
    lowStockVariants: ProductVariant[];
    totalRevenue: number;
    totalCost: number;
    totalProfit: number;
    totalSales: number;
    recentSales: Sale[];
};
