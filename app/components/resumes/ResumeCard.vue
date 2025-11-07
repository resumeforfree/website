<template>
    <Card
        :class="{ 'ring-2 ring-blue-500': isActive }"
        class="hover:shadow-lg transition-shadow relative"
    >
        <div class="absolute top-3 right-3 sm:top-4 sm:right-4 flex flex-col gap-1 items-end">
            <Badge
                v-if="isActive"
                class="bg-blue-500 text-white text-xs"
            >
                Active
            </Badge>
            <Badge
                v-if="resume.serverId"
                class="bg-green-500 text-white flex items-center gap-1 text-xs"
            >
                <Cloud class="w-3 h-3" />
                Synced
            </Badge>
        </div>
        <CardHeader class="pb-4">
            <div
                v-if="isEditing"
                class="flex items-center gap-2 pr-20"
            >
                <input
                    v-model="editingName"
                    autofocus
                    class="flex-1 px-2 py-1 border rounded text-xl font-semibold"
                    @keyup.enter="saveEdit"
                    @keyup.escape="cancelEdit"
                >
                <button
                    class="p-1 text-green-600 hover:text-green-700"
                    @click="saveEdit"
                >
                    <Check class="w-4 h-4" />
                </button>
                <button
                    class="p-1 text-red-600 hover:text-red-700"
                    @click="cancelEdit"
                >
                    <X class="w-4 h-4" />
                </button>
            </div>
            <div
                v-else
                class="flex items-center gap-2 pr-20"
            >
                <CardTitle class="text-xl font-semibold truncate flex-1">
                    {{ resume.name }}
                </CardTitle>
                <button
                    class="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Edit resume name"
                    @click="startEdit"
                >
                    <PencilIcon class="w-4 h-4" />
                </button>
            </div>
            <div class="flex items-center gap-2 text-sm text-gray-500">
                <Calendar class="w-4 h-4" />
                <span>Updated {{ formatDate(resume.updatedAt) }}</span>
            </div>
        </CardHeader>
        <CardContent class="pt-0">
            <div class="space-y-2 mb-4">
                <p class="font-medium text-gray-900">
                    {{ resumePreview.fullName }}
                </p>
                <p class="text-sm text-gray-600">
                    {{ resumePreview.position }}
                </p>
                <p class="text-xs text-gray-500">
                    {{ resumePreview.sections }}
                </p>
            </div>
            <div class="flex gap-2 mt-4">
                <Button
                    class="flex items-center gap-1"
                    size="sm"
                    variant="outline"
                    @click="$emit('edit', resume.id)"
                >
                    <Edit class="w-3 h-3" />
                    Build
                </Button>
                <Button
                    class="flex items-center gap-1"
                    size="sm"
                    variant="outline"
                    @click.stop="$emit('copy', resume.id)"
                >
                    <Copy class="w-3 h-3" />
                    Copy
                </Button>
                <Button
                    class="flex items-center gap-1"
                    size="sm"
                    variant="outline"
                    title="Export resume"
                    @click.stop="$emit('export', resume.id)"
                >
                    <Download class="w-3 h-3" />
                    Export
                </Button>
                <Popover>
                    <PopoverTrigger as-child>
                        <Button
                            size="sm"
                            variant="outline"
                            class="p-2"
                            @click.stop
                        >
                            <MoreVertical class="w-3 h-3" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent
                        class="w-48 p-1"
                        align="end"
                    >
                        <button
                            v-if="authStore.isLoggedIn && resume.serverId"
                            class="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-amber-600 hover:bg-amber-50 rounded transition-colors"
                            @click.stop="$emit('disableSync', resume.id)"
                        >
                            <CloudOff class="w-3 h-3" />
                            Disable Cloud Sync
                        </button>
                        <button
                            class="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                            @click.stop="$emit('delete', resume.id)"
                        >
                            <Trash2 class="w-3 h-3" />
                            Delete
                        </button>
                    </PopoverContent>
                </Popover>
            </div>
        </CardContent>
    </Card>
</template>

<script lang="ts" setup>
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';
import {
    Calendar,
    Check,
    Cloud,
    CloudOff,
    Copy,
    Download,
    Edit,
    MoreVertical,
    PencilIcon,
    Trash2,
    X,
} from 'lucide-vue-next';
import type { Resume } from '~/types/resume';

interface Props {
    resume: Resume;
    isActive: boolean;
}
const props = defineProps<Props>();
defineEmits<{
    edit: [id: string];
    copy: [id: string];
    export: [id: string];
    delete: [id: string];
    rename: [id: string, newName: string];
    disableSync: [id: string];
}>();
const resumeStore = useResumeStore();
const authStore = useAuthStore();
const isEditing = ref(false);
const editingName = ref('');
const resumePreview = computed(() => {
    const data = props.resume.data;
    const fullName = [data.firstName, data.lastName].filter(Boolean).join(' ');
    const position = data.position || 'No position specified';
    const sections = [];
    if (data.experiences?.length) sections.push(`${data.experiences.length} experience${data.experiences.length > 1 ? 's' : ''}`);
    if (data.education?.length) sections.push(`${data.education.length} education${data.education.length > 1 ? 's' : ''}`);
    if (data.skills?.length) sections.push(`${data.skills.length} skill${data.skills.length > 1 ? 's' : ''}`);
    return {
        fullName: fullName || 'No name specified',
        position,
        sections: sections.join(', ') || 'No sections added',
    };
});
const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};
const startEdit = () => {
    isEditing.value = true;
    editingName.value = props.resume.name;
};
const saveEdit = () => {
    if (editingName.value.trim()) {
        resumeStore.renameResume(props.resume.id, editingName.value.trim());
    }
    cancelEdit();
};
const cancelEdit = () => {
    isEditing.value = false;
    editingName.value = '';
};
</script>
