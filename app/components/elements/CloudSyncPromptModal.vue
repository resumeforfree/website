<template>
    <Dialog
        :open="isOpen"
        @update:open="$emit('close')"
    >
        <DialogContent class="max-w-[95vw] sm:max-w-lg max-h-[95vh] overflow-y-auto mx-4 sm:mx-auto">
            <DialogHeader class="pb-2 sm:pb-4">
                <DialogTitle class="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl">
                    <div class="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full">
                        <Cloud class="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                    </div>
                    <span class="leading-tight">Save Your Resume to the Cloud?</span>
                </DialogTitle>
                <DialogDescription class="text-sm sm:text-base leading-relaxed pt-1 sm:pt-2">
                    Your resume is currently saved locally. Would you like to sync it to the cloud?
                </DialogDescription>
            </DialogHeader>
            <div class="space-y-4 sm:space-y-6 py-2 sm:py-4">
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                    <div class="flex items-start gap-2 sm:gap-3">
                        <CloudUpload class="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div class="flex-1 min-w-0">
                            <h3 class="font-medium text-blue-900 mb-2 text-sm sm:text-base">
                                Benefits of Cloud Sync
                            </h3>
                            <ul class="text-xs sm:text-sm text-blue-800 space-y-1">
                                <li class="flex items-center gap-2">
                                    <Check class="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" />
                                    <span>Access your resume from any device</span>
                                </li>
                                <li class="flex items-center gap-2">
                                    <Check class="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" />
                                    <span>Automatic backup and protection</span>
                                </li>
                                <li class="flex items-center gap-2">
                                    <Check class="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" />
                                    <span>Real-time synchronization</span>
                                </li>
                                <li class="flex items-center gap-2">
                                    <Check class="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" />
                                    <span>Never lose your work</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div class="bg-amber-50 border border-amber-200 rounded-lg p-3 sm:p-4">
                    <div class="flex items-start gap-3">
                        <Info class="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <h3 class="font-medium text-amber-900 mb-2">
                                Cloud Storage Limit
                            </h3>
                            <p class="text-sm text-amber-800 leading-relaxed">
                                You can save up to 3 resumes to the cloud with your free account.
                                You currently have {{ cloudInfo.remaining }} slot{{ cloudInfo.remaining !== 1 ? 's' : '' }} available.
                            </p>
                        </div>
                    </div>
                </div>
                <div class="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4">
                    <div class="flex items-start gap-2 sm:gap-3">
                        <HardDrive class="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <h3 class="font-medium text-gray-900 mb-2 text-sm sm:text-base">
                                Continue with Local Storage
                            </h3>
                            <p class="text-xs sm:text-sm text-gray-700 leading-relaxed">
                                Your resume will remain saved locally in this browser.
                                You can enable cloud sync anytime from the resume settings.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <DialogFooter class="!flex-col space-y-4 pt-4">
                <div class="flex items-center space-x-2 w-full">
                    <Checkbox
                        id="dont-show-cloud-sync"
                        v-model="dontShowAgain"
                    />
                    <Label
                        for="dont-show-cloud-sync"
                        class="text-sm text-gray-600 cursor-pointer"
                    >
                        Don't ask me again for this resume
                    </Label>
                </div>
                <div class="flex flex-row justify-between w-full gap-2">
                    <Button
                        :disabled="!canSaveToCloud"
                        @click="$emit('enableSync', dontShowAgain)"
                    >
                        <CloudUpload class="w-4 h-4 mr-2" />
                        Enable Cloud Sync
                    </Button>
                    <Button
                        variant="outline"
                        @click="$emit('continueLocally', dontShowAgain)"
                    >
                        <HardDrive class="w-4 h-4 mr-2" />
                        Keep Local Only
                    </Button>
                </div>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>

<script lang="ts" setup>
import { Button } from '~/components/ui/button';
import { Checkbox } from '~/components/ui/checkbox';
import { Label } from '~/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '~/components/ui/dialog';
import {
    Check,
    Cloud,
    CloudUpload,
    HardDrive,
    Info,
} from 'lucide-vue-next';
import { useResumeStore } from '~/stores/resume';

interface Props {
    isOpen: boolean;
}

const props = defineProps<Props>();

defineEmits<{
    close: [];
    enableSync: [dontShowAgain: boolean];
    continueLocally: [dontShowAgain: boolean];
}>();

const resumeStore = useResumeStore();
const dontShowAgain = ref(false);

const cloudInfo = computed(() => resumeStore.cloudInfo);
const canSaveToCloud = computed(() => resumeStore.canSaveToCloud);

watch(() => props.isOpen, (isOpen) => {
    if (isOpen) {
        dontShowAgain.value = false;
    }
});
</script>
