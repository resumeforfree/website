<template>
    <div class="space-y-6">
            <!-- Header -->
            <div>
                <p class="text-gray-600">
                    {{ $t('admin.contactMessages.description') }}
                </p>
            </div>

            <!-- Filter Tabs -->
            <div class="mb-6 border-b border-gray-200">
                <nav class="-mb-px flex space-x-8">
                    <button
                        v-for="filter in filters"
                        :key="filter.value"
                        :class="[
                            'py-4 px-1 border-b-2 font-medium text-sm',
                            currentFilter === filter.value
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        ]"
                        @click="currentFilter = filter.value"
                    >
                        {{ $t(filter.label) }}
                        <span
                            v-if="filter.count !== undefined"
                            class="ml-2 py-0.5 px-2 rounded-full text-xs"
                            :class="currentFilter === filter.value ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'"
                        >
                            {{ filter.count }}
                        </span>
                    </button>
                </nav>
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
                v-else-if="filteredMessages.length === 0"
                class="text-center py-12"
            >
                <p class="text-gray-500">
                    {{ $t('admin.contactMessages.noMessages') }}
                </p>
            </div>

            <!-- Messages List -->
            <div
                v-else
                class="space-y-4"
            >
                <Card
                    v-for="message in filteredMessages"
                    :key="message.id"
                    class="p-6"
                >
                    <div class="flex items-start justify-between">
                        <div class="flex-1">
                            <!-- Header -->
                            <div class="flex items-center gap-3 mb-2">
                                <span
                                    class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                                    :class="{
                                        'bg-green-100 text-green-800': message.status === 'new',
                                        'bg-blue-100 text-blue-800': message.status === 'read',
                                        'bg-gray-100 text-gray-800': message.status === 'resolved'
                                    }"
                                >
                                    {{ $t(`admin.contactMessages.status.${message.status}`) }}
                                </span>
                                <span class="text-sm text-gray-500">
                                    {{ formatDate(message.created_at) }}
                                </span>
                            </div>

                            <!-- Subject -->
                            <h3 class="text-lg font-semibold text-gray-900 mb-2">
                                {{ message.subject }}
                            </h3>

                            <!-- Sender Info -->
                            <div class="flex gap-4 text-sm text-gray-600 mb-3">
                                <span>
                                    <strong>{{ $t('admin.contactMessages.from') }}:</strong> {{ message.name }}
                                </span>
                                <span>
                                    <strong>{{ $t('admin.contactMessages.email') }}:</strong>
                                    <a
                                        :href="`mailto:${message.email}`"
                                        class="text-blue-600 hover:text-blue-800"
                                    >
                                        {{ message.email }}
                                    </a>
                                </span>
                            </div>

                            <!-- Message Content -->
                            <p class="text-gray-700 whitespace-pre-wrap">
                                {{ message.message }}
                            </p>

                            <!-- Meta Info -->
                            <div
                                v-if="message.ip_address"
                                class="mt-3 text-xs text-gray-500"
                            >
                                <span>IP: {{ message.ip_address }}</span>
                            </div>
                        </div>

                        <!-- Actions -->
                        <div class="flex gap-2 ml-4">
                            <Button
                                v-if="message.status !== 'read'"
                                variant="outline"
                                size="sm"
                                @click="updateStatus(message.id, 'read')"
                            >
                                {{ $t('admin.contactMessages.actions.markRead') }}
                            </Button>
                            <Button
                                v-if="message.status !== 'resolved'"
                                variant="outline"
                                size="sm"
                                @click="updateStatus(message.id, 'resolved')"
                            >
                                {{ $t('admin.contactMessages.actions.markResolved') }}
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                @click="confirmDelete(message.id)"
                            >
                                {{ $t('common.delete') }}
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>

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
import { toast } from 'vue-sonner';
import { Card } from '~/components/ui/card';
import { Button } from '~/components/ui/button';

definePageMeta({
    middleware: 'admin',
    layout: 'admin',
});

const { t } = useI18n();

interface ContactMessage {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    status: 'new' | 'read' | 'resolved';
    ip_address?: string;
    user_agent?: string;
    created_at: string;
    updated_at: string;
}

const messages = ref<ContactMessage[]>([]);
const loading = ref(true);
const currentFilter = ref<string>('all');
const currentPage = ref(1);
const pagination = ref({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
});

const filters = computed(() => [
    {
        value: 'all',
        label: 'admin.contactMessages.filters.all',
        count: messages.value.length,
    },
    {
        value: 'new',
        label: 'admin.contactMessages.filters.new',
        count: messages.value.filter(m => m.status === 'new').length,
    },
    {
        value: 'read',
        label: 'admin.contactMessages.filters.read',
        count: messages.value.filter(m => m.status === 'read').length,
    },
    {
        value: 'resolved',
        label: 'admin.contactMessages.filters.resolved',
        count: messages.value.filter(m => m.status === 'resolved').length,
    },
]);

const filteredMessages = computed(() => {
    if (currentFilter.value === 'all') {
        return messages.value;
    }
    return messages.value.filter(m => m.status === currentFilter.value);
});

const fetchMessages = async () => {
    loading.value = true;
    try {
        const data = await $fetch('/api/admin/contact-messages', {
            query: {
                page: currentPage.value,
                limit: 50,
            },
        });
        messages.value = data.messages || [];
        pagination.value = data.pagination;
    }
    catch (error) {
        console.error('Error fetching contact messages:', error);
        toast.error(t('admin.contactMessages.errors.fetchFailed'));
    }
    finally {
        loading.value = false;
    }
};

const goToPage = (page: number) => {
    currentPage.value = page;
    fetchMessages();
};

const updateStatus = async (messageId: string, status: string) => {
    try {
        await $fetch(`/api/admin/contact-messages/${messageId}`, {
            method: 'PATCH',
            body: { status },
        });

        // Update local state
        const message = messages.value.find(m => m.id === messageId);
        if (message) {
            message.status = status as 'new' | 'read' | 'resolved';
        }

        toast.success(t('admin.contactMessages.success.statusUpdated'));
    }
    catch (error) {
        console.error('Error updating message status:', error);
        toast.error(t('admin.contactMessages.errors.updateFailed'));
    }
};

const confirmDelete = (messageId: string) => {
    if (confirm(t('admin.contactMessages.confirmDelete'))) {
        deleteMessage(messageId);
    }
};

const deleteMessage = async (messageId: string) => {
    try {
        await $fetch(`/api/admin/contact-messages/${messageId}`, {
            method: 'DELETE',
        });

        // Remove from local state
        messages.value = messages.value.filter(m => m.id !== messageId);

        toast.success(t('admin.contactMessages.success.deleted'));
    }
    catch (error) {
        console.error('Error deleting message:', error);
        toast.error(t('admin.contactMessages.errors.deleteFailed'));
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

// Fetch messages on component mount
onMounted(() => {
    fetchMessages();
});
</script>
