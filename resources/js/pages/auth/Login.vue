<script setup lang="ts">
import { Form, Head } from '@inertiajs/vue3';
import InputError from '@/components/InputError.vue';
import PasswordInput from '@/components/PasswordInput.vue';
import TextLink from '@/components/TextLink.vue';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

defineOptions({
    layout: {
        title: 'auth.login_title',
        description: 'auth.login_description',
    },
});

defineProps<{
    status?: string;
    canResetPassword: boolean;
}>();
</script>

<template>
    <Head :title="t('auth.login')" />

    <Form
        v-bind="store.form()"
        :reset-on-success="['password']"
        v-slot="{ errors, processing }"
        class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xl shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none sm:p-8"
    >
        <div class="mb-7 space-y-2">
            <p class="text-xs font-semibold tracking-[0.18em] text-blue-600 uppercase">{{ $t('common.app_name') }}</p>
            <h2 class="text-2xl leading-relaxed font-bold tracking-tight text-slate-900 dark:text-white">{{ $t('auth.login_to_account') }}</h2>
            <p class="text-sm leading-7 text-slate-500 dark:text-slate-400">{{ $t('auth.enter_credentials') }}</p>
        </div>
        <div v-if="status" class="mb-5 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
            {{ status }}
        </div>
        <div class="grid gap-6">
            <div class="grid gap-2">
                <Label for="email" class="text-slate-700 dark:text-slate-200">{{ $t('auth.email') }}</Label>
                <Input
                    id="email"
                    type="email"
                    name="email"
                    required
                    autofocus
                    :tabindex="1"
                    autocomplete="email"
                    :placeholder="$t('auth.email_placeholder')"
                />
                <InputError :message="errors.email" />
            </div>

            <div class="grid gap-2">
                <div class="flex items-center justify-between">
                    <Label for="password" class="text-slate-700 dark:text-slate-200">{{ $t('auth.password') }}</Label>
                    <TextLink
                        v-if="canResetPassword"
                        :href="request()"
                        class="text-sm"
                        :tabindex="5"
                    >
                        {{ $t('auth.forgot_password') }}
                    </TextLink>
                </div>
                <PasswordInput
                    id="password"
                    name="password"
                    required
                    :tabindex="2"
                    autocomplete="current-password"
                    :placeholder="$t('auth.password')"
                />
                <InputError :message="errors.password" />
            </div>

            <div class="flex items-center justify-between">
                <Label for="remember" class="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <Checkbox id="remember" name="remember" :tabindex="3" />
                    <span>{{ $t('auth.remember_me') }}</span>
                </Label>
            </div>

            <Button
                type="submit"
                class="mt-2 h-11 w-full rounded-xl bg-blue-600 font-semibold shadow-lg shadow-blue-600/20 hover:bg-blue-700"
                :tabindex="4"
                :disabled="processing"
                data-test="login-button"
            >
                <Spinner v-if="processing" />
                {{ $t('auth.login') }}
            </Button>
        </div>
    </Form>
</template>
