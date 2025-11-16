<template>
    <Dialog
        v-model:open="isOpen"
    >
        <DialogContent class="!max-w-[80vw] !w-[80vw] h-[90vh]">
            <DialogHeader>
                <DialogTitle>{{ resumeName }}</DialogTitle>
                <DialogDescription>
                    {{ $t('admin.resumes.preview.owner') }}: {{ ownerEmail }}
                </DialogDescription>
            </DialogHeader>

            <ClientOnly>
                <div class="flex-1 overflow-auto bg-gray-100 rounded-lg p-4">
                    <!-- Loading State -->
                    <div
                        v-if="isLoading"
                        class="flex items-center justify-center h-full"
                    >
                        <div class="text-center">
                            <div class="w-16 h-16 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
                            <p class="text-gray-600">
                                {{ $t('common.loading') }}
                            </p>
                        </div>
                    </div>

                    <!-- Error State -->
                    <div
                        v-else-if="error"
                        class="flex items-center justify-center h-full"
                    >
                        <div class="text-center">
                            <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <X class="w-8 h-8 text-red-500" />
                            </div>
                            <h3 class="text-xl font-semibold text-red-800 mb-2">
                                {{ $t('admin.resumes.preview.error') }}
                            </h3>
                            <p class="text-red-600">
                                {{ error }}
                            </p>
                        </div>
                    </div>

                    <!-- Preview Content -->
                    <div
                        v-else-if="previewContent"
                        class="flex justify-center"
                    >
                        <div
                            class="resume-preview-content bg-white p-4 rounded shadow-lg"
                            v-html="previewContent"
                        />
                    </div>

                    <!-- Empty State -->
                    <div
                        v-else
                        class="flex items-center justify-center h-full"
                    >
                        <p class="text-gray-500">
                            {{ $t('admin.resumes.preview.noData') }}
                        </p>
                    </div>
                </div>

                <DialogFooter class="mt-4">
                    <Button
                        variant="outline"
                        @click="isOpen = false"
                    >
                        {{ $t('common.close') }}
                    </Button>
                </DialogFooter>
            </ClientOnly>
        </DialogContent>
    </Dialog>
</template>

<script lang="ts" setup>
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { Button } from '~/components/ui/button';
import { X } from 'lucide-vue-next';
import { useResumeGenerator } from '~/composables/useResumeGenerator';
import type { ResumeData, AppSettings } from '~/types/resume';
import { defaultAppSettings } from '~/types/resume';

const props = defineProps<{
    modelValue: boolean;
    resumeId: string;
    resumeName: string;
    ownerEmail: string;
    userId: string;
}>();

const emit = defineEmits<{
    'update:modelValue': [value: boolean];
}>();

const { generatePreview } = useResumeGenerator();
const { isReady: typstReady } = useTypstLoader();

const isOpen = computed({
    get: () => props.modelValue,
    set: value => emit('update:modelValue', value),
});

const isLoading = ref(false);
const error = ref<string | null>(null);
const previewContent = ref<string>('');

const loadResume = async () => {
    if (!props.resumeId) return;

    isLoading.value = true;
    error.value = null;
    previewContent.value = '';

    try {
        // Fetch resume data and user settings in parallel
        const [resumeResponse, userSettingsResponse] = await Promise.all([
            $fetch(`/api/admin/resumes/${props.resumeId}`),
            $fetch(`/api/admin/users/${props.userId}/settings`).catch(() => ({ settings: null })),
        ]);

        const resumeData = resumeResponse.data as ResumeData;

        // Merge user settings with defaults (user settings take precedence)
        const userSettings = userSettingsResponse.settings as AppSettings | null;
        const settings: AppSettings = {
            ...defaultAppSettings,
            ...userSettings,
        };

        // Use user's preferred template and font
        const template = settings.selectedTemplate || resumeResponse.template || 'default';
        const font = settings.selectedFont || 'Calibri';

        // Wait for Typst to be ready
        if (!typstReady.value) {
            await new Promise((resolve) => {
                const unwatch = watch(
                    typstReady,
                    (ready) => {
                        if (ready) {
                            unwatch();
                            resolve(void 0);
                        }
                    },
                    { timeout: 10000 },
                );
            });
        }

        if (!typstReady.value) {
            throw new Error('Typst compiler not ready');
        }

        // Generate preview with user's font and template
        previewContent.value = await generatePreview(resumeData, template, font);
    }
    catch (err) {
        console.error('Error loading resume preview:', err);
        error.value = err instanceof Error ? err.message : 'Failed to load resume';
    }
    finally {
        isLoading.value = false;
    }
};

// Watch for dialog open and load resume
watch(() => props.modelValue, (newValue) => {
    if (newValue && props.resumeId) {
        loadResume();
    }
});
</script>

<style scoped>
.resume-preview-content :deep(svg) {
    width: 100% !important;
    max-width: 1200px !important;
    height: auto !important;
    display: block;
    margin: 0 auto;
}

.resume-preview-content :deep(svg) + :deep(svg) {
    margin-top: 16px;
}
</style>
