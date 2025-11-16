<template>
    <FormContainer
        :is-empty="resumeStore.resumeData.volunteering.length === 0"
        :title="volunteeringHeader"
        :add-button-label="t('forms.volunteering.addVolunteering')"
        :empty-message="t('forms.volunteering.emptyMessage')"
        section-key="volunteering"
        @add="resumeStore.addVolunteering"
        @edit-title="(value) => setSectionHeader('volunteering', value)"
    >
        <template #header-actions>
            <SectionPlacementSelector
                :placement="resumeStore.resumeData.sectionPlacement.volunteering"
                :can-move="templateConfig.canMoveSection('volunteering')"
                @update="(value) => resumeStore.updateSectionPlacement('volunteering', value)"
            />
        </template>
        <FormCard
            v-for="(volunteering, index) in resumeStore.resumeData.volunteering"
            :key="index"
            :can-move-down="index < resumeStore.resumeData.volunteering.length - 1"
            :can-move-up="index > 0"
            :confirm-message="t('forms.volunteering.deleteConfirm.message')"
            :confirm-title="t('forms.volunteering.deleteConfirm.title')"
            :title="`Volunteering ${index + 1}`"
            @remove="resumeStore.removeVolunteering(index)"
            @move-up="resumeStore.moveVolunteering(index, index - 1)"
            @move-down="resumeStore.moveVolunteering(index, index + 1)"
        >
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div class="space-y-2">
                    <Label>{{ t('forms.volunteering.organization') }}</Label>
                    <Input
                        :model-value="volunteering.organization"
                        :placeholder="t('forms.volunteering.organization')"
                        @update:model-value="(value) => resumeStore.updateVolunteering(index, 'organization', value)"
                    />
                </div>
                <div class="space-y-2">
                    <Label>{{ t('common.position') }}</Label>
                    <Input
                        :model-value="volunteering.position"
                        :placeholder="t('common.position')"
                        @update:model-value="(value) => resumeStore.updateVolunteering(index, 'position', value)"
                    />
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div class="space-y-2">
                    <Label>{{ t('common.location') }}</Label>
                    <Input
                        :model-value="volunteering.location"
                        :placeholder="t('common.location')"
                        @update:model-value="(value) => resumeStore.updateVolunteering(index, 'location', value)"
                    />
                </div>
                <MonthYearPicker
                    :model-value="volunteering.startDate"
                    :label="t('common.startDate')"
                    @update:model-value="(value) => resumeStore.updateVolunteering(index, 'startDate', value)"
                />
                <div class="space-y-2">
                    <MonthYearPicker
                        :disabled="volunteering.isPresent"
                        :model-value="volunteering.endDate"
                        :label="t('common.endDate')"
                        @update:model-value="(value) => resumeStore.updateVolunteering(index, 'endDate', value)"
                    />
                    <div class="flex items-center space-x-2">
                        <Checkbox
                            :id="`vol-present-${index}`"
                            :model-value="volunteering.isPresent"
                            @update:model-value="(value) => {
                                resumeStore.updateVolunteering(index, 'isPresent', value);
                                if (value) resumeStore.updateVolunteering(index, 'endDate', '');
                            }"
                        />
                        <Label
                            :for="`vol-present-${index}`"
                            class="text-sm"
                        >{{ t('common.present') }}</Label>
                    </div>
                </div>
            </div>
            <AchievementsList
                :achievements="volunteering.achievements"
                @add="resumeStore.addVolunteeringAchievement(index)"
                @update="(achIndex, value) => resumeStore.updateVolunteeringAchievement(index, achIndex, value)"
                @remove="(achIndex) => resumeStore.removeVolunteeringAchievement(index, achIndex)"
                @move-up="(achIndex) => resumeStore.moveVolunteeringAchievement(index, achIndex, achIndex - 1)"
                @move-down="(achIndex) => resumeStore.moveVolunteeringAchievement(index, achIndex, achIndex + 1)"
            />
        </FormCard>
    </FormContainer>
</template>

<script lang="ts" setup>
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Checkbox } from '~/components/ui/checkbox';
import MonthYearPicker from '~/components/elements/MonthYearPicker.vue';
import FormCard from '~/components/elements/FormCard.vue';
import FormContainer from '~/components/elements/FormContainer.vue';
import AchievementsList from '~/components/forms/AchievementsList.vue';
import SectionPlacementSelector from '~/components/forms/SectionPlacementSelector.vue';

const resumeStore = useResumeStore();
const templateConfig = useTemplate();
const { t } = useI18n();
const { getSectionHeader, setSectionHeader } = useSectionHeader();
const volunteeringHeader = getSectionHeader('volunteering');
</script>
