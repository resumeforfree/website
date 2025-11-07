import type { TypstLoaderState } from '~/utils/typstLoader';
import { typstLoader } from '~/utils/typstLoader';

export const useTypstLoader = () => {
    const state = ref<TypstLoaderState>(typstLoader.getState());
    const initializationStarted = ref(false);
    const initializeTypst = async () => {
        if (initializationStarted.value) {
            return;
        }
        try {
            initializationStarted.value = true;
            await typstLoader.initialize();
        }
        catch (error) {
            console.error('Failed to initialize Typst:', error);
        }
    };
    onMounted(() => {
        if (import.meta.client) {
            const unsubscribe = typstLoader.subscribe((newState) => {
                state.value = newState;
            });
            if (!state.value.hasInitialized && !state.value.isLoading && !initializationStarted.value) {
                initializeTypst();
            }
            onUnmounted(() => {
                unsubscribe();
            });
        }
    });
    watch(state, (newState) => {
        if (import.meta.client && !newState.hasInitialized && !newState.isLoading && !initializationStarted.value) {
            initializeTypst();
        }
    });
    const retry = async () => {
        initializationStarted.value = false;
        typstLoader.reset();
        await initializeTypst();
    };
    return {
        isLoading: computed(() => state.value.isLoading),
        isReady: computed(() => state.value.isReady),
        error: computed(() => state.value.error),
        hasInitialized: computed(() => state.value.hasInitialized),
        retry,
    };
};
