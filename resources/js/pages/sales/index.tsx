import { Head, router, usePage } from '@inertiajs/react';
import { Search, Trash2, ShoppingCart, MinusIcon, PlusIcon } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { salesCheckout, dashboard } from '@/feature-routes';
import { useFlashToast } from '@/hooks/use-flash-toast';
import { useTranslation } from '@/lib/i18n';
import type { Product, CartItem } from '@/types';

const num = (v: unknown): number => Number(v) || 0;

const ks = (v: unknown): string => {
    return num(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

type Props = {
    products: Product[];
};

let cartIdCounter = 0;

export default function SalesIndex({ products }: Props) {
    useFlashToast();
    const { t } = useTranslation();

    const { errors } = usePage().props;

    const [cart, setCart] = useState<CartItem[]>([]);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [amountPaid, setAmountPaid] = useState('');
    const [discount, setDiscount] = useState('');
    const [tax, setTax] = useState('');
    const [notes, setNotes] = useState('');
    const [processing, setProcessing] = useState(false);

    const categories = useMemo(() => {
        const cats = new Map<number, { id: number; name: string }>();
        products.forEach((p) => {
            if (p.category) {
cats.set(p.category.id, p.category);
}
        });

        return Array.from(cats.values());
    }, [products]);

    const filteredProducts = useMemo(() => {
        return products.filter((p) => {
            const matchesSearch =
                !search ||
                p.name.toLowerCase().includes(search.toLowerCase()) ||
                p.sku.toLowerCase().includes(search.toLowerCase());
            const matchesCategory =
                selectedCategory === 'all' ||
                p.category?.id.toString() === selectedCategory;

            return matchesSearch && matchesCategory && p.is_active;
        });
    }, [products, search, selectedCategory]);

    const addToCart = (variant: Product['variants'][number]) => {
        if (num(variant.stock_quantity) <= 0) {
return;
}

        setCart((prev) => {
            const existing = prev.find((item) => item.variant_id === variant.id);

            if (existing) {
                if (existing.quantity >= variant.stock_quantity) {
return prev;
}

                return prev.map((item) =>
                    item.variant_id === variant.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item,
                );
            }

            cartIdCounter++;

            return [
                ...prev,
                {
                    id: `cart-${cartIdCounter}`,
                    variant_id: variant.id,
                    product_name: variant.product?.name ?? '',
                    variant_name: variant.name,
                    unit_name: variant.unit?.abbreviation ?? null,
                    unit_price: num(variant.selling_price),
                    cost_price: num(variant.cost_price),
                    quantity: 1,
                    stock_quantity: variant.stock_quantity,
                },
            ];
        });
    };

    const updateQuantity = (itemId: string, delta: number) => {
        setCart((prev) =>
            prev
                .map((item) => {
                    if (item.id !== itemId) {
return item;
}

                    const newQty = item.quantity + delta;

                    if (newQty <= 0) {
return null;
}

                    if (newQty > item.stock_quantity) {
return item;
}

                    return { ...item, quantity: newQty };
                })
                .filter(Boolean) as CartItem[],
        );
    };

    const removeFromCart = (itemId: string) => {
        setCart((prev) => prev.filter((item) => item.id !== itemId));
    };

    const subtotal = useMemo(
        () => cart.reduce((sum, item) => sum + item.unit_price * item.quantity, 0),
        [cart],
    );

    const discountNum = parseFloat(discount) || 0;
    const taxNum = parseFloat(tax) || 0;
    const total = subtotal - discountNum + taxNum;
    const change = Math.max(0, (parseFloat(amountPaid) || 0) - total);

    const handleCheckout = () => {
        if (cart.length === 0) {
return;
}

        if ((parseFloat(amountPaid) || 0) < total) {
            alert(t('Amount paid must be at least the total amount.'));

            return;
        }

        setProcessing(true);

        router.post(
            salesCheckout().url,
            {
                items: cart.map((item) => ({
                    variant_id: item.variant_id,
                    quantity: item.quantity,
                })),
                payment_method: paymentMethod,
                amount_paid: parseFloat(amountPaid) || total,
                discount: discountNum,
                tax: taxNum,
                notes: notes || null,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setCart([]);
                    setAmountPaid('');
                    setDiscount('');
                    setTax('');
                    setNotes('');
                    setPaymentMethod('cash');
                    setProcessing(false);
                },
                onError: () => {
                    setProcessing(false);
                },
                onFinish: () => {
                    setProcessing(false);
                },
            },
        );
    };

    return (
        <>
            <Head title={t('Point of Sale')} />
            <div className="flex h-full flex-1 gap-4 p-4">
                <div className="flex flex-1 flex-col gap-4 overflow-auto">
                    <div className="flex items-center gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder={t('Search products...')}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Select
                            value={selectedCategory}
                            onValueChange={setSelectedCategory}
                        >
                            <SelectTrigger className="w-44">
                                <SelectValue placeholder={t('All Categories')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('All Categories')}</SelectItem>
                                {categories.map((cat) => (
                                    <SelectItem key={cat.id} value={cat.id.toString()}>
                                        {cat.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-3 xl:grid-cols-3 2xl:grid-cols-4">
                        {filteredProducts.map((product) => {
                            const primaryVariant = product.variants[0];
                            const imgSrc = product.image_url || primaryVariant?.image_url || null;

                            return (
                                <Card key={product.id} className="overflow-hidden">
                                    {imgSrc ? (
                                        <div className="aspect-[4/3] w-full overflow-hidden bg-muted">
                                            <img
                                                src={imgSrc}
                                                alt={product.name}
                                                className="h-full w-full object-cover transition-transform hover:scale-105"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex aspect-[4/3] w-full items-center justify-center bg-muted">
                                            <ShoppingCart className="h-8 w-8 text-muted-foreground/40" />
                                        </div>
                                    )}
                                    <CardHeader className="p-3 pb-0">
                                        <CardTitle className="truncate text-sm font-semibold">
                                            {product.name}
                                        </CardTitle>
                                        <p className="text-xs text-muted-foreground">
                                            {product.category?.name || '—'}
                                        </p>
                                    </CardHeader>
                                    <CardContent className="space-y-1 p-3 pt-1">
                                        {product.variants.length === 0 ? (
                                            <p className="py-2 text-center text-xs text-muted-foreground">
                                                {t('No variants')}
                                            </p>
                                        ) : (
                                            product.variants.map((variant) => {
                                                const inCart = cart.find(
                                                    (ci) => ci.variant_id === variant.id,
                                                );

                                                return (
                                                    <button
                                                        key={variant.id}
                                                        type="button"
                                                        disabled={
                                                            variant.stock_quantity <= 0
                                                        }
                                                        onClick={() => addToCart(variant)}
                                                        className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
                                                    >
                                                        <div className="min-w-0 flex-1">
                                                            <span className="font-medium">
                                                                {variant.name || t('Default')}
                                                            </span>
                                                            <span className="ml-1 text-xs text-muted-foreground">
                                                                ({variant.unit?.abbreviation ||
                                                                    'pc'}
                                                                )
                                                            </span>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs font-semibold text-primary">
                                                                    Ks {ks(variant.selling_price)}
                                                                </span>
                                                                {variant.stock_quantity <=
                                                                    variant
                                                                        .min_stock_level && (
                                                                    <Badge
                                                                        variant={
                                                                            variant.stock_quantity <=
                                                                            0
                                                                                ? 'destructive'
                                                                                : 'warning'
                                                                        }
                                                                        className="text-[10px]"
                                                                    >
{variant.stock_quantity <=
                                                                        0
                                                                            ? t('Out')
                                                                            : t('Low')}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {inCart && (
                                                                <Badge
                                                                    variant="secondary"
                                                                    className="mr-1 text-xs"
                                                                >
                                                                    {inCart.quantity}
                                                                </Badge>
                                                            )}
                                                            <PlusIcon className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                                                        </div>
                                                    </button>
                                                );
                                            })
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                        {filteredProducts.length === 0 && (
                            <div className="col-span-full flex items-center justify-center py-16 text-muted-foreground">
                                {t('No products found')}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex w-96 flex-shrink-0 flex-col gap-4 self-start">
                    <Card className="flex max-h-[calc(100dvh-8rem)] flex-col overflow-hidden">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <ShoppingCart className="h-5 w-5" />
                                {t('Cart')} ({cart.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-1 flex-col gap-0 overflow-auto p-0">
                            {cart.length === 0 ? (
                                <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
                                    {t('Select products to add')}
                                </div>
                            ) : (
                                <div className="flex flex-1 flex-col">
                                    <div className="flex-1 space-y-1 overflow-auto px-3">
                                        {cart.map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex items-center gap-2 rounded-md border p-2"
                                            >
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-medium leading-tight">
                                                        {item.product_name}
                                                    </p>
                                                    <p className="truncate text-xs text-muted-foreground">
                                                        {item.variant_name || t('Default')}
                                                        {item.unit_name
                                                            ? ` / ${item.unit_name}`
                                                            : ''}
                                                    </p>
                                                    <p className="text-xs font-semibold text-primary">
                                                        Ks {ks(item.unit_price)}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-7 w-7"
                                                        onClick={() =>
                                                            updateQuantity(
                                                                item.id,
                                                                -1,
                                                            )
                                                        }
                                                    >
                                                        <MinusIcon className="h-3 w-3" />
                                                    </Button>
                                                    <span className="flex h-7 min-w-[2rem] items-center justify-center text-sm font-medium tabular-nums">
                                                        {item.quantity}
                                                    </span>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-7 w-7"
                                                        disabled={
                                                            item.quantity >=
                                                            item.stock_quantity
                                                        }
                                                        onClick={() =>
                                                            updateQuantity(
                                                                item.id,
                                                                1,
                                                            )
                                                        }
                                                    >
                                                        <PlusIcon className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                                <p className="w-16 text-right text-sm font-medium tabular-nums">
                                                    Ks {ks(item.unit_price * item.quantity)}
                                                </p>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 text-destructive"
                                                    onClick={() =>
                                                        removeFromCart(item.id)
                                                    }
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="space-y-2 border-t p-3">
                                        {errors.items && (
                                            <p className="text-xs text-destructive">
                                                {errors.items}
                                            </p>
                                        )}

                                        <div className="flex items-center gap-2">
                                            <Input
                                                placeholder={t('Discount')}
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={discount}
                                                onChange={(e) =>
                                                    setDiscount(e.target.value)
                                                }
                                                className="h-8 text-xs"
                                            />
                                            <Input
                                                placeholder={t('Tax')}
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={tax}
                                                onChange={(e) =>
                                                    setTax(e.target.value)
                                                }
                                                className="h-8 text-xs"
                                            />
                                        </div>

                                        <div className="space-y-1 text-sm">
                                            <div className="flex justify-between text-muted-foreground">
                                                <span>{t('Subtotal')}</span>
                                                <span>Ks {ks(subtotal)}</span>
                                            </div>
                                            {discountNum > 0 && (
                                                <div className="flex justify-between text-muted-foreground">
                                                    <span>{t('Discount')}</span>
                                                    <span className="text-destructive">
                                                        -{ks(discountNum)}
                                                    </span>
                                                </div>
                                            )}
                                            {taxNum > 0 && (
                                                <div className="flex justify-between text-muted-foreground">
                                                    <span>{t('Tax')}</span>
                                                    <span>
                                                        +Ks {ks(taxNum)}
                                                    </span>
                                                </div>
                                            )}
                                            <Separator />
                                            <div className="flex justify-between font-bold">
                                                <span>{t('Total')}</span>
                                                <span>Ks {ks(total)}</span>
                                            </div>
                                        </div>

                                        <Select
                                            value={paymentMethod}
                                            onValueChange={setPaymentMethod}
                                        >
                                            <SelectTrigger className="h-8 text-xs">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="cash">
                                                    {t('Cash')}
                                                </SelectItem>
                                                <SelectItem value="kbzpay">
                                                    KBZ Pay
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>

                                        <Input
                                            placeholder={t('Amount paid')}
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={amountPaid}
                                            onChange={(e) =>
                                                setAmountPaid(e.target.value)
                                            }
                                            className="h-8 text-xs"
                                        />

                                        {parseFloat(amountPaid || '0') > 0 && (
                                            <div className="flex justify-between text-xs">
                                                <span className="text-muted-foreground">
                                                    {t('Change')}
                                                </span>
                                                <span className="font-semibold text-green-600 dark:text-green-400">
                                                    Ks {ks(change)}
                                                </span>
                                            </div>
                                        )}

                                        <Input
                                            placeholder={t('Notes (optional)')}
                                            value={notes}
                                            onChange={(e) =>
                                                setNotes(e.target.value)
                                            }
                                            className="h-8 text-xs"
                                        />

                                        <Button
                                            className="w-full"
                                            size="lg"
                                            disabled={
                                                cart.length === 0 || processing
                                            }
                                            onClick={handleCheckout}
                                        >
                                            {processing
                                                ? t('Processing...')
                                                : `${t('Charge')} Ks ${ks(total)}`}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

SalesIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'POS', href: '#' },
    ],
};
