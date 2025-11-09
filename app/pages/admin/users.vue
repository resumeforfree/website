<template>
    <div class="space-y-6">
            <!-- Header -->
            <div>
                <p class="text-gray-600">
                    {{ $t('admin.users.description') }}
                </p>
            </div>

            <!-- Search Bar -->
            <div class="relative">
                <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                    v-model="searchQuery"
                    type="text"
                    :placeholder="$t('admin.users.searchPlaceholder')"
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
                v-else-if="users.length === 0"
                class="text-center py-12"
            >
                <Users class="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p class="text-gray-500">
                    {{ $t('admin.users.noUsers') }}
                </p>
            </div>

            <!-- Users Table -->
            <Card v-else>
                <CardContent class="p-0">
                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead class="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {{ $t('common.email') }}
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {{ $t('common.name') }}
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {{ $t('admin.users.role') }}
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {{ $t('admin.users.verified') }}
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {{ $t('admin.users.createdAt') }}
                                    </th>
                                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {{ $t('common.actions') }}
                                    </th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                <tr
                                    v-for="user in users"
                                    :key="user.id"
                                >
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {{ user.email }}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {{ user.name || '-' }}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <span
                                            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                                            :class="user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'"
                                        >
                                            {{ user.role }}
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        <span
                                            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                                            :class="user.verified ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
                                        >
                                            {{ user.verified ? $t('common.yes') : $t('common.no') }}
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {{ formatDate(user.created_at) }}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            @click="confirmDelete(user.id)"
                                        >
                                            {{ $t('common.delete') }}
                                        </Button>
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
    </div>
</template>

<script lang="ts" setup>
import { Users, Search } from 'lucide-vue-next';
import { Card, CardContent } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { toast } from 'vue-sonner';

definePageMeta({
    middleware: 'admin',
    layout: 'admin',
});

const { t } = useI18n();

interface User {
    id: string;
    email: string;
    name?: string;
    role: 'user' | 'admin';
    verified: boolean;
    created_at: string;
}

const users = ref<User[]>([]);
const loading = ref(true);
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

const fetchUsers = async () => {
    loading.value = true;
    try {
        const data = await $fetch('/api/admin/users', {
            query: {
                page: currentPage.value,
                limit: 50,
                search: debouncedQuery.value || undefined,
            },
            signal: abortController.value?.signal,
        });
        users.value = data.users || [];
        pagination.value = data.pagination;
    }
    catch (error: any) {
        // Ignore abort errors
        if (error.name === 'AbortError') {
            return;
        }
        console.error('Error fetching users:', error);
        toast.error(t('admin.users.errors.fetchFailed'));
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
    fetchUsers();
});

const goToPage = (page: number) => {
    currentPage.value = page;
    fetchUsers();
};

const confirmDelete = (userId: string) => {
    if (confirm(t('admin.users.confirmDelete'))) {
        deleteUser(userId);
    }
};

const deleteUser = async (userId: string) => {
    try {
        await $fetch(`/api/admin/users/${userId}`, {
            method: 'DELETE',
        });

        // Remove from local state
        users.value = users.value.filter(u => u.id !== userId);

        toast.success(t('admin.users.success.deleted'));
    }
    catch (error) {
        console.error('Error deleting user:', error);
        toast.error(t('admin.users.errors.deleteFailed'));
    }
};

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(date);
};

onMounted(() => {
    fetchUsers();
});
</script>
