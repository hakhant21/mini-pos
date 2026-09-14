<script setup lang="ts">
import { Form, Head } from '@inertiajs/vue3';
import SecurityController from '@/actions/App/Http/Controllers/Settings/SecurityController';
import Heading from '@/components/Heading.vue';
import PasswordInput from '@/components/PasswordInput.vue';
import { edit } from '@/routes/security';
import FormActions from '@/components/forms/FormActions.vue';
import FormField from '@/components/forms/FormField.vue';
import FormSection from '@/components/forms/FormSection.vue';

// oxfmt-ignore
type Props = {
    passwordRules: string;
} ;

const props = defineProps<Props>();

defineOptions({
    layout: {
        breadcrumbs: [
            {
                title: 'settings.security_settings',
                href: edit(),
            },
        ],
    },
});
</script>

<template>
    <Head :title="$t('settings.security_settings')" />

    <h1 class="sr-only">{{ $t('settings.security_settings') }}</h1>

    <div class="space-y-6">
        <Heading
            variant="small"
            :title="$t('settings.update_password')"
            :description="$t('settings.update_password_description')"
        />

        <Form
            v-bind="SecurityController.update.form()"
            :options="{
                preserveScroll: true,
            }"
            reset-on-success
            :reset-on-error="[
                'password',
                'password_confirmation',
                'current_password',
            ]"
            class="space-y-5"
            v-slot="{ errors, processing }"
        >
            <FormSection :title="$t('auth.password')" :description="$t('settings.password_description')">
            <div class="grid gap-5">
                <FormField :label="$t('settings.current_password')" required :error="errors.current_password" :hint="$t('settings.current_password_hint')">
                <PasswordInput
                    id="current_password"
                    name="current_password"
                    class="mt-1 block w-full"
                    autocomplete="current-password"
                    :placeholder="$t('settings.current_password')"
                />
                </FormField>

                <FormField :label="$t('settings.new_password')" required :error="errors.password" :hint="$t('settings.new_password_hint')">
                <PasswordInput
                    id="password"
                    name="password"
                    class="mt-1 block w-full"
                    autocomplete="new-password"
                    :placeholder="$t('settings.new_password')"
                    :passwordrules="props.passwordRules"
                />
                </FormField>

                <FormField :label="$t('auth.confirm_password')" required :error="errors.password_confirmation" :hint="$t('settings.confirm_password_hint')">
                <PasswordInput
                    id="password_confirmation"
                    name="password_confirmation"
                    class="mt-1 block w-full"
                    autocomplete="new-password"
                    :placeholder="$t('auth.confirm_password')"
                    :passwordrules="props.passwordRules"
                />
                </FormField>
            </div>
            </FormSection>
            <FormActions :label="$t('settings.save_password')" :processing="processing" />
        </Form>
    </div>
</template>
