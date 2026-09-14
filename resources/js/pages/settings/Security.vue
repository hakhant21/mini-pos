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
                title: 'Security settings',
                href: edit(),
            },
        ],
    },
});
</script>

<template>
    <Head title="Security settings" />

    <h1 class="sr-only">Security settings</h1>

    <div class="space-y-6">
        <Heading
            variant="small"
            title="Update password"
            description="Ensure your account is using a long, random password to stay secure"
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
            <FormSection title="Password" description="Use a unique password to keep your account secure.">
            <div class="grid gap-5">
                <FormField label="Current password" required :error="errors.current_password" hint="Confirm your current password before changing it.">
                <PasswordInput
                    id="current_password"
                    name="current_password"
                    class="mt-1 block w-full"
                    autocomplete="current-password"
                    placeholder="Current password"
                />
                </FormField>

                <FormField label="New password" required :error="errors.password" hint="Choose a unique password that is at least 12 characters.">
                <PasswordInput
                    id="password"
                    name="password"
                    class="mt-1 block w-full"
                    autocomplete="new-password"
                    placeholder="New password"
                    :passwordrules="props.passwordRules"
                />
                </FormField>

                <FormField label="Confirm password" required :error="errors.password_confirmation" hint="Enter the new password again to confirm it.">
                <PasswordInput
                    id="password_confirmation"
                    name="password_confirmation"
                    class="mt-1 block w-full"
                    autocomplete="new-password"
                    placeholder="Confirm password"
                    :passwordrules="props.passwordRules"
                />
                </FormField>
            </div>
            </FormSection>
            <FormActions label="Save password" :processing="processing" />
        </Form>
    </div>
</template>
