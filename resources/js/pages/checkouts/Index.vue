<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { Head, Link, useForm } from "@inertiajs/vue3";
import { storeToRefs } from "pinia";
import { useCheckoutStore } from "@/Stores/checkout";
import {
    ArrowLeft,
    Minus,
    Plus,
    Search,
    ShoppingCart,
    Trash2,
} from "@lucide/vue";
import { dashboard } from "@/routes";
import { store as saleStore } from "@/routes/sales";
import FormActions from "@/components/forms/FormActions.vue";
import FormField from "@/components/forms/FormField.vue";
import FormSection from "@/components/forms/FormSection.vue";
type Unit = {
    id: number;
    name: string;
    conversion: number;
    selling_price: number;
    barcode?: string | null;
};
type Product = {
    id: number;
    name: string;
    sku: string;
    category: { name: string };
    base_unit: string;
    stock: { quantity_base: number } | null;
    units: Unit[];
    icon: string;
    barcode?: string | null;
};
type CartItem = Product & {
    product_id: number;
    product: Product;
    unit: Unit | null;
    quantity: number;
};
const props = defineProps<{ products: Product[] }>();
const query = ref("");
const category = ref("All");
const barcodeMessage = ref("");
const unitMessage = ref("");
const checkoutStore = useCheckoutStore();
const { items: cart, subtotal } = storeToRefs(checkoutStore);
const saleForm = useForm({
    payment_method: "cash",
    received_amount: 0,
    discount: 0,
    tax: 0,
    items: [] as {
        product_id: number;
        product_unit_id: number;
        quantity: number;
    }[],
});
const categories = computed(() => [
    "All",
    ...new Set(props.products.map((product) => product.category.name)),
]);
const filteredProducts = computed(() =>
    props.products.filter(
        (product) =>
            (category.value === "All" ||
                product.category.name === category.value) &&
            `${product.name} ${product.sku}`
                .toLowerCase()
                .includes(query.value.toLowerCase()),
    ),
);
const money = (value: number) =>
    new Intl.NumberFormat("en-US").format(value) + " MMK";
function addToCart(product: Product, selectedUnit?: Unit): void {
    const baseUnit = product.units.find(
        (unit) => unit.name.toLowerCase() === product.base_unit.toLowerCase(),
    );

    checkoutStore.addItem(product, selectedUnit ?? baseUnit ?? null);
}
function handleBarcode(): void {
    const value = query.value.trim();
    if (!value) return;
    const product = props.products.find(
        (item) =>
            item.barcode === value ||
            item.sku === value ||
            item.units.some((unit) => unit.barcode === value),
    );
    const unit = product?.units.find((item) => item.barcode === value);
    if (product) {
        addToCart(product, unit);
        query.value = "";
        barcodeMessage.value = "";
        return;
    }
    barcodeMessage.value = "Product not found";
}
function handleShortcut(event: KeyboardEvent): void {
    if (event.key === "F2") {
        event.preventDefault();
        document
            .querySelector<HTMLInputElement>("[data-checkout-search]")
            ?.focus();
    }
    if (event.key === "F8" && cart.value.length) completeSale();
}
onMounted(() => window.addEventListener("keydown", handleShortcut));
onBeforeUnmount(() => window.removeEventListener("keydown", handleShortcut));
function unitPrice(item: any): number {
    return item.unit?.selling_price ?? 0;
}

