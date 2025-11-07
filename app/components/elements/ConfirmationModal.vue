<template>
    <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center"
        @click="handleCancel"
    >
        <div class="absolute inset-0 bg-black/50" />
        <div
            class="relative bg-white border rounded-lg shadow-xl p-6 w-96 max-w-[90vw]"
            @click.stop
        >
            <div class="space-y-4">
                <div class="flex items-center space-x-3">
                    <div class="flex-shrink-0">
                        <div class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                            <AlertTriangle class="w-6 h-6 text-red-600" />
                        </div>
                    </div>
                    <div class="flex-1">
                        <h3 class="text-lg font-semibold text-gray-900">
                            {{ title }}
                        </h3>
                    </div>
                </div>
                <div class="text-gray-600">
                    <p>{{ message }}</p>
                </div>
                <div class="flex gap-3 pt-4">
                    <Button
                        class="flex-1"
                        variant="destructive"
                        @click="handleConfirm"
                    >
                        {{ confirmText }}
                    </Button>
                    <Button
                        class="flex-1"
                        variant="outline"
                        @click="handleCancel"
                    >
                        {{ cancelText }}
                    </Button>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { Button } from '~/components/ui/button';
import { AlertTriangle } from 'lucide-vue-next';

interface Props {
    isOpen: boolean;
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
}
const _props = withDefaults(defineProps<Props>(), {
    title: 'Confirm Action',
    message: 'Are you sure you want to proceed?',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
});
const emit = defineEmits<{
    confirm: [];
    cancel: [];
}>();
const handleConfirm = () => {
    emit('confirm');
};
const handleCancel = () => {
    emit('cancel');
};
</script>
