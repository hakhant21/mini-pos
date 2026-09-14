<script setup lang="ts">
import { Form, Head, usePage } from '@inertiajs/vue3';
import { computed } from 'vue';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import DeleteUser from '@/components/DeleteUser.vue';
import Heading from '@/components/Heading.vue';
import { Input } from '@/components/ui/input';
import { edit } from '@/routes/profile';
import FormActions from '@/components/forms/FormActions.vue';
import FormField from '@/components/forms/FormField.vue';
import FormSection from '@/components/forms/FormSection.vue';

defineOptions({
    layout: {
        breadcrumbs: [
            {
                title: 'settings.profile_settings',
                href: edit(),
            },
        ],
    },
});

const page = usePage();
const user = computed(() => page.props.auth.user);
</script>

<template>
    <Head :title="$t('settings.profile_settings')" />

    <h1 class="sr-only">{{ $t('settings.profile_settings') }}</h1>

    <div class="flex flex-col gap-6">
        <Heading
            variant="small"
            :title="$t('settings.profile')"
            :description="$t('settings.profile_description')"
        />

        <Form
            v-bind="ProfileController.update.form()"
            class="space-y-5"
            v-slot="{ errors, processing }"
        >
            <FormSection :title="$t('settings.personal_details')" :description="$t('settings.personal_details_description')">
                <div class="grid gap-5">
                    <FormField :label="$t('settings.name')" required :error="errors.name" :hint="$t('settings.name_hint')">
                        <Input id="name" class="mt-1 block w-full" name="name" :default-value="user.name" required autocomplete="name" :placeholder="$t('settings.full_name')" />
                    </FormField>
                    <FormField :label="$t('auth.email')" required :error="errors.email" :hint="$t('settings.email_hint')">
                        <Input id="email" type="email" class="mt-1 block w-full" name="email" :default-value="user.email" required autocomplete="username" :placeholder="$t('auth.email')" />
                    </FormField>
                </div>
            </FormSection>
            <FormActions :label="$t('common.save_changes')" :processing="processing" />
        </Form>
    </div>

    <DeleteUser />
</template>
