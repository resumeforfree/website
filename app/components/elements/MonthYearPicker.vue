<template>
    <div class="mb-4">
        <label
            v-if="label"
            class="block text-sm font-medium text-gray-700 mb-1"
        >{{ label }}</label>
        <div class="relative">
            <VueDatePicker
                v-model="selectedDate"
                :disabled="disabled"
                :placeholder="placeholder"
                class="month-year-picker"
                format="MMMM yyyy"
                month-picker
                @update:model-value="handleDateChange"
            />
        </div>
    </div>
</template>

<script lang="ts" setup>
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

interface Props {
    modelValue: string;
    label?: string;
    placeholder?: string;
    disabled?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
    label: '',
    placeholder: 'Select',
});
const emit = defineEmits<{
    'update:modelValue': [value: string];
}>();
const selectedDate = ref<{ month: number; year: number } | null>(null);
watch(() => props.modelValue, (newValue) => {
    if (newValue) {
        const [year, month] = newValue.split('-');
        selectedDate.value = {
            month: parseInt(month) - 1,
            year: parseInt(year),
        };
    }
    else {
        selectedDate.value = null;
    }
}, { immediate: true });
const handleDateChange = (date: { month: number; year: number } | null | undefined) => {
    if (!date) {
        emit('update:modelValue', '');
        return;
    }
    if (typeof date === 'object' && 'month' in date && 'year' in date) {
        const year = date.year;
        const month = String(date.month + 1).padStart(2, '0');
        emit('update:modelValue', `${year}-${month}`);
    }
    else {
        emit('update:modelValue', '');
    }
};
</script>

<style scoped>
</style>
