<template>
    <FormContainer
        :is-empty="resumeStore.resumeData.projects.length === 0"
        :title="projectsHeader"
        :add-button-label="t('forms.projects.addProject')"
        :empty-message="t('forms.projects.emptyMessage')"
        section-key="projects"
        @add="resumeStore.addProject"
        @edit-title="(value) => setSectionHeader('projects', value)"
    >
        <template #header-actions>
            <div
                v-if="templateConfig.canMoveSection('projects')"
                class="flex items-center gap-2"
            >
                <span class="text-sm text-gray-600">{{ t('forms.projects.column') }}:</span>
                <select
                    :value="resumeStore.resumeData.sectionPlacement.projects"
                    class="px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    @change="(e) => resumeStore.updateSectionPlacement('projects', (e.target as HTMLSelectElement).value as 'left' | 'right')"
                >
                    <option value="left">
                        {{ t('common.left', 'Left') }}
                    </option>
                    <option value="right">
                        {{ t('common.right', 'Right') }}
                    </option>
                </select>
            </div>
        </template>
        <FormCard
            v-for="(project, index) in resumeStore.resumeData.projects"
            :key="index"
            :can-move-down="index < resumeStore.resumeData.projects.length - 1"
            :can-move-up="index > 0"
            :confirm-message="t('forms.projects.deleteConfirm.message')"
            :confirm-title="t('forms.projects.deleteConfirm.title')"
            :title="`Project ${index + 1}`"
            @remove="resumeStore.removeProject(index)"
            @move-up="resumeStore.moveProject(index, index - 1)"
            @move-down="resumeStore.moveProject(index, index + 1)"
        >
            <div class="space-y-4">
                <div class="space-y-2">
                    <Label :for="`project-title-${index}`">{{ t('forms.projects.projectTitle') }}</Label>
                    <Input
                        :id="`project-title-${index}`"
                        :model-value="project.title"
                        :placeholder="t('forms.projects.projectTitle')"
                        @update:model-value="(value) => resumeStore.updateProject(index, 'title', value)"
                    />
                </div>
                <div class="space-y-2">
                    <Label :for="`project-url-${index}`">{{ t('forms.projects.projectUrl') }}</Label>
                    <Input
                        :id="`project-url-${index}`"
                        :model-value="project.url"
                        :placeholder="t('forms.projects.projectUrl')"
                        type="url"
                        @update:model-value="(value) => resumeStore.updateProject(index, 'url', value)"
                    />
                </div>
                <div class="space-y-2">
                    <Label :for="`project-description-${index}`">{{ t('common.description') }}</Label>
                    <Textarea
                        :id="`project-description-${index}`"
                        :model-value="project.description"
                        :placeholder="t('common.description')"
                        rows="3"
                        @update:model-value="(value) => resumeStore.updateProject(index, 'description', value)"
                    />
                </div>
            </div>
        </FormCard>
    </FormContainer>
    <ConfirmationModal
        :cancel-text="confirmation.cancelText.value"
        :confirm-text="confirmation.confirmText.value"
        :is-open="confirmation.isOpen.value"
        :message="confirmation.message.value"
        :title="confirmation.title.value"
        @cancel="confirmation.handleCancel"
        @confirm="confirmation.handleConfirm"
    />
</template>

<script lang="ts" setup>
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Textarea } from '~/components/ui/textarea';
import FormContainer from '~/components/elements/FormContainer.vue';
import FormCard from '~/components/elements/FormCard.vue';
import ConfirmationModal from '~/components/elements/ConfirmationModal.vue';

const resumeStore = useResumeStore();
const confirmation = useConfirmation();
const templateConfig = useTemplate();
const { t } = useI18n();
const { getSectionHeader, setSectionHeader } = useSectionHeader();
const projectsHeader = getSectionHeader('projects');
</script>
