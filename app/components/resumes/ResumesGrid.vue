<template>
    <div class="resumes-grid">
        <ResumeCard
            v-for="resume in resumes"
            :key="resume.id"
            :resume="resume"
            :is-active="activeResumeId === resume.id"
            @edit="$emit('edit', $event)"
            @copy="$emit('copy', $event)"
            @export="$emit('export', $event)"
            @delete="$emit('delete', $event)"
            @sync="$emit('sync', $event)"
            @disable-sync="$emit('disableSync', $event)"
        />
    </div>
</template>

<script lang="ts" setup>
import ResumeCard from './ResumeCard.vue';
import type { Resume } from '~/types/resume';

interface Props {
    resumes: Resume[];
    activeResumeId: string | null;
}
defineProps<Props>();
defineEmits<{
    edit: [id: string];
    copy: [id: string];
    export: [id: string];
    delete: [id: string];
    sync: [id: string];
    disableSync: [id: string];
}>();
</script>

<style scoped>
    .resumes-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1.5rem;
    }
    @media (min-width: 768px) {
        .resumes-grid {
            grid-template-columns: repeat(2, 1fr);
        }
    }
    @media (min-width: 1024px) {
        .resumes-grid {
            grid-template-columns: repeat(3, 1fr);
        }
    }
</style>
