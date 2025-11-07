<script lang="ts" setup>
import ConfirmationModal from '~/components/elements/ConfirmationModal.vue';
import CreateResumeModal from '~/components/elements/CreateResumeModal.vue';
import CopyResumeModal from '~/components/elements/CopyResumeModal.vue';
import ExportModal from '~/components/elements/ExportModal.vue';
import ImportConfirmationModal from '~/components/elements/ImportConfirmationModal.vue';
import CloudSyncModal from '~/components/elements/CloudSyncModal.vue';
import ResumesHeader from '~/components/resumes/ResumesHeader.vue';
import ResumesGrid from '~/components/resumes/ResumesGrid.vue';
import ResumesEmptyState from '~/components/resumes/ResumesEmptyState.vue';
import type { ImportResumePreview } from '~/components/elements/ImportConfirmationModal.vue';
import type { Resume } from '~/types/resume';
import { Button } from '~/components/ui/button';
import { CheckCircle, Cloud, LogIn, UserPlus } from 'lucide-vue-next';

const resumeStore = useResumeStore();
const authStore = useAuthStore();
const router = useRouter();
const confirmation = useConfirmation();
const { exportResumes, exportSingleResume, parseImportFile, importSelectedResumes } = useResumeImportExport();
const searchQuery = ref('');
const fetchServerResumesIfLoggedIn = async () => {
    if (authStore.isLoggedIn) {
        try {
            await resumeStore.fetchServerResumes();
        }
        catch (error) {
            console.error('Failed to fetch server resumes:', error);
        }
    }
};
onMounted(async () => {
    await fetchServerResumesIfLoggedIn();
});
watch(() => authStore.isLoggedIn, async (isLoggedIn) => {
    if (isLoggedIn) {
        await fetchServerResumesIfLoggedIn();
    }
});
const resumes = computed(() => {
    const allResumes = resumeStore.resumesList;
    if (!searchQuery.value.trim()) {
        return allResumes;
    }
    const query = searchQuery.value.toLowerCase().trim();
    return allResumes.filter(resume =>
        resume.name.toLowerCase().includes(query),
    );
});
const resumeCount = computed(() => resumeStore.resumeCount);
const filteredCount = computed(() => resumes.value.length);
const showCreateModal = ref(false);
const showCopyModal = ref(false);
const resumeToCopy = ref<Resume | null>(null);
const showExportModal = ref(false);
const showImportModal = ref(false);
const importPreviews = ref<ImportResumePreview[]>([]);
const showCloudSyncModal = ref(false);
const importInputRef = ref<HTMLInputElement>();
const createNewResume = () => {
    showCreateModal.value = true;
};
const handleCreateResume = async (name: string, navigateToBuilder: boolean, saveToCloud: boolean) => {
    const { toast } = await import('vue-sonner');
    const resumeName = name.trim() || 'Untitled Resume';
    const newResumeId = resumeStore.createResume(resumeName);
    resumeStore.setActiveResume(newResumeId);
    showCreateModal.value = false;
    if (saveToCloud && authStore.isLoggedIn) {
        try {
            toast.info('Creating resume in cloud...');
            const api = useApi();
            const resume = resumeStore.resumesList.find(r => r.id === newResumeId);
            if (resume) {
                const newCloudResume = await api.resumes.create(resume.name, resume.data);
                if (resumeStore.resumes[newResumeId] && newCloudResume) {
                    resumeStore.resumes[newResumeId].serverId = newCloudResume.id;
                    resumeStore.resumes[newResumeId].updatedAt = new Date().toISOString();
                }
                toast.success(`Resume "${resumeName}" created and saved to cloud`);
            }
        }
        catch (error: unknown) {
            console.error('Failed to save resume to cloud:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            toast.warning(`Resume "${resumeName}" created locally, but failed to save to cloud: ${errorMessage}`);
        }
    }
    else if (saveToCloud && !authStore.isLoggedIn) {
        toast.warning('Please log in to save resumes to the cloud');
    }
    else {
        toast.success(`Resume "${resumeName}" created`);
    }
    if (navigateToBuilder) {
        router.push('/builder');
    }
};
const editResume = (id: string) => {
    resumeStore.setActiveResume(id);
    router.push('/builder');
};
const showCopyResumeModal = (id: string) => {
    const resume = resumeStore.resumesList.find(r => r.id === id);
    if (resume) {
        resumeToCopy.value = resume;
        showCopyModal.value = true;
    }
};
const handleCopyResume = (name: string, navigateToBuilder: boolean) => {
    if (resumeToCopy.value) {
        const resumeName = name.trim() || 'Untitled Resume';
        const newResumeId = resumeStore.duplicateResume(resumeToCopy.value.id, resumeName);
        if (newResumeId) {
            resumeStore.setActiveResume(newResumeId);
            showCopyModal.value = false;
            resumeToCopy.value = null;
            if (navigateToBuilder) {
                router.push('/builder');
            }
        }
    }
};
const deleteResume = async (id: string) => {
    const { toast } = await import('vue-sonner');
    const resume = resumeStore.resumesList.find(r => r.id === id);
    const resumeName = resume?.name || 'this resume';
    const confirmed = await confirmation.confirm({
        title: 'Delete Resume',
        message: `Are you sure you want to delete "${resumeName}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
    });
    if (confirmed) {
        resumeStore.deleteResume(id);
        if (authStore.isLoggedIn && resume?.serverId) {
            try {
                const api = useApi();
                await api.resumes.delete(resume.serverId);
                toast.success(`Resume "${resumeName}" deleted from cloud`);
            }
            catch (error) {
                console.error('Failed to delete resume from cloud:', error);
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                toast.warning(`Resume deleted locally, but failed to delete from cloud: ${errorMessage}`);
            }
        }
        else {
            toast.success(`Resume "${resumeName}" deleted`);
        }
    }
};
const syncResume = async (id: string) => {
    const { toast } = await import('vue-sonner');
    if (!authStore.isLoggedIn) {
        toast.error('Please log in to sync resumes');
        return;
    }
    try {
        const api = useApi();
        const resume = resumeStore.resumesList.find(r => r.id === id);
        if (!resume) {
            toast.error('Resume not found');
            return;
        }
        toast.info('Syncing resume to cloud...');
        if (resume.serverId) {
            try {
                await api.resumes.update(resume.serverId, {
                    name: resume.name,
                    data: resume.data,
                });
                toast.success(`Resume "${resume.name}" updated in cloud`);
            }
            catch (error: unknown) {
                if (error && typeof error === 'object' && 'statusCode' in error && error.statusCode === 404) {
                    const newResume = await api.resumes.create(resume.name, resume.data);
                    if (resumeStore.resumes[id] && newResume) {
                        resumeStore.resumes[id].serverId = newResume.id;
                        resumeStore.resumes[id].updatedAt = new Date().toISOString();
                    }
                    toast.success(`Resume "${resume.name}" synced to cloud (new copy created)`);
                }
                else {
                    throw error;
                }
            }
        }
        else {
            const newResume = await api.resumes.create(resume.name, resume.data);
            if (resumeStore.resumes[id] && newResume) {
                resumeStore.resumes[id].serverId = newResume.id;
                resumeStore.resumes[id].updatedAt = new Date().toISOString();
            }
            toast.success(`Resume "${resume.name}" synced to cloud`);
        }
    }
    catch (error: unknown) {
        console.error('Failed to sync resume:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        toast.error(`Failed to sync resume: ${errorMessage}`);
    }
};
const clearSearch = () => {
    searchQuery.value = '';
};
const triggerImport = () => {
    importInputRef.value?.click();
};
const handleExportModal = () => {
    showExportModal.value = true;
};
const handleExport = (resumeIds: string[]) => {
    exportResumes(resumeIds);
    showExportModal.value = false;
};
const handleFileSelect = async (event: Event) => {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const result = await parseImportFile(file);
    if (result.success && result.previews) {
        importPreviews.value = result.previews;
        showImportModal.value = true;
    }
    else {
        console.error('Failed to parse file:', result.error);
    }
    input.value = '';
};
const handleImportConfirm = (selectedIndexes: number[]) => {
    const importedCount = importSelectedResumes(importPreviews.value, selectedIndexes);
    console.log(`Successfully imported ${importedCount} resume${importedCount !== 1 ? 's' : ''}`);
    showImportModal.value = false;
    importPreviews.value = [];
};
const handleCloudSyncModal = () => {
    if (!authStore.isLoggedIn) {
        return;
    }
    showCloudSyncModal.value = true;
};
const handleCloudSync = async (resumeIds: string[]) => {
    const { toast } = await import('vue-sonner');
    if (resumeIds.length === 0) {
        showCloudSyncModal.value = false;
        return;
    }
    try {
        toast.info(`Syncing ${resumeIds.length} resume${resumeIds.length !== 1 ? 's' : ''} to cloud...`);
        for (const resumeId of resumeIds) {
            await resumeStore.syncResumeToServer(resumeId);
        }
        toast.success(`Successfully synced ${resumeIds.length} resume${resumeIds.length !== 1 ? 's' : ''} to cloud`);
        showCloudSyncModal.value = false;
    }
    catch (error: unknown) {
        console.error('Failed to sync resumes:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        toast.error(`Failed to sync resumes: ${errorMessage}`);
    }
};
const disableCloudSync = async (id: string) => {
    const { toast } = await import('vue-sonner');
    const resume = resumeStore.resumesList.find(r => r.id === id);
    const resumeName = resume?.name || 'this resume';
    if (!resume?.serverId) {
        toast.error('Resume is not synced to cloud');
        return;
    }
    const confirmed = await confirmation.confirm({
        title: 'Disable Cloud Sync',
        message: `Are you sure you want to remove "${resumeName}" from the cloud? The resume will remain on your device but will no longer be synced.`,
        confirmText: 'Remove from Cloud',
        cancelText: 'Cancel',
    });
    if (confirmed) {
        try {
            const api = useApi();
            await api.resumes.delete(resume.serverId);
            if (resumeStore.resumes[id]) {
                resumeStore.resumes[id].serverId = undefined;
                resumeStore.resumes[id].updatedAt = new Date().toISOString();
            }
            toast.success(`"${resumeName}" removed from cloud and cloud sync disabled`);
        }
        catch (error: unknown) {
            console.error('Failed to disable cloud sync:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            toast.error(`Failed to remove from cloud: ${errorMessage}`);
        }
    }
};
useHead({
    title: 'Your Resumes - Manage Multiple Professional Resumes | Free Resume Builder',
    meta: [
        {
            name: 'description',
            content: 'Manage unlimited resumes in one place. Create, edit, duplicate, and organize professional resumes for free. No storage limits, complete privacy.',
        },
        {
            name: 'keywords',
            content: 'resume management, multiple resumes, organize resumes, duplicate resume, resume dashboard, free resume storage',
        },
        {
            name: 'robots',
            content: 'index, follow',
        },
        {
            property: 'og:type',
            content: 'website',
        },
        {
            property: 'og:site_name',
            content: 'Free Resume Builder',
        },
        {
            property: 'og:title',
            content: 'Your Resumes - Manage Multiple Professional Resumes',
        },
        {
            property: 'og:description',
            content: 'Manage unlimited resumes in one place. Create, edit, duplicate, and organize professional resumes for free.',
        },
        {
            property: 'og:url',
            content: 'https://resumeforfree.com/resumes',
        },
        {
            property: 'og:image',
            content: 'https://resumeforfree.com/og-image.png',
        },
        {
            name: 'twitter:card',
            content: 'summary_large_image',
        },
        {
            name: 'twitter:title',
            content: 'Your Resumes - Manage Multiple Professional Resumes',
        },
        {
            name: 'twitter:description',
            content: 'Manage unlimited resumes in one place. Create, edit, duplicate, and organize professional resumes for free.',
        },
        {
            name: 'twitter:image',
            content: 'https://resumeforfree.com/og-image.png',
        },
    ],
    link: [
        {
            rel: 'canonical',
            href: 'https://resumeforfree.com/resumes',
        },
    ],
});
</script>

<template>
    <div class="px-4 py-8">
        <div class="container mx-auto">
            <ClientOnly>
                <div
                    v-if="!authStore.isLoggedIn"
                    class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"
                >
                    <div class="flex items-start gap-3">
                        <Cloud class="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div class="flex-1">
                            <h3 class="text-sm font-medium text-blue-900 mb-1">
                                Save Your Resumes to the Cloud
                            </h3>
                            <p class="text-sm text-blue-700 mb-3">
                                Register for a free account to save up to 3 resumes to the cloud and access them from any browser.
                                Never lose your work again!
                            </p>
                            <div class="flex gap-2">
                                <Button
                                    size="sm"
                                    class="bg-blue-600 hover:bg-blue-700"
                                    @click="$router.push('/auth/register')"
                                >
                                    <UserPlus class="w-4 h-4 mr-1" />
                                    Register Free
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    class="border-blue-300 text-blue-700 hover:bg-blue-100"
                                    @click="$router.push('/auth/login')"
                                >
                                    <LogIn class="w-4 h-4 mr-1" />
                                    Login
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
                <div
                    v-else
                    class="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg"
                >
                    <div class="flex items-start gap-3">
                        <CheckCircle class="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div class="flex-1">
                            <h3 class="text-sm font-medium text-green-900 mb-1">
                                Cloud Storage Available
                            </h3>
                            <p class="text-sm text-green-700">
                                You can now save up to 3 resumes to the cloud and access them from any browser.
                                Use the "Cloud Sync" button to sync your resumes.
                            </p>
                        </div>
                    </div>
                </div>
            </ClientOnly>
            <ResumesHeader
                v-model:search-query="searchQuery"
                :resume-count="resumeCount"
                :filtered-count="filteredCount"
                @import="triggerImport"
                @export="handleExportModal"
                @create="createNewResume"
                @cloud-sync="handleCloudSyncModal"
            />
            <ClientOnly>
                <div
                    v-if="resumeStore.isLoading"
                    class="flex items-center justify-center py-12"
                >
                    <div class="flex flex-col items-center gap-3">
                        <div class="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
                        <p class="text-gray-600">
                            Loading resumes...
                        </p>
                    </div>
                </div>
                <div
                    v-else-if="resumeStore.error"
                    class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
                >
                    <div class="flex items-start gap-3">
                        <div class="w-5 h-5 text-red-600 mt-0.5">
                            ⚠️
                        </div>
                        <div>
                            <h3 class="text-sm font-medium text-red-900 mb-1">
                                Failed to load resumes
                            </h3>
                            <p class="text-sm text-red-700">
                                {{ resumeStore.error }}
                            </p>
                            <Button
                                size="sm"
                                variant="outline"
                                class="mt-2 border-red-300 text-red-700 hover:bg-red-100"
                                @click="fetchServerResumesIfLoggedIn"
                            >
                                Try Again
                            </Button>
                        </div>
                    </div>
                </div>
                <div v-else>
                    <ResumesEmptyState
                        v-if="resumeCount === 0"
                        type="no-resumes"
                        @create="createNewResume"
                    />
                    <ResumesEmptyState
                        v-else-if="filteredCount === 0 && searchQuery"
                        type="no-search-results"
                        :search-query="searchQuery"
                        @create="createNewResume"
                        @clear-search="clearSearch"
                    />
                    <ResumesGrid
                        v-else
                        :resumes="resumes"
                        :active-resume-id="resumeStore.activeResumeId"
                        @edit="editResume"
                        @copy="showCopyResumeModal"
                        @export="exportSingleResume"
                        @delete="deleteResume"
                        @sync="syncResume"
                        @disable-sync="disableCloudSync"
                    />
                </div>
                <CreateResumeModal
                    :is-open="showCreateModal"
                    @close="showCreateModal = false"
                    @confirm="handleCreateResume"
                />
                <CopyResumeModal
                    :is-open="showCopyModal"
                    :resume-name="resumeToCopy ? `${resumeToCopy.name} (Copy)` : ''"
                    @close="showCopyModal = false; resumeToCopy = null"
                    @confirm="handleCopyResume"
                />
                <ExportModal
                    :is-open="showExportModal"
                    :resumes="resumes"
                    @close="showExportModal = false"
                    @export="handleExport"
                />
                <ImportConfirmationModal
                    :is-open="showImportModal"
                    :resumes-to-import="importPreviews"
                    @close="showImportModal = false; importPreviews = []"
                    @import="handleImportConfirm"
                />
                <CloudSyncModal
                    :is-open="showCloudSyncModal"
                    :resumes="resumes"
                    @close="showCloudSyncModal = false"
                    @sync="handleCloudSync"
                />
                <ConfirmationModal
                    :cancel-text="confirmation.cancelText.value"
                    :confirm-text="confirmation.confirmText.value"
                    :is-open="confirmation.isOpen.value"
                    :message="confirmation.message.value"
                    :title="confirmation.title.value"
                    @cancel="confirmation.handleCancel"
                    @confirm="confirmation.handleConfirm"
                />
                <input
                    ref="importInputRef"
                    accept=".json"
                    class="hidden"
                    type="file"
                    @change="handleFileSelect"
                >
            </ClientOnly>
        </div>
    </div>
</template>
