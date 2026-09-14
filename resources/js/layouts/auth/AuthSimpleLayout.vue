<script setup lang="ts">
import { Link } from '@inertiajs/vue3';
import AppLogoIcon from '@/components/AppLogoIcon.vue';
import { home } from '@/routes';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps<{
    title?: string;
    description?: string;
}>();
const { t } = useI18n();
const localizedTitle = computed(() => props.title ? t(props.title) : '');
const localizedDescription = computed(() => props.description ? t(props.description) : '');
</script>

<template>
    <div
        class="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10"
    >
        <div class="w-full max-w-sm">
            <div class="flex flex-col gap-10">
                <div class="flex flex-col items-center gap-4">
                    <Link
                        :href="home()"
                        class="flex flex-col items-center gap-2 font-medium"
                    >
                        <div
                            class="mb-1 flex h-9 w-9 items-center justify-center rounded-md"
                        >
                            <AppLogoIcon
                                class="size-9 fill-current text-[var(--foreground)] dark:text-white"
                            />
                        </div>
                        <span class="sr-only">{{ localizedTitle }}</span>
                    </Link>
                    <div class="space-y-3 text-center">
                        <h1 class="text-xl leading-relaxed font-medium">{{ localizedTitle }}</h1>
                        <p class="text-muted-foreground text-center text-sm leading-7">
                            {{ localizedDescription }}
                        </p>
                    </div>
                </div>
                <slot />
            </div>
        </div>
    </div>
</template>
