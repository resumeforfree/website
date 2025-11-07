export const useAutoSync = () => {
    const resumeStore = useResumeStore();
    const authStore = useAuthStore();
    let syncInterval: number | null = null;
    const isSyncing = ref(false);
    const lastSyncSuccess = ref(true);
    const lastSyncTime = ref<Date | null>(null);
    const lastSyncError = ref<string | null>(null);
    const SYNC_INTERVAL = 5000;
    const LAST_SYNC_KEY = 'lastAutoSyncTime';
    const getLastSyncTime = (): Date | null => {
        if (typeof window === 'undefined') return null;
        try {
            const lastSync = localStorage.getItem(LAST_SYNC_KEY);
            return lastSync ? new Date(lastSync) : null;
        }
        catch (error) {
            console.warn('Failed to get last sync time:', error);
            return null;
        }
    };
    const setLastSyncTime = (time: Date): void => {
        if (typeof window === 'undefined') return;
        try {
            localStorage.setItem(LAST_SYNC_KEY, time.toISOString());
        }
        catch (error) {
            console.warn('Failed to set last sync time:', error);
        }
    };
    const getChangedSyncedResumes = (): string[] => {
        const lastSyncTime = getLastSyncTime();
        const changedResumeIds: string[] = [];
        for (const [id, resume] of Object.entries(resumeStore.resumes)) {
            if (!resume.serverId) continue;
            const resumeUpdatedAt = new Date(resume.updatedAt);
            if (!lastSyncTime || resumeUpdatedAt > lastSyncTime) {
                changedResumeIds.push(id);
            }
        }
        return changedResumeIds;
    };
    const syncChangedResumes = async (): Promise<void> => {
        if (isSyncing.value || !authStore.isAuthenticated) return;
        const changedResumeIds = getChangedSyncedResumes();
        if (changedResumeIds.length === 0) return;
        isSyncing.value = true;
        lastSyncError.value = null;
        try {
            for (const resumeId of changedResumeIds) {
                await resumeStore.syncResumeToServer(resumeId);
            }
            const syncTime = new Date();
            setLastSyncTime(syncTime);
            lastSyncTime.value = syncTime;
            lastSyncSuccess.value = true;
        }
        catch (error) {
            lastSyncSuccess.value = false;
            lastSyncError.value = error instanceof Error ? error.message : 'Unknown error';
        }
        finally {
            isSyncing.value = false;
        }
    };
    const startAutoSync = (): void => {
        if (syncInterval) return;
        lastSyncTime.value = getLastSyncTime();
        syncChangedResumes();
        syncInterval = setInterval(syncChangedResumes, SYNC_INTERVAL);
    };
    const stopAutoSync = (): void => {
        if (syncInterval) {
            clearInterval(syncInterval);
            syncInterval = null;
        }
    };
    const resetLastSyncTime = (): void => {
        if (typeof window === 'undefined') return;
        try {
            localStorage.removeItem(LAST_SYNC_KEY);
        }
        catch (error) {
            console.warn('Failed to reset last sync time:', error);
        }
    };
    onUnmounted(() => {
        stopAutoSync();
    });
    return {
        startAutoSync,
        stopAutoSync,
        syncChangedResumes,
        getChangedSyncedResumes,
        resetLastSyncTime,
        isSyncing: computed(() => isSyncing.value),
        lastSyncSuccess: computed(() => lastSyncSuccess.value),
        lastSyncTime: computed(() => lastSyncTime.value),
        lastSyncError: computed(() => lastSyncError.value),
    };
};
