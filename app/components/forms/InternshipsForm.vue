<template>
    <FormContainer
        :is-empty="resumeStore.resumeData.internships.length === 0"
        :title="internshipsHeader"
        :add-button-label="t('forms.internships.addInternship')"
        :empty-message="t('forms.internships.emptyMessage')"
        section-key="internships"
        @add="resumeStore.addInternship"
        @edit-title="(value) => setSectionHeader('internships', value)"
    >
        <FormCard
            v-for="(internship, index) in resumeStore.resumeData.internships"
            :key="index"
            :can-move-down="index < resumeStore.resumeData.internships.length - 1"
            :can-move-up="index > 0"
            :confirm-message="t('forms.internships.deleteConfirm.message')"
            :confirm-title="t('forms.internships.deleteConfirm.title')"
            :title="`Internship ${index + 1}`"
            @remove="resumeStore.removeInternship(index)"
            @move-up="resumeStore.moveInternship(index, index - 1)"
            @move-down="resumeStore.moveInternship(index, index + 1)"
        >
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div class="space-y-2">
                    <Label>{{ t('common.position') }}</Label>
                    <Input
                        :model-value="internship.position"
                        :placeholder="t('common.position')"
                        @update:model-value="(value) => resumeStore.updateInternship(index, 'position', value)"
                    />
                </div>
                <div class="space-y-2">
                    <Label>{{ t('common.company') }}</Label>
                    <Input
                        :model-value="internship.company"
                        :placeholder="t('common.company')"
                        @update:model-value="(value) => resumeStore.updateInternship(index, 'company', value)"
                    />
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div class="space-y-2">
                    <Label>{{ t('common.location') }}</Label>
                    <Input
                        :model-value="internship.location"
                        :placeholder="t('common.location')"
                        @update:model-value="(value) => resumeStore.updateInternship(index, 'location', value)"
                    />
                </div>
                <div class="space-y-2">
                    <Label>{{ t('common.companyUrl') }}</Label>
                    <Input
                        :model-value="internship.companyUrl || ''"
                        :placeholder="t('common.companyUrl')"
                        @update:model-value="(value) => resumeStore.updateInternship(index, 'companyUrl', value)"
                    />
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div class="space-y-2">
                    <MonthYearPicker
                        :model-value="internship.startDate"
                        :label="t('common.startDate')"
                        @update:model-value="(value) => resumeStore.updateInternship(index, 'startDate', value)"
                    />
                </div>
                <div class="space-y-2">
                    <MonthYearPicker
                        :disabled="internship.isPresent"
                        :model-value="internship.endDate"
                        :label="t('common.endDate')"
                        @update:model-value="(value) => resumeStore.updateInternship(index, 'endDate', value)"
                    />
                    <div class="flex items-center space-x-2 mt-2">
                        <Checkbox
                            :id="`present-${index}`"
                            :model-value="internship.isPresent"
                            @update:model-value="(value) => {
                                resumeStore.updateInternship(index, 'isPresent', value);
                                if (value) resumeStore.updateInternship(index, 'endDate', '');
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
                :achievements="internship.achievements"
                @add="resumeStore.addInternshipAchievement(index)"
                @update="(achIndex, value) => resumeStore.updateInternshipAchievement(index, achIndex, value)"
                @remove="(achIndex) => resumeStore.removeInternshipAchievement(index, achIndex)"
                @move-up="(achIndex) => resumeStore.moveInternshipAchievement(index, achIndex, achIndex - 1)"
                @move-down="(achIndex) => resumeStore.moveInternshipAchievement(index, achIndex, achIndex + 1)"
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
const internshipsHeader = getSectionHeader('internships');
</script>
