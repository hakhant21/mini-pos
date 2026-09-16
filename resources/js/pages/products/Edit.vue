<script setup lang="ts">
import { Head, Link, useForm } from "@inertiajs/vue3";
import { ArrowLeft, Plus, Trash2 } from "@lucide/vue";
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import FormActions from "@/components/forms/FormActions.vue";
import FormField from "@/components/forms/FormField.vue";
import FormSection from "@/components/forms/FormSection.vue";
import ProductImageCropper from "@/components/ProductImageCropper.vue";
import { generateSku } from "@/lib/generateSku";
import { index as productsIndex, update } from "@/routes/products";

const props = defineProps<{
    product: any;
    categories: { id: number; name: string }[];
}>();
const inputClass =
    "mt-1 block min-h-11 w-full rounded-xl border-slate-200 bg-slate-50 px-3.5 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white";
const { t } = useI18n();
const localizedUnit = (unit: string): string =>
    t(`products.unit_names.${unit}`);
const form = useForm({
    category_id: props.product.category_id,
    name: props.product.name,
    sku: props.product.sku,
    price_mode: props.product.price_mode,
    base_unit: props.product.base_unit,
    reorder_level: props.product.reorder_level,
    active: props.product.active,
    image: null as File | null,
    units: props.product.units,
});
const generatedSku = ref(generateSku(form.name));
const skuWasEdited = ref(form.sku !== generatedSku.value);
let isUpdatingGeneratedSku = false;
const errors = form.errors as Record<string, string>;
const baseUnitOptions = computed(() => {
    const categoryName =
        props.categories
            .find((category) => category.id === form.category_id)
            ?.name.toLowerCase() ?? "";

    if (categoryName.includes("alcohol")) {
        return ["Bottle"];
    }

    if (categoryName.includes("beer")) {
        return ["Bottle", "Can"];
    }

    if (categoryName.includes("soft drink")) {
        return ["Bottle", "Can"];
    }

    if (
        categoryName.includes("cigarette") ||
        categoryName.includes("cheroot")
    ) {
        return ["Stick", "Pack"];
    }

    if (categoryName.includes("snack") || categoryName.includes("other")) {
        return ["Piece", "Pack"];
    }

    return ["Piece"];
});

watch(
    baseUnitOptions,
    (options) => {
        if (!options.includes(form.base_unit)) {
            form.base_unit = options[0];
        }
    },
    { immediate: true },
);

watch(
    () => form.name,
    (name) => {
        generatedSku.value = generateSku(name);

        if (!skuWasEdited.value) {
            isUpdatingGeneratedSku = true;
            form.sku = generatedSku.value;
            isUpdatingGeneratedSku = false;
        }
    },
);

watch(
    () => form.sku,
    (sku) => {
        if (!isUpdatingGeneratedSku && sku !== generatedSku.value) {
            skuWasEdited.value = true;
        }
    },
);

function addUnit(): void {
    form.units.push({
        name: "",
        conversion: 1,
        purchase_price: 0,
        selling_price: 0,
        package_price: 0,
        single_unit_price: 0,
        package_quantity: 0,
        loose_quantity: 0,
        barcode: "",
    });
}

function removeUnit(index: number): void {
    if (form.units.length > 1) {
        form.units.splice(index, 1);
    }
}

function submit(): void {
    form.transform((data) => ({ ...data, _method: "put" })).post(
        update(props.product.id).url,
    );
}
</script>

