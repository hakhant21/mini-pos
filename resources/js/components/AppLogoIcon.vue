<script setup lang="ts">
import type { HTMLAttributes } from "vue";

defineOptions({
    inheritAttrs: false,
});

type Props = {
    className?: HTMLAttributes["class"];
};

defineProps<Props>();
</script>

<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 50 50"
        :class="className"
        v-bind="$attrs"
    >
        <path fill="currentColor" d="M5 19 9 8h30l4 11H5Z" />
        <path fill="currentColor" d="M7 18h34v5H7z" />
        <path fill="currentColor" d="M10 23h28v20H10z" />
        <path
            fill="currentColor"
            d="M15 28h7v15h-7zM27 28h7v8h-7z"
            opacity=".65"
        />
        <path fill="currentColor" d="M4 43h40v3H4z" />
    </svg>
</template>
