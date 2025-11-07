export const useCloudSyncPrompt = (resumeId: string) => {
    const getStorageKey = (id: string) => `dismissCloudSyncPrompt_${id}`;

    const isDismissed = (): boolean => {
        if (typeof window === 'undefined' || !resumeId) return false;
        try {
            const value = localStorage.getItem(getStorageKey(resumeId));
            return value === 'true';
        }
        catch (error) {
            console.warn(`Failed to read cloud sync prompt state for resume "${resumeId}":`, error);
            return false;
        }
    };

    const dismissPrompt = (): void => {
        if (typeof window === 'undefined' || !resumeId) return;
        try {
            localStorage.setItem(getStorageKey(resumeId), 'true');
        }
        catch (error) {
            console.warn(`Failed to save cloud sync prompt dismissal for resume "${resumeId}":`, error);
        }
    };

    const resetPromptState = (): void => {
        if (typeof window === 'undefined' || !resumeId) return;
        try {
            localStorage.removeItem(getStorageKey(resumeId));
        }
        catch (error) {
            console.warn(`Failed to reset cloud sync prompt state for resume "${resumeId}":`, error);
        }
    };

    return {
        isDismissed,
        dismissPrompt,
        resetPromptState,
    };
};

export const useCloudSyncPromptUtilities = () => {
    const getAllDismissedResumes = (): string[] => {
        if (typeof window === 'undefined') return [];
        try {
            const dismissedResumes: string[] = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key?.startsWith('dismissCloudSyncPrompt_')) {
                    const resumeId = key.replace('dismissCloudSyncPrompt_', '');
                    if (localStorage.getItem(key) === 'true') {
                        dismissedResumes.push(resumeId);
                    }
                }
            }
            return dismissedResumes;
        }
        catch (error) {
            console.warn('Failed to get all dismissed cloud sync prompts:', error);
            return [];
        }
    };

    const resetAllPrompts = (): void => {
        if (typeof window === 'undefined') return;
        try {
            const keysToRemove: string[] = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key?.startsWith('dismissCloudSyncPrompt_')) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));
        }
        catch (error) {
            console.warn('Failed to reset all cloud sync prompt states:', error);
        }
    };

    return {
        getAllDismissedResumes,
        resetAllPrompts,
    };
};
