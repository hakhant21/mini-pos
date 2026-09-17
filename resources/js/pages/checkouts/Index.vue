<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { Head, InfiniteScroll, Link, useForm } from "@inertiajs/vue3";
import { storeToRefs } from "pinia";
import { toast } from "vue-sonner";
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
import { store as saleItemsStore } from "@/routes/sales/items";
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
    package_quantity?: number;
    loose_quantity?: number;
    barcode?: string | null;
};
type Product = {
    id: number;
    name: string;
    sku: string;
    category: { name: string };
    base_unit: string;
    reorder_level?: number;
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
    selling_mode: "Single" | "Package" | "Carton";
};
type SellingMode = CartItem["selling_mode"];
const props = defineProps<{
    products: { data: Product[] };
    categories: string[];
    sale?: { id: number; invoice_number: string; payment_method: string; total: number } | null;
}>();
const { t, te } = useI18n();
const query = ref("");
const category = ref("all");
const barcodeMessage = ref("");
const unitMessage = ref("");
const showMobileCart = ref(false);
const checkoutStore = useCheckoutStore();
const isAppending = computed(() => Boolean(props.sale));
const { subtotal } = storeToRefs(checkoutStore);
const cart = computed<CartItem[]>(() => checkoutStore.items as unknown as CartItem[]);
const saleForm = useForm({
    payment_method: props.sale?.payment_method ?? "cash",
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
function selectedFormat(item: CartItem): string {
    return item.unit
        ? unitFormat(item.unit, item.product)
        : (formatOptions(item.product)[0] ?? "");
}
function selectedPackage(item: CartItem): string {
    return item.selling_mode ?? "Single";
}
function changeCartUnit(item: CartItem, format: string, packageName: string): void {
    const matchingUnits = item.product.units.filter(
        (unit: Unit) => unitFormat(unit, item.product) === format,
    );
    item.unit =
        matchingUnits.find((unit: Unit) => unitPackage(unit) === packageName) ??
        (packageName === "Single" ? matchingUnits[0] : null);
    item.selling_mode = (['Single', 'Package', 'Carton'] as string[]).includes(packageName)
        ? packageName as SellingMode
        : 'Single';
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
function openMobileCart(): void {
    showMobileCart.value = true;
}
onMounted(() => window.addEventListener("keydown", handleShortcut));
onBeforeUnmount(() => window.removeEventListener("keydown", handleShortcut));
function unitPrice(item: CartItem): number {
    if (item.selling_mode === "Single")
        return item.unit?.single_unit_price ?? 0;
    if (
        item.selling_mode === "Package" &&
        item.product.price_mode === "single_package_carton"
    )
        return item.unit?.package_price ?? 0;

    return item.unit?.selling_price ?? 0;
}

function availableQuantity(item: CartItem): number {
    const unit = item.unit;
    if (!unit) return 0;

    const quantityBase = (unit.package_quantity ?? 0) * unit.conversion + (unit.loose_quantity ?? 0);
    return item.selling_mode === "Single"
        ? quantityBase
        : Math.floor(quantityBase / unit.conversion);
}

function translatedUnitName(unitName: string): string {
    const translationKey = `products.unit_names.${unitName}`;

    return te(translationKey) ? t(translationKey) : unitName;
}

function availableStock(item: CartItem): string {
    const unit = item.unit;
    if (!unit) return "";

    const quantityBase =
        (unit.package_quantity ?? 0) * unit.conversion +
        (unit.loose_quantity ?? 0);
    const baseUnit = translatedUnitName(item.product.base_unit);

    if (item.selling_mode === "Single") {
        return t("checkout.stock_count", {
            count: quantityBase,
            unit: baseUnit,
        });
    }

    const packages = Math.floor(quantityBase / unit.conversion);
    const loose = quantityBase % unit.conversion;
    const stockParts: string[] = [];

    if (packages > 0) {
        stockParts.push(
            t("checkout.stock_packages", {
                count: packages,
                unit: translatedUnitName(item.selling_mode),
            }),
        );
    }

    if (loose > 0 || stockParts.length === 0) {
        stockParts.push(
            t("checkout.stock_count", {
                count: loose,
                unit: baseUnit,
            }),
        );
    }

    return stockParts.join(` ${t("common.and")} `);
}

function stockMessage(item: CartItem): string {
    const available = availableQuantity(item);
    if (available === 0) return t("checkout.out_of_stock");
    if (item.quantity > available) return t("checkout.insufficient_stock");
    const threshold = item.selling_mode === "Single"
        ? item.reorder_level ?? 0
        : Math.ceil((item.reorder_level ?? 0) / (item.unit?.conversion ?? 1));
    if (threshold > 0 && available <= threshold) return t("checkout.low_stock");

    return "";
}

function removeFromCart(item: CartItem): void {
    const index = cart.value.indexOf(item);
    if (item.quantity > 1)
        checkoutStore.updateQuantity(index, item.quantity - 1);
    else checkoutStore.removeItem(index);
}
function completeSale(): void {
    if (cart.value.some((item) => !item.unit)) {
        unitMessage.value = t("checkout.choose_unit_error");
        toast.error(unitMessage.value);
        return;
    }

    const stockIssue = cart.value.find((item) => stockMessage(item));
    if (stockIssue) {
        toast.error(`${stockIssue.name}: ${stockMessage(stockIssue)}`);
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
    saleForm.post(isAppending.value ? saleItemsStore(props.sale!.id).url : saleStore().url, {
        onSuccess: () => {
            checkoutStore.clearCart();
            toast.success(t("checkout.sale_success"));
        },
        onError: (errors) => {
            const message = errors.items ?? Object.values(errors)[0] ?? t("checkout.sale_error");
            toast.error(message);
        },
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
                        {{ isAppending ? $t("checkout.add_items") : $t("checkout.new_sale") }}
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
                <div
                    v-if="showMobileCart"
                    class="fixed inset-0 z-20 bg-slate-950/40 lg:hidden"
                    aria-hidden="true"
                    @click="showMobileCart = false"
                />
                <aside
                    id="mobile-cart"
                    :class="showMobileCart ? 'fixed inset-x-3 top-16 bottom-3 z-30 flex max-h-[calc(100vh-5rem)] flex-col' : 'hidden'"
                    class="rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:static lg:inset-auto lg:z-auto lg:flex lg:h-[calc(100vh-9rem)] lg:max-h-none lg:flex-col"
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
                        <div class="flex items-center gap-3">
                            <button
                                v-if="cart.length"
                                @click="checkoutStore.clearCart()"
                                type="button"
                                class="text-xs font-semibold text-rose-500 hover:text-rose-700"
                            >
                                {{ $t("checkout.clear") }}
                            </button>
                            <button
                                type="button"
                                class="text-xs font-semibold text-slate-500 lg:hidden"
                                @click="showMobileCart = false"
                            >
                                {{ $t("common.close") }}
                            </button>
                        </div>
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
                                <p class="mt-2 text-[11px] font-medium text-slate-400">
                                    {{ $t("checkout.available_stock") }}: {{ availableStock(item) }}
                                </p>
                                <p v-if="stockMessage(item)" class="mt-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                                    {{ stockMessage(item) }}
                                </p>
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
                            :label="$t(isAppending ? 'checkout.add_items' : 'checkout.complete')"
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
