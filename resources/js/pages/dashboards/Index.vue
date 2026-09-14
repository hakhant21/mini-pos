<script setup lang="ts">
import { Head, Link, useForm } from '@inertiajs/vue3';
import { ref } from 'vue';
import {
    ArrowUpRight,
    ChevronRight,
    CircleAlert,
    Package,
    Plus,
    ShoppingCart,
    Wallet,
} from '@lucide/vue';
import { dashboard } from '@/routes';
import { index as checkoutIndex } from '@/routes/checkout';
import { index as inventoryIndex } from '@/routes/inventory';
import { index as productIndex } from '@/routes/products';
import { index as saleIndex } from '@/routes/sales';
import { store as balanceStore } from '@/routes/balances';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

type Stat = { label: string; value: string; change: string; tone: string };
type Sale = {
    invoice: string;
    customer: string;
    amount: string;
    time: string;
    status: string;
};
type Stock = { name: string; sku: string; stock: string; level: string };

const props = defineProps<{
    stats: Stat[];
    sales: { label: string; value: number }[];
    lowStock: Stock[];
    recentSales: Sale[];
    currentDate: string;
    userName: string;
    balance: {
        opening_amount: string;
        closing_amount: string;
        total_sale_amount: string;
        total_change_amount: string;
    } | null;
}>();
defineOptions({
    layout: { breadcrumbs: [{ title: 'Dashboard', href: dashboard() }] },
});

const statIcons = [Package, CircleAlert, Wallet, ShoppingCart];
const statStyles = [
    'bg-blue-50 text-blue-600',
    'bg-amber-50 text-amber-600',
    'bg-emerald-50 text-emerald-600',
    'bg-violet-50 text-violet-600',
];
const showBalanceModal = ref(false);
const balanceForm = useForm({ opening_amount: 0 });
const money = (value: string | number) =>
    new Intl.NumberFormat('en-US').format(Number(value)) + ' MMK';

function submitBalance(): void {
    balanceForm.post(balanceStore().url, {
        onSuccess: () => {
            showBalanceModal.value = false;
            balanceForm.reset();
        },
    });
}
</script>

