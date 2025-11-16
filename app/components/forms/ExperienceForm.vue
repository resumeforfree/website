<template>
    <FormContainer
        :is-empty="resumeStore.resumeData.experiences.length === 0"
        :title="experienceHeader"
        :add-button-label="t('forms.experience.addExperience')"
        :empty-message="t('forms.experience.emptyMessage')"
        section-key="experience"
        @add="resumeStore.addExperience"
        @edit-title="(value) => setSectionHeader('experience', value)"
    >
        <FormCard
            v-for="(experience, index) in resumeStore.resumeData.experiences"
            :key="index"
            :can-move-down="index < resumeStore.resumeData.experiences.length - 1"
            :can-move-up="index > 0"
            :confirm-message="t('forms.experience.deleteConfirm.message')"
            :confirm-title="t('forms.experience.deleteConfirm.title')"
            :title="`Experience ${index + 1}`"
            @remove="resumeStore.removeExperience(index)"
            @move-up="resumeStore.moveExperience(index, index - 1)"
            @move-down="resumeStore.moveExperience(index, index + 1)"
        >
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div class="space-y-2">
                    <Label>{{ t('common.position') }}</Label>
                    <Input
                        :model-value="experience.position"
                        :placeholder="t('common.position')"
                        @update:model-value="(value) => resumeStore.updateExperience(index, 'position', value)"
                    />
                </div>
                <div class="space-y-2">
                    <Label>{{ t('common.company') }}</Label>
                    <Input
                        :model-value="experience.company"
                        :placeholder="t('common.company')"
                        @update:model-value="(value) => resumeStore.updateExperience(index, 'company', value)"
                    />
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div class="space-y-2">
                    <Label>{{ t('common.location') }}</Label>
                    <Input
                        :model-value="experience.location"
                        :placeholder="t('common.location')"
                        @update:model-value="(value) => resumeStore.updateExperience(index, 'location', value)"
                    />
                </div>
                <div class="space-y-2">
                    <Label>{{ t('common.companyUrl') }}</Label>
                    <Input
                        :model-value="experience.companyUrl || ''"
                        :placeholder="t('common.companyUrl')"
                        @update:model-value="(value) => resumeStore.updateExperience(index, 'companyUrl', value)"
                    />
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div class="space-y-2">
                    <MonthYearPicker
                        :model-value="experience.startDate"
                        :label="t('common.startDate')"
                        @update:model-value="(value) => resumeStore.updateExperience(index, 'startDate', value)"
                    />
                </div>
                <div class="space-y-2">
                    <MonthYearPicker
                        :disabled="experience.isPresent"
                        :model-value="experience.endDate"
                        :label="t('common.endDate')"
                        @update:model-value="(value) => resumeStore.updateExperience(index, 'endDate', value)"
                    />
                    <div class="flex items-center space-x-2 mt-2">
                        <Checkbox
                            :id="`present-${index}`"
                            :model-value="experience.isPresent"
                            @update:model-value="(value) => {
                                resumeStore.updateExperience(index, 'isPresent', value);
                                if (value) resumeStore.updateExperience(index, 'endDate', '');
                            }"
                        />
                        <Label
                            :for="`present-${index}`"
                            class="text-sm"
                        >{{ t('common.present') }}</Label>
                    </div>
                </div>
            </div>
            <AchievementsList
                :achievements="experience.achievements"
                @add="resumeStore.addExperienceAchievement(index)"
                @update="(achIndex, value) => resumeStore.updateExperienceAchievement(index, achIndex, value)"
                @remove="(achIndex) => resumeStore.removeExperienceAchievement(index, achIndex)"
                @move-up="(achIndex) => resumeStore.moveExperienceAchievement(index, achIndex, achIndex - 1)"
                @move-down="(achIndex) => resumeStore.moveExperienceAchievement(index, achIndex, achIndex + 1)"
            />
        </FormCard>
    </FormContainer>
</template>

<script lang="ts" setup>
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Checkbox } from '~/components/ui/checkbox';
import MonthYearPicker from '~/components/elements/MonthYearPicker.vue';
import FormCard from '~/components/elements/FormCard.vue';
import FormContainer from '~/components/elements/FormContainer.vue';
import AchievementsList from '~/components/forms/AchievementsList.vue';

const resumeStore = useResumeStore();
const { t } = useI18n();
const { getSectionHeader, setSectionHeader } = useSectionHeader();
const experienceHeader = getSectionHeader('experience');
</script>
