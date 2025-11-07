<template>
    <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 translate-y-2 scale-95"
        enter-to-class="opacity-100 translate-y-0 scale-100"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0 scale-100"
        leave-to-class="opacity-0 translate-y-2 scale-95"
    >
        <div
            v-if="show"
            class="fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg border backdrop-blur-sm"
            :class="indicatorClasses"
        >
            <template v-if="isSyncing">
                <Loader2 class="w-4 h-4 animate-spin" />
                <span class="text-sm font-medium">Syncing...</span>
            </template>
            <template v-else-if="showSuccess">
                <CheckCircle class="w-4 h-4" />
                <span class="text-sm font-medium">Saved</span>
            </template>
            <template v-else-if="showError">
                <AlertCircle class="w-4 h-4" />
                <span class="text-sm font-medium">Sync failed</span>
            </template>
        </div>
    </Transition>
</template>

<script lang="ts" setup>
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-vue-next';

interface Props {
    isSyncing: boolean;
    lastSyncSuccess: boolean;
    lastSyncTime: Date | null;
    errorMessage?: string;
}
const props = defineProps<Props>();
const showSuccess = ref(false);
const showError = ref(false);
const successTimeout = ref<number>();
const errorTimeout = ref<number>();
watch(() => props.isSyncing, (isSyncing, wasSyncing) => {
    if (successTimeout.value) {
        clearTimeout(successTimeout.value);
        successTimeout.value = undefined;
    }
    if (errorTimeout.value) {
        clearTimeout(errorTimeout.value);
        errorTimeout.value = undefined;
    }
    if (isSyncing) {
        showSuccess.value = false;
        showError.value = false;
        return;
    }
    if (wasSyncing && !isSyncing) {
        if (props.lastSyncSuccess) {
            showSuccess.value = true;
            successTimeout.value = setTimeout(() => {
                showSuccess.value = false;
            }, 2000);
        }
        else {
            showError.value = true;
            errorTimeout.value = setTimeout(() => {
                showError.value = false;
            }, 3000);
        }
    }
});
const show = computed(() =>
    props.isSyncing || showSuccess.value || showError.value,
);
const indicatorClasses = computed(() => {
    if (props.isSyncing) {
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
    else if (showSuccess.value) {
        return 'bg-green-50 border-green-200 text-green-800';
    }
    else if (showError.value) {
        return 'bg-red-50 border-red-200 text-red-800';
    }
    return 'bg-gray-50 border-gray-200 text-gray-800';
});
onUnmounted(() => {
    if (successTimeout.value) {
        clearTimeout(successTimeout.value);
    }
    if (errorTimeout.value) {
        clearTimeout(errorTimeout.value);
    }
});
</script>

<style scoped>
@media (max-width: 640px) {
    .fixed {
        top: 1rem;
        right: 1rem;
    }
}
</style>
