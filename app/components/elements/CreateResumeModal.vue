<script lang="ts" setup>
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Checkbox } from '~/components/ui/checkbox';
import { Cloud } from 'lucide-vue-next';

interface Props {
    isOpen: boolean;
}
interface Emits {
    (e: 'close'): void;
    (e: 'confirm', name: string, navigateToBuilder: boolean, saveToCloud: boolean): void;
}
const props = defineProps<Props>();
const emit = defineEmits<Emits>();
const authStore = useAuthStore();
const resumeStore = useResumeStore();
const newResumeName = ref('');
const navigateToBuilder = ref(true);
const saveToCloud = ref(false);
const canSaveToCloud = computed(() => {
    return authStore.isLoggedIn && resumeStore.canSaveToCloud;
});
watch(() => props.isOpen, (isOpen) => {
    if (isOpen) {
        newResumeName.value = '';
        navigateToBuilder.value = true;
        saveToCloud.value = false;
    }
});
const handleConfirm = () => {
    emit('confirm', newResumeName.value, navigateToBuilder.value, saveToCloud.value);
};
const handleCancel = () => {
    emit('close');
};
const handleEnter = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
        handleConfirm();
    }
};
</script>

<template>
    <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center"
        @click="handleCancel"
    >
        <div class="absolute inset-0 bg-black/50" />
        <div
            class="relative bg-white border rounded-lg shadow-xl p-6 w-96 max-w-[90vw]"
            @click.stop
        >
            <div class="space-y-4">
                <h3 class="text-lg font-semibold text-gray-900">
                    Create New Resume
                </h3>
                <div class="space-y-2">
                    <Label for="resume-name">Resume Name</Label>
                    <Input
                        id="resume-name"
                        v-model="newResumeName"
                        autofocus
                        placeholder="Enter resume name"
                        @keydown="handleEnter"
                    />
                </div>
                <div class="space-y-3 pt-2">
                    <div class="flex items-center space-x-2">
                        <Checkbox
                            id="navigate-to-builder"
                            v-model="navigateToBuilder"
                        />
                        <Label
                            class="text-sm font-normal"
                            for="navigate-to-builder"
                        >
                            Navigate to the builder after creating
                        </Label>
                    </div>
                    <div
                        v-if="authStore.isLoggedIn"
                        class="space-y-2"
                    >
                        <div
                            v-if="canSaveToCloud"
                            class="flex items-center space-x-2"
                        >
                            <Checkbox
                                id="save-to-cloud"
                                v-model="saveToCloud"
                            />
                            <Label
                                class="text-sm font-normal flex items-center gap-1"
                                for="save-to-cloud"
                            >
                                <Cloud class="w-4 h-4 text-blue-600" />
                                Save to cloud
                            </Label>
                        </div>
                        <div class="text-xs text-gray-500 flex items-center gap-1">
                            <Cloud class="w-3 h-3" />
                            <span v-if="resumeStore.cloudInfo.remaining > 0">
                                {{ resumeStore.cloudInfo.remaining }} of {{ resumeStore.cloudInfo.limit }} cloud slots available
                            </span>
                            <span
                                v-else
                                class="text-amber-600"
                            >
                                No cloud slots available ({{ resumeStore.cloudInfo.count }}/{{ resumeStore.cloudInfo.limit }} used)
                            </span>
                        </div>
                    </div>
                </div>
                <div class="flex gap-3 pt-4">
                    <Button
                        class="flex-1"
                        @click="handleConfirm"
                    >
                        Create Resume
                    </Button>
                    <Button
                        class="flex-1"
                        variant="outline"
                        @click="handleCancel"
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        </div>
    </div>
</template>
