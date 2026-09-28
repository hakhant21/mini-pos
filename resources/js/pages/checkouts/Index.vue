<script setup lang="ts">
import {
    computed,
    onBeforeUnmount,
    onMounted,
    nextTick,
    reactive,
    ref,
} from "vue";
import {
    Head,
    InfiniteScroll,
    router,
    useForm,
    useRemember,
} from "@inertiajs/vue3";
import { storeToRefs } from "pinia";
import { toast } from "vue-sonner";
import { useI18n } from "vue-i18n";
import {
    CreditCard,
    Minus,
    Plus,
    ScanLine,
    Search,
    ShoppingCart,
    X,
} from "@lucide/vue";
import { useCheckoutStore } from "@/stores/checkout";
import { create as checkoutRoute, store as saleStore } from "@/routes/sales";
import { store as saleItemsStore } from "@/routes/sales/items";

type Unit = {
    id: number;
    name: string;
    conversion: number;
    selling_price: number;
    package_price: number;
    single_unit_price: number;
    package_quantity?: number;
    loose_quantity?: number;
    barcode?: string | null;
};
type SellingMode = "Single" | "Package" | "Carton";
type SellingOption = { unit: Unit; mode: SellingMode };

type Product = {
    id: number;
    name: string;
    sku: string;
    category: { name: string };
    price_mode: string;
    base_unit: string;
    units: Unit[];
    icon: string;
    image_url?: string | null;
    barcode?: string | null;
    reorder_level?: number;
};

type CartItem = Product & {
    product_id: number;
    product: Product;
    unit: Unit | null;
    quantity: number;
    selling_mode: SellingMode;
};

type CheckoutFilters = {
    query: string;
    category: string;
};

const props = defineProps<{
    products: { data: Product[] };
    categories: string[];
    filters?: { query?: string; category?: string };
    sale?: {
        id: number;
        invoice_number: string;
        payment_method: string;
        total: number;
    } | null;
}>();

const checkoutStore = useCheckoutStore();
const { t } = useI18n();
const { subtotal } = storeToRefs(checkoutStore);
const cart = computed<CartItem[]>(() => checkoutStore.items as CartItem[]);
const isAppending = computed(() => Boolean(props.sale));
const searchInput = ref<HTMLInputElement | null>(null);
const filters = useRemember(
    reactive({
        query: props.filters?.query ?? "",
        category: props.filters?.category ?? "all",
    }),
    "Checkout/Index/filters",
) as CheckoutFilters;
const barcodeMessage = ref("");
const showMobileCart = ref(false);
const isComposing = ref(false);

const saleForm = useForm({
    payment_method: props.sale?.payment_method ?? "cash",
    received_amount: 0,
    discount: 0,
    tax: 0,
    items: [] as {
        product_id: number;
        product_unit_id: number;
        selling_mode: SellingMode;
        quantity: number;
    }[],
});

const categories = computed(() => ["all", ...props.categories]);
const returnAmount = computed(() =>
    Math.max(0, Number(saleForm.received_amount || 0) - subtotal.value),
);
const filteredProducts = computed(() => props.products.data);

let latestFilterRequest = 0;
function filterProducts(): void {
    const filterRequest = ++latestFilterRequest;
    const input = searchInput.value;
    const restoreFocus = document.activeElement === input;
    const selectionStart = filters.query.length;
    const selectionEnd = filters.query.length;

    router.visit(
        checkoutRoute({
            query: {
                search: filters.query || undefined,
                category: filters.category === "all" ? undefined : filters.category,
            },
        }),
        {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => {
                if (!restoreFocus || filterRequest !== latestFilterRequest) return;

                void nextTick(() => {
                    const restore = (): void => {
                        searchInput.value?.focus();
                        searchInput.value?.setSelectionRange(
                            selectionStart,
                            selectionEnd,
                        );
                    };

                    restore();
                });
            },
        },
    );
}

