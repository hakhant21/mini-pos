<script setup lang="ts">
import { Head, Link, useForm } from '@inertiajs/vue3';
import { ArrowLeft, Plus, Trash2 } from '@lucide/vue';
import { computed, watch } from 'vue';
import FormActions from '@/components/forms/FormActions.vue';
import FormField from '@/components/forms/FormField.vue';
import FormSection from '@/components/forms/FormSection.vue';
import ProductImageCropper from '@/components/ProductImageCropper.vue';
import { index as productsIndex, store } from '@/routes/products';

const props = defineProps<{ categories: { id: number; name: string }[] }>();
const inputClass = 'mt-1 block min-h-11 w-full rounded-xl border-slate-200 bg-slate-50 px-3.5 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white';
type UnitForm = { name: string; conversion: number; selling_price: number; barcode: string };
const form = useForm({ category_id: props.categories[0]?.id ?? '', name: '', sku: '', product_type: 'standard', base_unit: 'piece', purchase_price: 0, reorder_level: 0, image: null as File | null, units: [{ name: 'piece', conversion: 1, selling_price: 0, barcode: '' }] as UnitForm[] });
const baseUnitOptions = computed(() => {
    const categoryName = props.categories.find((category) => category.id === form.category_id)?.name.toLowerCase() ?? '';

    if (categoryName.includes('alcohol')) {
        return ['Bottle'];
    }

    if (categoryName.includes('beer')) {
        return ['Bottle', 'Can'];
    }

    if (categoryName.includes('soft drink')) {
        return ['Bottle', 'Can'];
    }

    if (categoryName.includes('cigarette') || categoryName.includes('cheroot')) {
        return ['Stick', 'Pack'];
    }

    if (categoryName.includes('snack') || categoryName.includes('other')) {
        return ['Piece', 'Pack'];
    }

    return ['Piece'];
});

watch(baseUnitOptions, (options) => {
    if (!options.includes(form.base_unit)) {
        form.base_unit = options[0];
    }
}, { immediate: true });

function addUnit(): void {
    form.units.push({ name: '', conversion: 1, selling_price: 0, barcode: '' });
}

function removeUnit(index: number): void {
    if (form.units.length > 1) {
        form.units.splice(index, 1);
    }
}

function submit(): void {
    form.post(store().url);
}
</script>

<template>
    <Head title="Add product" />
    <div class="min-h-screen bg-[#f5f7fb] px-4 py-6 text-slate-900 sm:px-6 lg:px-8 dark:bg-slate-950 dark:text-white">
        <div class="mx-auto max-w-4xl space-y-6">
            <Link :href="productsIndex()" class="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600"><ArrowLeft class="size-4" /> Back to products</Link>
            <header><p class="text-sm font-medium text-blue-600">Catalog setup</p><h1 class="mt-1 text-3xl font-bold tracking-tight">Add product</h1><p class="mt-2 text-sm text-slate-500">Create a product once, then control how it is purchased, stocked, and sold.</p></header>
            <form @submit.prevent="submit" class="space-y-5">
                <FormSection title="Product details" description="The information staff will use to identify this item at checkout.">
                    <div class="grid gap-5 sm:grid-cols-2">
                        <FormField label="Product name" :error="form.errors.name" required><input v-model="form.name" :class="inputClass" required autocomplete="off" /></FormField>
                        <FormField label="SKU" :error="form.errors.sku" hint="Use a unique internal code." required><input v-model="form.sku" :class="inputClass" required autocomplete="off" /></FormField>
                        <FormField label="Category" :error="form.errors.category_id" required><select v-model="form.category_id" :class="inputClass" required><option v-for="category in props.categories" :key="category.id" :value="category.id">{{ category.name }}</option></select></FormField>
                        <FormField label="Base unit" :error="form.errors.base_unit" hint="The smallest stock unit for this category." required><select v-model="form.base_unit" :class="inputClass" required><option v-for="unit in baseUnitOptions" :key="unit" :value="unit">{{ unit }}</option></select></FormField>
                        <FormField label="Purchase price" :error="form.errors.purchase_price" hint="Cost per base unit."><input v-model.number="form.purchase_price" :class="inputClass" type="number" min="0" /></FormField>
                        <FormField label="Reorder level" :error="form.errors.reorder_level" hint="Show a low-stock warning at this quantity."><input v-model.number="form.reorder_level" :class="inputClass" type="number" min="0" /></FormField>
                    </div>
                </FormSection>
                <FormSection title="Product image" description="Add a square image to make this product easier to identify.">
                    <ProductImageCropper v-model="form.image" />
                    <p v-if="form.errors.image" class="mt-3 text-xs font-medium text-rose-600" role="alert">{{ form.errors.image }}</p>
                </FormSection>
                <FormSection title="Selling units" description="Add every unit customers can buy at checkout, such as piece, box, or carton.">
                    <div class="space-y-5">
                        <div v-for="(unit, index) in form.units" :key="index" class="grid gap-5 rounded-xl border border-slate-100 p-4 dark:border-slate-800 sm:grid-cols-3">
                            <FormField label="Unit name" :error="form.errors[`units.${index}.name`]" required><input v-model="unit.name" :class="inputClass" required placeholder="Box" /></FormField>
                            <FormField label="Conversion" :error="form.errors[`units.${index}.conversion`]" hint="Base units in one selling unit." required><input v-model.number="unit.conversion" :class="inputClass" type="number" min="1" required /></FormField>
                            <FormField label="Selling price" :error="form.errors[`units.${index}.selling_price`]" required><div class="flex gap-2"><input v-model.number="unit.selling_price" :class="[inputClass, 'flex-1']" type="number" min="0" required /><button v-if="form.units.length > 1" type="button" @click="removeUnit(index)" class="mt-1 inline-flex min-h-11 items-center justify-center rounded-xl border border-rose-200 px-3 text-rose-600 transition hover:bg-rose-50 dark:border-rose-900 dark:hover:bg-rose-950/40" aria-label="Remove unit"><Trash2 class="size-4" /></button></div></FormField>
                        </div>
                        <button type="button" @click="addUnit" class="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-blue-950/40"><Plus class="size-4" /> Add another unit</button>
                    </div>
                </FormSection>
                <FormActions label="Create product" :processing="form.processing" :cancel-href="productsIndex().url" />
            </form>
        </div>
    </div>
</template>
