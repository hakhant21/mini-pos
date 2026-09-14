<script setup lang="ts">
import { Head } from '@inertiajs/vue3';
import AppearanceTabs from '@/components/AppearanceTabs.vue';
import Heading from '@/components/Heading.vue';
import { edit } from '@/routes/appearance';

defineOptions({
    layout: {
        breadcrumbs: [
            {
                title: 'settings.appearance_settings',
                href: edit(),
            },
        ],
    },
});
</script>

<template>
    <Head :title="$t('settings.appearance_settings')" />

    <h1 class="sr-only">{{ $t('settings.appearance_settings') }}</h1>

    <div class="space-y-6">
        <Heading
            variant="small"
            :title="$t('settings.appearance_settings')"
            :description="$t('settings.appearance_description')"
        />
        <AppearanceTabs />
    </div>
</template>