function filterProductsOnKeyup(event: KeyboardEvent): void {
    if (isComposing.value || event.isComposing) return;
    filterProducts();
}

function finishComposition(): void {
    isComposing.value = false;
    filterProducts();
}

function selectCategory(category: string): void {
    filters.category = category;
    filterProducts();
}

const formatMoney = (value: number): string =>
    new Intl.NumberFormat("en-US").format(value);

function defaultUnit(product: Product): Unit | undefined {
    return (
        product.units.find((unit) => unit.name.toLowerCase() === "single") ??
        product.units.find((unit) => unit.conversion === 1) ??
        product.units[0]
    );
}

function unitPrice(unit: Unit | null, sellingMode = "Single"): number {
    if (!unit) return 0;
    if (sellingMode === "Single")
        return unit.single_unit_price || unit.selling_price;
    if (sellingMode === "Package" && unit.package_price)
        return unit.package_price;

    return unit.selling_price;
}

function translatedUnitName(name: string): string {
    const exactKey = `products.unit_names.${name}`;
    const exactTranslation = t(exactKey);

    if (exactTranslation !== exactKey) return exactTranslation;

    return name.replace(
        /(single|package|carton)$/i,
        (unit) => t(`products.unit_names.${unit[0].toUpperCase()}${unit.slice(1).toLowerCase()}`),
    );
}

function sellingModeFor(product: Product, unit: Unit): SellingMode {
    if (product.price_mode === "standard") return "Single";

    const name = unit.name.trim().toLowerCase();

    if (/carton(?:\s*\(\d+\))?$/.test(name)) return "Carton";
    if (/package(?:\s*\(\d+\))?$/.test(name)) return "Package";
    if (/single(?:\s*\(\d+\))?$/.test(name)) return "Single";

    return "Single";
}

function sellingOptions(product: Product): SellingOption[] {
    if (
        product.price_mode === "single_package_carton" &&
        product.units.length === 1
    ) {
        return ["Single", "Package", "Carton"].map((mode) => ({
            unit: product.units[0],
            mode: mode as SellingMode,
        }));
    }

    return product.units.map((unit) => ({
        unit,
        mode: sellingModeFor(product, unit),
    }));
}

function addToCart(
    product: Product,
    unit = defaultUnit(product),
    sellingMode = unit ? sellingModeFor(product, unit) : "Single",
): void {

    if (!unit || !isUnitAvailable(unit, sellingMode)) return;
    checkoutStore.addItem(product, unit, sellingMode);
}

function stockLabel(
    unit: Unit,
    sellingMode: SellingMode,
    product: Product,
): string {
    const packs = unit.package_quantity ?? 0;
    const bottles = unit.loose_quantity ?? 0;

    return packs === 0 && bottles === 0
        ? t("checkout.out_of_stock")
        : sellingMode === "Single"
          ? `${packs} ${translatedUnitName(unit.name)} / ${bottles} ${translatedUnitName(product.base_unit)}`
          : `${Math.floor((packs * unit.conversion + bottles) / unitConversion(unit, sellingMode))} ${translatedUnitName(sellingMode)}`;
}

function unitConversion(unit: Unit, sellingMode: SellingMode): number {
    if (sellingMode === "Single") return 1;
    if (sellingMode === "Carton" && !/carton$/i.test(unit.name.trim())) {
        return unit.conversion * 10;
    }

    return unit.conversion;
}

function isUnitAvailable(unit: Unit, sellingMode: SellingMode): boolean {
    const quantityBase =
        (unit.package_quantity ?? 0) * unit.conversion +
        (unit.loose_quantity ?? 0);
    const requiredBaseQuantity = unitConversion(unit, sellingMode);

    return quantityBase >= requiredBaseQuantity;
}

function unitLabel(unit: Unit, product: Product): string {
    if (
        product.price_mode === "single_package_carton" &&
        ["single", "package", "carton"].includes(unit.name.toLowerCase())
    ) {
        return product.category.name === "Beer" ? "Bottle" : unit.name;
    }

    return unit.name
        .replace(
            /\s+(single|package(?:\s*\(\d+\))?|carton(?:\s*\(\d+\))?)$/i,
            "",
        )
        .trim();
}

