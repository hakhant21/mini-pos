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
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Separator } from '@/components/ui/separator';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { VariantPriceBlock } from '@/components/variant-price-block';
import {
    salesCheckout,
    salesAddItems,
    sales,
    dashboard,
} from '@/feature-routes';
import { useTranslation } from '@/lib/i18n';
import { num, ks } from '@/lib/utils';
import type { Product, CartItem, Sale } from '@/types';
import type { ProductVariant } from '../../types/product';

type Props = {
    products: Product[];
    sale?: Sale | null;
};

let cartIdCounter = 0;

export default function SalesCheckout({ products, sale = null }: Props) {
    const { t } = useTranslation();

    const { errors } = usePage().props;

    const [cart, setCart] = useState<CartItem[]>([]);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedProduct, setSelectedProduct] = useState<string>('all');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [amountPaid, setAmountPaid] = useState('');
    const [amountPaidTouched, setAmountPaidTouched] = useState(false);
    const [discount, setDiscount] = useState(sale ? '' : '');
    const [tax, setTax] = useState(sale ? '' : '');
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

    const variantCards = useMemo(() => {
        const cards: { product: Product; variant: ProductVariant }[] = [];

        products.forEach((p) => {
            p.variants.forEach((v) => {
                cards.push({ product: p, variant: v });
            });
        });

        return cards;
    }, [products]);

    const filteredVariantCards = useMemo(() => {
        return variantCards.filter(({ product, variant }) => {
            const q = search.trim().toLowerCase();
            const matchesSearch =
                !q ||
                product.name.toLowerCase().includes(q) ||
                product.sku.toLowerCase().includes(q) ||
                variant.name?.toLowerCase().includes(q) ||
                variant.sku.toLowerCase().includes(q);
            const matchesCategory =
                selectedCategory === 'all' ||
                product.category?.id.toString() === selectedCategory;
            const matchesProduct =
                selectedProduct === 'all' ||
                product.id.toString() === selectedProduct;

            return (
                matchesSearch &&
                matchesCategory &&
                matchesProduct &&
                product.is_active &&
                variant.is_active
            );
        });
    }, [variantCards, search, selectedCategory, selectedProduct]);

    const getCartItemQuantity = (
        variantId: number,
        mode: CartItem['pricing_mode'],
    ): number => {
        const item = cart.find(
            (ci) => ci.variant_id === variantId && ci.pricing_mode === mode,
        );

        return item?.quantity ?? 0;
    };

    const totalUnitsForVariant = (variantId: number): number =>
        cart.reduce(
            (sum, item) =>
                item.variant_id === variantId
                    ? sum +
                      (item.pricing_mode === 'package'
                          ? item.quantity * item.units_per_package
                          : item.quantity)
                    : sum,
            0,
        );

    const canAddMode = (
        variant: Product['variants'][number],
        mode: CartItem['pricing_mode'],
    ): boolean => {
        const reserved = totalUnitsForVariant(variant.id);
        const needed = mode === 'package' ? num(variant.units_per_package) : 1;

        return num(variant.stock_quantity) - reserved >= needed;
    };

    const decrementLine = (
        variantId: number,
        mode: CartItem['pricing_mode'],
    ) => {
        const item = cart.find(
            (ci) => ci.variant_id === variantId && ci.pricing_mode === mode,
        );

        if (item) {
            updateQuantity(item.id, -1);
        }
    };

    const addToCart = (
        variant: Product['variants'][number],
        productName: string,
        pricing_mode: CartItem['pricing_mode'],
    ) => {
        if (num(variant.stock_quantity) <= 0) {
            return;
        }

        const unitsPerPackage = num(variant.units_per_package);
        const unitPrice =
            pricing_mode === 'package'
                ? num(variant.cost_price)
                : num(variant.per_unit_price);

        setCart((prev) => {
            const reserved = prev
                .filter((item) => item.variant_id === variant.id)
                .reduce(
                    (sum, item) =>
                        sum +
                        (item.pricing_mode === 'package'
                            ? item.quantity * item.units_per_package
                            : item.quantity),
                    0,
                );
            const needed = pricing_mode === 'package' ? unitsPerPackage : 1;

            if (reserved + needed > num(variant.stock_quantity)) {
                return prev;
            }

            const existing = prev.find(
                (item) =>
                    item.variant_id === variant.id &&
                    item.pricing_mode === pricing_mode,
            );

            if (existing) {
                return prev.map((item) =>
                    item.id === existing.id
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
                    pricing_mode,
                    product_name: productName,
                    variant_name: variant.name,
                    unit_name: variant.unit?.abbreviation ?? null,
                    units_per_package: unitsPerPackage,
                    unit_price: unitPrice,
                    cost_price: num(variant.cost_price),
                    per_unit_price: num(variant.per_unit_price),
                    quantity: 1,
                    stock_quantity: num(variant.stock_quantity),
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

                        const otherUnits = prev
                            .filter(
                                (i) =>
                                    i.variant_id === item.variant_id &&
                                    i.id !== item.id,
                            )
                            .reduce(
                                (sum, i) =>
                                    sum +
                                    (i.pricing_mode === 'package'
                                        ? i.quantity * i.units_per_package
                                        : i.quantity),
                                0,
                            );
                        const newUnits =
                            item.pricing_mode === 'package'
                                ? newQty * item.units_per_package
                                : newQty;

                        if (otherUnits + newUnits > item.stock_quantity) {
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

    const saleDiscount = sale ? Number(sale.discount) || 0 : 0;
    const saleTax = sale ? Number(sale.tax) || 0 : 0;
    const existingTotal = sale
        ? sale.items.reduce((sum, item) => sum + Number(item.total_price), 0)
        : 0;
    const discountNum = parseFloat(discount) || 0;
    const taxNum = parseFloat(tax) || 0;
    const total = sale
        ? existingTotal + subtotal - saleDiscount + saleTax
        : subtotal - discountNum + taxNum;
    const amountPaidValue = amountPaidTouched
        ? amountPaid
        : total > 0
          ? String(total)
          : '';

    const change = Math.max(0, (parseFloat(amountPaidValue) || 0) - total);

    const handleCheckout = () => {
        if (cart.length === 0) {
            return;
        }

        if ((parseFloat(amountPaidValue) || 0) < (sale ? subtotal : total)) {
            alert(t('Amount paid must be at least the total amount.'));

            return;
        }

        setProcessing(true);

        if (sale) {
            router.post(
                salesAddItems(sale.id).url,
                {
                    items: cart.map((item) => ({
                        variant_id: item.variant_id,
                        pricing_mode: item.pricing_mode,
                        quantity: item.quantity,
                    })),
                    amount_paid: parseFloat(amountPaidValue) || 0,
                },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setCart([]);
                        setAmountPaid('');
                        setAmountPaidTouched(false);
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
        } else {
            router.post(
                salesCheckout().url,
                {
                    items: cart.map((item) => ({
                        variant_id: item.variant_id,
                        pricing_mode: item.pricing_mode,
                        quantity: item.quantity,
                    })),
                    payment_method: paymentMethod,
                    amount_paid: parseFloat(amountPaidValue) || total,
                    discount: discountNum,
                    tax: taxNum,
                    notes: notes || null,
                },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setCart([]);
                        setAmountPaid('');
                        setAmountPaidTouched(false);
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
        }
    };

    return (
        <>
            <Head title={t('Point of Sale')} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 pb-24 lg:flex-row lg:pb-4">
                <div className="flex flex-1 flex-col gap-3 lg:overflow-auto">
                    <div className="flex flex-wrap items-center gap-3">
                        <SearchableSelect
                            value={selectedCategory}
                            onValueChange={(v) => {
                                setSelectedProduct('all');
                                setSelectedCategory(v);
                            }}
                            options={[
                                { value: 'all', label: t('All Categories') },
                                ...categories.map((cat) => ({
                                    value: cat.id.toString(),
                                    label: cat.name,
                                })),
                            ]}
                            placeholder={t('All Categories')}
                            className="w-40"
                        />
                        <SearchableSelect
                            value={selectedProduct}
                            onValueChange={setSelectedProduct}
                            options={[
                                { value: 'all', label: t('All Products') },
                                ...products.map((p) => ({
                                    value: p.id.toString(),
                                    label: p.name,
                                })),
                            ]}
                            placeholder={t('All Products')}
                            className="w-2/4"
                        />
                        <div className="flex flex-1 items-center gap-2 rounded-md px-2 py-2 text-sm shadow-xs">
                            <Input
                                placeholder={t('Search products...')}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-40"
                            />
                            <Search className="size-4 opacity-50" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                        {filteredVariantCards.map(({ product, variant }) => {
                            const imgSrc = variant.image_url || null;
                            const showVariantName = product.variants.length > 1;

                            return (
                                <Card
                                    key={variant.id}
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
                                            {showVariantName && (
                                                <> - ( {variant.name} )</>
                                            )}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-1 p-2 pt-1">
                                        <VariantPriceBlock
                                            variant={variant}
                                            productName={product.name}
                                            getQuantity={getCartItemQuantity}
                                            totalUnits={totalUnitsForVariant}
                                            canAddMode={canAddMode}
                                            onAdd={addToCart}
                                            onDecrement={decrementLine}
                                        />
                                    </CardContent>
                                </Card>
                            );
                        })}
                        {filteredVariantCards.length === 0 && (
                            <div className="col-span-full flex items-center justify-center py-16 text-muted-foreground">
                                {t('No products found')}
                            </div>
                        )}
                    </div>
                </div>

                <div
                    id="cart-section"
                    className="flex flex-col gap-3 lg:w-70 lg:shrink-0 lg:self-start"
                >
                    <Card className="flex max-h-none flex-col overflow-hidden lg:max-h-[calc(100dvh-8rem)]">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-sm">
                                <ShoppingCart className="h-4 w-4" />
                                {sale ? (
                                    <>
                                        {sale.invoice_number}
                                        <Badge
                                            variant="secondary"
                                            className="ml-auto text-[10px]"
                                        >
                                            {t('Edit')}
                                        </Badge>
                                    </>
                                ) : (
                                    <>
                                        {t('Cart')} ({cart.length})
                                    </>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-1 flex-col gap-0 overflow-auto p-0">
                            <div className="flex flex-1 flex-col">
                                {sale && sale.items.length > 0 && (
                                    <div className="mt-1 border-b p-2">
                                        <p className="mb-1.5 text-[10px] font-medium text-muted-foreground uppercase">
                                            {t('Existing Items')}
                                        </p>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="text-[10px]">
                                                        {t('Product')}
                                                    </TableHead>
                                                    <TableHead className="text-right text-[10px]">
                                                        {t('Qty')}
                                                    </TableHead>
                                                    <TableHead className="text-right text-[10px]">
                                                        {t('Total')}
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {sale.items.map((item) => (
                                                    <TableRow key={item.id}>
                                                        <TableCell className="py-1 text-[10px]">
                                                            <span className="font-medium">
                                                                {
                                                                    item.product_name
                                                                }
                                                            </span>
                                                            {item.variant_name && (
                                                                <span className="ml-0.5 text-muted-foreground">
                                                                    (
                                                                    {
                                                                        item.variant_name
                                                                    }
                                                                    )
                                                                </span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="py-1 text-right text-[10px]">
                                                            {Number(
                                                                item.quantity,
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="py-1 text-right text-[10px] font-medium">
                                                            Ks{' '}
                                                            {ks(
                                                                item.total_price,
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                        <div className="mt-1 flex justify-between text-[10px]">
                                            <span className="text-muted-foreground">
                                                {t('Existing Total')}
                                            </span>
                                            <span className="font-semibold">
                                                Ks {ks(existingTotal)}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {cart.length === 0 ? (
                                    <div className="mt-1 flex flex-1 items-center justify-center text-xs text-muted-foreground">
                                        {t('Select products to add')}
                                    </div>
                                ) : (
                                    <div className="mt-1 flex flex-1 flex-col">
                                        <div className="flex-1 space-y-1 overflow-auto px-2">
                                            {cart.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="mt-2 rounded-md border p-1.5"
                                                >
                                                    <div className="flex items-center justify-between gap-1.5">
                                                        <p className="min-w-0 flex-1 truncate text-[10px] leading-tight font-medium">
                                                            {item.product_name}
                                                            {item.variant_name &&
                                                                ` - ${item.variant_name}`}
                                                        </p>
                                                        <Badge
                                                            variant="secondary"
                                                            className="h-4 shrink-0 px-1 text-[10px]"
                                                        >
                                                            {item.pricing_mode ===
                                                            'package'
                                                                ? `${t('Pkg')} x${num(item.units_per_package)}`
                                                                : t('Single')}
                                                        </Badge>
                                                    </div>
                                                    <div className="mt-1 flex items-center justify-between gap-1.5">
                                                        <p className="text-right text-[11px] font-medium tabular-nums">
                                                            Ks:
                                                            {ks(
                                                                item.unit_price *
                                                                    item.quantity,
                                                            )}
                                                        </p>
                                                        <div className="flex items-center gap-1">
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
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-5 w-5 text-destructive"
                                                            onClick={() =>
                                                                removeFromCart(
                                                                    item.id,
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="space-y-2 p-2">
                                            {errors.items && (
                                                <p className="text-[10px] text-destructive">
                                                    {errors.items}
                                                </p>
                                            )}

                                            {!sale && (
                                                <div className="flex items-center gap-2 py-2">
                                                    <Input
                                                        placeholder={t(
                                                            'Discount',
                                                        )}
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={discount}
                                                        onChange={(e) =>
                                                            setDiscount(
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="h-8 py-2 text-[11px]"
                                                    />
                                                    <Input
                                                        placeholder={t('Tax')}
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={tax}
                                                        onChange={(e) =>
                                                            setTax(
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="h-8 py-2 text-[11px]"
                                                    />
                                                </div>
                                            )}

                                            <div className="mt-1 space-y-0.5 text-[11px]">
                                                {sale && (
                                                    <div className="flex justify-between text-muted-foreground">
                                                        <span>
                                                            {t('Existing')}
                                                        </span>
                                                        <span>
                                                            Ks:
                                                            {ks(existingTotal)}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between text-muted-foreground">
                                                    <span>{t('Subtotal')}</span>
                                                    <span>
                                                        Ks: {ks(subtotal)}
                                                    </span>
                                                </div>
                                                {sale ? (
                                                    <>
                                                        {saleDiscount > 0 && (
                                                            <div className="flex justify-between text-muted-foreground">
                                                                <span>
                                                                    {t(
                                                                        'Discount',
                                                                    )}
                                                                </span>
                                                                <span className="text-destructive">
                                                                    - Ks:{' '}
                                                                    {ks(
                                                                        saleDiscount,
                                                                    )}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {saleTax > 0 && (
                                                            <div className="flex justify-between text-muted-foreground">
                                                                <span>
                                                                    {t('Tax')}
                                                                </span>
                                                                <span>
                                                                    +
                                                                    {ks(
                                                                        saleTax,
                                                                    )}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </>
                                                ) : (
                                                    <>
                                                        {discountNum > 0 && (
                                                            <div className="flex justify-between text-muted-foreground">
                                                                <span>
                                                                    {t(
                                                                        'Discount',
                                                                    )}
                                                                </span>
                                                                <span className="text-destructive">
                                                                    -
                                                                    {ks(
                                                                        discountNum,
                                                                    )}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {taxNum > 0 && (
                                                            <div className="flex justify-between text-muted-foreground">
                                                                <span>
                                                                    {t('Tax')}
                                                                </span>
                                                                <span>
                                                                    +
                                                                    {ks(taxNum)}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                                <Separator className="my-1" />
                                                <div className="flex justify-between text-sm font-bold">
                                                    <span>{t('Total')}</span>
                                                    <span>Ks: {ks(total)}</span>
                                                </div>
                                            </div>

                                            {!sale && (
                                                <SearchableSelect
                                                    value={paymentMethod}
                                                    onValueChange={
                                                        setPaymentMethod
                                                    }
                                                    options={[
                                                        {
                                                            value: 'cash',
                                                            label: t('Cash'),
                                                        },
                                                        {
                                                            value: 'kbzpay',
                                                            label: 'KBZ Pay',
                                                        },
                                                    ]}
                                                    className="h-7 text-[11px]"
                                                />
                                            )}

                                            <Input
                                                placeholder={t('Amount paid')}
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={amountPaidValue}
                                                onChange={(e) => {
                                                    setAmountPaidTouched(true);
                                                    setAmountPaid(
                                                        e.target.value,
                                                    );
                                                }}
                                                className="h-7 text-[11px]"
                                            />

                                            {parseFloat(amountPaidValue) >
                                                0 && (
                                                <div className="flex justify-between text-[10px]">
                                                    <span className="text-muted-foreground">
                                                        {t('Change')}
                                                    </span>
                                                    <span className="font-semibold text-green-600 dark:text-green-400">
                                                        {ks(change)}
                                                    </span>
                                                </div>
                                            )}

                                            {!sale && (
                                                <Input
                                                    placeholder={t(
                                                        'Notes (optional)',
                                                    )}
                                                    value={notes}
                                                    onChange={(e) =>
                                                        setNotes(e.target.value)
                                                    }
                                                    className="h-7 text-[11px]"
                                                />
                                            )}

                                            <Button
                                                className="w-full"
                                                size="sm"
                                                disabled={
                                                    cart.length === 0 ||
                                                    processing
                                                }
                                                onClick={handleCheckout}
                                            >
                                                {processing
                                                    ? t('Processing...')
                                                    : sale
                                                      ? `${t('Add Items')} (${cart.length})`
                                                      : `${t('Charge')} ${ks(total)}`}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {cart.length > 0 && (
                <div className="fixed inset-x-0 bottom-0 z-50 border-t bg-background p-3 shadow-lg lg:hidden">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <Badge
                                variant="secondary"
                                className="px-1.5 py-0.5 text-xs"
                            >
                                {cart.length}
                            </Badge>
                            <span className="text-sm font-semibold">
                                {ks(total)}
                            </span>
                        </div>
                        <Button
                            size="sm"
                            disabled={processing}
                            onClick={() => {
                                document
                                    .getElementById('cart-section')
                                    ?.scrollIntoView({ behavior: 'smooth' });
                            }}
                        >
                            {t('View Cart')}
                        </Button>
                    </div>
                    <div className="mt-2 flex gap-1.5 overflow-x-auto">
                        {cart.map((item) => (
                            <span
                                key={item.id}
                                className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
                            >
                                {item.product_name} x{item.quantity}
                            </span>
                        ))}
                    </div>
                </div>
            )}
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
