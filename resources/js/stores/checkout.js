import { computed, ref } from 'vue';
import { defineStore } from 'pinia';

export const useCheckoutStore = defineStore('checkout', () => {
    const items = ref(/** @type {Array<Record<string, any>>} */ ([]));
    const discount = ref(0);
    const tax = ref(0);
    const receivedAmount = ref(0);
    const paymentMethod = ref('cash');

    const subtotal = computed(() =>
        items.value.reduce((total, item) => total + item.total, 0),
    );
    const grandTotal = computed(() =>
        Math.max(0, subtotal.value - discount.value + tax.value),
    );
    const changeAmount = computed(() =>
        Math.max(0, receivedAmount.value - grandTotal.value),
    );

    function addItem(product, unit) {
        const sellingMode = unit?.selling_mode ?? 'Single';
        const existing = items.value.find(
            (item) =>
                item.product_id === product.id && item.unit?.id === unit?.id && item.selling_mode === sellingMode,
        );
        if (existing) existing.quantity += 1;
        else
            items.value.push({
                ...product,
                product_id: product.id,
                product,
                unit,
                selling_mode: sellingMode,
                quantity: 1,
                get total() {
                        const price = this.selling_mode === 'Single'
                            ? (this.unit?.single_unit_price ?? 0)
                            : this.selling_mode === 'Package' && this.product.price_mode === 'single_package_carton'
                                ? (this.unit?.package_price ?? 0)
                                : (this.unit?.selling_price ?? 0);

                        return price * this.quantity;
                },
            });
    }

    function removeItem(index) {
        items.value.splice(index, 1);
    }
    function updateQuantity(index, quantity) {
        if (quantity > 0) items.value[index].quantity = quantity;
        else removeItem(index);
    }
    function clearCart() {
        items.value = [];
        receivedAmount.value = 0;
    }

    return {
        items,
        discount,
        tax,
        receivedAmount,
        paymentMethod,
        subtotal,
        grandTotal,
        changeAmount,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
    };
});
