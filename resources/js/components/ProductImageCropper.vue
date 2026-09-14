<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue';

const props = defineProps<{
    modelValue: File | null;
    existingImage?: string | null;
}>();

const emit = defineEmits<{
    'update:modelValue': [value: File | null];
}>();

const fileInput = ref<HTMLInputElement | null>(null);
const previewUrl = ref<string | null>(null);
const selectedImage = ref<HTMLImageElement | null>(null);
const zoom = ref(1);
const error = ref('');

function revokePreview(): void {
    if (previewUrl.value) {
        URL.revokeObjectURL(previewUrl.value);
        previewUrl.value = null;
    }
}

function selectFile(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) {
        return;
    }

    if (!file.type.startsWith('image/')) {
        error.value = 'Please select an image file.';
        return;
    }

    error.value = '';
    revokePreview();
    previewUrl.value = URL.createObjectURL(file);
    zoom.value = 1;
    emit('update:modelValue', null);
}

function cropImage(): void {
    if (!selectedImage.value || !previewUrl.value) {
        return;
    }

    const image = selectedImage.value;
    const cropSize = Math.min(image.naturalWidth, image.naturalHeight) / zoom.value;
    const sourceX = (image.naturalWidth - cropSize) / 2;
    const sourceY = (image.naturalHeight - cropSize) / 2;
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 800;
    canvas.getContext('2d')?.drawImage(
        image,
        sourceX,
        sourceY,
        cropSize,
        cropSize,
        0,
        0,
        canvas.width,
        canvas.height,
    );

    canvas.toBlob((blob) => {
        if (blob) {
            emit('update:modelValue', new File([blob], 'product-image.jpg', { type: 'image/jpeg' }));
        }
    }, 'image/jpeg', 0.9);
}

function clearImage(): void {
    revokePreview();
    selectedImage.value = null;
    zoom.value = 1;
    error.value = '';
    emit('update:modelValue', null);
    if (fileInput.value) {
        fileInput.value.value = '';
    }
}

onBeforeUnmount(revokePreview);
</script>

<template>
    <div class="space-y-3">
        <div class="flex flex-wrap items-center gap-3">
            <button type="button" @click="fileInput?.click()" class="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-blue-950/40">
                {{ previewUrl || existingImage ? 'Choose another image' : 'Choose image' }}
            </button>
            <button v-if="previewUrl" type="button" @click="cropImage" class="inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700">
                Crop and use image
            </button>
            <button v-if="previewUrl || props.modelValue" type="button" @click="clearImage" class="text-sm font-semibold text-rose-600 hover:text-rose-700">
                Remove
            </button>
        </div>
        <input ref="fileInput" type="file" accept="image/jpeg,image/png,image/webp" class="sr-only" @change="selectFile" />
        <div v-if="previewUrl || existingImage" class="relative h-48 w-48 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
            <img :src="previewUrl || existingImage || ''" alt="Product preview" class="h-full w-full object-cover" :style="{ transform: previewUrl ? `scale(${zoom})` : undefined }" @load="selectedImage = $event.target as HTMLImageElement" />
            <div v-if="previewUrl" class="pointer-events-none absolute inset-0 border-4 border-white/80 shadow-[inset_0_0_0_999px_rgba(0,0,0,0.2)]" />
        </div>
        <div v-if="previewUrl" class="flex max-w-xs items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span>Zoom</span>
            <input v-model.number="zoom" type="range" min="1" max="3" step="0.1" class="flex-1" />
        </div>
        <p class="text-xs text-slate-400">JPG, PNG, or WebP. Maximum 2 MB.</p>
        <p v-if="error" class="text-xs font-medium text-rose-600" role="alert">{{ error }}</p>
    </div>
</template>
