<template>
    <div class="text-center py-16">
        <div v-if="type === 'no-resumes'">
            <FileText class="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <h2 class="text-2xl font-semibold text-gray-900 mb-2">
                No resumes yet
            </h2>
            <p class="text-gray-600 mb-6">
                Create your first resume to get started
            </p>
            <Button
                size="lg"
                @click="$emit('create')"
            >
                Create Your First Resume
            </Button>
        </div>
        <div v-else-if="type === 'no-search-results'">
            <Search class="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <h2 class="text-2xl font-semibold text-gray-900 mb-2">
                No resumes found
            </h2>
            <p class="text-gray-600 mb-6">
                No resumes match your search for "{{ searchQuery }}"
            </p>
            <div class="flex gap-3 justify-center">
                <Button
                    variant="outline"
                    @click="$emit('clear-search')"
                >
                    Clear Search
                </Button>
                <Button @click="$emit('create')">
                    Create New Resume
                </Button>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { Button } from '~/components/ui/button';
import { FileText, Search } from 'lucide-vue-next';

interface Props {
    type: 'no-resumes' | 'no-search-results';
    searchQuery?: string;
}
defineProps<Props>();
defineEmits<{
    'create': [];
    'clear-search': [];
}>();
</script>
