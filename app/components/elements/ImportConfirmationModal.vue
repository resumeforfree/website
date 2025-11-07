<template>
    <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center"
        @click="handleBackdropClick"
    >
        <div class="absolute inset-0 bg-black/50" />
        <div
            class="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-lg mx-4"
            @click.stop
        >
            <div class="mb-4">
                <h3 class="text-lg font-semibold">
                    Import Resumes
                </h3>
                <p class="text-sm text-gray-600 mt-1">
                    {{ resumesToImport.length }} resume{{ resumesToImport.length !== 1 ? 's' : '' }} found in file
                </p>
            </div>
            <div
                v-if="duplicateCount > 0"
                class="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4"
            >
                <div class="flex">
                    <AlertTriangle class="h-5 w-5 text-amber-600 flex-shrink-0" />
                    <div class="ml-3">
                        <p class="text-sm text-amber-800">
                            {{ duplicateCount }} resume{{ duplicateCount !== 1 ? 's' : '' }} with matching names already
                            exist.
                            These are unchecked by default.
                        </p>
                    </div>
                </div>
            </div>
            <div class="space-y-2 max-h-80 overflow-y-auto mb-6 border rounded-md p-2">
                <div
                    v-for="(resume, index) in resumesToImport"
                    :key="index"
                    class="relative"
                >
                    <label
                        class="flex items-center gap-2 p-2 rounded cursor-pointer"
                        :class="[
                            resume.isDuplicate ? 'bg-amber-50 hover:bg-amber-100' : 'hover:bg-gray-50',
                        ]"
                    >
                        <input
                            v-model="selectedIndexes"
                            :value="index"
                            class="rounded border-gray-300 text-primary focus:ring-primary"
                            type="checkbox"
                        >
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-2">
                                <span class="text-sm font-medium truncate">
                                    {{ resume.name }}
                                </span>
                                <Badge
                                    v-if="resume.isDuplicate"
                                    class="bg-amber-100 text-amber-800 text-xs"
                                >
                                    Duplicate
                                </Badge>
                            </div>
                            <div class="text-xs text-gray-500">
                                {{ resume.itemCount }} items
                            </div>
                        </div>
                    </label>
                </div>
            </div>
            <div class="text-sm text-gray-600 mb-4">
                {{ selectedIndexes.length }} resume{{ selectedIndexes.length !== 1 ? 's' : '' }} selected for import
            </div>
            <div class="flex justify-end gap-3">
                <Button
                    variant="outline"
                    @click="handleCancel"
                >
                    Cancel
                </Button>
                <Button
                    :disabled="selectedIndexes.length === 0"
                    @click="handleImport"
                >
                    Import Selected
                </Button>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { AlertTriangle } from 'lucide-vue-next';

export interface ImportResumePreview {
    name: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any;
    isDuplicate: boolean;
    itemCount: number;
}
interface Props {
    isOpen: boolean;
    resumesToImport: ImportResumePreview[];
}
const props = defineProps<Props>();
const emit = defineEmits<{
    close: [];
    import: [indexes: number[]];
}>();
const selectedIndexes = ref<number[]>([]);
watch(() => props.isOpen, (newVal) => {
    if (newVal) {
        selectedIndexes.value = props.resumesToImport
            .map((resume, index) => ({ resume, index }))
            .filter(({ resume }) => !resume.isDuplicate)
            .map(({ index }) => index);
    }
});
const duplicateCount = computed(() => {
    return props.resumesToImport.filter(r => r.isDuplicate).length;
});
const handleBackdropClick = () => {
    emit('close');
};
const handleCancel = () => {
    emit('close');
};
const handleImport = () => {
    emit('import', selectedIndexes.value);
};
</script>
