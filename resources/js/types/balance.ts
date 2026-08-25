export type Balance = {
    id: number;
    opening_amount: number;
    closing_amount: number;
    total_sale_amount: number;
    total_change_amount: number;
    user: {
        id: number;
        name: string;
        email: string;
    } | null;
    created_at: string;
    updated_at: string;
};

export type BalanceForm = {
    opening_amount: number;
    closing_amount: number;
    total_sale_amount: number;
    total_change_amount: number;
};
