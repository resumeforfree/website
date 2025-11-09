import { ref, watch, type Ref } from 'vue';

interface UseDebouncedSearchOptions {
    debounceMs?: number;
    minLength?: number;
}

interface UseDebouncedSearchReturn {
    searchQuery: Ref<string>;
    debouncedQuery: Ref<string>;
    isSearching: Ref<boolean>;
    abortController: Ref<AbortController | null>;
}

/**
 * Composable for debounced search with AbortController support
 *
 * @param options - Configuration options
 * @param options.debounceMs - Debounce delay in milliseconds (default: 300)
 * @param options.minLength - Minimum query length to trigger search (default: 0)
 * @returns Search state and control refs
 *
 * @example
 * ```ts
 * const { searchQuery, debouncedQuery, isSearching, abortController } = useDebouncedSearch({
 *   debounceMs: 500,
 *   minLength: 2
 * });
 *
 * watch(debouncedQuery, async (query) => {
 *   if (!query) return;
 *
 *   isSearching.value = true;
 *   try {
 *     const data = await $fetch('/api/search', {
 *       query: { q: query },
 *       signal: abortController.value?.signal
 *     });
 *     // Handle results
 *   } catch (error) {
 *     if (error.name === 'AbortError') {
 *       // Request was cancelled
 *       return;
 *     }
 *     // Handle other errors
 *   } finally {
 *     isSearching.value = false;
 *   }
 * });
 * ```
 */
export function useDebouncedSearch(options: UseDebouncedSearchOptions = {}): UseDebouncedSearchReturn {
    const { debounceMs = 300, minLength = 0 } = options;

    const searchQuery = ref<string>('');
    const debouncedQuery = ref<string>('');
    const isSearching = ref<boolean>(false);
    const abortController = ref<AbortController | null>(null);

    let debounceTimeout: NodeJS.Timeout | null = null;

    // Watch for search query changes
    watch(searchQuery, (newQuery) => {
        // Clear existing timeout
        if (debounceTimeout) {
            clearTimeout(debounceTimeout);
        }

        // Abort any pending requests
        if (abortController.value) {
            abortController.value.abort();
            abortController.value = null;
        }

        // If query is empty or below minimum length, clear immediately
        if (!newQuery || newQuery.length < minLength) {
            debouncedQuery.value = '';
            isSearching.value = false;
            return;
        }

        // Set debounced value after delay
        debounceTimeout = setTimeout(() => {
            debouncedQuery.value = newQuery;
            // Create new AbortController for the upcoming request
            abortController.value = new AbortController();
        }, debounceMs);
    });

    // Cleanup on unmount
    onUnmounted(() => {
        if (debounceTimeout) {
            clearTimeout(debounceTimeout);
        }
        if (abortController.value) {
            abortController.value.abort();
        }
    });

    return {
        searchQuery,
        debouncedQuery,
        isSearching,
        abortController,
    };
}
