<template>
    <ClientOnly>
        <div>
            <div class="flex justify-between items-center mb-8">
                <h2 class="text-xl font-semibold">
                    <span class="hidden md:inline">Preview</span>
                    <span class="md:hidden text-base">{{ activeResume?.name }}</span>
                </h2>
                <div class="hidden md:flex items-center space-x-3">
                    <div class="zoom-controls-midscreen">
                        <ZoomControls
                            :max-zoom="maxZoom"
                            :min-zoom="minZoom"
                            :zoom-level="zoomLevel"
                            :zoom-step="zoomStep"
                            @zoom-in="handleZoomIn"
                            @zoom-out="handleZoomOut"
                        />
                    </div>
                    <div class="template-selection-desktop">
                        <Popover v-model:open="showTemplateMenu">
                            <PopoverTrigger as-child>
                                <Button
                                    class="h-9"
                                    size="sm"
                                    variant="outline"
                                >
                                    <span>{{
                                        (availableTemplates?.find(t => t.id === selectedTemplate).name || 'Default')
                                    }} Template</span>
                                    <ChevronDown class="w-4 h-4 ml-2" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent class="w-80">
                                <div class="space-y-2">
                                    <div
                                        v-for="template in availableTemplates"
                                        :key="template.id"
                                        :class="selectedTemplate === template.id ? 'bg-accent' : ''"
                                        class="cursor-pointer rounded-md p-3 hover:bg-accent transition-colors"
                                        @click="handleTemplateSelect(template.id)"
                                    >
                                        <div class="flex flex-col space-y-1">
                                            <div class="font-medium text-sm">
                                                {{ template.name }}
                                            </div>
                                            <div class="text-xs text-muted-foreground">
                                                {{ template.description }}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                    <Button
                        class="h-9"
                        size="sm"
                        variant="outline"
                        @click="showSettingsModal = true"
                    >
                        <SlidersHorizontal class="w-4 h-4 mr-2" />
                        Settings
                    </Button>
                    <div class="flex items-center">
                        <Button
                            class="rounded-r-none h-9"
                            size="sm"
                            @click="handleDownload"
                        >
                            <Download class="w-4 h-4 mr-2" />
                            <span class="download-text">Download</span> PDF
                        </Button>
                        <Menubar class="border-0 p-0 h-auto flex items-center">
                            <MenubarMenu>
                                <MenubarTrigger as-child>
                                    <Button
                                        class="rounded-l-none border-l-0 px-2 h-9"
                                        size="sm"
                                        variant="default"
                                    >
                                        <MoreVertical class="w-4 h-4" />
                                    </Button>
                                </MenubarTrigger>
                                <MenubarContent>
                                    <MenubarItem @click="handleDownloadSVG">
                                        <Download class="w-4 h-4 mr-2" />
                                        Download as SVG
                                    </MenubarItem>
                                    <MenubarItem @click="handleDownloadTypst">
                                        <Download class="w-4 h-4 mr-2" />
                                        Download as Typst
                                    </MenubarItem>
                                    <MenubarItem @click="handleDownloadTypstText">
                                        <Download class="w-4 h-4 mr-2" />
                                        Download as Text
                                    </MenubarItem>
                                </MenubarContent>
                            </MenubarMenu>
                        </Menubar>
                    </div>
                </div>
                <div class="md:hidden flex space-x-2">
                    <Button
                        class="h-9"
                        size="sm"
                        variant="outline"
                        @click="showSettingsModal = true"
                    >
                        <Settings class="w-4 h-4" />
                    </Button>
                    <div class="flex items-center">
                        <Button
                            class="rounded-r-none h-9"
                            size="sm"
                            @click="handleDownload"
                        >
                            <Download class="w-4 h-4 mr-2" />
                            Download
                        </Button>
                        <Menubar class="border-0 p-0 h-auto flex items-center">
                            <MenubarMenu>
                                <MenubarTrigger as-child>
                                    <Button
                                        class="rounded-l-none border-l-0 px-2 h-9"
                                        size="sm"
                                        variant="default"
                                    >
                                        <MoreVertical class="w-4 h-4" />
                                    </Button>
                                </MenubarTrigger>
                                <MenubarContent>
                                    <MenubarItem @click="handleDownloadSVG">
                                        <Download class="w-4 h-4 mr-2" />
                                        Download as SVG
                                    </MenubarItem>
                                    <MenubarItem @click="handleDownloadTypst">
                                        <Download class="w-4 h-4 mr-2" />
                                        Download as Typst
                                    </MenubarItem>
                                    <MenubarItem @click="handleDownloadTypstText">
                                        <Download class="w-4 h-4 mr-2" />
                                        Download as Text
                                    </MenubarItem>
                                </MenubarContent>
                            </MenubarMenu>
                        </Menubar>
                    </div>
                </div>
            </div>
            <Card class="h-full">
                <CardContent class="p-0">
                    <div class="bg-gray-100 rounded-lg overflow-hidden h-full">
                        <div class="bg-white h-full min-h-[calc(100vh-200px)] flex flex-col">
                            <div
                                v-if="isLoading"
                                class="flex items-center justify-center flex-1"
                            >
                                <div class="text-center">
                                    <div
                                        class="w-16 h-16 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"
                                    />
                                    <h3 class="text-xl font-semibold text-gray-800 mb-2">
                                        Loading Preview
                                    </h3>
                                    <p class="text-gray-600">
                                        Please wait as fetching
                                        <a
                                            href="https://github.com/Myriad-Dreamin/typst.ts"
                                            target="_blank"
                                        >
                                            Typst
                                        </a>
                                        module and compiler takes time on slow networks ...
                                    </p>
                                </div>
                            </div>
                            <div
                                v-else-if="error"
                                class="flex items-center justify-center flex-1"
                            >
                                <div class="text-center">
                                    <div
                                        class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
                                    >
                                        <svg
                                            class="w-8 h-8 text-red-500"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                d="M6 18L18 6M6 6l12 12"
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                stroke-width="2"
                                            />
                                        </svg>
                                    </div>
                                    <h3 class="text-xl font-semibold text-red-800 mb-2">
                                        Preview Error
                                    </h3>
                                    <p class="text-red-600 mb-4">
                                        {{ error }}
                                    </p>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        @click="generatePreview"
                                    >
                                        Try Again
                                    </Button>
                                </div>
                            </div>
                            <div
                                v-else-if="previewContent"
                                class="flex-1 overflow-auto p-4"
                            >
                                <div class="preview-container flex justify-center min-h-full">
                                    <div
                                        class="resume-preview-wrapper"
                                        v-html="previewContent"
                                    />
                                </div>
                            </div>
                            <div
                                v-else
                                class="flex items-center justify-center flex-1"
                            >
                                <div class="text-center">
                                    <div
                                        class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"
                                    >
                                        <svg
                                            class="w-8 h-8 text-blue-500"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                stroke-width="2"
                                            />
                                        </svg>
                                    </div>
                                    <h3 class="text-xl font-semibold text-gray-800 mb-2">
                                        Initializing Typst
                                    </h3>
                                    <p class="text-gray-600">
                                        Setting up the resume compiler...
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <SettingsModal v-model="showSettingsModal" />
        </div>
    </ClientOnly>