function orderedUnits(item: any): Unit[] {
    const order = ['1L', '750ML', '0.75L', '350ML', '50ML', 'Big Bottle', 'Big bottle', 'Small Bottle', 'Small bottle', 'Long Can', 'Long can', 'Short Can', 'Short can'];

    return [...item.units].sort((first, second) => {
        const firstPosition = order.indexOf(first.name);
        const secondPosition = order.indexOf(second.name);

        return (firstPosition === -1 ? order.length : firstPosition) - (secondPosition === -1 ? order.length : secondPosition);
    });
}
function removeFromCart(item: any): void {
    const index = cart.value.indexOf(item);
    if (item.quantity > 1)
        checkoutStore.updateQuantity(index, item.quantity - 1);
    else checkoutStore.removeItem(index);
}
function completeSale(): void {
    if (cart.value.some((item) => !item.unit)) {
        unitMessage.value = "Choose a selling unit for every product before completing the sale.";
        return;
    }

    unitMessage.value = "";
    saleForm.items = cart.value.map((item) => ({
        product_id: item.product_id,
        product_unit_id: item.unit!.id,
        quantity: item.quantity,
    }));
    if (!saleForm.received_amount) {
        saleForm.received_amount = subtotal.value;
    }
    saleForm.post(saleStore().url);
}
</script>
<template>
    <Head title="Checkout" />
    <div
        class="min-h-screen bg-[#f5f7fb] px-4 py-6 text-slate-900 dark:bg-slate-950 dark:text-slate-100 sm:px-6 lg:px-8"
    >
        <div class="mx-auto max-w-[1500px] space-y-5">
            <header class="flex flex-wrap items-center gap-3">
                <Link
                    :href="dashboard()"
                    aria-label="Back to dashboard"
                    class="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 transition hover:border-blue-200 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                    ><ArrowLeft class="size-4"
                /></Link>
                <div>
                    <p class="text-sm text-slate-400">Point of sale</p>
                    <h1 class="text-2xl font-bold">New sale</h1>
                </div>
                <span
                     class="ml-auto rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600"
                    >Register open</span
                >
            </header>
             <div class="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,390px)]">
                <section
                    class="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5"
                >
                    <label
                        class="flex items-center gap-3 rounded-xl border border-slate-200 px-4 text-sm text-slate-400 dark:border-slate-700"
                        ><Search class="size-5" /><input
                            v-model="query"
                            data-checkout-search
                            @keydown.enter="handleBarcode"
                            class="w-full border-0 bg-transparent py-3 outline-none"
                            placeholder="Search product, SKU or barcode..."
                    /></label>
                    <p
                        v-if="barcodeMessage"
                        class="mt-2 text-xs font-medium text-rose-600"
                    >
                        {{ barcodeMessage }}
                    </p>
                    <div class="mt-5 flex gap-2 overflow-x-auto pb-1">
                        <button
                            v-for="item in categories"
                            :key="item"
                            @click="category = item"
                            :class="
                                category === item
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                            "
                            class="rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap"
                        >
                            {{ item }}
                        </button>
                    </div>
                    <div
                        class="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
                    >
                        <button
                            v-for="product in filteredProducts"
                            :key="product.id"
                            @click="addToCart(product)"
                            class="group rounded-xl border border-slate-100 p-3 text-left transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md dark:border-slate-800"
                        >
                            <div
                                class="flex aspect-[1.4] items-center justify-center rounded-lg bg-slate-50 text-4xl dark:bg-slate-800"
                            >
                                {{ product.icon }}
                            </div>
                            <p class="mt-3 break-words whitespace-normal text-sm font-semibold">
                                {{ product.name }}
                            </p>
                            <p class="mt-1 text-xs text-slate-400">
                                {{
                                    money(product.units[0]?.selling_price ?? 0)
                                }}
                            </p>
                            <span
                                class="mt-3 block text-xs font-medium text-blue-600"
                                >{{ product.stock?.quantity_base ?? 0 }} in
                                stock</span
                            >
                        </button>
                    </div>
                </section>
                 <aside
                     class="rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:sticky lg:top-5"
                >
                    <div
                        class="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800"
                    >
                        <div>
                            <h2 class="font-bold">Current sale</h2>
                            <p class="mt-1 text-xs text-slate-400">
                                {{ cart.length }} items
                            </p>
                        </div>
                        <button
                            v-if="cart.length"
                            @click="checkoutStore.clearCart()"
                            type="button"
                            class="text-xs font-semibold text-rose-500 hover:text-rose-700"
                        >
                            Clear all
                        </button>
                    </div>
                    <div
                        class="min-h-48 divide-y divide-slate-100 p-5 dark:divide-slate-800"
                    >
                        <div
                            v-if="!cart.length"
                            class="flex min-h-40 flex-col items-center justify-center text-center"
                        >
                            <div
                                class="rounded-full bg-slate-50 p-4 text-slate-300 dark:bg-slate-800 dark:text-slate-500"
                            >
                                <ShoppingCart class="size-7" />
                            </div>
                            <p
                                class="mt-3 text-sm font-semibold text-slate-500"
                            >
                                Your sale is empty
                            </p>
                            <p class="mt-1 text-xs text-slate-400">
                                Select products to add them here
                            </p>
                        </div>
                        <div
                            v-for="item in cart"
                            :key="item.id"
                            class="flex gap-3 py-3 first:pt-0"
                        >
                            <div
                                class="flex size-10 items-center justify-center rounded-lg bg-slate-50 text-xl"
                            >
                                {{ item.icon }}
                            </div>
                            <div class="min-w-0 flex-1">
                                <p class="break-words text-sm font-semibold">
                                    {{ item.name }}
                                </p>
                                <label class="mt-1 block text-[10px] font-medium text-slate-400 dark:text-slate-500">Selling unit</label>
                                <select
                                    v-model="item.unit"
                                    class="mt-1 min-h-8 w-full rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                                >
                                    <option :value="null" disabled>Choose unit</option>
                                    <option
                                        v-for="unit in orderedUnits(item)"
                                        :key="unit.id"
                                        :value="unit"
                                    >
                                        {{ unit.name }}
                                    </option>
                                </select>
                                <div class="mt-2 flex items-center gap-2">
                                    <button
                                        @click="removeFromCart(item)"
                                        type="button"
                                        aria-label="Decrease quantity"
                                        class="rounded-md border border-slate-200 p-1 text-slate-400 transition hover:border-blue-200 hover:text-blue-600 dark:border-slate-700"
                                    >
                                        <Minus class="size-3" /></button
                                    ><span
                                        class="w-5 text-center text-xs font-semibold"
                                        >{{ item.quantity }}</span
                                    ><button
                                        @click="item.quantity++"
                                        type="button"
                                        aria-label="Increase quantity"
                                        class="rounded-md border border-slate-200 p-1 text-slate-400 transition hover:border-blue-200 hover:text-blue-600 dark:border-slate-700"
                                    >
                                        <Plus class="size-3" />
                                    </button>
                                </div>
                            </div>
                            <div class="text-right">
                                <p class="text-sm font-semibold">
                                    {{ money(unitPrice(item) * item.quantity) }}
                                </p>
                                <button
                                    @click="
                                        checkoutStore.removeItem(
                                            cart.indexOf(item),
                                        )
                                    "
                                    type="button"
                                    aria-label="Remove item from sale"
                                    class="mt-2 text-slate-300 hover:text-rose-500"
                                >
                                    <Trash2 class="size-3.5" />
                                </button>
                            </div>
                        </div>
                    </div>
                    <p v-if="unitMessage" class="mx-5 mb-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300" role="alert">{{ unitMessage }}</p>
                    <form
                        @submit.prevent="completeSale"
                        class="space-y-3 border-t border-slate-100 p-5 text-sm dark:border-slate-800"
                    >
                        <div class="flex justify-between text-slate-500">
                            <span>Subtotal</span
                            ><span>{{ money(subtotal) }}</span>
                        </div>
                        <div class="flex justify-between text-slate-500">
                            <span>Discount</span><span>0 MMK</span>
                        </div>
                        <div class="flex justify-between text-slate-500">
                            <span>Tax</span><span>0 MMK</span>
                        </div>
                        <div
                            class="flex justify-between border-t border-slate-100 pt-3 text-base font-bold"
                        >
                            <span>Total</span
                            ><span class="text-blue-600">{{
                                money(subtotal)
                            }}</span>
                        </div>
                        <FormSection
                            title="Payment"
                            description="Choose how the customer paid and record the amount received."
                        >
                            <div class="space-y-4">
                                <FormField
                                    label="Payment method"
                                    required
                                    :error="saleForm.errors.payment_method"
                                >
                                    <select
                                        id="payment_method"
                                        v-model="saleForm.payment_method"
                                        class="w-full rounded-xl border-slate-200 bg-slate-50 px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                                    >
                                        <option value="cash">Cash</option>
                                        <option value="kbzpay">KBZPay</option>
                                    </select>
                                </FormField>
                                <FormField
                                    label="Received amount"
                                    :error="saleForm.errors.received_amount"
                                    hint="Leave blank to use the sale total."
                                >
                                    <input
                                        id="received_amount"
                                        v-model.number="
                                            saleForm.received_amount
                                        "
                                        type="number"
                                        min="0"
                                        class="w-full rounded-xl border-slate-200 bg-slate-50 px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                                        placeholder="0"
                                    />
                                </FormField>
                            </div>
                        </FormSection>
                        <p
                            v-if="saleForm.errors.items"
                            class="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700"
                            role="alert"
                        >
                            {{ saleForm.errors.items }}
                        </p>
                        <FormActions
                            label="Complete sale"
                            :processing="saleForm.processing"
                        />
                    </form>
                </aside>
            </div>
        </div>
    </div>
</template>
