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
                                            <DropdownMenuItem @click="openChangePasswordDialog(user)">
                                                <Key class="w-4 h-4 mr-2" />
                                                {{ $t('admin.users.actions.changePassword') }}
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                class="text-red-600 focus:text-red-600"
                                                @click="confirmDeleteUser(user.id)"
                                            >
                                                <Trash2 class="w-4 h-4 mr-2" />
                                                {{ $t('admin.users.actions.delete') }}
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>

        <!-- Password Success Dialog -->
        <Dialog v-model:open="passwordSuccessDialogOpen">
            <DialogContent class="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{{ $t('admin.users.changePassword.successDialog.title') }}</DialogTitle>
                    <DialogDescription>
                        {{ $t('admin.users.changePassword.successDialog.description', { email: successPasswordEmail }) }}
                    </DialogDescription>
                </DialogHeader>
                <div class="space-y-4 py-4">
                    <div class="flex items-center gap-2">
                        <Input
                            :model-value="successPassword"
                            readonly
                            class="flex-1 font-mono"
                        />
                        <Button
                            variant="outline"
                            size="icon"
                            :title="$t('common.copy')"
                            @click="copyPassword"
                        >
                            <Check
                                v-if="copied"
                                class="w-4 h-4 text-green-600"
                            />
                            <Copy
                                v-else
                                class="w-4 h-4"
                            />
                        </Button>
                    </div>
                    <p class="text-sm text-amber-600">
                        {{ $t('admin.users.changePassword.successDialog.warning') }}
                    </p>
                </div>
                <DialogFooter>
                    <Button @click="passwordSuccessDialogOpen = false">
                        {{ $t('common.done') }}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        <!-- Change Password Dialog -->
        <Dialog v-model:open="changePasswordDialogOpen">
            <DialogContent class="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{{ $t('admin.users.changePassword.title') }}</DialogTitle>
                    <DialogDescription>
                        {{ $t('admin.users.changePassword.description', { email: selectedUser?.email }) }}
                    </DialogDescription>
                </DialogHeader>
                <div class="space-y-4 py-4">
                    <div class="space-y-2">
                        <Label for="newPassword">{{ $t('admin.users.changePassword.newPassword') }}</Label>
                        <div class="flex gap-2">
                            <Input
                                id="newPassword"
                                v-model="newPassword"
                                :type="showPassword ? 'text' : 'password'"
                                :placeholder="$t('admin.users.changePassword.newPasswordPlaceholder')"
                                class="flex-1"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                :title="$t('admin.users.changePassword.toggleVisibility')"
                                @click="showPassword = !showPassword"
                            >
                                <EyeOff
                                    v-if="showPassword"
                                    class="w-4 h-4"
                                />
                                <Eye
                                    v-else
                                    class="w-4 h-4"
                                />
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                :title="$t('admin.users.changePassword.generateRandom')"
                                @click="generateRandomPassword"
                            >
                                <RefreshCw class="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                    <div class="space-y-2">
                        <Label for="confirmPassword">{{ $t('admin.users.changePassword.confirmPassword') }}</Label>
                        <Input
                            id="confirmPassword"
                            v-model="confirmPassword"
                            :type="showPassword ? 'text' : 'password'"
                            :placeholder="$t('admin.users.changePassword.confirmPasswordPlaceholder')"
                        />
                    </div>
                    <p
                        v-if="passwordError"
                        class="text-sm text-red-600"
                    >
                        {{ passwordError }}
                    </p>
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        @click="changePasswordDialogOpen = false"
                    >
                        {{ $t('common.cancel') }}
                    </Button>
                    <Button
                        :disabled="isChangingPassword"
                        @click="changePassword"
                    >
                        <span
                            v-if="isChangingPassword"
                            class="mr-2"
                        >
                            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        </span>
                        {{ $t('admin.users.changePassword.submit') }}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

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
import { Users, Search, MoreVertical, Key, Trash2, Eye, EyeOff, RefreshCw, Copy, Check } from 'lucide-vue-next';
import { Card, CardContent } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '~/components/ui/dropdown-menu';
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

// Change password state
const changePasswordDialogOpen = ref(false);
const selectedUser = ref<User | null>(null);
const newPassword = ref('');
const confirmPassword = ref('');
const passwordError = ref('');
const isChangingPassword = ref(false);
const showPassword = ref(false);

// Password success dialog state
const passwordSuccessDialogOpen = ref(false);
const successPassword = ref('');
const successPasswordEmail = ref('');
const copied = ref(false);

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
    catch (error: unknown) {
        // Ignore abort errors
        if (error instanceof Error && error.name === 'AbortError') {
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

const confirmDeleteUser = (userId: string) => {
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

const openChangePasswordDialog = (user: User) => {
    selectedUser.value = user;
    newPassword.value = '';
    confirmPassword.value = '';
    passwordError.value = '';
    showPassword.value = false;
    changePasswordDialogOpen.value = true;
};

const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const length = 12;
    let password = '';
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    newPassword.value = password;
    confirmPassword.value = password;
    showPassword.value = true;
    passwordError.value = '';
};

const changePassword = async () => {
    passwordError.value = '';

    if (!newPassword.value) {
        passwordError.value = t('admin.users.changePassword.errors.required');
        return;
    }

    if (newPassword.value.length < 8) {
        passwordError.value = t('admin.users.changePassword.errors.minLength');
        return;
    }

    if (newPassword.value !== confirmPassword.value) {
        passwordError.value = t('admin.users.changePassword.errors.mismatch');
        return;
    }

    if (!selectedUser.value) return;

    isChangingPassword.value = true;

    try {
        await $fetch(`/api/admin/users/${selectedUser.value.id}/password`, {
            method: 'PATCH',
            body: {
                newPassword: newPassword.value,
            },
        });

        // Store password and email for success dialog
        successPassword.value = newPassword.value;
        successPasswordEmail.value = selectedUser.value.email;
        copied.value = false;

        // Close change password dialog and open success dialog
        changePasswordDialogOpen.value = false;
        passwordSuccessDialogOpen.value = true;
    }
    catch (error) {
        console.error('Error changing password:', error);
        toast.error(t('admin.users.changePassword.errors.failed'));
    }
    finally {
        isChangingPassword.value = false;
    }
};

const copyPassword = async () => {
    try {
        await navigator.clipboard.writeText(successPassword.value);
        copied.value = true;
        setTimeout(() => {
            copied.value = false;
        }, 2000);
    }
    catch (error) {
        console.error('Failed to copy password:', error);
        toast.error(t('common.copyFailed'));
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