</template>

<script lang="ts" setup>
import { Card, CardContent } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger } from '~/components/ui/menubar';
import { ChevronDown, Download, MoreVertical, Settings, SlidersHorizontal } from 'lucide-vue-next';
import { availableTemplates } from '~/types/resume';
import { useResumeGenerator } from '~/composables/useResumeGenerator';
import { useDebounceFn } from '@vueuse/core';
import SettingsModal from '~/components/elements/SettingsModal.vue';
import ZoomControls from '~/components/elements/ZoomControls.vue';
import { useSettingsStore } from '~/stores/settings';
import { useResumeStore } from '~/stores/resume';
import { storeToRefs } from 'pinia';

const { generatePreview, downloadPDF, downloadSVG, downloadTypst, downloadTypstText } = useResumeGenerator();
const { isReady: typstReady } = useTypstLoader();
const settingsStore = useSettingsStore();
const resumeStore = useResumeStore();
const { resumeData, activeResume } = storeToRefs(resumeStore);
const { selectedFont, selectedTemplate, fontSize } = storeToRefs(settingsStore);
const isLoading = ref(false);
const error = ref<string | null>(null);
const previewContent = ref<string>('');
const showTemplateMenu = ref(false);
const showSettingsModal = ref(false);
const zoomLevel = ref(1);
const minZoom = 0.5;
const maxZoom = 2.5;
const zoomStep = 0.25;
const handleZoomIn = () => {
    if (zoomLevel.value < maxZoom) {
        zoomLevel.value = Math.min(zoomLevel.value + zoomStep, maxZoom);
    }
};
const handleZoomOut = () => {
    if (zoomLevel.value > minZoom) {
        zoomLevel.value = Math.max(zoomLevel.value - zoomStep, minZoom);
    }
};
const handleTemplateSelect = (template: string) => {
    settingsStore.setSelectedTemplate(template);
    showTemplateMenu.value = false;
};
const generatePreviewInternal = async () => {
    if (!resumeData.value) return;
    isLoading.value = true;
    error.value = null;
    try {
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
                );
            });
        }
        if (!typstReady.value) {
            return;
        }
        previewContent.value = await generatePreview(
            resumeData.value,
            selectedTemplate.value || 'default',
            selectedFont.value || 'Calibri',
        );
    }
    catch (err) {
        console.error(err);
        error.value = err instanceof Error ? err.message : 'Failed to generate preview';
    }
    finally {
        isLoading.value = false;
    }
};
const handleDownload = async () => {
    if (!resumeData.value) return;
    try {
        await downloadPDF(
            resumeData.value,
            selectedTemplate.value || 'default',
            selectedFont.value || 'Calibri',
        );
    }
    catch (err) {
        error.value = err instanceof Error ? err.message : 'Failed to download PDF';
        console.error('PDF download error:', err);
    }
};
const handleDownloadSVG = async () => {
    if (!resumeData.value) return;
    try {
        await downloadSVG(
            resumeData.value,
            selectedTemplate.value || 'default',
            selectedFont.value || 'Calibri',
        );
    }
    catch (err) {
        error.value = err instanceof Error ? err.message : 'Failed to download SVG';
        console.error('SVG download error:', err);
    }
};
const handleDownloadTypst = () => {
    if (!resumeData.value) return;
    try {
        downloadTypst(
            resumeData.value,
            selectedTemplate.value || 'default',
            selectedFont.value || 'Calibri',
        );
    }
    catch (err) {
        error.value = err instanceof Error ? err.message : 'Failed to download Typst';
        console.error('Typst download error:', err);
    }
};
const handleDownloadTypstText = () => {
    if (!resumeData.value) return;
    try {
        downloadTypstText(
            resumeData.value,
            selectedTemplate.value || 'default',
            selectedFont.value || 'Calibri',
        );
    }
    catch (err) {
        error.value = err instanceof Error ? err.message : 'Failed to download Typst as text';
        console.error('Typst text download error:', err);
    }
};
const debouncedGeneratePreview = useDebounceFn(() => {
    generatePreviewInternal();
}, 100);
watch(
    [resumeData, selectedTemplate, selectedFont, fontSize],
    () => {
        debouncedGeneratePreview();
    },
    { deep: true, immediate: true },
);
defineExpose({
    generatePreview: generatePreviewInternal,
});
</script>

