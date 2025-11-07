export const useModalSeen = (modalName: string) => {
    const getStorageKey = (name: string) => `hasSeenModal_${name}`;
    const hasSeenModal = (): boolean => {
        if (typeof window === 'undefined') return false;
        try {
            const value = localStorage.getItem(getStorageKey(modalName));
            return value === 'true';
        }
        catch (error) {
            console.warn(`Failed to read modal state for "${modalName}" from localStorage:`, error);
            return false;
        }
    };
    const markModalSeen = (): void => {
        if (typeof window === 'undefined') return;
        try {
            localStorage.setItem(getStorageKey(modalName), 'true');
        }
        catch (error) {
            console.warn(`Failed to save modal state for "${modalName}" to localStorage:`, error);
        }
    };
    const resetModalState = (): void => {
        if (typeof window === 'undefined') return;
        try {
            localStorage.removeItem(getStorageKey(modalName));
        }
        catch (error) {
            console.warn(`Failed to reset modal state for "${modalName}":`, error);
        }
    };
    return {
        hasSeenModal,
        markModalSeen,
        resetModalState,
    };
};
export const useModalSeenUtilities = () => {
    const getAllSeenModals = (): string[] => {
        if (typeof window === 'undefined') return [];
        try {
            const seenModals: string[] = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key?.startsWith('hasSeenModal_')) {
                    const modalName = key.replace('hasSeenModal_', '');
                    if (localStorage.getItem(key) === 'true') {
                        seenModals.push(modalName);
                    }
                }
            }
            return seenModals;
        }
        catch (error) {
            console.warn('Failed to get all seen modals:', error);
            return [];
        }
    };
    const resetAllModals = (): void => {
        if (typeof window === 'undefined') return;
        try {
            const keysToRemove: string[] = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key?.startsWith('hasSeenModal_')) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));
        }
        catch (error) {
            console.warn('Failed to reset all modal states:', error);
        }
    };
    const hasSeenAnyModal = (): boolean => {
        return getAllSeenModals().length > 0;
    };
    return {
        getAllSeenModals,
        resetAllModals,
        hasSeenAnyModal,
    };
};
export const useFirstTimeModal = () => useModalSeen('firstTimeBuilder');
