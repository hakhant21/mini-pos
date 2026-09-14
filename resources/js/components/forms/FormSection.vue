<script setup lang="ts">
defineProps<{
    title: string;
    description?: string;
}>();
</script>

<template>
    <section class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900">
        <div class="border-b border-slate-100 pb-4 dark:border-slate-800">
            <h2 class="text-base font-bold text-slate-900 dark:text-white">{{ title }}</h2>
            <p v-if="description" class="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">{{ description }}</p>
        </div>
        <div class="pt-5">
            <slot />
        </div>
    </section>
</template>
