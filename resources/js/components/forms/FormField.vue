<script setup lang="ts">
withDefaults(defineProps<{
    label: string;
    error?: string;
    hint?: string;
    required?: boolean;
}>(), {
    error: '',
    hint: '',
    required: false,
});
</script>

<template>
    <div class="space-y-1.5">
        <label class="block text-sm font-semibold text-slate-700 dark:text-slate-200">
            {{ label }}
            <span v-if="required" class="ml-1 text-rose-500" aria-hidden="true">*</span>
        </label>
        <slot />
        <p v-if="hint && !error" class="text-xs leading-5 text-slate-400">{{ hint }}</p>
        <p v-if="error" class="text-xs font-medium text-rose-600" role="alert">{{ error }}</p>
    </div>
</template>
