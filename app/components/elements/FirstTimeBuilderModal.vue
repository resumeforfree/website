<template>
    <Dialog
        :open="isOpen"
        @update:open="$emit('close')"
    >
        <DialogContent class="max-w-[95vw] sm:max-w-2xl max-h-[95vh] overflow-y-auto mx-4 sm:mx-auto">
            <DialogHeader class="pb-2 sm:pb-4">
                <DialogTitle class="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl">
                    <div class="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full">
                        <FileText class="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                    </div>
                    <span class="leading-tight">Welcome to The Resume Builder!</span>
                </DialogTitle>
                <DialogDescription class="text-sm sm:text-base leading-relaxed pt-1 sm:pt-2">
                    Let's get you started with building your professional resume.
                </DialogDescription>
            </DialogHeader>
            <div class="space-y-4 sm:space-y-6 py-2 sm:py-4">
                <div class="bg-amber-50 border border-amber-200 rounded-lg p-3 sm:p-4">
                    <div class="flex items-start gap-3">
                        <HardDrive class="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <h3 class="font-medium text-amber-900 mb-2">
                                Your Data Stays Private & Local
                            </h3>
                            <p class="text-sm text-amber-800 leading-relaxed">
                                By default, your resume data is saved securely in your browser's local storage.
                                This means your personal information never leaves your device and remains completely private.
                            </p>
                        </div>
                    </div>
                </div>
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                    <div class="flex items-start gap-2 sm:gap-3">
                        <Cloud class="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div class="flex-1 min-w-0">
                            <h3 class="font-medium text-blue-900 mb-2 text-sm sm:text-base">
                                Want to Access Your Resumes Anywhere?
                            </h3>
                            <p class="text-xs sm:text-sm text-blue-800 leading-relaxed mb-3">
                                Create a free account to save up to 3 resumes to the cloud and access them from any device.
                                Perfect for job hunting on the go!
                            </p>
                            <ul class="text-xs sm:text-sm text-blue-800 space-y-1 mb-3 sm:mb-4">
                                <li class="flex items-center gap-2">
                                    <Check class="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" />
                                    <span>Access from any browser or device</span>
                                </li>
                                <li class="flex items-center gap-2">
                                    <Check class="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" />
                                    <span>Automatic backup and sync</span>
                                </li>
                                <li class="flex items-center gap-2">
                                    <Check class="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" />
                                    <span>Up to 3 resumes for free</span>
                                </li>
                                <li class="flex items-center gap-2">
                                    <Check class="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" />
                                    <span>Always Free</span>
                                </li>
                            </ul>
                            <div class="flex gap-2">
                                <Button
                                    size="sm"
                                    class="bg-blue-600 hover:bg-blue-700"
                                    @click="$emit('register', dontShowAgain)"
                                >
                                    <UserPlus class="w-4 h-4 mr-1" />
                                    Create Account
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    class="border-blue-300 text-blue-700 hover:bg-blue-100"
                                    @click="$emit('login', dontShowAgain)"
                                >
                                    <LogIn class="w-4 h-4 mr-1" />
                                    Login
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4">
                    <div class="flex items-start gap-2 sm:gap-3">
                        <Monitor class="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <h3 class="font-medium text-gray-900 mb-2 text-sm sm:text-base">
                                Continue with Local Storage
                            </h3>
                            <p class="text-xs sm:text-sm text-gray-700 leading-relaxed">
                                No problem! You can continue building your resume locally.
                                Your data will be saved in this browser and you can create an account anytime later.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <DialogFooter class="!flex-col space-y-4 pt-4">
                <div class="flex items-center space-x-2 w-full">
                    <Checkbox
                        id="dont-show-again"
                        v-model="dontShowAgain"
                    />
                    <Label
                        for="dont-show-again"
                        class="text-sm text-gray-600 cursor-pointer"
                    >
                        Don't show this again
                    </Label>
                </div>
                <div class="flex flex-row justify-between w-full">
                    <Button
                        @click="$emit('register', dontShowAgain)"
                    >
                        <UserPlus class="w-4 h-4 mr-2" />
                        Create Account & Save to Cloud
                    </Button>
                    <Button
                        variant="outline"
                        @click="$emit('continueLocally', dontShowAgain)"
                    >
                        Continue Locally
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
    FileText,
    HardDrive,
    LogIn,
    Monitor,
    UserPlus,
} from 'lucide-vue-next';

interface Props {
    isOpen: boolean;
}
const props = defineProps<Props>();
defineEmits<{
    close: [];
    register: [dontShowAgain: boolean];
    login: [dontShowAgain: boolean];
    continueLocally: [dontShowAgain: boolean];
}>();
const dontShowAgain = ref(false);
watch(() => props.isOpen, (isOpen) => {
    if (isOpen) {
        dontShowAgain.value = false;
    }
});
</script>
