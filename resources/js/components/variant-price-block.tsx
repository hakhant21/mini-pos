import { MinusIcon, PlusIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useTranslation } from '@/lib/i18n';
import { num, ks } from '@/lib/utils';
import { useProductStockCalculator } from '@/hooks/use-product-stock-calculator';
import type { CartItem } from '@/types';
import type { ProductVariant } from '@/types/product';

export type VariantPriceBlockProps = {
    variant: ProductVariant;
    productName: string;
    cart: CartItem[];
    getQuantity: (variantId: number, mode: CartItem['pricing_mode']) => number;
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
    cart,
    getQuantity,
    onAdd,
    onDecrement,
}: VariantPriceBlockProps) {
    const { t } = useTranslation();

    const {
        availableUnits,
        displayStock,
        isOutOfStock,
        isLowStock,
        stockPercentage,
        canAddToCart,
        getMaxQuantity,
        formatStock,
    } = useProductStockCalculator({
        variant,
        cartItems: cart,
        minStockLevel: num(variant.min_stock_level) || 5,
    });

    const qtySingle = getQuantity(variant.id, 'single');
    const qtyPack = getQuantity(variant.id, 'pack');
    const qtyPackage = getQuantity(variant.id, 'package');

    const canAddSingle = canAddToCart('single', 1);
    const canAddPack = canAddToCart('pack', 1);
    const canAddPackage = canAddToCart('package', 1);

    const maxSingle = getMaxQuantity('single');
    const maxPack = getMaxQuantity('pack');
    const maxPackage = getMaxQuantity('package');

    const showSingle =
        variant.pricing_mode === 'single' ||
        variant.pricing_mode === 'both' ||
        variant.pricing_mode === 'single_pack';
    const showPack =
        variant.pricing_mode === 'pack' ||
        variant.pricing_mode === 'both' ||
        variant.pricing_mode === 'single_pack';
    const showPackage =
        variant.pricing_mode === 'package' || variant.pricing_mode === 'both';

    const hasBorderTop = (showPrev: boolean) => (showPrev ? 'border-t' : '');

    const stockDetails = formatStock(availableUnits);
    const unitLabel = variant.unit?.abbreviation || 'units';

    return (
        <div>
            <div className="mx-1 flex items-center justify-between gap-1 py-1">
                <div className="flex items-center gap-1">
                    {isOutOfStock ? (
                        <Badge
                            variant="destructive"
                            className="h-4 px-1.5 text-[10px]"
                        >
                            {t('Out')}
                        </Badge>
                    ) : isLowStock ? (
                        <Badge
                            variant="secondary"
                            className="h-4 px-1.5 text-[10px] text-orange-600 dark:text-orange-400"
                        >
                            {t('Low')}
                        </Badge>
                    ) : (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Badge
                                        variant="secondary"
                                        className="h-4 px-1.5 text-[10px] cursor-help"
                                    >
                                        {displayStock.short}
                                    </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>
                                        {t('Available')}:{' '}
                                        {displayStock.detailed}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground">
                                        {stockDetails.formatted}
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>

                {!isOutOfStock && (
                    <div className="w-12 h-1 bg-muted rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-300"
                            style={{
                                width: `${Math.min(100, stockPercentage)}%`,
                            }}
                        />
                    </div>
                )}
            </div>

            <div
                className={`${
                    isOutOfStock ? 'opacity-40' : ''
                } rounded-md border`}
            >
                {showSingle && (
                    <div className="flex items-stretch">
                        <button
                            type="button"
                            onClick={() =>
                                onAdd(variant, productName, 'single')
                            }
                            disabled={!canAddSingle || isOutOfStock}
                            className={`flex min-h-9 flex-1 flex-col justify-center gap-0.5 p-1 text-left ${
                                !canAddSingle || isOutOfStock
                                    ? 'cursor-not-allowed opacity-60'
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
                            {qtySingle > 0 && (
                                <p className="text-[9px] text-muted-foreground">
                                    {qtySingle} / {maxSingle}{' '}
                                    {t('max')}
                                </p>
                            )}
                        </button>
                        {qtySingle > 0 && (
                            <button
                                type="button"
                                onClick={() =>
                                    onDecrement(variant.id, 'single')
                                }
                                className="flex w-7 shrink-0 items-center justify-center border-l text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors"
                            >
                                <MinusIcon className="h-3 w-3" />
                            </button>
                        )}
                    </div>
                )}
                {showPack && (
                    <div
                        className={`flex items-stretch ${hasBorderTop(showSingle)}`}
                    >
                        <button
                            type="button"
                            onClick={() =>
                                onAdd(variant, productName, 'pack')
                            }
                            disabled={!canAddPack || isOutOfStock}
                            className={`flex min-h-9 flex-1 items-center justify-between gap-1 px-1.5 py-1 text-left ${
                                !canAddPack || isOutOfStock
                                    ? 'cursor-not-allowed opacity-60'
                                    : 'cursor-pointer hover:bg-accent/50'
                            }`}
                        >
                            <p className="text-[11px] font-semibold text-primary">
                                Ks {ks(variant.pack_price)}
                                <span className="text-[10px] font-normal text-muted-foreground">
                                    {' '}
                                    / {t('Pack')} (
                                    {num(variant.units_per_pack)}{' '}
                                    units)
                                </span>
                            </p>
                            {qtyPack > 0 ? (
                                <span className="rounded-full bg-muted-foreground/10 px-1.5 py-0.5 text-[9px] font-semibold">
                                    x{qtyPack}
                                </span>
                            ) : (
                                <PlusIcon className="h-3 w-3 text-muted-foreground" />
                            )}
                        </button>
                        {qtyPack > 0 && (
                            <button
                                type="button"
                                onClick={() =>
                                    onDecrement(variant.id, 'pack')
                                }
                                className="flex w-7 shrink-0 items-center justify-center border-l text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors"
                            >
                                <MinusIcon className="h-3 w-3" />
                            </button>
                        )}
                    </div>
                )}
                {showPackage && (
                    <div
                        className={`flex items-stretch ${hasBorderTop(showSingle || showPack)}`}
                    >
                        <button
                            type="button"
                            onClick={() =>
                                onAdd(variant, productName, 'package')
                            }
                            disabled={!canAddPackage || isOutOfStock}
                            className={`flex min-h-9 flex-1 items-center justify-between gap-1 px-1.5 py-1 text-left ${
                                !canAddPackage || isOutOfStock
                                    ? 'cursor-not-allowed opacity-60'
                                    : 'cursor-pointer hover:bg-accent/50'
                            }`}
                        >
                            <p className="text-[11px] font-semibold text-primary">
                                Ks {ks(variant.cost_price)}
                                <span className="text-[10px] font-normal text-muted-foreground">
                                    {' '}
                                    / {t('Package')} (
                                    {num(variant.units_per_package)}{' '}
                                    {t('packs')} ={' '}
                                    {num(variant.units_per_package) *
                                        num(variant.units_per_pack)}{' '}
                                    units)
                                </span>
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
                                onClick={() =>
                                    onDecrement(variant.id, 'package')
                                }
                                className="flex w-7 shrink-0 items-center justify-center border-l text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors"
                            >
                                <MinusIcon className="h-3 w-3" />
                            </button>
                        )}
                    </div>
                )}
            </div>

            {!isOutOfStock && availableUnits > 0 && (
                <div className="mt-1 text-[9px] text-muted-foreground flex items-center justify-end gap-1">
                    <span>{displayStock.hierarchical}</span>
                    <span className="text-[8px] opacity-50">
                        ({availableUnits} units)
                    </span>
                </div>
            )}
        </div>
    );
}
