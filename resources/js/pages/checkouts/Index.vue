<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { Head, InfiniteScroll, Link, useForm } from "@inertiajs/vue3";
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
type Unit = {
    id: number;
    name: string;
    conversion: number;
    selling_price: number;
    package_price: number;
    single_unit_price: number;
    quantity_base?: number;
    barcode?: string | null;
};
type Product = {
    id: number;
    name: string;
    sku: string;
    category: { name: string };
    base_unit: string;
    price_mode: string;
    units: Unit[];
    icon: string;
    image_url?: string | null;
    barcode?: string | null;
    price?: number;
};
type CartItem = Product & {
    product_id: number;
    product: Product;
    unit: Unit | null;
    quantity: number;
};
const props = defineProps<{
    products: { data: Product[] };
    categories: string[];
}>();
const { t } = useI18n();
const query = ref("");
const category = ref("all");
const barcodeMessage = ref("");
const unitMessage = ref("");
const showMobileCart = ref(false);
const mobileCart = ref<HTMLElement | null>(null);
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
        selling_mode: "Single" | "Package" | "Carton";
        quantity: number;
    }[],
});
const categories = computed<string[]>(() => ["all", ...props.categories]);
const filteredProducts = computed(() =>
    props.products.data.filter(
        (product) =>
            (category.value === "all" ||
                product.category.name === category.value) &&
            `${product.name} ${product.sku}`
                .toLowerCase()
                .includes(query.value.toLowerCase()),
    ),
);
const totalStock = (product: Product): number =>
    product.units.reduce((total, unit) => total + (unit.quantity_base ?? 0), 0);
const money = (value: number) =>
    `${new Intl.NumberFormat("en-US").format(value)} ${t("common.currency")}`;