function optionLabel(option: SellingOption, product: Product): string {
    if (
        product.price_mode === "single_package_carton" &&
        product.units.length === 1
    ) {
        return option.mode;
    }

    return unitLabel(option.unit, product);
}

function handleBarcode(): void {
    const value = filters.query.trim().toLowerCase();
    if (!value) return;

    const product = props.products.data.find(
        (item) =>
            item.sku.toLowerCase() === value ||
            item.barcode?.toLowerCase() === value ||
            item.units.some((unit) => unit.barcode?.toLowerCase() === value),
    );
    const exactUnit = product?.units.find(
        (unit) => unit.barcode?.toLowerCase() === value,
    );

    if (product) {
        addToCart(product, exactUnit ?? defaultUnit(product));
        filters.query = "";
        barcodeMessage.value = "";
        return;
    }

    barcodeMessage.value = t("checkout.no_exact_match");
}

function clearFilters(): void {
    filters.query = "";
    filters.category = "all";
    barcodeMessage.value = "";
    filterProducts();
}

function changeQuantity(item: CartItem, amount: number): void {
    const index = cart.value.indexOf(item);
    checkoutStore.updateQuantity(index, item.quantity + amount);
}

function removeItem(item: CartItem): void {
    checkoutStore.removeItem(cart.value.indexOf(item));
}

function completeSale(): void {
    if (!cart.value.length) return;

    saleForm.items = cart.value.map((item) => ({
        product_id: item.product_id,
        product_unit_id: item.unit!.id,
        selling_mode: item.selling_mode,
        quantity: item.quantity,
    }));
    saleForm.received_amount = saleForm.received_amount || subtotal.value;
    saleForm.post(
        isAppending.value
            ? saleItemsStore(props.sale!.id).url
            : saleStore().url,
        {
            onSuccess: () => {
                checkoutStore.clearCart();
                toast.success(t("checkout.sale_success"));
            },
            onError: (errors) =>
                toast.error(
                    errors.items ??
                        Object.values(errors)[0] ??
                        t("checkout.sale_error"),
                ),
        },
    );
}

function handleShortcut(event: KeyboardEvent): void {
    if (event.key === "F2") {
        event.preventDefault();
        searchInput.value?.focus();
    }
    if (event.key === "F8") completeSale();
}

onMounted(() => window.addEventListener("keydown", handleShortcut));
onBeforeUnmount(() => {
    window.removeEventListener("keydown", handleShortcut);
});
</script>

<template>
    <Head :title="t('checkout.title')" />
    <div
        class="pos-shell h-[calc(100vh-4rem)] overflow-hidden bg-[#07111f] text-slate-100"
    >
        <main
            class="grid h-full min-h-0 grid-cols-1 lg:grid-cols-[minmax(0,7.5fr)_minmax(280px,2.5fr)]"
        >
            <section
                class="flex min-h-0 min-w-0 flex-col border-r border-[#263752] px-4 pt-4 pb-20 sm:px-6 lg:pb-5"
            >
                <div class="flex shrink-0 flex-col gap-2">
                    <div
                        class="flex h-10 items-center gap-2.5 rounded-lg border border-[#30415c] bg-[#0d1b2d] px-3 shadow-inner shadow-black/10 focus-within:border-[#1677ff] focus-within:ring-2 focus-within:ring-blue-500/10"
                    >
                        <Search class="size-[19px] shrink-0 text-slate-500" />
                        <input
                            ref="searchInput"
                            v-model="filters.query"
                            data-checkout-search
                            type="search"
                            class="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                            :placeholder="t('checkout.search')"
                            @keydown.enter="handleBarcode"
                            @compositionstart="isComposing = true"
                            @compositionend="finishComposition"
                            @keyup="filterProductsOnKeyup"
                        />
                        <button
                            type="button"
                            :aria-label="t('checkout.scan_barcode')"
                            class="rounded-lg p-1.5 text-slate-500 transition hover:bg-[#17263d] hover:text-blue-400"
                            @click="searchInput?.focus()"
                        >
                            <ScanLine class="size-5" />
                        </button>
                    </div>
                    <p
                        v-if="barcodeMessage"
                        class="text-xs font-medium text-rose-400"
                    >
                        {{ barcodeMessage }}
                    </p>
                    <div class="flex shrink-0 gap-2 overflow-x-auto pb-1">
                        <button
                            v-for="category in categories"
                            :key="category"
                            type="button"
                            class="h-8 shrink-0 rounded-lg px-3 text-[11px] font-bold capitalize transition"
                            :class="
                                filters.category === category
                                    ? 'bg-[#1677ff] text-white shadow-lg shadow-blue-950/20'
                                    : 'border border-[#263752] bg-[#17263d] text-slate-400 hover:border-[#3d5475] hover:text-white'
                            "
                            @click="selectCategory(category)"
