<script setup lang="ts">
import { Link } from '@inertiajs/vue3';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
withDefaults(defineProps<{
    label?: string;
    processing?: boolean;
    cancelHref?: string;
}>(), {
    label: '',
    processing: false,
    cancelHref: '',
});
</script>

<template>
    <div class="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-end dark:border-slate-800">
        <Link v-if="cancelHref" :href="cancelHref" class="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">{{ t('common.cancel') }}</Link>
        <button type="submit" :disabled="processing" class="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
            <span v-if="processing" class="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />
            {{ processing ? t('common.saving') : (label || t('common.save_changes')) }}
        </button>
    </div>
</template>
