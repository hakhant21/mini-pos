import { MinusIcon, PlusIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/lib/i18n';
import { num, ks } from '@/lib/utils';
import type { CartItem } from '@/types';
import type { ProductVariant } from '@/types/product';

export type VariantPriceBlockProps = {
    variant: ProductVariant;
    productName: string;
    getQuantity: (variantId: number, mode: CartItem['pricing_mode']) => number;
    totalUnits: (variantId: number) => number;
    canAddMode: (
        variant: ProductVariant,
        mode: CartItem['pricing_mode'],
    ) => boolean;
    onAdd: (
        variant: ProductVariant,
        productName: string,
        mode: CartItem['pricing_mode'],
    ) => void;
    onDecrement: (variantId: number, mode: CartItem['pricing_mode']) => void;
};

export function VariantPriceBlock({
    variant,
    productName,
    getQuantity,
    totalUnits,
    canAddMode,
    onAdd,
    onDecrement,
}: VariantPriceBlockProps) {
    const { t } = useTranslation();

    const qtyPackage = getQuantity(variant.id, 'package');
    const qtySingle = getQuantity(variant.id, 'single');
    const reservedUnits = totalUnits(variant.id);
    const availableStock = num(variant.stock_quantity) - reservedUnits;
    const isOutOfStock = availableStock <= 0;
    const isLowStock =
        availableStock > 0 && availableStock <= variant.min_stock_level;

    return (
        <div>
            <div className="mx-1 flex items-center justify-end gap-1 py-1">
                {isOutOfStock ? (
                    <Badge
                        variant="destructive"
                        className="h-4 px-1.5 text-[10px]"
                    >
                        {t('Out')}
                    </Badge>
                ) : (
                    <p className="shrink-0 text-[10px] text-muted-foreground">
                        {t('Stock')}: {Number(availableStock)}
                        {isLowStock && (
                            <span className="ml-0.5 text-orange-600 dark:text-orange-400">
                                ({t('Low')})
                            </span>
                        )}
                    </p>
                )}
            </div>
            <div
                className={`${
                    isOutOfStock ? 'opacity-40' : ''
                } rounded-md border`}
            >
                <div className="flex items-stretch">
                    <button
                        type="button"
                        onClick={() => onAdd(variant, productName, 'single')}
                        disabled={
                            isOutOfStock || !canAddMode(variant, 'single')
                        }
                        className={`flex min-h-9 flex-1 flex-col justify-center gap-0.5 p-1 text-left ${
                            isOutOfStock
                                ? 'cursor-not-allowed'
                                : 'cursor-pointer hover:bg-accent/50'
                        }`}
                    >
                        <div className="flex items-center justify-between gap-1">
                            <p className="text-[11px] font-semibold text-primary">
                                Ks {ks(variant.per_unit_price)}
                                <span className="text-[10px] font-normal text-muted-foreground">
                                    {' '}
                                    / {t('Single')}
                                </span>
                            </p>
                            {qtySingle > 0 ? (
                                <span className="rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-semibold text-primary-foreground">
                                    x{qtySingle}
                                </span>
                            ) : (
                                <PlusIcon className="h-3 w-3 text-muted-foreground" />
                            )}
                        </div>
                    </button>
                    {qtySingle > 0 && (
                        <button
                            type="button"
                            onClick={() => onDecrement(variant.id, 'single')}
                            className="flex w-7 shrink-0 items-center justify-center border-l text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                        >
                            <MinusIcon className="h-3 w-3" />
                        </button>
                    )}
                </div>
                <div className="flex items-stretch border-t">
                    <button
                        type="button"
                        onClick={() => onAdd(variant, productName, 'package')}
                        disabled={
                            isOutOfStock || !canAddMode(variant, 'package')
                        }
                        className={`flex min-h-9 flex-1 items-center justify-between gap-1 px-1.5 py-1 text-left ${
                            isOutOfStock
                                ? 'cursor-not-allowed'
                                : 'cursor-pointer hover:bg-accent/50'
                        }`}
                    >
                        <p className="text-[11px] font-semibold text-primary">
                            Ks {ks(variant.cost_price)} / {t('Package')}
                        </p>
                        {qtyPackage > 0 ? (
                            <span className="rounded-full bg-muted-foreground/10 px-1.5 py-0.5 text-[9px] font-semibold">
                                x{qtyPackage}
                            </span>
                        ) : (
                            <PlusIcon className="h-3 w-3 text-muted-foreground" />
                        )}
                    </button>
                    {qtyPackage > 0 && (
                        <button
                            type="button"
                            onClick={() => onDecrement(variant.id, 'package')}
                            className="flex w-7 shrink-0 items-center justify-center border-l text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                        >
                            <MinusIcon className="h-3 w-3" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