<template>
    <Head :title="$t('products.edit_product_title')" />
    <div
        class="min-h-screen bg-[#f5f7fb] px-4 py-6 text-slate-900 sm:px-6 lg:px-8 dark:bg-slate-950 dark:text-white"
    >
        <div class="mx-auto max-w-7xl space-y-6">
            <Link
                :href="productsIndex()"
                class="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600"
                ><ArrowLeft class="size-4" />
                {{ $t("products.back_to_products") }}</Link
            >
            <header>
                <p class="text-sm font-medium text-blue-600">
                    {{ $t("products.catalog_maintenance") }}
                </p>
                <h1 class="mt-1 text-3xl font-bold tracking-tight">
                    {{ $t("products.edit_product_title") }}
                </h1>
                <p class="mt-2 text-sm text-slate-500">
                    {{
                        $t("products.edit_product_description", {
                            name: props.product.name,
                        })
                    }}
                </p>
            </header>
            <form @submit.prevent="submit" class="space-y-5">
                <FormSection
                    :title="$t('products.product_details')"
                    :description="
                        $t('products.product_details_edit_description')
                    "
                >
                    <div class="grid gap-5 sm:grid-cols-2">
                        <FormField
                            :label="$t('products.product_name')"
                            :error="form.errors.name"
                            required
                            ><input
                                v-model="form.name"
                                :class="inputClass"
                                required
                        /></FormField>
                        <FormField
                            :label="$t('products.sku')"
                            :error="form.errors.sku"
                            :hint="$t('products.sku_edit_hint')"
                            required
                            ><input
                                v-model="form.sku"
                                :class="inputClass"
                                pattern="[A-Z0-9-]+"
                                required
                        /></FormField>
                        <FormField
                            :label="$t('products.category')"
                            :error="form.errors.category_id"
                            required
                            ><select
                                v-model="form.category_id"
                                :class="inputClass"
                                required
                            >
                                <option
                                    v-for="category in props.categories"
                                    :key="category.id"
                                    :value="category.id"
                                >
                                    {{ category.name }}
                                </option>
                            </select></FormField
                        >
                        <FormField
                            label="Price mode"
                            :error="form.errors.price_mode"
                            required
                            ><select
                                v-model="form.price_mode"
                                :class="inputClass"
                                required
                            >
                                <option value="standard">Single only</option>
                                <option value="single_package">
                                    Single and Package
                                </option>
                                <option value="single_package_carton">
                                    Single, Package and Carton
                                </option>
                            </select></FormField
                        >
                        <FormField
                            :label="$t('products.base_unit')"
                            :error="form.errors.base_unit"
                            :hint="$t('products.base_unit_hint')"
                            required
                            ><select
                                v-model="form.base_unit"
                                :class="inputClass"
                                required
                            >
                                <option
                                    v-for="unit in baseUnitOptions"
                                    :key="unit"
                                    :value="unit"
                                >
                                    {{ unit }}
                                </option>
                            </select></FormField
                        >
                        <FormField
                            :label="$t('products.reorder_level')"
                            :error="form.errors.reorder_level"
                            ><input
                                v-model.number="form.reorder_level"
                                :class="inputClass"
                                type="number"
                                min="0"
                        /></FormField>
                    </div>
                </FormSection>
                <FormSection
                    :title="$t('products.product_image')"
                    :description="$t('products.image_edit_description')"
                >
                    <ProductImageCropper
                        v-model="form.image"
                        :existing-image="props.product.image_url"
                    />
                    <p
                        v-if="form.errors.image"
                        class="mt-3 text-xs font-medium text-rose-600"
                        role="alert"
                    >
                        {{ form.errors.image }}
                    </p>
                </FormSection>
                <FormSection
                    :title="$t('products.selling_units')"
                    :description="$t('products.selling_units_edit_description')"
                >
                    <div class="space-y-5">
                        <p class="text-sm text-slate-500">
                            {{ $t("products.purchase_price") }},
                            {{ $t("products.selling_price") }},
                            {{ $t("products.packages") }} and
                            {{
                                $t("products.loose_units", {
                                    unit: localizedUnit(form.base_unit),
                                })
                            }}
                            are set per unit below.
                        </p>
                        <div
                            v-for="(unit, index) in form.units"
                            :key="unit.id ?? index"
                            class="grid gap-5 rounded-xl border border-slate-100 p-4 dark:border-slate-800 sm:grid-cols-3"
                        >
                            <FormField
                                v-if="
                                    form.price_mode === 'single_package_carton'
                                "
                                class="order-5"
                                :label="$t('products.package_price')"
                                :error="errors[`units.${index}.package_price`]"
                                required
                                ><input
                                    v-model.number="unit.package_price"
                                    :class="inputClass"
                                    type="number"
                                    min="0"
                                    required
                            /></FormField>
                            <FormField
                                v-if="form.price_mode !== 'standard'"
                                class="order-6"
                                :label="$t('products.single_unit_price')"
                                ><input
                                    v-model.number="unit.single_unit_price"
                                    :class="inputClass"
                                    type="number"
                                    min="0"
                                    required
                            /></FormField>
                            <FormField
                                class="order-1"
                                :label="$t('products.unit_name')"
                                :error="errors[`units.${index}.name`]"
                                ><input
                                    v-model="unit.name"
                                    :class="inputClass"
                                    required
                            /></FormField>
                            <FormField
                                class="order-2"
                                :label="$t('products.conversion')"
                                :error="errors[`units.${index}.conversion`]"
                                ><input
                                    v-model.number="unit.conversion"
                                    :class="inputClass"
                                    type="number"
                                    min="1"
                                    required
                            /></FormField>
                            <FormField
                                v-if="form.price_mode !== 'standard'"
                                class="order-4"
                                :label="$t('products.selling_price')"
                                :error="errors[`units.${index}.selling_price`]"
                                ><input
                                    v-model.number="unit.selling_price"
                                    :class="inputClass"
                                    type="number"
                                    min="0"
                                    required
                            /></FormField>
                            <FormField
                                class="order-3"
                                :label="$t('products.purchase_price')"
                                :error="errors[`units.${index}.purchase_price`]"
                                ><input
                                    v-model.number="unit.purchase_price"
                                    :class="inputClass"
                                    type="number"
                                    min="0"
                                    required
                            /></FormField>
                            <FormField
                                class="order-7"
                                :label="$t('products.packages')"
                                :error="
                                    errors[`units.${index}.package_quantity`]
                                "
                                ><input
                                    v-model.number="unit.package_quantity"
                                    :class="inputClass"
                                    type="number"
                                    min="0"
                                    required
                            /></FormField>
                            <FormField
                                class="order-8"
                                :label="
                                    $t('products.loose_units', {
                                        unit: localizedUnit(form.base_unit),
                                    })
                                "
                                :error="errors[`units.${index}.loose_quantity`]"
                                ><input
                                    v-model.number="unit.loose_quantity"
                                    :class="inputClass"
                                    type="number"
                                    min="0"
                                    required
                            /></FormField>
                        </div>
                        <button
                            type="button"
                            @click="addUnit"
                            class="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-blue-950/40"
                        >
                            <Plus class="size-4" />
                            {{ $t("products.add_another_unit") }}
                        </button>
                    </div>
                </FormSection>
                <FormActions
                    :label="$t('products.save_product')"
                    :processing="form.processing"
                    :cancel-href="productsIndex().url"
                />
            </form>
        </div>
    </div>
</template>
