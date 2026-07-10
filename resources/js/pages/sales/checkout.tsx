import { Head, router, usePage } from '@inertiajs/react';
import {
    Search,
    Trash2,
    ShoppingCart,
    MinusIcon,
    PlusIcon,
    Package,
} from 'lucide-react';
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
import { salesCheckout, sales, dashboard } from '@/feature-routes';
import { useFlashToast } from '@/hooks/use-flash-toast';
import { useTranslation } from '@/lib/i18n';
import { num, ks } from '@/lib/utils';
import type { Product, CartItem } from '@/types';

type Props = {
    products: Product[];
};

let cartIdCounter = 0;

export default function SalesCheckout({ products }: Props) {
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

    const getCartItemQuantity = (variantId: number): number => {
        const item = cart.find((ci) => ci.variant_id === variantId);

        return item?.quantity ?? 0;
    };

    const addToCart = (variant: Product['variants'][number]) => {
        if (num(variant.stock_quantity) <= 0) {
            return;
        }

        setCart((prev) => {
            const existing = prev.find(
                (item) => item.variant_id === variant.id,
            );

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
        setCart(
            (prev) =>
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
        () =>
            cart.reduce(
                (sum, item) => sum + item.unit_price * item.quantity,
                0,
            ),
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
                <div className="flex flex-1 flex-col gap-3 overflow-auto">
                    <div className="flex items-center gap-3">
                        <Select
                            value={selectedCategory}
                            onValueChange={setSelectedCategory}
                        >
                            <SelectTrigger className="w-40">
                                <SelectValue
                                    placeholder={t('All Categories')}
                                />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    {t('All Categories')}
                                </SelectItem>
                                {categories.map((cat) => (
                                    <SelectItem
                                        key={cat.id}
                                        value={cat.id.toString()}
                                    >
                                        {cat.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="relative flex-1">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder={t('Search products...')}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                        {filteredProducts.map((product) => {
                            const primaryVariant = product.variants[0];
                            const imgSrc =
                                product.image_url ||
                                primaryVariant?.image_url ||
                                null;

                            return (
                                <Card
                                    key={product.id}
                                    className="overflow-hidden p-0 transition-shadow hover:shadow-md"
                                >
                                    {imgSrc ? (
                                        <div className="relative h-30 w-full overflow-hidden bg-muted">
                                            <img
                                                src={imgSrc}
                                                alt={product.name}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex h-30 w-full items-center justify-center bg-muted">
                                            <Package className="h-8 w-8 text-muted-foreground/30" />
                                        </div>
                                    )}
                                    <CardHeader className="p-2 pb-0">
                                        <CardTitle className="truncate text-xs leading-tight font-semibold">
                                            {product.name}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-1 p-2 pt-1">
                                        {product.variants.length === 0 ? (
                                            <p className="py-1 text-center text-[10px] text-muted-foreground">
                                                {t('No variants')}
                                            </p>
                                        ) : (
                                            product.variants.map((variant) => {
                                                const qtyInCart =
                                                    getCartItemQuantity(
                                                        variant.id,
                                                    );
                                                const isOutOfStock =
                                                    variant.stock_quantity <= 0;
                                                const isLowStock =
                                                    variant.stock_quantity >
                                                        0 &&
                                                    variant.stock_quantity <=
                                                        variant.min_stock_level;
                                                const atMaxStock =
                                                    qtyInCart >=
                                                    variant.stock_quantity;

                                                return (
                                                    <div
                                                        key={variant.id}
                                                        className={`rounded-md border p-1.5 transition-colors ${
                                                            isOutOfStock
                                                                ? 'opacity-40'
                                                                : 'hover:bg-accent/50'
                                                        }`}
                                                    >
                                                        <div className="flex items-center justify-between gap-1">
                                                            <div className="min-w-0 flex-1">
                                                                <p className="truncate text-[11px] leading-tight font-medium">
                                                                    {variant.name ||
                                                                        t(
                                                                            'Default',
                                                                        )}
                                                                    <span className="ml-0.5 text-muted-foreground">
                                                                        (
                                                                        {variant
                                                                            .unit
                                                                            ?.abbreviation ||
                                                                            'pc'}
                                                                        )
                                                                    </span>
                                                                </p>
                                                                <p className="text-[11px] font-semibold text-primary">
                                                                    Ks{' '}
                                                                    {ks(
                                                                        variant.selling_price,
                                                                    )}
                                                                </p>
                                                                <p className="text-[9px] text-muted-foreground">
                                                                    {t('Stock')}
                                                                    :{' '}
                                                                    {
                                                                        variant.stock_quantity
                                                                    }
                                                                    {isLowStock && (
                                                                        <span className="ml-0.5 text-orange-600 dark:text-orange-400">
                                                                            (
                                                                            {t(
                                                                                'Low',
                                                                            )}
                                                                            )
                                                                        </span>
                                                                    )}
                                                                </p>
                                                            </div>

                                                            {isOutOfStock ? (
                                                                <Badge
                                                                    variant="destructive"
                                                                    className="h-5 px-1.5 text-[9px]"
                                                                >
                                                                    {t('Out')}
                                                                </Badge>
                                                            ) : (
                                                                <div className="flex items-center gap-0.5">
                                                                    <Button
                                                                        variant="outline"
                                                                        size="icon"
                                                                        className="h-5 w-5"
                                                                        onClick={() =>
                                                                            addToCart(
                                                                                variant,
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            atMaxStock
                                                                        }
                                                                    >
                                                                        <PlusIcon className="h-2.5 w-2.5" />
                                                                    </Button>
                                                                    <span className="min-w-5 text-center text-[11px] font-semibold tabular-nums">
                                                                        {
                                                                            qtyInCart
                                                                        }
                                                                    </span>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="icon"
                                                                        className="h-5 w-5"
                                                                        onClick={() => {
                                                                            const item =
                                                                                cart.find(
                                                                                    (
                                                                                        ci,
                                                                                    ) =>
                                                                                        ci.variant_id ===
                                                                                        variant.id,
                                                                                );

                                                                            if (item) {
                                                                                updateQuantity(
                                                                                    item.id,
                                                                                    -1,
                                                                                );
                                                                            }
                                                                        }}

                                                                        disabled={
                                                                            qtyInCart ===
                                                                            0
                                                                        }
                                                                    >
                                                                        <MinusIcon className="h-2.5 w-2.5" />
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
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

                <div className="flex w-80 shrink-0 flex-col gap-3 self-start">
                    <Card className="flex max-h-[calc(100dvh-8rem)] flex-col overflow-hidden">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-sm">
                                <ShoppingCart className="h-4 w-4" />
                                {t('Cart')} ({cart.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-1 flex-col gap-0 overflow-auto p-0">
                            {cart.length === 0 ? (
                                <div className="flex flex-1 items-center justify-center text-xs text-muted-foreground">
                                    {t('Select products to add')}
                                </div>
                            ) : (
                                <div className="flex flex-1 flex-col">
                                    <div className="flex-1 space-y-1 overflow-auto px-2">
                                        {cart.map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex items-center gap-1.5 rounded-md border p-1.5"
                                            >
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-xs leading-tight font-medium">
                                                        {item.product_name}
                                                    </p>
                                                    <p className="truncate text-[10px] text-muted-foreground">
                                                        {item.variant_name ||
                                                            t('Default')}
                                                        {item.unit_name
                                                            ? ` / ${item.unit_name}`
                                                            : ''}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-0.5">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-5 w-5"
                                                        onClick={() =>
                                                            updateQuantity(
                                                                item.id,
                                                                -1,
                                                            )
                                                        }
                                                    >
                                                        <MinusIcon className="h-2.5 w-2.5" />
                                                    </Button>
                                                    <span className="min-w-4.5 text-center text-[11px] font-semibold tabular-nums">
                                                        {item.quantity}
                                                    </span>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-5 w-5"
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
                                                        <PlusIcon className="h-2.5 w-2.5" />
                                                    </Button>
                                                </div>
                                                <p className="w-14 text-right text-[11px] font-medium tabular-nums">
                                                    {ks(
                                                        item.unit_price *
                                                            item.quantity,
                                                    )}
                                                </p>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-5 w-5 text-destructive"
                                                    onClick={() =>
                                                        removeFromCart(item.id)
                                                    }
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="space-y-1.5 border-t p-2">
                                        {errors.items && (
                                            <p className="text-[10px] text-destructive">
                                                {errors.items}
                                            </p>
                                        )}

                                        <div className="flex items-center gap-1.5">
                                            <Input
                                                placeholder={t('Discount')}
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={discount}
                                                onChange={(e) =>
                                                    setDiscount(e.target.value)
                                                }
                                                className="h-7 text-[11px]"
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
                                                className="h-7 text-[11px]"
                                            />
                                        </div>

                                        <div className="space-y-0.5 text-[11px]">
                                            <div className="flex justify-between text-muted-foreground">
                                                <span>{t('Subtotal')}</span>
                                                <span>{ks(subtotal)}</span>
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
                                                    <span>+{ks(taxNum)}</span>
                                                </div>
                                            )}
                                            <Separator className="my-1" />
                                            <div className="flex justify-between text-sm font-bold">
                                                <span>{t('Total')}</span>
                                                <span>{ks(total)}</span>
                                            </div>
                                        </div>

                                        <Select
                                            value={paymentMethod}
                                            onValueChange={setPaymentMethod}
                                        >
                                            <SelectTrigger className="h-7 text-[11px]">
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
                                            className="h-7 text-[11px]"
                                        />

                                        {parseFloat(amountPaid || '0') > 0 && (
                                            <div className="flex justify-between text-[10px]">
                                                <span className="text-muted-foreground">
                                                    {t('Change')}
                                                </span>
                                                <span className="font-semibold text-green-600 dark:text-green-400">
                                                    {ks(change)}
                                                </span>
                                            </div>
                                        )}

                                        <Input
                                            placeholder={t('Notes (optional)')}
                                            value={notes}
                                            onChange={(e) =>
                                                setNotes(e.target.value)
                                            }
                                            className="h-7 text-[11px]"
                                        />

                                        <Button
                                            className="w-full"
                                            size="sm"
                                            disabled={
                                                cart.length === 0 || processing
                                            }
                                            onClick={handleCheckout}
                                        >
                                            {processing
                                                ? t('Processing...')
                                                : `${t('Charge')} ${ks(total)}`}
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

SalesCheckout.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Sales', href: sales() },
        { title: 'POS', href: '#' },
    ],
};
