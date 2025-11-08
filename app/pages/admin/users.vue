<template>
    <div class="space-y-6">
            <!-- Header -->
            <div>
                <p class="text-gray-600">
                    {{ $t('admin.users.description') }}
                </p>
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
                                        {{ $t('admin.users.email') }}
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {{ $t('admin.users.name') }}
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
                                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <Button
                                            v-if="user.role === 'user'"
                                            variant="outline"
                                            size="sm"
                                            @click="updateRole(user.id, 'admin')"
                                        >
                                            {{ $t('admin.users.actions.makeAdmin') }}
                                        </Button>
                                        <Button
                                            v-else
                                            variant="outline"
                                            size="sm"
                                            @click="updateRole(user.id, 'user')"
                                        >
                                            {{ $t('admin.users.actions.removeAdmin') }}
                                        </Button>
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
import { Users } from 'lucide-vue-next';
import { Card, CardContent } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
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

const fetchUsers = async () => {
    loading.value = true;
    try {
        const data = await $fetch('/api/admin/users', {
            query: {
                page: currentPage.value,
                limit: 50,
            },
        });
        users.value = data.users || [];
        pagination.value = data.pagination;
    }
    catch (error) {
        console.error('Error fetching users:', error);
        toast.error(t('admin.users.errors.fetchFailed'));
    }
    finally {
        loading.value = false;
    }
};

const goToPage = (page: number) => {
    currentPage.value = page;
    fetchUsers();
};

const updateRole = async (userId: string, newRole: 'user' | 'admin') => {
    try {
        await $fetch(`/api/admin/users/${userId}/role`, {
            method: 'PATCH',
            body: { role: newRole },
        });

        // Update local state
        const user = users.value.find(u => u.id === userId);
        if (user) {
            user.role = newRole;
        }

        toast.success(t('admin.users.success.roleUpdated'));
    }
    catch (error) {
        console.error('Error updating user role:', error);
        toast.error(t('admin.users.errors.updateFailed'));
    }
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
