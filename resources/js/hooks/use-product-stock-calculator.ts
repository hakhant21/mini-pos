import { useMemo } from 'react';
import { num } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import type { ProductVariant } from '@/types/product';
import type { CartItem } from '@/types';

interface UseProductStockCalculatorProps {
    variant: ProductVariant;
    cartItems: CartItem[];
    minStockLevel?: number;
}

interface StockBreakdown {
    packages: number;
    packs: number;
    units: number;
}

export function useProductStockCalculator({
    variant,
    cartItems = [],
    minStockLevel = 5,
}: UseProductStockCalculatorProps) {
    const { t } = useTranslation();
    const unitsPerPack = num(variant.units_per_pack) || 1;
    const unitsPerPackage = num(variant.units_per_package) || 1;
    const totalUnits = num(variant.stock_quantity) || 0;

    const reservedUnits = useMemo(() => {
        return cartItems
            .filter((item) => item.variant_id === variant.id)
            .reduce((total, item) => {
                const unitsConsumed =
                    item.pricing_mode === 'package'
                        ? item.quantity *
                          item.units_per_package *
                          item.units_per_pack
                        : item.pricing_mode === 'pack'
                          ? item.quantity * item.units_per_pack
                          : item.quantity;
                return total + unitsConsumed;
            }, 0);
    }, [cartItems, variant.id]);

    const availableUnits = useMemo(() => {
        return Math.max(0, totalUnits - reservedUnits);
    }, [totalUnits, reservedUnits]);

    const breakdownUnits = useMemo((): StockBreakdown => {
        const packages = Math.floor(
            availableUnits / (unitsPerPackage * unitsPerPack),
        );
        const remainingAfterPackages =
            availableUnits - packages * unitsPerPackage * unitsPerPack;
        const packs = Math.floor(remainingAfterPackages / unitsPerPack);
        const units = remainingAfterPackages - packs * unitsPerPack;

        return { packages, packs, units };
    }, [availableUnits, unitsPerPack, unitsPerPackage]);

    const displayStock = useMemo(() => {
        const { packages, packs, units } = breakdownUnits;

        const parts: string[] = [];
        if (packages > 0)
            parts.push(
                `${packages} ${t(packages > 1 ? 'Packages' : 'Package')}`,
            );
        if (packs > 0)
            parts.push(`${packs} ${t(packs > 1 ? 'Packs' : 'Pack')}`);
        if (units > 0) parts.push(`${units} ${t('Units')}`);

        const short = parts.length > 0 ? parts.join(' + ') : 'Out of stock';
        const detailed =
            parts.length > 0 ? `${parts.join(', ')} available` : 'Out of stock';
        const hierarchical = parts.length > 0 ? parts.join(' + ') : 'No stock';

        return { short, detailed, hierarchical };
    }, [breakdownUnits, t, variant.unit?.abbreviation]);

    const calculateUnitsForMode = (
        mode: 'single' | 'pack' | 'package',
        quantity: number,
    ): number => {
        const qty = num(quantity) || 0;
        switch (mode) {
            case 'package':
                return qty * unitsPerPackage * unitsPerPack;
            case 'pack':
                return qty * unitsPerPack;
            default:
                return qty;
        }
    };

    const canAddToCart = (
        mode: 'single' | 'pack' | 'package',
        quantity: number,
    ): boolean => {
        const neededUnits = calculateUnitsForMode(mode, quantity);
        return neededUnits <= availableUnits && availableUnits > 0;
    };

    const getMaxQuantity = (mode: 'single' | 'pack' | 'package'): number => {
        if (availableUnits <= 0) return 0;

        switch (mode) {
            case 'package':
                return Math.floor(
                    availableUnits / (unitsPerPackage * unitsPerPack),
                );
            case 'pack':
                return Math.floor(availableUnits / unitsPerPack);
            default:
                return Math.floor(availableUnits);
        }
    };

    const formatStock = (
        units: number,
    ): StockBreakdown & { formatted: string } => {
        const u = Math.max(0, units);
        const pkgs = Math.floor(u / (unitsPerPackage * unitsPerPack));
        const rem1 = u - pkgs * unitsPerPackage * unitsPerPack;
        const pks = Math.floor(rem1 / unitsPerPack);
        const rem2 = rem1 - pks * unitsPerPack;

        const parts: string[] = [];
        if (pkgs > 0)
            parts.push(`${pkgs} ${t(pkgs > 1 ? 'Packages' : 'Package')}`);
        if (pks > 0) parts.push(`${pks} ${t(pks > 1 ? 'Packs' : 'Pack')}`);
        if (rem2 > 0) parts.push(`${rem2} ${t('Units')}`);

        return {
            packages: pkgs,
            packs: pks,
            units: rem2,
            formatted: parts.length > 0 ? parts.join(' + ') : 'No stock',
        };
    };

    const isOutOfStock = availableUnits <= 0;
    const minStockUnits = minStockLevel;
    const isLowStock = availableUnits > 0 && availableUnits <= minStockUnits;
    const stockPercentage =
        totalUnits > 0 ? (availableUnits / totalUnits) * 100 : 0;

    return {
        totalUnits,
        availableUnits,
        reservedUnits,
        breakdown: breakdownUnits,
        displayStock,
        isOutOfStock,
        isLowStock,
        stockPercentage,
        calculateUnitsForMode,
        canAddToCart,
        getMaxQuantity,
        formatStock,
    };
}

export type UseProductStockCalculatorReturn = ReturnType<
    typeof useProductStockCalculator
>;
