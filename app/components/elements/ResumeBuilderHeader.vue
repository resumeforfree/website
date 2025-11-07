<template>
    <div class="mb-8">
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0">
            <div class="flex items-center space-x-3">
                <h1 class="text-2xl font-bold text-gray-900">
                    {{ resumeStore.activeResume?.name || 'Resume Builder' }}
                </h1>
            </div>
            <div class="flex items-center space-x-2">
                <Button
                    v-if="authStore.isLoggedIn && activeResume"
                    size="sm"
                    variant="outline"
                    class="flex items-center gap-2 min-w-fit"
                    :disabled="!canSyncToCloud || isAnySyncing"
                    @click="handleCloudSync"
                >
                    <Loader2
                        v-if="isAnySyncing"
                        class="h-4 w-4 animate-spin"
                    />
                    <Cloud
                        v-else
                        class="h-4 w-4"
                    />
                    <span class="hidden sm:inline whitespace-nowrap">{{ isAnySyncing ? syncingText : syncButtonText }}</span>
                    <span class="sm:hidden whitespace-nowrap">{{ isAnySyncing ? (activeResume.serverId ? 'Updating...' : 'Syncing...') : (activeResume.serverId ? 'Update' : 'Sync') }}</span>
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    @click="settingsStore.expandAllSections()"
                >
                    <ChevronDown class="h-4 w-4" />
                    <span class="ml-1 sm:hidden">Expand</span>
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    @click="settingsStore.collapseAllSections()"
                >
                    <ChevronUp class="h-4 w-4" />
                    <span class="ml-1 sm:hidden">Collapse</span>
                </Button>
                <Button
                    class="flex items-center gap-2"
                    size="sm"
                    variant="outline"
                    @click="showStepper = true"
                >
                    <ListIcon class="h-4 w-4" />
                    Sections
                </Button>
            </div>
        </div>
    </div>
    <ResumeStepper v-model:show-stepper="showStepper" />
</template>

<script lang="ts" setup>
import { Button } from '~/components/ui/button';
import { ChevronDown, ChevronUp, ListIcon, Cloud, Loader2 } from 'lucide-vue-next';
import ResumeStepper from '~/components/elements/ResumeStepper.vue';

const resumeStore = useResumeStore();
const settingsStore = useSettingsStore();
const authStore = useAuthStore();
const showStepper = ref<boolean>(false);
const isSyncing = ref<boolean>(false);
const { isSyncing: isAutoSyncing } = useAutoSync();
const activeResume = computed(() => resumeStore.activeResume);
const isAnySyncing = computed(() => isSyncing.value || isAutoSyncing.value);
const canSyncToCloud = computed(() => {
    const cloudInfo = resumeStore.cloudInfo;
    if (activeResume.value?.serverId) return true;
    return cloudInfo.remaining > 0;
});
const syncButtonText = computed(() => {
    if (!activeResume.value) return 'Sync to Cloud';
    if (activeResume.value.serverId) {
        return 'Update Cloud';
    }
    else {
        return 'Sync to Cloud';
    }
});
const syncingText = computed(() => {
    if (!activeResume.value) return 'Syncing to Cloud...';
    if (activeResume.value.serverId) {
        return 'Updating Cloud...';
    }
    else {
        return 'Syncing to Cloud...';
    }
});
const handleCloudSync = async () => {
    if (!activeResume.value || isAnySyncing.value) return;
    const { toast } = await import('vue-sonner');
    try {
        isSyncing.value = true;
        await resumeStore.syncResumeToServer(activeResume.value.id);
        // Silent sync - success toasts are handled by the calling component
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    catch (error: any) {
        console.error('Failed to sync resume:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        toast.error(`Failed to sync resume: ${errorMessage}`);
    }
    finally {
        isSyncing.value = false;
    }
};
</script>
