import type { Category } from './category';
import type { Unit } from './unit';

export type Product = {
    id: number;
    name: string;
    sku: string;
    image: string | null;
    image_url: string | null;
    brand: string | null;
    is_active: boolean;
    category: Category | null;
    variants: ProductVariant[];
    variants_count?: number;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
};

export type ProductVariant = {
    id: number;
    product_id: number;
    unit_id: number;
    name: string | null;
    image: string | null;
    image_url: string | null;
    sku: string;
    units_per_package: number;
    cost_price: number;
    selling_price: number;
    per_unit_price: number;
    stock_quantity: number;
    min_stock_level: number;
    max_stock_level: number | null;
    is_active: boolean;
    stock_status: 'in_stock' | 'low_stock' | 'out_of_stock';
    product?: Product;
    unit: Unit | null;
    created_at: string;
    updated_at: string;
};

export type ProductForm = {
    category_id: number;
    name: string;
    sku: string;
    image?: File | string | null;
    brand?: string;
    is_active?: boolean;
};

export type ProductVariantForm = {
    unit_id: number;
    name?: string;
    sku: string;
    units_per_package: number;
    cost_price: number;
    selling_price: number;
    min_stock_level: number;
    max_stock_level?: number;
    is_active?: boolean;
};
