export type Category = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    is_active: boolean;
    products_count?: number;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
};

export type CategoryForm = {
    name: string;
    description?: string;
    is_active?: boolean;
};
