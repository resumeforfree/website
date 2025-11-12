<template>
    <FormContainer
        :is-empty="resumeStore.resumeData.skills.length === 0"
        :title="skillsHeader"
        :add-button-label="t('forms.skills.addSkill')"
        :empty-message="t('forms.skills.emptyMessage')"
        section-key="skills"
        @add="resumeStore.addSkill"
        @edit-title="(value) => setSectionHeader('skills', value)"
    >
        <template #header-actions>
            <div
                v-if="templateConfig.canMoveSection('skills')"
                class="flex items-center gap-2"
            >
                <span class="text-sm text-gray-600">{{ t('forms.skills.column') }}:</span>
                <select
                    :value="resumeStore.resumeData.sectionPlacement.skills"
                    class="px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    @change="(e) => resumeStore.updateSectionPlacement('skills', (e.target as HTMLSelectElement).value as 'left' | 'right')"
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
            v-for="(skill, index) in resumeStore.resumeData.skills"
            :key="index"
            :can-move-down="index < resumeStore.resumeData.skills.length - 1"
            :can-move-up="index > 0"
            :confirm-message="t('forms.skills.deleteConfirm.message')"
            :confirm-title="t('forms.skills.deleteConfirm.title')"
            :title="`Skill ${index + 1}`"
            @remove="resumeStore.removeSkill(index)"
            @move-up="resumeStore.moveSkill(index, index - 1)"
            @move-down="resumeStore.moveSkill(index, index + 1)"
        >
            <div class="space-y-4">
                <div class="space-y-2">
                    <Label>{{ t('forms.skills.skillTitle') }}</Label>
                    <Input
                        :model-value="skill.title"
                        :placeholder="t('forms.skills.skillTitle')"
                        @update:model-value="(value) => resumeStore.updateSkill(index, 'title', value)"
                    />
                </div>
                <div class="space-y-2">
                    <Label>{{ t('common.description') }}</Label>
                    <Textarea
                        :model-value="skill.description"
                        :placeholder="t('common.description')"
                        rows="3"
                        @update:model-value="(value) => resumeStore.updateSkill(index, 'description', value)"
                    />
                </div>
            </div>
        </FormCard>
    </FormContainer>
</template>

<script lang="ts" setup>
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Textarea } from '~/components/ui/textarea';
import FormCard from '~/components/elements/FormCard.vue';
import FormContainer from '~/components/elements/FormContainer.vue';

const resumeStore = useResumeStore();
const templateConfig = useTemplate();
const { t } = useI18n();
const { getSectionHeader, setSectionHeader } = useSectionHeader();
const skillsHeader = getSectionHeader('skills');
</script>
