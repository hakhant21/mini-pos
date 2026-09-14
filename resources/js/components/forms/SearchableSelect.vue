<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

type Option = { value: string | number; label: string };

const props = withDefaults(defineProps<{
    options: Option[];
    placeholder?: string;
    searchPlaceholder?: string;
}>(), {
    placeholder: '',
    searchPlaceholder: '',
});
const { t } = useI18n();

const modelValue = defineModel<string | number>({ default: '' });
const isOpen = ref(false);
const query = ref('');
const selectedLabel = computed(() => props.options.find((option) => String(option.value) === String(modelValue.value))?.label ?? '');
const filteredOptions = computed(() => props.options.filter((option) => option.label.toLowerCase().includes(query.value.toLowerCase())));

function selectOption(option: Option): void {
    modelValue.value = option.value;
    query.value = '';
    isOpen.value = false;
}
</script>

<template>
    <div class="relative">
        <button type="button" class="flex min-h-11 w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 text-left text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" @click="isOpen = !isOpen">
            <span :class="selectedLabel ? '' : 'text-slate-400'">{{ selectedLabel || placeholder || t('common.select_option') }}</span>
            <span aria-hidden="true">&#9662;</span>
        </button>
        <div v-if="isOpen" class="absolute z-30 mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-900">
            <input v-model="query" type="search" :placeholder="searchPlaceholder || t('common.search_options')" :aria-label="searchPlaceholder || t('common.search_options')" class="mb-2 min-h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-400 dark:border-slate-700 dark:bg-slate-800" autofocus @keydown.escape="isOpen = false" />
            <div class="max-h-56 overflow-y-auto">
                <button v-for="option in filteredOptions" :key="option.value" type="button" class="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-blue-50 dark:hover:bg-slate-800" @mousedown.prevent @click="selectOption(option)">{{ option.label }}</button>
                <p v-if="!filteredOptions.length" class="px-3 py-2 text-sm text-slate-400">{{ t('common.no_options') }}</p>
            </div>
        </div>
    </div>
</template>