``                        >
                            {{
                                category === "all"
                                    ? t("checkout.all_categories")
                                    : category
                            }}
                        </button>
                        <button
                            v-if="filters.query || filters.category !== 'all'"
                            type="button"
                            class="h-8 shrink-0 rounded-lg border border-[#30415c] px-3 text-[11px] font-bold text-slate-500 transition hover:border-slate-500 hover:text-white"
                            @click="clearFilters"
                        >
                            {{ t("common.clear_filters") }}
                        </button>
                    </div>
                </div>

                <InfiniteScroll
                    data="products"
                    items-element="#product-grid"
                    class="min-h-0 flex-1 overflow-hidden"
                >
                    <div
                        id="product-grid"
                        class="pos-scroll mt-4 grid h-full min-h-0 grid-cols-2 content-start gap-4 overflow-y-auto pr-2 sm:grid-cols-3 lg:grid-cols-4"
                    >
                        <article
                            v-for="product in filteredProducts"
                            :key="product.id"
                            class="flex min-w-0 flex-col rounded-xl border border-[#263752] bg-[#101f33] p-3 transition hover:border-[#3e669a] hover:bg-[#12243b]"
                        >
                            <div
                                class="flex h-32 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#263752] bg-[#0b182a]"
                            >
                                <img
                                    v-if="product.image_url"
                                    :src="product.image_url"
                                    :alt="product.name"
                                    class="object-fit size-full"
                                />
                                <span
                                    v-else
                                    class="text-5xl leading-none"
                                    aria-hidden="true"
                                    >{{ product.icon }}</span
                                >
                            </div>
                            <div class="min-w-0 py-2.5">
                                <h2
                                    class="truncate text-[14px] leading-5 font-bold text-white"
                                    :title="product.name"
                                >
                                    {{ product.name }}
                                </h2>
                                <p
                                    class="mt-0.5 truncate text-[10px] font-medium tracking-[0.08em] text-slate-500 uppercase"
                                >
                                    SKU: {{ product.sku }}
                                </p>
                            </div>
                            <div
                                class="grid gap-2"
                                :class="
                                    sellingOptions(product).length === 1
                                        ? 'grid-cols-1'
                                        : 'grid-cols-2'
                                "
                            >
                                <button
                                    v-for="(option, unitIndex) in sellingOptions(
                                        product,
                                    )"
                                    :key="`${option.unit.id}-${option.mode}`"
                                    type="button"
                                    :disabled="
                                        !isUnitAvailable(
                                            option.unit,
                                            option.mode,
                                        )
                                    "
                                    class="unit-tile min-w-0 rounded-lg border px-1.5 py-1 text-center transition duration-100 active:scale-[0.96] disabled:cursor-not-allowed disabled:grayscale"
                                    :class="[
                                        !isUnitAvailable(
                                            option.unit,
                                            option.mode,
                                        )
                                            ? 'border-[#30415c] bg-[#17263d] text-slate-500 opacity-40'
                                            : unitIndex === 0
                                              ? 'border-[#1677ff] bg-[#1677ff] text-white shadow-md shadow-blue-950/20 hover:bg-[#2584ff]'
                                              : 'border-[#3b506e] bg-[#17263d] text-slate-100 hover:border-[#6e8db9] hover:bg-[#1c304b]',
                                        sellingOptions(product).length === 3 &&
                                        unitIndex === 2
                                            ? 'col-span-2'
                                            : '',
                                    ]"
                                    @click="
                                        addToCart(
                                            product,
                                            option.unit,
                                            option.mode,
                                        )
                                    "
                                >
                                    <span
                                        class="block truncate text-[10px] leading-4 font-semibold"
                                        >{{
                                            !isUnitAvailable(
                                                option.unit,
                                                option.mode,
                                            )
                                                ? t("checkout.out_of_stock")
                                            : optionLabel(option, product)
                                        }}</span
                                    >
                                    <span
                                        v-if="
                                            isUnitAvailable(
                                                option.unit,
                                                option.mode,
                                            )
                                        "
                                        class="mt-0.5 block truncate text-xs leading-4 font-black"
                                        >{{
                                            formatMoney(
                                                unitPrice(
                                                    option.unit,
                                                    option.mode,
                                                ),
                                            )
                                        }}</span
                                    >
                                    <span
                                        class="mt-0.5 block truncate text-[8px] leading-3 font-medium"
                                        :class="
                                            unitIndex === 0 &&
                                            isUnitAvailable(option.unit, option.mode)
                                                ? 'text-blue-100'
                                                : 'text-slate-400'
                                        "
                                        >{{
                                            stockLabel(
                                                option.unit,
                                                option.mode,
                                                product,
                                            )
                                        }}</span
                                    >
                                </button>
                            </div>
                        </article>
                        <div
                            v-if="!filteredProducts.length"
                            class="col-span-full flex min-h-52 items-center justify-center rounded-xl border border-dashed border-[#30415c] text-sm text-slate-500"
                        >
                            {{ t("checkout.no_products_match") }}
                        </div>
                    </div>
                </InfiniteScroll>
            </section>

            <div
                v-if="showMobileCart"
                class="fixed inset-0 z-30 bg-[#020817]/75 backdrop-blur-[2px] lg:hidden"
                aria-hidden="true"
                @click="showMobileCart = false"
            />
            <aside
                :class="
                    showMobileCart
                        ? 'fixed inset-x-3 top-20 bottom-3 z-40 flex rounded-xl shadow-2xl shadow-black/40'
                        : 'hidden'
                "
                class="min-h-0 flex-col bg-[#0d1b2d] lg:static lg:z-auto lg:flex lg:h-full lg:rounded-none lg:shadow-none"
            >
                <div
                    class="flex h-[58px] shrink-0 items-center justify-between border-b border-[#263752] px-3.5 sm:px-4"
                >
                    <div class="flex items-center gap-2.5">
                        <div class="relative">
                            <ShoppingCart class="size-5 text-blue-400" /><span
                                v-if="cart.length"
                                class="absolute -top-2 -right-2 flex min-w-4 items-center justify-center rounded-full bg-[#1677ff] px-1 text-[9px] font-black text-white"
                                >{{ cart.length }}</span
                            >
                        </div>
                        <h2 class="font-bold text-white">
                            {{ t("checkout.current_sale") }}
                        </h2>
                    </div>
                    <button
                        v-if="cart.length"
                        type="button"
                        class="text-xs font-bold text-rose-400 transition hover:text-rose-300"
                        @click="checkoutStore.clearCart()"
                    >
                        {{ t("checkout.clear") }}
                    </button>
                </div>

                <div
                    class="pos-scroll min-h-0 flex-1 overflow-y-auto px-3.5 py-2 sm:px-4"
                >
                    <div
                        v-if="!cart.length"
                        class="flex h-full min-h-64 flex-col items-center justify-center text-center"
                    >
                        <div
                            class="flex size-14 items-center justify-center rounded-2xl border border-[#263752] bg-[#101f33] text-slate-600"
                        >
                            <ShoppingCart class="size-7" />
                        </div>
                        <p class="mt-4 text-sm font-bold text-slate-400">
                            {{ t("checkout.cart_ready") }}
                        </p>
                        <p
                            class="mt-1 max-w-[190px] text-xs leading-5 text-slate-600"
                        >
                            {{ t("checkout.tap_to_add") }}
                        </p>
                    </div>
                    <div
                        v-for="item in cart"
                        :key="`${item.id}-${item.unit?.id}`"
                        class="flex gap-3 border-b border-[#263752] py-3 last:border-0"
                    >
                        <div
                            class="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#30415c] bg-[#101f33] text-2xl"
                        >
                            <img
                                v-if="item.image_url"
                                :src="item.image_url"
                                :alt="item.name"
                                class="size-full object-contain p-1"
                            />
                            <span v-else>{{ item.icon }}</span>
                        </div>
                        <div class="min-w-0 flex-1">
                            <div class="flex items-start justify-between gap-2">
                                <div class="min-w-0">
                                    <p
                                        class="truncate text-[13px] font-bold text-white"
                                    >
                                        {{ item.name }}
                                    </p>
                                    <p
                                        class="mt-0.5 truncate text-[11px] text-slate-500"
                                    >
                                        {{
                                            item.unit
                                                ? unitLabel(
                                                      item.unit,
                                                      item.product,
                                                  )
                                                : "Unit"
                                        }}
                                        ·
                                        {{
                                            formatMoney(
                                                unitPrice(
                                                    item.unit,
                                                    item.selling_mode,
                                                ),
                                            )
                                        }}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    aria-label="Remove item"
                                    class="shrink-0 rounded p-1 text-slate-600 transition hover:text-rose-400"
                                    @click="removeItem(item)"
                                >
                                    <X class="size-4" />
                                </button>
                            </div>
                            <div
                                class="mt-2 flex items-center justify-between gap-2"
                            >
                                <div
                                    class="flex items-center rounded-lg border border-[#30415c] bg-[#101f33]"
                                >
                                    <button
                                        type="button"
                                        aria-label="Decrease quantity"
                                        class="flex size-8 items-center justify-center text-slate-400 transition hover:text-white"
                                        @click="changeQuantity(item, -1)"
                                    >
                                        <Minus class="size-3.5" />
                                    </button>
                                    <span
                                        class="w-7 text-center text-xs font-bold text-white"
                                        >{{ item.quantity }}</span
                                    >
                                    <button
                                        type="button"
                                        aria-label="Increase quantity"
                                        class="flex size-8 items-center justify-center text-slate-400 transition hover:text-white"
                                        @click="changeQuantity(item, 1)"
                                    >
                                        <Plus class="size-3.5" />
                                    </button>
                                </div>
                                <span
                                    class="text-[14px] font-black text-blue-400"
                                    >{{
                                        formatMoney(
                                            unitPrice(
                                                item.unit,
                                                item.selling_mode,
                                            ) * item.quantity,
                                        )
                                    }}</span
                                >
                            </div>
                        </div>
                    </div>
                </div>

                <form
                    class="shrink-0 border-t border-[#263752] bg-[#0b182a] p-3.5 sm:p-4"
                    @submit.prevent="completeSale"
                >
                    <div class="mb-2 grid grid-cols-2 gap-1.5">
                        <button
                            type="button"
                            class="h-8 rounded-lg border text-xs font-bold transition"
                            :class="
                                saleForm.payment_method === 'cash'
                                    ? 'border-[#1677ff] bg-[#1677ff]/15 text-blue-300'
                                    : 'border-[#30415c] bg-[#101f33] text-slate-400 hover:text-white'
                            "
                            @click="saleForm.payment_method = 'cash'"
                        >
                            {{ t("checkout.cash") }}
                        </button>
                        <button
                            type="button"
                            class="h-8 rounded-lg border text-xs font-bold transition"
                            :class="
                                saleForm.payment_method === 'mobile_wallet'
                                    ? 'border-[#1677ff] bg-[#1677ff]/15 text-blue-300'
                                    : 'border-[#30415c] bg-[#101f33] text-slate-400 hover:text-white'
                            "
                            @click="saleForm.payment_method = 'mobile_wallet'"
                        >
                            {{ t("checkout.kbzpay") }}
                        </button>
                    </div>
                    <label
                        class="mb-2 block text-[10px] font-bold tracking-wider text-slate-500 uppercase"
                    >
                        {{ t("checkout.received") }}
                        <input
                            v-model.number="saleForm.received_amount"
                            type="number"
                            min="0"
                            inputmode="numeric"
                            class="mt-1 h-9 w-full rounded-lg border border-[#30415c] bg-[#101f33] px-3 text-sm font-bold text-white transition outline-none placeholder:text-slate-600 focus:border-[#1677ff]"
                            placeholder="0"
                        />
                    </label>
                    <div
                        class="space-y-1 border-t border-[#263752] pt-2 text-xs"
                    >
                        <div class="flex items-center justify-between">
                            <span class="text-slate-500">{{
                                t("checkout.received")
                            }}</span
                            ><span class="font-bold text-slate-300"
                                >{{
                                    formatMoney(
                                        Number(saleForm.received_amount || 0),
                                    )
                                }}
                                MMK</span
                            >
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-sm font-medium text-slate-400">{{
                                t("checkout.total_amount")
                            }}</span
                            ><span
                                class="text-[20px] font-black tracking-tight text-white"
                                >{{ formatMoney(subtotal) }}
                                <small class="text-xs font-bold text-slate-500"
                                    >MMK</small
                                ></span
                            >
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="font-bold text-slate-500">{{
                                t("checkout.return_amount")
                            }}</span
                            ><span
                                class="font-black"
                                :class="
                                    returnAmount > 0
                                        ? 'text-emerald-400'
                                        : 'text-slate-400'
                                "
                                >{{ formatMoney(returnAmount) }} MMK</span
                            >
                        </div>
                    </div>
                    <button
                        type="submit"
                        :disabled="!cart.length || saleForm.processing"
                        class="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#22c55e] text-xs font-black text-[#04150a] shadow-lg shadow-emerald-950/30 transition hover:bg-[#35d66f] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <CreditCard class="size-4" />{{
                            saleForm.processing
                                ? t("common.processing")
                                : t("checkout.title")
                        }}<span
                            class="rounded bg-black/10 px-1.5 py-0.5 text-[10px]"
                            >{{ cart.length }}</span
                        >
                    </button>
                </form>
            </aside>
        </main>
        <button
            type="button"
            class="fixed inset-x-4 bottom-4 z-20 flex h-12 items-center justify-center gap-2 rounded-xl bg-[#1677ff] text-sm font-black text-white shadow-xl shadow-blue-950/40 lg:hidden"
            @click="showMobileCart = true"
        >
            <ShoppingCart class="size-4" />
            {{ t("checkout.view_cart") }}
            <span class="rounded-md bg-white/15 px-2 py-0.5 text-xs">{{
                cart.length
            }}</span>
        </button>
    </div>
</template>

<style scoped>
.pos-scroll {
    scrollbar-color: #30415c transparent;
    scrollbar-width: thin;
}

.pos-scroll::-webkit-scrollbar {
    width: 6px;
}

.pos-scroll::-webkit-scrollbar-thumb {
    background: #30415c;
    border-radius: 999px;
}

@media (max-width: 1023px) {
    .pos-shell {
        overflow-y: auto;
    }
}
</style>
