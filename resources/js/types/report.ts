export type VariantReport = {
    id: number;
    sku: string;
    unit: string;
    stock_quantity: number;
    cost_price: number;
    selling_price: number;
    stock_value: number;
};

export type ProductReport = {
    product_name: string;
    category: string;
    total_stock: number;
    total_value: number;
    variants: VariantReport[];
};

export type ReportSummary = {
    total_products: number;
    total_variants: number;
    total_stock: number;
    total_inventory_value: number;
};
