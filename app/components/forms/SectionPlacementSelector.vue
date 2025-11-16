<template>
    <div
        v-if="canMove"
        class="flex items-center gap-2"
    >
        <span class="text-sm text-gray-600">{{ $t('common.column') }}:</span>
        <select
            :value="placement"
            class="px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            @change="$emit('update', ($event.target as HTMLSelectElement).value as 'left' | 'right')"
        >
            <option value="left">
                {{ $t('common.left') }}
            </option>
            <option value="right">
                {{ $t('common.right') }}
            </option>
        </select>
    </div>
</template>

<script lang="ts" setup>
defineProps<{
    placement: 'left' | 'right';
    canMove: boolean;
}>();

defineEmits<{
    update: [value: 'left' | 'right'];
}>();
</script>
