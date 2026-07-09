export type CartItem = {
    id: string;
    variant_id: number;
    product_name: string;
    variant_name: string | null;
    unit_name: string | null;
    unit_price: number;
    cost_price: number;
    quantity: number;
    stock_quantity: number;
};

export type Sale = {
    id: number;
    invoice_number: string;
    total_amount: number;
    payment_method: string;
    amount_paid: number;
    change: number;
    discount: number;
    tax: number;
    notes: string | null;
    items: SaleItem[];
    created_at: string;
};

export type SaleItem = {
    id: number;
    product_variant_id: number;
    product_name: string;
    variant_name: string | null;
    unit_name: string | null;
    quantity: number;
    unit_price: number;
    cost_price: number;
    total_price: number;
};
