<template>
    <Dialog
        :open="isOpen"
        @update:open="$emit('close')"
    >
        <DialogContent class="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <DialogHeader class="flex-shrink-0">
                <DialogTitle class="flex items-center gap-2">
                    <Cloud class="w-5 h-5" />
                    Cloud Sync
                </DialogTitle>
                <DialogDescription>
                    You have {{ cloudInfo.count }}/{{ cloudInfo.limit }} resumes in the cloud.
                    {{ cloudInfo.remaining }} slot{{ cloudInfo.remaining !== 1 ? 's' : '' }} remaining.
                </DialogDescription>
            </DialogHeader>
            <div class="flex-1 overflow-y-auto space-y-4 py-4">
                <div
                    v-for="resume in syncableResumes"
                    :key="resume.id"
                    class="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    :class="{ 'bg-blue-50 border-blue-200': selectedResumes.includes(resume.id) }"
                    @click="toggleResume(resume.id)"
                >
                    <div class="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                        <CheckCircle
                            v-if="selectedResumes.includes(resume.id)"
                            class="w-5 h-5 text-blue-600"
                        />
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="block font-medium text-gray-900 truncate">
                            {{ resume.name }}
                        </div>
                        <div class="text-sm text-gray-500 space-y-1">
                            <p>Updated {{ formatDate(resume.updatedAt) }}</p>
                            <div class="flex items-center gap-4 text-xs">
                                <span class="flex items-center gap-1">
                                    <AlertCircle class="w-3 h-3 text-amber-600" />
                                    Not synced
                                </span>
                                <span>{{ getSectionCount(resume) }}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div
                    v-if="syncableResumes.length === 0"
                    class="text-center py-8 text-gray-500"
                >
                    <Cloud class="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>All resumes are synced to cloud</p>
                    <p class="text-xs mt-2">
                        Use "Disable Cloud Sync" from the resume menu to unsync a resume.
                    </p>
                </div>
                <div
                    v-if="getNewResumesCount() > cloudInfo.remaining"
                    class="bg-amber-50 border border-amber-200 rounded-lg p-4"
                >
                    <div class="flex items-start gap-3">
                        <AlertCircle class="w-5 h-5 text-amber-600 mt-0.5" />
                        <div>
                            <h4 class="text-sm font-medium text-amber-800">
                                Storage Limit Exceeded
                            </h4>
                            <p class="text-sm text-amber-700 mt-1">
                                You're trying to sync {{ getNewResumesCount() }} new resume{{ getNewResumesCount() !== 1 ? 's' : '' }},
                                but you only have {{ cloudInfo.remaining }} slot{{ cloudInfo.remaining !== 1 ? 's' : '' }} remaining.
                                Please deselect some resumes or delete existing ones from the cloud.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <DialogFooter class="flex-shrink-0 gap-2">
                <Button
                    variant="outline"
                    @click="$emit('close')"
                >
                    Cancel
                </Button>
                <Button
                    variant="outline"
                    :disabled="syncableResumes.length === 0"
                    @click="selectAll"
                >
                    {{ selectedResumes.length === syncableResumes.length ? 'Deselect All' : 'Select All' }}
                </Button>
                <Button
                    :disabled="selectedResumes.length === 0 || isLoading || getNewResumesCount() > cloudInfo.remaining"
                    @click="handleSync"
                >
                    <Loader2
                        v-if="isLoading"
                        class="w-4 h-4 mr-2 animate-spin"
                    />
                    Sync {{ selectedResumes.length }} Resume{{ selectedResumes.length !== 1 ? 's' : '' }}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>

<script lang="ts" setup>
import { Button } from '~/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '~/components/ui/dialog';
import {
    AlertCircle,
    CheckCircle,
    Cloud,
    Loader2,
} from 'lucide-vue-next';
import type { Resume } from '~/types/resume';

interface Props {
    isOpen: boolean;
    resumes: Resume[];
}
const props = defineProps<Props>();
const emit = defineEmits<{
    close: [];
    sync: [resumeIds: string[]];
}>();
const selectedResumes = ref<string[]>([]);
const isLoading = ref(false);
const syncableResumes = computed(() => {
    return props.resumes.filter(resume => !resume.serverId);
});
const cloudInfo = computed(() => {
    const syncedCount = props.resumes.filter(resume => resume.serverId).length;
    return {
        count: syncedCount,
        limit: 3,
        remaining: Math.max(0, 3 - syncedCount),
    };
});
const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};
const getSectionCount = (resume: Resume): string => {
    const data = resume.data;
    const sections = [];
    if (data.experiences?.length) sections.push(`${data.experiences.length} exp`);
    if (data.education?.length) sections.push(`${data.education.length} edu`);
    if (data.skills?.length) sections.push(`${data.skills.length} skills`);
    if (data.projects?.length) sections.push(`${data.projects.length} projects`);
    return sections.join(', ') || 'No sections';
};
const getNewResumesCount = (): number => {
    return selectedResumes.value.filter((id) => {
        const resume = props.resumes.find(r => r.id === id);
        return resume && !resume.serverId;
    }).length;
};
const toggleResume = (resumeId: string) => {
    const index = selectedResumes.value.indexOf(resumeId);
    if (index > -1) {
        selectedResumes.value.splice(index, 1);
    }
    else {
        selectedResumes.value.push(resumeId);
    }
};
const selectAll = () => {
    if (selectedResumes.value.length === syncableResumes.value.length) {
        selectedResumes.value = [];
    }
    else {
        selectedResumes.value = syncableResumes.value.map(r => r.id);
    }
};
const handleSync = async () => {
    if (selectedResumes.value.length === 0) return;
    isLoading.value = true;
    await new Promise(resolve => setTimeout(resolve, 500));
    emit('sync', [...selectedResumes.value]);
    selectedResumes.value = [];
    isLoading.value = false;
};
watch(() => props.isOpen, (isOpen) => {
    if (isOpen) {
        selectedResumes.value = [];
    }
});
</script>
