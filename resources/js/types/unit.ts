export type Unit = {
    id: number;
    name: string;
    abbreviation: string;
    product_variants_count?: number;
    created_at: string;
    updated_at: string;
};

export type UnitForm = {
    name: string;
    abbreviation: string;
};
