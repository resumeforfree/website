<template>
    <div class="space-y-6">
        <!-- Header -->
        <div>
            <p class="text-gray-600">
                {{ $t('admin.resumes.description') }}
            </p>
        </div>

        <!-- Search Bar -->
        <div class="relative">
            <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
                v-model="searchQuery"
                type="text"
                :placeholder="$t('admin.resumes.searchPlaceholder')"
                class="pl-10"
            />
            <div
                v-if="isSearching"
                class="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
            </div>
        </div>

        <!-- Loading State -->
        <div
            v-if="loading"
            class="text-center py-12"
        >
            <p class="text-gray-500">
                {{ $t('common.loading') }}
            </p>
        </div>

        <!-- Empty State -->
        <div
            v-else-if="resumes.length === 0"
            class="text-center py-12"
        >
            <FileText class="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p class="text-gray-500">
                {{ $t('admin.resumes.noResumes') }}
            </p>
        </div>

        <!-- Resumes Table -->
        <Card v-else>
            <CardContent class="p-0">
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {{ $t('admin.resumes.name') }}
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {{ $t('admin.resumes.owner') }}
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {{ $t('admin.resumes.createdAt') }}
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {{ $t('admin.resumes.updatedAt') }}
                                </th>
                                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {{ $t('common.actions') }}
                                </th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            <tr
                                v-for="resume in resumes"
                                :key="resume.id"
                            >
                                <td class="px-6 py-4 text-sm font-medium text-gray-900">
                                    {{ resume.name || 'Untitled Resume' }}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                    {{ resume.user_email || resume.user_id }}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                    {{ formatDate(resume.created_at) }}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                    {{ formatDate(resume.updated_at) }}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div class="flex items-center justify-end gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            @click="openPreview(resume)"
                                        >
                                            <Eye class="w-4 h-4 mr-1" />
                                            {{ $t('admin.resumes.actions.view') }}
                                        </Button>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger as-child>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                >
                                                    <MoreVertical class="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    class="text-red-600 focus:text-red-600"
                                                    @click="confirmDelete(resume.id)"
                                                >
                                                    <Trash2 class="w-4 h-4 mr-2" />
                                                    {{ $t('common.delete') }}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>

        <!-- Pagination -->
        <div
            v-if="pagination.totalPages > 1"
            class="flex items-center justify-between"
        >
            <div class="text-sm text-gray-700">
                {{ $t('admin.pagination.showing', { from: (pagination.page - 1) * pagination.limit + 1, to: Math.min(pagination.page * pagination.limit, pagination.total), total: pagination.total }) }}
            </div>
            <div class="flex gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    :disabled="currentPage === 1"
                    @click="goToPage(currentPage - 1)"
                >
                    {{ $t('admin.pagination.previous') }}
                </Button>
                <div class="flex items-center gap-1">
                    <Button
                        v-for="page in pagination.totalPages"
                        :key="page"
                        variant="outline"
                        size="sm"
                        :class="{ 'bg-blue-50 border-blue-500 text-blue-600': page === currentPage }"
                        @click="goToPage(page)"
                    >
                        {{ page }}
                    </Button>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    :disabled="currentPage === pagination.totalPages"
                    @click="goToPage(currentPage + 1)"
                >
                    {{ $t('admin.pagination.next') }}
                </Button>
            </div>
        </div>

        <!-- Preview Dialog -->
        <ResumePreviewDialog
            v-model="showPreview"
            :resume-id="previewResume?.id || ''"
            :resume-name="previewResume?.name || ''"
            :owner-email="previewResume?.user_email || ''"
            :user-id="previewResume?.user_id || ''"
        />
    </div>
</template>

<script lang="ts" setup>
import { FileText, Eye, MoreVertical, Trash2, Search } from 'lucide-vue-next';
import ResumePreviewDialog from '~/components/admin/ResumePreviewDialog.vue';
import { Card, CardContent } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { toast } from 'vue-sonner';

definePageMeta({
    middleware: 'admin',
    layout: 'admin',
});

const { t } = useI18n();

interface Resume {
    id: string;
    user_id: string;
    user_email?: string;
    name: string;
    template?: string;
    is_active?: boolean;
    created_at: string;
    updated_at: string;
}

const resumes = ref<Resume[]>([]);
const loading = ref(true);
const showPreview = ref(false);
const previewResume = ref<Resume | null>(null);
const currentPage = ref(1);
const pagination = ref({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
});

// Setup debounced search
const { searchQuery, debouncedQuery, isSearching, abortController } = useDebouncedSearch({
    debounceMs: 400,
    minLength: 2,
});

const fetchResumes = async () => {
    loading.value = true;
    try {
        const data = await $fetch('/api/admin/resumes', {
            query: {
                page: currentPage.value,
                limit: 50,
                search: debouncedQuery.value || undefined,
            },
            signal: abortController.value?.signal,
        });
        resumes.value = data.resumes || [];
        pagination.value = data.pagination;
    }
    catch (error: unknown) {
        // Ignore abort errors
        if (error instanceof Error && error.name === 'AbortError') {
            return;
        }
        console.error('Error fetching resumes:', error);
        toast.error(t('admin.resumes.errors.fetchFailed'));
    }
    finally {
        loading.value = false;
        isSearching.value = false;
    }
};

// Watch for search query changes
watch(debouncedQuery, () => {
    currentPage.value = 1; // Reset to first page on search
    isSearching.value = true;
    fetchResumes();
});

const goToPage = (page: number) => {
    currentPage.value = page;
    fetchResumes();
};

const openPreview = (resume: Resume) => {
    previewResume.value = resume;
    showPreview.value = true;
};

const confirmDelete = (resumeId: string) => {
    if (confirm(t('admin.resumes.confirmDelete'))) {
        deleteResume(resumeId);
    }
};

const deleteResume = async (resumeId: string) => {
    try {
        await $fetch(`/api/admin/resumes/${resumeId}`, {
            method: 'DELETE',
        });

        // Remove from local state
        resumes.value = resumes.value.filter(r => r.id !== resumeId);

        toast.success(t('admin.resumes.success.deleted'));
    }
    catch (error) {
        console.error('Error deleting resume:', error);
        toast.error(t('admin.resumes.errors.deleteFailed'));
    }
};

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
};

onMounted(() => {
    fetchResumes();
});
</script>
