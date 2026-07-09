import { Head, Link } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import { LoaderCircle, Search } from 'lucide-react';
import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { inventory, inventoryCreate, inventoryStore, inventorySearchProducts, dashboard } from '@/feature-routes';
import type { Product, ProductVariant } from '@/types';

export default function InventoryCreate() {
    const { data, setData, post, processing, errors } = useForm({
        variant_id: 0,
        quantity: 0,
        cost_price: 0,
    });

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = useCallback(async () => {
        if (!searchQuery.trim()) {
return;
}

        setIsSearching(true);

        try {
            const res = await fetch(inventorySearchProducts.get().url + `&search=${encodeURIComponent(searchQuery)}`);
            const results = await res.json();
            setSearchResults(results);
        } finally {
            setIsSearching(false);
        }
    }, [searchQuery]);

    const selectVariant = (variant: ProductVariant) => {
        setSelectedVariant(variant);
        setData('variant_id', variant.id);
        setSearchResults([]);
        setSearchQuery('');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(inventoryStore().url, {
            preserveScroll: true,
            onSuccess: () => {
                setSelectedVariant(null);
                setData('variant_id', 0);
                setData('quantity', 0);
                setData('cost_price', 0);
            },
        });
    };

    return (
        <>
            <Head title="Add Stock" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Add Stock</h1>
                    <Link href={inventory()}>
                        <Button variant="outline">Back to Inventory</Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Search Product Variant</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    className="pl-9"
                                    placeholder="Search by product name or SKU..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                />
                            </div>
                            <Button onClick={handleSearch} disabled={isSearching}>
                                {isSearching && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                Search
                            </Button>
                        </div>

                        {searchResults.length > 0 && (
                            <div className="space-y-2">
                                {searchResults.map((product) => (
                                    <div key={product.id} className="rounded-lg border p-3">
                                        <p className="font-medium">{product.name}</p>
                                        <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                                        <div className="mt-2 grid grid-cols-2 gap-2">
                                            {product.variants.map((variant) => (
                                                <Button
                                                    key={variant.id}
                                                    variant="outline"
                                                    className="justify-start"
                                                    onClick={() => selectVariant(variant)}
                                                >
                                                    {variant.name || '—'} ({variant.unit?.abbreviation}) — Stock: {variant.stock_quantity}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {selectedVariant && (
                    <form onSubmit={handleSubmit}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Stock Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="rounded-lg bg-muted p-3">
                                    <p className="font-medium">{selectedVariant.product?.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {selectedVariant.name} — {selectedVariant.unit?.abbreviation}
                                        {' | '}Current Stock: {selectedVariant.stock_quantity}
                                        {' | '}Cost Price: ${selectedVariant.cost_price}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="quantity">Quantity to Add</Label>
                                        <Input
                                            id="quantity"
                                            type="number"
                                            step="0.01"
                                            min="0.01"
                                            value={data.quantity || ''}
                                            onChange={(e) => setData('quantity', parseFloat(e.target.value) || 0)}
                                        />
                                        {errors.quantity && <p className="text-sm text-destructive">{errors.quantity}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="cost_price">New Cost Price (per unit)</Label>
                                        <Input
                                            id="cost_price"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.cost_price || ''}
                                            onChange={(e) => setData('cost_price', parseFloat(e.target.value) || 0)}
                                        />
                                        {errors.cost_price && <p className="text-sm text-destructive">{errors.cost_price}</p>}
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <Button type="submit" disabled={processing}>
                                        {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                        Add Stock
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </form>
                )}
            </div>
        </>
    );
}

InventoryCreate.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Inventory', href: inventory() },
        { title: 'Add Stock', href: inventoryCreate() },
    ],
};
