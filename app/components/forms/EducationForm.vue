<template>
    <FormContainer
        :is-empty="resumeStore.resumeData.education.length === 0"
        :title="educationHeader"
        :add-button-label="t('forms.education.addEducation')"
        :empty-message="t('forms.education.emptyMessage')"
        section-key="education"
        @add="resumeStore.addEducation"
        @edit-title="(value) => setSectionHeader('education', value)"
    >
        <FormCard
            v-for="(education, index) in resumeStore.resumeData.education"
            :key="index"
            :can-move-down="index < resumeStore.resumeData.education.length - 1"
            :can-move-up="index > 0"
            :confirm-message="t('forms.education.deleteConfirm.message')"
            :confirm-title="t('forms.education.deleteConfirm.title')"
            :title="`Education ${index + 1}`"
            @remove="resumeStore.removeEducation(index)"
            @move-up="resumeStore.moveEducation(index, index - 1)"
            @move-down="resumeStore.moveEducation(index, index + 1)"
        >
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div class="space-y-2">
                    <Label>{{ t('forms.education.institution') }}</Label>
                    <Input
                        :model-value="education.institution"
                        :placeholder="t('forms.education.institution')"
                        @update:model-value="(value) => resumeStore.updateEducation(index, 'institution', value)"
                    />
                </div>
                <div class="space-y-2">
                    <Label>{{ t('forms.education.degree') }}</Label>
                    <Input
                        :model-value="education.degree"
                        :placeholder="t('forms.education.degree')"
                        @update:model-value="(value) => resumeStore.updateEducation(index, 'degree', value)"
                    />
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div class="space-y-2">
                    <Label>{{ t('common.location') }}</Label>
                    <Input
                        :model-value="education.location"
                        :placeholder="t('common.location')"
                        @update:model-value="(value) => resumeStore.updateEducation(index, 'location', value)"
                    />
                </div>
                <div class="space-y-2">
                    <Label>{{ t('forms.education.graduationScore') }}</Label>
                    <Input
                        :model-value="education.graduationScore"
                        :placeholder="t('forms.education.graduationScore')"
                        @update:model-value="(value) => resumeStore.updateEducation(index, 'graduationScore', value)"
                    />
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div class="space-y-2">
                    <MonthYearPicker
                        :model-value="education.startDate"
                        :label="t('common.startDate')"
                        @update:model-value="(value) => resumeStore.updateEducation(index, 'startDate', value)"
                    />
                </div>
                <div class="space-y-2">
                    <MonthYearPicker
                        :disabled="education.isPresent"
                        :model-value="education.endDate"
                        :label="t('common.endDate')"
                        @update:model-value="(value) => resumeStore.updateEducation(index, 'endDate', value)"
                    />
                    <div class="flex items-center space-x-2 mt-2">
                        <Checkbox
                            :id="`present-${index}`"
                            :model-value="education.isPresent"
                            @update:model-value="(value) => {
                                resumeStore.updateEducation(index, 'isPresent', value);
                                if (value) resumeStore.updateEducation(index, 'endDate', '');
                            }"
                        />
                        <Label
                            :for="`present-${index}`"
                            class="text-sm"
                        >{{ t('common.present') }}</Label>
                    </div>
                </div>
            </div>
            <div class="space-y-2">
                <Label>{{ t('common.description') }}</Label>
                <Textarea
                    :model-value="education.description"
                    :placeholder="t('common.description')"
                    rows="3"
                    @update:model-value="(value) => resumeStore.updateEducation(index, 'description', value)"
                />
            </div>
        </FormCard>
    </FormContainer>
</template>

<script lang="ts" setup>
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Textarea } from '~/components/ui/textarea';
import { Checkbox } from '~/components/ui/checkbox';
import MonthYearPicker from '~/components/elements/MonthYearPicker.vue';
import FormCard from '~/components/elements/FormCard.vue';
import FormContainer from '~/components/elements/FormContainer.vue';

const resumeStore = useResumeStore();
const { t } = useI18n();
const { getSectionHeader, setSectionHeader } = useSectionHeader();
const educationHeader = getSectionHeader('education');
</script>
