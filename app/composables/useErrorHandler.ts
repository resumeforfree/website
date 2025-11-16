import { toast } from 'vue-sonner';

interface ApiError {
    data?: { message?: string };
    statusMessage?: string;
    message?: string;
}

interface ErrorHandlerOptions {
    showToast?: boolean;
    toastMessage?: string;
    fallbackMessage?: string;
    logToConsole?: boolean;
    rethrow?: boolean;
}

export function useErrorHandler() {
    const { t } = useI18n();

    /**
     * Extract a readable error message from various error types
     */
    const extractErrorMessage = (error: unknown): string => {
        if (error instanceof Error) {
            return error.message;
        }

        // Handle API errors from $fetch
        if (typeof error === 'object' && error !== null) {
            const apiError = error as ApiError;
            return apiError?.data?.message
                || apiError?.statusMessage
                || apiError?.message
                || 'An unknown error occurred';
        }

        return 'An unknown error occurred';
    };

    /**
     * Handle an error with configurable options
     */
    const handleError = async (
        error: unknown,
        options: ErrorHandlerOptions = {},
    ): Promise<string> => {
        const {
            showToast = false,
            toastMessage,
            fallbackMessage = t('errors.generic'),
            logToConsole = true,
            rethrow = false,
        } = options;

        const errorMessage = extractErrorMessage(error);
        const displayMessage = toastMessage || errorMessage || fallbackMessage;

        if (logToConsole) {
            console.error('Error:', errorMessage, error);
        }

        if (showToast) {
            toast.error(displayMessage);
        }

        if (rethrow) {
            throw new Error(errorMessage);
        }

        return errorMessage;
    };

    /**
     * Wrapper for async operations with automatic error handling
     */
    const withErrorHandling = async <T>(
        operation: () => Promise<T>,
        options: ErrorHandlerOptions = {},
    ): Promise<{ data: T | null; error: string | null; success: boolean }> => {
        try {
            const data = await operation();
            return { data, error: null, success: true };
        }
        catch (error) {
            const errorMessage = await handleError(error, options);
            return { data: null, error: errorMessage, success: false };
        }
    };

    return {
        handleError,
        withErrorHandling,
        extractErrorMessage,
    };
}
