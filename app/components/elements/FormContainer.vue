<template>
    <Card class="w-full">
        <CardHeader class="px-4 md:px-6">
            <div class="flex items-center justify-between">
                <div class="flex-1">
                    <EditableHeader
                        v-if="props.editable"
                        :value="props.title"
                        @update="$emit('edit-title', $event)"
                    />
                    <h3
                        v-else
                        class="text-lg font-semibold text-gray-900"
                    >
                        {{ props.title }}
                    </h3>
                </div>
                <div class="flex items-center space-x-2">
                    <div
                        v-if="$slots['header-actions']"
                        class="ml-4"
                    >
                        <slot name="header-actions" />
                    </div>
                    <Button
                        v-if="props.collapsible"
                        variant="ghost"
                        size="sm"
                        @click="toggleCollapse"
                    >
                        <ChevronDown
                            class="w-4 h-4 transition-transform duration-200"
                            :class="[isCollapsed ? '-rotate-90' : 'rotate-0']"
                        />
                    </Button>
                </div>
            </div>
        </CardHeader>
        <CardContent
            v-if="!isCollapsed"
            class="px-4 md:px-6"
        >
            <div
                v-if="props.isEmpty"
                class="text-center py-8 text-muted-foreground"
            >
                {{ props.emptyMessage }}
            </div>
            <div v-else>
                <slot />
            </div>
            <div
                v-if="props.showAddButton"
                class="mt-6"
            >
                <AddButton
                    :label="props.addButtonLabel"
                    @click="$emit('add')"
                />
            </div>
        </CardContent>
    </Card>
</template>

<script lang="ts" setup>
import { Card, CardContent, CardHeader } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { ChevronDown } from 'lucide-vue-next';
import AddButton from '~/components/elements/AddButton.vue';
import EditableHeader from '~/components/elements/EditableHeader.vue';

interface Props {
    title: string;
    isEmpty: boolean;
    emptyMessage: string;
    addButtonLabel: string;
    showAddButton?: boolean;
    editable?: boolean;
    sectionKey?: string;
    collapsible?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
    showAddButton: true,
    editable: true,
    collapsible: true,
});
const _emit = defineEmits<{
    'add': [];
    'edit-title': [value: string];
}>();
const settingsStore = useSettingsStore();
const isCollapsed = computed(() => {
    if (!props.collapsible || !props.sectionKey) return false;
    return settingsStore.sectionCollapsed[props.sectionKey] || false;
});
const toggleCollapse = () => {
    if (props.collapsible && props.sectionKey) {
        settingsStore.toggleSectionCollapse(props.sectionKey);
    }
};
</script>