function addToCart(product: Product, selectedUnit?: Unit): void {
    const defaultUnit =
        product.units.find((unit) => unit.name.toLowerCase() === "single") ??
        product.units.find((unit) => unit.conversion === 1) ??
        product.units[0];

    const unit = selectedUnit ?? defaultUnit ?? null;
    checkoutStore.addItem(product, unit);
}
function productBaseName(product: Product): string {
    return product.name.replace(/\s+\([^)]*\)$/, "");
}
function productVariantLabel(product: Product): string {
    return product.name.match(/\(([^)]*)\)$/)?.[1] ?? "";
}
function unitFormat(unit: Unit, product: Product): string {
    if (
        product.price_mode === "single_package_carton" &&
        ["single", "package", "carton"].includes(unit.name.toLowerCase())
    ) {
        return product.base_unit;
    }

    return unit.name
        .replace(
            /\s+(single|package(?:\s*\(\d+\))?|carton(?:\s*\(\d+\))?)$/i,
            "",
        )
        .trim();
}
function unitPackage(unit: Unit): string {
    if (/carton/i.test(unit.name)) return "Carton";
    if (/package/i.test(unit.name)) return "Package";

    return "Single";
}
function formatOptions(product: Product): string[] {
    return [...new Set(product.units.map((unit) => unitFormat(unit, product)))];
}
function packageOptions(product: Product): string[] {
    const allowedPackages =
        product.price_mode === "single_package_carton"
            ? ["Single", "Package", "Carton"]
            : product.price_mode === "single_package"
              ? ["Single", "Package"]
              : ["Single"];

    return allowedPackages.filter(
        (option) =>
            option === "Single" ||
            product.units.some((unit) => unitPackage(unit) === option),
    );
}
function selectedFormat(item: any): string {
    return item.unit
        ? unitFormat(item.unit, item.product)
        : (formatOptions(item.product)[0] ?? "");
}
function selectedPackage(item: any): string {
    return item.selling_mode ?? "Single";
}
function changeCartUnit(item: any, format: string, packageName: string): void {
    const matchingUnits = item.product.units.filter(
        (unit: Unit) => unitFormat(unit, item.product) === format,
    );
    item.unit =
        matchingUnits.find((unit: Unit) => unitPackage(unit) === packageName) ??
        (packageName === "Single" ? matchingUnits[0] : null);
    item.selling_mode = packageName;
}
function handleBarcode(): void {
    const value = query.value.trim();
    if (!value) return;
    const product = props.products.data.find(
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
    barcodeMessage.value = t("checkout.product_not_found");
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
async function openMobileCart(): Promise<void> {
    showMobileCart.value = true;
    await nextTick();
    mobileCart.value?.scrollIntoView({ behavior: "smooth", block: "start" });
}
onMounted(() => window.addEventListener("keydown", handleShortcut));
onBeforeUnmount(() => window.removeEventListener("keydown", handleShortcut));
function unitPrice(item: any): number {
    if (item.selling_mode === "Single")
        return item.unit?.single_unit_price ?? 0;
    if (
        item.selling_mode === "Package" &&
        item.product.price_mode === "single_package_carton"
    )
        return item.unit?.package_price ?? 0;

    return item.unit?.selling_price ?? 0;
}

function removeFromCart(item: any): void {
    const index = cart.value.indexOf(item);
    if (item.quantity > 1)
        checkoutStore.updateQuantity(index, item.quantity - 1);
    else checkoutStore.removeItem(index);
}
function completeSale(): void {
    if (cart.value.some((item) => !item.unit)) {
        unitMessage.value = t("checkout.choose_unit_error");
        return;
    }

    unitMessage.value = "";
    saleForm.items = cart.value.map((item) => ({
        product_id: item.product_id,
        product_unit_id: item.unit!.id,
        selling_mode: item.selling_mode ?? "Single",
        quantity: item.quantity,
    }));
    if (!saleForm.received_amount) {
        saleForm.received_amount = subtotal.value;
    }
    saleForm.post(saleStore().url, {
        onSuccess: () => checkoutStore.clearCart(),
    });
}
</script>
<template>
    <Head :title="$t('checkout.title')" />
    <div
        class="min-h-screen scroll-smooth bg-[#f5f7fb] px-4 py-6 text-slate-900 dark:bg-slate-950 dark:text-slate-100 sm:px-6 lg:px-8"
    >
        <div class="mx-auto max-w-[1500px] space-y-5">
            <header class="flex flex-wrap items-center gap-3">
                <Link
                    :href="dashboard()"
                    :aria-label="$t('checkout.back_to_dashboard')"
                    class="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 transition hover:border-blue-200 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                    ><ArrowLeft class="size-4"
                /></Link>
                <div>
                    <p class="text-sm text-slate-400">
                        {{ $t("checkout.point_of_sale") }}
                    </p>
                    <h1 class="text-2xl font-bold">
                        {{ $t("checkout.new_sale") }}
                    </h1>
                </div>
                <span
                    class="ml-auto rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600"
                    >{{ $t("checkout.register_open") }}</span
                >
            </header>
            <div
                class="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,390px)]"
            >
                <section
                    class="w-full min-w-0 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5"
                >
                    <label
                        class="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 px-4 text-sm text-slate-400 dark:border-slate-700"
                        ><Search class="size-5" /><input
                            v-model="query"
                            data-checkout-search
                            @keydown.enter="handleBarcode"
                            class="min-w-0 w-full border-0 bg-transparent py-3 outline-none"
                            :placeholder="$t('checkout.search')"
                    /></label>
                    <p
                        v-if="barcodeMessage"
                        class="mt-2 text-xs font-medium text-rose-600"
                    >
                        {{ barcodeMessage }}
                    </p>
                    <div class="mt-5 flex flex-wrap gap-2 pb-1">
                        <button
                            v-for="item in categories"
                            :key="item"
                            @click="category = item"
                            :class="
                                category === item
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                            "
                            class="rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap sm:px-4"
                        >
                            {{
                                item === "all"
                                    ? $t("checkout.all_categories")
                                    : item
                            }}
                        </button>
                    </div>
                    <InfiniteScroll
                        data="products"
                        items-element="#product-grid"
                    >
                        <div
                            id="product-grid"
                            class="mt-5 grid w-full min-w-0 grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
                        >
                            <button
                                v-for="product in filteredProducts"
                                :key="product.id"
                                @click="addToCart(product)"
                                class="group min-w-0 rounded-xl border border-slate-100 p-3 text-left transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md dark:border-slate-800"
                            >
                                <div
                                    class="flex aspect-[1.4] w-full max-w-full items-center justify-center rounded-lg bg-slate-50 text-4xl dark:bg-slate-800"
                                >
                                    <img
                                        v-if="product.image_url"
                                        :src="product.image_url"
                                        :alt="product.name"
                                        class="size-full object-cover"
                                    />
                                    <span v-else>{{ product.icon }}</span>
                                </div>
                                <p
                                    class="mt-3 break-words whitespace-normal text-sm font-semibold"
                                >
                                    {{ productBaseName(product) }}
                                </p>
                                <span
                                    v-if="productVariantLabel(product)"
                                    class="mt-1 inline-flex rounded-md bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                                >
                                    {{ productVariantLabel(product) }}
                                </span>
                            </button>
                        </div>
                    </InfiniteScroll>
                </section>
                <aside
                    ref="mobileCart"
                    id="mobile-cart"
                    :class="showMobileCart ? 'flex flex-col' : 'hidden'"
                    class="rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:sticky lg:top-5 lg:flex lg:h-[calc(100vh-9rem)] lg:flex-col"
                >
                    <div
                        class="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800"
                    >
                        <div>
                            <h2 class="font-bold">
                                {{ $t("checkout.current_sale") }}
                            </h2>
                            <p class="mt-1 text-xs text-slate-400">
                                {{ cart.length }} {{ $t("checkout.items") }}
                            </p>
                        </div>
                        <button
                            v-if="cart.length"
                            @click="checkoutStore.clearCart()"
                            type="button"
                            class="text-xs font-semibold text-rose-500 hover:text-rose-700"
                        >
                            {{ $t("checkout.clear") }}
                        </button>
                    </div>
                    <div
                        class="max-h-[40rem] min-h-48 scroll-smooth overflow-y-auto divide-y divide-slate-100 p-5 overscroll-contain dark:divide-slate-800 lg:max-h-none lg:min-h-0 lg:flex-1"
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
                                {{ $t("checkout.empty") }}
                            </p>
                            <p class="mt-1 text-xs text-slate-400">
                                {{ $t("checkout.select_products") }}
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
                                <img
                                    v-if="item.image_url"
                                    :src="item.image_url"
                                    :alt="item.name"
                                    class="size-full rounded-lg object-cover"
                                />
                                <span v-else>{{ item.icon }}</span>
                            </div>
                            <div class="min-w-0 flex-1">
                                <p class="break-words text-sm font-semibold">
                                    {{ item.name }}
                                </p>
                                <div class="mt-1 grid grid-cols-2 gap-2">
                                    <label
                                        class="block text-[10px] font-medium text-slate-400 dark:text-slate-500"
                                        >{{ $t("checkout.product_unit")
                                        }}<select
                                            :value="selectedFormat(item)"
                                            class="mt-1 min-h-8 w-full rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                                            @change="
                                                changeCartUnit(
                                                    item,
                                                    (
                                                        $event.target as HTMLSelectElement
                                                    ).value,
                                                    selectedPackage(item),
                                                )
                                            "
                                        >
                                            <option
                                                v-for="format in formatOptions(
                                                    item.product,
                                                )"
                                                :key="format"
                                                :value="format"
                                            >
                                                {{ format }}
                                            </option>
                                        </select></label
                                    >
                                    <label
                                        class="block text-[10px] font-medium text-slate-400 dark:text-slate-500"
                                        >{{ $t("checkout.selling_unit")
                                        }}<select
                                            :value="selectedPackage(item)"
                                            class="mt-1 min-h-8 w-full rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                                            @change="
                                                changeCartUnit(
                                                    item,
                                                    selectedFormat(item),
                                                    (
                                                        $event.target as HTMLSelectElement
                                                    ).value,
                                                )
                                            "
                                        >
                                            <option
                                                v-for="packageName in packageOptions(
                                                    item.product,
                                                )"
                                                :key="packageName"
                                                :value="packageName"
                                            >
                                                {{ packageName }}
                                            </option>
                                        </select></label
                                    >
                                </div>
                                <div class="mt-2 flex items-center gap-2">
                                    <button
                                        @click="removeFromCart(item)"
                                        type="button"
                                        :aria-label="
                                            $t('checkout.decrease_quantity')
                                        "
                                        class="rounded-md border border-slate-200 p-1 text-slate-400 transition hover:border-blue-200 hover:text-blue-600 dark:border-slate-700"
                                    >
                                        <Minus class="size-3" /></button
                                    ><span
                                        class="w-5 text-center text-xs font-semibold"
                                        >{{ item.quantity }}</span
                                    ><button
                                        @click="item.quantity++"
                                        type="button"
                                        :aria-label="
                                            $t('checkout.increase_quantity')
                                        "
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
                                    :aria-label="$t('checkout.remove_item')"
                                    class="mt-2 text-slate-300 hover:text-rose-500"
                                >
                                    <Trash2 class="size-3.5" />
                                </button>
                            </div>
                        </div>
                    </div>
                    <p
                        v-if="unitMessage"
                        class="mx-5 mb-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300"
                        role="alert"
                    >
                        {{ unitMessage }}
                    </p>
                    <form
                        @submit.prevent="completeSale"
                        class="shrink-0 space-y-2 border-t border-slate-100 p-3 text-sm dark:border-slate-800"
                    >
                        <div class="flex justify-between text-slate-500">
                            <span>{{ $t("checkout.subtotal") }}</span
                            ><span>{{ money(subtotal) }}</span>
                        </div>
                        <div class="flex justify-between text-slate-500">
                            <span>{{ $t("checkout.discount") }}</span
                            ><span>{{ $t("checkout.zero_amount") }}</span>
                        </div>
                        <div class="flex justify-between text-slate-500">
                            <span>{{ $t("checkout.tax") }}</span
                            ><span>{{ $t("checkout.zero_amount") }}</span>
                        </div>
                        <div
                            class="flex justify-between border-t border-slate-100 pt-2 text-base font-bold"
                        >
                            <span>{{ $t("checkout.total") }}</span
                            ><span class="text-blue-600">{{
                                money(subtotal)
                            }}</span>
                        </div>
                        <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            <FormField
                                :label="$t('checkout.payment')"
                                required
                                :error="saleForm.errors.payment_method"
                                class="text-xs [&>label]:text-xs"
                            >
                                <select
                                    id="payment_method"
                                    v-model="saleForm.payment_method"
                                    class="w-full rounded-xl border-slate-200 bg-slate-50 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                                >
                                    <option value="cash">
                                        {{ $t("checkout.cash") }}
                                    </option>
                                    <option value="kbzpay">
                                        {{ $t("checkout.kbzpay") }}
                                    </option>
                                </select>
                            </FormField>
                            <FormField
                                :label="$t('checkout.received')"
                                :error="saleForm.errors.received_amount"
                                :hint="$t('checkout.received_hint')"
                                class="text-xs [&>label]:text-xs"
                            >
                                <input
                                    id="received_amount"
                                    v-model.number="saleForm.received_amount"
                                    type="number"
                                    min="0"
                                    class="w-full rounded-xl border-slate-200 bg-slate-50 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                                    :placeholder="
                                        $t(
                                            'checkout.received_amount_placeholder',
                                        )
                                    "
                                />
                            </FormField>
                        </div>
                        <p
                            v-if="saleForm.errors.items"
                            class="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700"
                            role="alert"
                        >
                            {{ saleForm.errors.items }}
                        </p>
                        <FormActions
                            :label="$t('checkout.complete')"
                            :processing="saleForm.processing"
                            class="gap-2 pt-2 [&>button]:min-h-9 [&>button]:px-3 [&>button]:text-xs"
                        />
                    </form>
                </aside>
            </div>
            <button
                type="button"
                @click="openMobileCart"
                aria-controls="mobile-cart"
                class="fixed right-4 bottom-4 z-20 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/30 lg:hidden"
            >
                {{ $t("checkout.view_cart") }} ({{ cart.length }})
            </button>
        </div>
    </div>
</template>
