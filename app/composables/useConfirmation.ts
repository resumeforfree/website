export interface ConfirmationOptions {
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
}
export const useConfirmation = () => {
    const isOpen = ref(false);
    const title = ref('Confirm Action');
    const message = ref('Are you sure you want to proceed?');
    const confirmText = ref('Confirm');
    const cancelText = ref('Cancel');
    const resolvePromise = ref<((value: boolean) => void) | null>(null);
    const confirm = (options: ConfirmationOptions = {}): Promise<boolean> => {
        return new Promise<boolean>((resolve) => {
            title.value = options.title || 'Confirm Action';
            message.value = options.message || 'Are you sure you want to proceed?';
            confirmText.value = options.confirmText || 'Confirm';
            cancelText.value = options.cancelText || 'Cancel';
            resolvePromise.value = resolve;
            isOpen.value = true;
        });
    };
    const handleConfirm = () => {
        isOpen.value = false;
        if (resolvePromise.value) {
            resolvePromise.value(true);
            resolvePromise.value = null;
        }
    };
    const handleCancel = () => {
        isOpen.value = false;
        if (resolvePromise.value) {
            resolvePromise.value(false);
            resolvePromise.value = null;
        }
    };
    return {
        isOpen: readonly(isOpen),
        title: readonly(title),
        message: readonly(message),
        confirmText: readonly(confirmText),
        cancelText: readonly(cancelText),
        confirm,
        handleConfirm,
        handleCancel,
    };
};
