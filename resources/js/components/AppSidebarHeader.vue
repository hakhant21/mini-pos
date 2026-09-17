<script setup lang="ts">
import { useI18n } from "vue-i18n";
import Breadcrumbs from "@/components/Breadcrumbs.vue";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useLocaleStore } from "@/stores/locale";
import type { BreadcrumbItem } from "@/types";

withDefaults(
    defineProps<{
        breadcrumbs?: BreadcrumbItem[];
    }>(),
    {
        breadcrumbs: () => [],
    },
);

const localeStore = useLocaleStore();
const { locale } = useI18n();

function changeLocale(value: string): void {
    localeStore.setLocale(value);
    locale.value = value;
}
</script>

<template>
    <header
        class="border-sidebar-border/70 flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-background px-6 text-foreground transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4"
    >
        <div class="flex items-center gap-2">
            <SidebarTrigger class="-ml-1" />
            <template v-if="breadcrumbs && breadcrumbs.length > 0">
                <Breadcrumbs :breadcrumbs="breadcrumbs" />
            </template>
        </div>
        <select
            :value="locale"
            @change="changeLocale(($event.target as HTMLSelectElement).value)"
            :aria-label="$t('common.language')"
            class="rounded-lg border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        >
            <option value="my">{{ $t("common.language_myanmar") }}</option>
            <option value="en">{{ $t("common.language_english") }}</option>
        </select>
    </header>
</template>
