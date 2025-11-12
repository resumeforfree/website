export const useSettingsSync = () => {
    const settingsStore = useSettingsStore();
    const authStore = useAuthStore();
    const api = useApi();
    let syncTimeout: number | null = null;
    const DEBOUNCE_DELAY = 2000; // 2 seconds

    const initializeSettingsFromServer = async (): Promise<void> => {
        if (!authStore.isAuthenticated) return;

        try {
            const response = await api.settings.get();
            const serverSettings = response.settings;
            const serverUpdatedAt = response.updated_at;

            if (!serverUpdatedAt || Object.keys(serverSettings).length === 0) {
                // No settings on server, push local settings
                await syncSettingsToServer();
                return;
            }

            // Compare timestamps and use newer settings
            const serverWon = settingsStore.initializeFromServer(serverSettings, serverUpdatedAt);

            if (!serverWon) {
                // Local settings are newer, push to server
                await syncSettingsToServer();
            }
        }
        catch (error) {
            console.error('Failed to initialize settings from server:', error);
            settingsStore.setLastSyncError(
                error instanceof Error ? error.message : 'Failed to fetch settings',
            );
        }
    };

    const syncSettingsToServer = async (): Promise<void> => {
        if (!authStore.isAuthenticated) return;

        settingsStore.setIsSyncing(true);
        settingsStore.setLastSyncError(null);

        try {
            await api.settings.update(settingsStore.settings);
            settingsStore.setLastSyncTime(Date.now());
        }
        catch (error) {
            console.error('Failed to sync settings to server:', error);
            settingsStore.setLastSyncError(
                error instanceof Error ? error.message : 'Failed to sync settings',
            );
        }
        finally {
            settingsStore.setIsSyncing(false);
        }
    };

    const debouncedSync = (): void => {
        if (syncTimeout) {
            clearTimeout(syncTimeout);
        }
        syncTimeout = setTimeout(() => {
            syncSettingsToServer();
        }, DEBOUNCE_DELAY);
    };

    const startSettingsSync = (): void => {
        if (!authStore.isAuthenticated) return;

        // Watch for settings changes and sync with debouncing
        watch(
            () => settingsStore.settings,
            () => {
                if (authStore.isAuthenticated) {
                    debouncedSync();
                }
            },
            { deep: true },
        );
    };

    const stopSettingsSync = (): void => {
        if (syncTimeout) {
            clearTimeout(syncTimeout);
            syncTimeout = null;
        }
    };

    onUnmounted(() => {
        stopSettingsSync();
    });

    return {
        initializeSettingsFromServer,
        syncSettingsToServer,
        startSettingsSync,
        stopSettingsSync,
    };
};
