<template>
    <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center"
        @click="handleBackdropClick"
    >
        <div class="absolute inset-0 bg-black/50" />
        <div
            class="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4"
            @click.stop
        >
            <div class="mb-4">
                <h3 class="text-lg font-semibold">
                    Export Resumes
                </h3>
                <p class="text-sm text-gray-600 mt-1">
                    Select resumes to export as JSON
                </p>
            </div>
            <div class="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
                <div class="flex">
                    <Info class="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <div class="ml-3">
                        <p class="text-sm text-blue-800">
                            This exports resume data as JSON files for backup or transfer purposes.
                            To download PDF resumes, please use the download button in the builder page.
                        </p>
                    </div>
                </div>
            </div>
            <div class="mb-4 pb-2 border-b">
                <label class="flex items-center gap-2 cursor-pointer">
                    <input
                        v-model="selectAll"
                        class="rounded border-gray-300 text-primary focus:ring-primary"
                        type="checkbox"
                        @change="handleSelectAll"
                    >
                    <span class="text-sm font-medium">Select All</span>
                </label>
            </div>
            <div class="space-y-2 max-h-60 overflow-y-auto mb-6">
                <label
                    v-for="resume in resumes"
                    :key="resume.id"
                    class="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                >
                    <input
                        v-model="selectedResumes"
                        :value="resume.id"
                        class="rounded border-gray-300 text-primary focus:ring-primary"
                        type="checkbox"
                    >
                    <div class="flex-1 min-w-0">
                        <div class="text-sm font-medium truncate">
                            {{ resume.name }}
                        </div>
                        <div class="text-xs text-gray-500">
                            Updated {{ formatDate(resume.updatedAt) }}
                        </div>
                    </div>
                </label>
            </div>
            <div class="text-sm text-gray-600 mb-4">
                {{ selectedResumes.length }} resume{{ selectedResumes.length !== 1 ? 's' : '' }} selected
            </div>
            <div class="flex justify-end gap-3">
                <Button
                    variant="outline"
                    @click="handleCancel"
                >
                    Cancel
                </Button>
                <Button
                    :disabled="selectedResumes.length === 0"
                    @click="handleExport"
                >
                    Export
                </Button>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { Button } from '~/components/ui/button';
import { Info } from 'lucide-vue-next';
import type { Resume } from '~/types/resume';

interface Props {
    isOpen: boolean;
    resumes: Resume[];
}
const props = defineProps<Props>();
const emit = defineEmits<{
    close: [];
    export: [resumeIds: string[]];
}>();
const selectedResumes = ref<string[]>([]);
const selectAll = ref(true);
watch(() => props.isOpen, (newVal) => {
    if (newVal) {
        selectedResumes.value = props.resumes.map(r => r.id);
        selectAll.value = true;
    }
});
const handleSelectAll = () => {
    if (selectAll.value) {
        selectedResumes.value = props.resumes.map(r => r.id);
    }
    else {
        selectedResumes.value = [];
    }
};
watch(selectedResumes, (newVal) => {
    selectAll.value = newVal.length === props.resumes.length && props.resumes.length > 0;
});
const handleBackdropClick = () => {
    emit('close');
};
const handleCancel = () => {
    emit('close');
};
const handleExport = () => {
    emit('export', selectedResumes.value);
};
const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};
</script>
