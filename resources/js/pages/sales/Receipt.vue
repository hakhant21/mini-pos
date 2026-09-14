<script setup lang="ts">
import { Head, Link } from "@inertiajs/vue3";
import { ArrowLeft, Printer } from "@lucide/vue";
import { useI18n } from "vue-i18n";
import { index as salesIndex } from "@/routes/sales";
const props = defineProps<{ sale: any }>();
const { t } = useI18n();
const money = (value: number) =>
    `${new Intl.NumberFormat("en-US").format(value)} ${t('common.currency')}`;
function printReceipt(): void {
    window.print();
}
</script>
<template>
    <Head :title="t('receipt.title')" />
    <div
        class="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 dark:bg-slate-950 dark:text-slate-100 print:bg-white print:p-0"
    >
        <div class="mx-auto max-w-lg space-y-4">
            <div class="flex items-center justify-between print:hidden">
                <Link
                    :href="salesIndex()"
                    class="flex items-center gap-2 text-sm text-slate-500"
                    ><ArrowLeft class="size-4" /> {{ t('receipt.sales') }}</Link
                ><button
                    @click="printReceipt"
                    class="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
                >
                    <Printer class="size-4" /> {{ t('receipt.print') }}
                </button>
            </div>
            <article
                class="receipt-paper bg-white p-8 shadow-sm dark:bg-slate-900 print:bg-white print:p-4 print:shadow-none"
            >
                <div class="text-center">
                    <h1 class="text-xl font-bold">{{ t('receipt.store_name') }}</h1>
                    <p class="mt-1 text-xs text-slate-500">{{ t('receipt.sales_receipt') }}</p>
                    <p class="mt-4 text-xs">{{ props.sale.invoice_number }}</p>
                    <p class="text-xs text-slate-500">
                        {{ props.sale.sold_at }}
                    </p>
                </div>
                <div class="my-6 border-t border-dashed border-slate-300" />
                <div class="space-y-3 text-sm">
                    <div
                        v-for="item in props.sale.items"
                        :key="item.id"
                        class="flex justify-between gap-4"
                    >
                        <span
                            >{{ item.product.name }} × {{ item.quantity }}
                            {{ item.unit.name }}</span
                        ><strong>{{
                            money(item.unit_price * item.quantity)
                        }}</strong>
                    </div>
                </div>
                <div class="my-6 border-t border-dashed border-slate-300" />
                <div class="space-y-2 text-sm">
                    <div class="flex justify-between">
                        <span>{{ t('checkout.subtotal') }}</span
                        ><span>{{ money(props.sale.subtotal) }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>{{ t('checkout.discount') }}</span
                        ><span>{{ money(props.sale.discount) }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>{{ t('checkout.tax') }}</span><span>{{ money(props.sale.tax) }}</span>
                    </div>
                    <div class="flex justify-between text-base font-bold">
                        <span>{{ t('checkout.total') }}</span
                        ><span>{{ money(props.sale.total) }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>{{ t(`operations.payment_methods.${props.sale.payment_method}`) }}</span
                        ><span
                            >{{ t('receipt.paid') }} {{ money(props.sale.received_amount) }}</span
                        >
                    </div>
                    <div class="flex justify-between">
                        <span>{{ t('receipt.change') }}</span
                        ><span>{{ money(props.sale.change_amount) }}</span>
                    </div>
                </div>
                <p class="mt-8 text-center text-sm font-semibold">
                    {{ t('receipt.thank_you') }}
                </p>
            </article>
        </div>
    </div>
</template>
<style scoped>
@media print {
    .receipt-paper {
        width: 80mm;
        margin: 0 auto;
        font-size: 11px;
    }
}
</style>