<template>
    <Head title="Dashboard" />
    <div
        class="min-h-screen bg-[#f5f7fb] px-4 py-6 text-slate-900 dark:bg-slate-950 dark:text-slate-100 sm:px-6 lg:px-8"
    >
        <div class="mx-auto max-w-[1500px] space-y-6">
            <header
                class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"
            >
                <div>
                    <p class="text-sm font-medium text-slate-400">
                        {{ props.currentDate }}
                    </p>
                    <h1 class="mt-1 text-2xl font-bold tracking-tight">
                        Good morning, {{ props.userName }}
                        <span class="text-amber-400">✦</span>
                    </h1>
                </div>
                <div class="flex items-center gap-3">
                    <Link
                        :href="checkoutIndex()"
                        class="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20"
                        ><Plus class="size-4" /> New sale</Link
                    >
                    <button type="button" @click="showBalanceModal = true" class="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-950/60">Add Balance</button>
                </div>
            </header>

            <div v-if="!props.balance" class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300" role="alert">No opening balance recorded for today.</div>

            <section v-else class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <article v-for="item in [
                    ['Opening balance', props.balance.opening_amount],
                    ['Sales today', props.balance.total_sale_amount],
                    ['Change given', props.balance.total_change_amount],
                    ['Expected closing', props.balance.closing_amount],
                ]" :key="item[0]" class="rounded-xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <p class="text-xs text-slate-400">{{ item[0] }}</p>
                    <p class="mt-1 text-lg font-bold">{{ money(item[1]) }}</p>
                </article>
            </section>

            <Dialog v-model:open="showBalanceModal">
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add opening balance</DialogTitle>
                        <DialogDescription>Record the opening balance for today.</DialogDescription>
                    </DialogHeader>
                    <form @submit.prevent="submitBalance" class="space-y-4">
                        <label class="block text-sm font-semibold text-slate-700 dark:text-slate-200" for="opening_amount">Opening amount</label>
                        <input id="opening_amount" v-model.number="balanceForm.opening_amount" type="number" min="0" step="0.01" required class="w-full rounded-xl border-slate-200 bg-slate-50 px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
                        <p v-if="balanceForm.errors.opening_amount" class="text-xs font-medium text-rose-600">{{ balanceForm.errors.opening_amount }}</p>
                        <DialogFooter>
                            <button type="button" @click="showBalanceModal = false" class="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300">Cancel</button>
                            <button type="submit" :disabled="balanceForm.processing" class="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Save balance</button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <article
                    v-for="(stat, index) in props.stats"
                    :key="stat.label"
                    class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                    <div class="flex items-start justify-between">
                        <div>
                            <p class="text-sm text-slate-500">
                                {{ stat.label }}
                            </p>
                            <p class="mt-3 text-2xl font-bold tracking-tight">
                                {{ stat.value }}
                            </p>
                        </div>
                        <div :class="['rounded-xl p-2.5', statStyles[index]]">
                            <component :is="statIcons[index]" class="size-5" />
                        </div>
                    </div>
                    <p
                        class="mt-4 text-xs font-medium"
                        :class="
                            index === 1 ? 'text-amber-600' : 'text-emerald-600'
                        "
                    >
                        {{ stat.change }}
                    </p>
                </article>
            </section>

            <section class="grid gap-6 xl:grid-cols-[1.65fr_1fr]">
                <article
                    class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6"
                >
                    <div class="flex items-center justify-between">
                        <div>
                            <h2 class="font-bold">Sales overview</h2>
                            <p class="mt-1 text-sm text-slate-400">
                                Revenue performance for the last 7 days
                            </p>
                        </div>
                        <span class="rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-300">Last 7 days</span>
                    </div>
                    <div
                        class="mt-8 flex h-52 items-end gap-3 border-b border-l border-slate-100 px-3 dark:border-slate-800 sm:gap-6"
                    >
                        <div
                            v-for="day in props.sales"
                            :key="day.label"
                            class="group flex h-full flex-1 flex-col items-center justify-end gap-2"
                        >
                            <div
                                class="w-full max-w-10 rounded-t-lg bg-blue-500 transition-all group-hover:bg-blue-600"
                                :style="{ height: `${day.value}%` }"
                            />
                            <span class="text-xs text-slate-400">{{
                                day.label
                            }}</span>
                        </div>
                    </div>
                    <div
                        class="mt-4 flex justify-between text-xs text-slate-400"
                    >
                        <span>0 MMK</span><span>100,000 MMK</span
                        ><span>200,000 MMK</span>
                    </div>
                </article>
                <article
                    class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6"
                >
                    <div class="flex items-start justify-between">
                        <div>
                            <h2 class="font-bold">Stock alerts</h2>
                            <p class="mt-1 text-sm text-slate-400">
                                Items that need your attention
                            </p>
                        </div>
                        <Link
                            :href="inventoryIndex()"
                            class="text-xs font-semibold text-blue-600"
                            >View all</Link
                        >
                    </div>
                    <div class="mt-5 divide-y divide-slate-100 dark:divide-slate-800">
                        <div
                            v-for="item in props.lowStock"
                            :key="item.sku"
                            class="flex items-center gap-3 py-3 first:pt-0"
                        >
                            <div
                                class="flex size-10 items-center justify-center rounded-xl bg-rose-50 text-rose-500"
                            >
                                <CircleAlert class="size-5" />
                            </div>
                            <div class="min-w-0 flex-1">
                                <p class="truncate text-sm font-semibold">
                                    {{ item.name }}
                                </p>
                                <p class="text-xs text-slate-400">
                                    {{ item.sku }} · {{ item.stock }}
                                </p>
                            </div>
                            <span
                                :class="
                                    item.level === 'Critical'
                                        ? 'bg-rose-50 text-rose-600'
                                        : 'bg-amber-50 text-amber-600'
                                "
                                class="rounded-full px-2 py-1 text-[10px] font-bold"
                                >{{ item.level }}</span
                            >
                        </div>
                    </div>
                </article>
            </section>

            <section class="grid gap-6 xl:grid-cols-[1.65fr_1fr]">
                <article
                    class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6"
                >
                    <div class="flex items-center justify-between">
                        <div>
                            <h2 class="font-bold">Recent sales</h2>
                            <p class="mt-1 text-sm text-slate-400">
                                Latest transactions from your store
                            </p>
                        </div>
                        <Link
                            :href="saleIndex()"
                            class="flex items-center gap-1 text-xs font-semibold text-blue-600"
                            >View all <ArrowUpRight class="size-3.5"
                        /></Link>
                    </div>
                    <div class="mt-5 overflow-x-auto">
                        <table class="w-full min-w-[560px] text-left text-sm">
                            <thead
                                class="border-y border-slate-100 text-xs tracking-wide text-slate-400 uppercase dark:border-slate-800"
                            >
                                <tr>
                                    <th class="py-3 font-medium">Invoice</th>
                                    <th class="py-3 font-medium">Customer</th>
                                    <th class="py-3 font-medium">Amount</th>
                                    <th class="py-3 font-medium">Time</th>
                                    <th class="py-3 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                                <tr
                                    v-for="sale in props.recentSales"
                                    :key="sale.invoice"
                                >
                                    <td
                                        class="py-3.5 font-semibold text-blue-600"
                                    >
                                        {{ sale.invoice }}
                                    </td>
                                    <td class="py-3.5 text-slate-600">
                                        {{ sale.customer }}
                                    </td>
                                    <td class="py-3.5 font-semibold">
                                        {{ sale.amount }}
                                    </td>
                                    <td class="py-3.5 text-slate-400">
                                        {{ sale.time }}
                                    </td>
                                    <td class="py-3.5">
                                        <span
                                            class="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600"
                                            >{{ sale.status }}</span
                                        >
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </article>
                <article
                    class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6"
                >
                    <h2 class="font-bold">Quick actions</h2>
                    <p class="mt-1 text-sm text-slate-400">
                        Common tasks at your fingertips
                    </p>
                    <div class="mt-5 grid gap-3">
                        <Link
                            :href="checkoutIndex()"
                            class="flex items-center gap-3 rounded-xl border border-slate-100 p-3 text-sm font-semibold transition hover:border-blue-200 hover:bg-blue-50 dark:border-slate-800 dark:hover:bg-blue-950/40"
                            ><span
                                class="rounded-lg bg-blue-50 p-2 text-blue-600"
                                ><ShoppingCart class="size-4"
                            /></span>
                            Start a new sale
                            <ChevronRight
                                class="ml-auto size-4 text-slate-300" /></Link
                        ><Link
                            :href="productIndex()"
                            class="flex items-center gap-3 rounded-xl border border-slate-100 p-3 text-sm font-semibold transition hover:border-blue-200 dark:border-slate-800 dark:hover:bg-blue-950/40"
                            ><span
                                class="rounded-lg bg-violet-50 p-2 text-violet-600"
                                ><Package class="size-4"
                            /></span>
                            Add a product
                            <ChevronRight class="ml-auto size-4 text-slate-300"
                        /></Link>
                    </div>
                </article>
            </section>
        </div>
    </div>
</template>