<style scoped>
    /* Base Styles (Mobile First)
       ================================== */
    .resume-preview-wrapper :deep(svg) + :deep(svg) {
        margin-top: 16px; /* Space between pages */
    }
    .preview-container {
        min-width: 100%;
        display: flex;
        justify-content: flex-start;
    }
    .zoom-controls-midscreen {
        display: none;
    }
    .template-selection-desktop {
        display: none !important;
    }
    /* Mobile: < 1024px
       ================================== */
    @media (max-width: 1023px) {
        .resume-preview-wrapper :deep(svg) {
            width: 100% !important;
            height: auto !important;
            max-width: 100% !important;
            max-height: none !important;
            display: block;
            margin: 0 auto;
            background: white;
            box-shadow: none !important;
            border-radius: 0;
        }
        .resume-preview-wrapper {
            width: 100%;
            padding: 0;
            min-width: auto;
        }
    }
    /* Small Desktop: 900px - 1024px
       ================================== */
    @media (min-width: 900px) and (max-width: 1023px) {
        .download-text {
            display: none;
        }
    }
    /* Desktop: >= 1024px
       ================================== */
    @media (min-width: 1024px) {
        .preview-container {
            justify-content: center;
        }
    }
    /* Medium Desktop: 1024px - 1600px
       ================================== */
    @media (min-width: 1024px) and (max-width: 1600px) {
        .resume-preview-wrapper :deep(svg) {
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            max-height: none !important;
            display: block;
            margin: 0;
            background: white;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            border-radius: 4px;
            transform: scale(v-bind(zoomLevel));
            transform-origin: top left;
            transition: transform 0.2s ease-in-out;
        }
        .resume-preview-wrapper {
            width: max-content;
            padding: 8px;
            margin: 0;
        }
        .preview-container {
            justify-content: flex-start;
        }
        .zoom-controls-midscreen {
            display: flex;
        }
        .download-text {
            display: none;
        }
    }
    /* Large Desktop: > 1600px
       ================================== */
    @media (min-width: 1601px) {
        .resume-preview-wrapper :deep(svg) {
            width: 794px !important; /* A4 width at 96 DPI */
            height: auto !important;
            max-width: none !important;
            max-height: none !important;
            display: block;
            margin: 0;
            background: white;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            border-radius: 4px;
        }
        .resume-preview-wrapper {
            min-width: 810px; /* SVG width + padding */
            padding: 8px;
        }
        .template-selection-desktop {
            display: block !important;
        }
    }
</style>
