<template>
    <div class="flex items-center bg-gray-100 rounded-lg p-1">
        <Button
            :disabled="zoomLevel <= minZoom"
            class="h-8 w-8 p-0"
            size="sm"
            variant="ghost"
            @click="zoomOut"
        >
            <ZoomOut class="h-4 w-4" />
            <span class="sr-only">Zoom out</span>
        </Button>
        <span class="px-3 text-sm font-medium text-gray-700 min-w-[60px] text-center">
            {{ Math.round(zoomLevel * 100) }}%
        </span>
        <Button
            :disabled="zoomLevel >= maxZoom"
            class="h-8 w-8 p-0"
            size="sm"
            variant="ghost"
            @click="zoomIn"
        >
            <ZoomIn class="h-4 w-4" />
            <span class="sr-only">Zoom in</span>
        </Button>
    </div>
</template>

<script lang="ts" setup>
import { ZoomIn, ZoomOut } from 'lucide-vue-next';
import { Button } from '~/components/ui/button';

interface Props {
    zoomLevel: number;
    minZoom?: number;
    maxZoom?: number;
    zoomStep?: number;
}
interface Emits {
    zoomIn: [];
    zoomOut: [];
}
const props = withDefaults(defineProps<Props>(), {
    minZoom: 0.5,
    maxZoom: 2.5,
    zoomStep: 0.25,
});
const emit = defineEmits<Emits>();
const zoomIn = () => {
    if (props.zoomLevel < props.maxZoom) {
        emit('zoomIn');
    }
};
const zoomOut = () => {
    if (props.zoomLevel > props.minZoom) {
        emit('zoomOut');
    }
};
</script>
