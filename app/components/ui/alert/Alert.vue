<script lang="ts" setup>
import type {HTMLAttributes} from 'vue';
import {cn} from '~/lib/utils';
import {type AlertVariants, alertVariants} from './index';

const props = defineProps<{
    class?: HTMLAttributes['class']
    variant?: AlertVariants['variant']
}>();
</script>

<template>
    <div
        :class="cn(alertVariants({ variant }), props.class)"
        data-slot="alert"
        role="alert"
    >
        <slot/>
    </div>
</template>
