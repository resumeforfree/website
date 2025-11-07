<template>
    <FormContainer
        :is-empty="resumeStore.resumeData.experiences.length === 0"
        :title="t('forms.experience.title')"
        :add-button-label="t('forms.experience.addExperience')"
        :empty-message="t('forms.experience.emptyMessage')"
        section-key="experience"
        @add="resumeStore.addExperience"
        @edit-title="(value) => resumeStore.updateSectionHeader('experience', value)"
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
                    <Label>{{ t('forms.experience.position') }}</Label>
                    <Input
                        :model-value="experience.position"
                        :placeholder="t('forms.experience.position')"
                        @update:model-value="(value) => resumeStore.updateExperience(index, 'position', value)"
                    />
                </div>
                <div class="space-y-2">
                    <Label>{{ t('forms.experience.company') }}</Label>
                    <Input
                        :model-value="experience.company"
                        :placeholder="t('forms.experience.company')"
                        @update:model-value="(value) => resumeStore.updateExperience(index, 'company', value)"
                    />
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div class="space-y-2">
                    <Label>{{ t('forms.experience.location') }}</Label>
                    <Input
                        :model-value="experience.location"
                        :placeholder="t('forms.experience.location')"
                        @update:model-value="(value) => resumeStore.updateExperience(index, 'location', value)"
                    />
                </div>
                <div class="space-y-2">
                    <Label>{{ t('forms.experience.companyUrl') }}</Label>
                    <Input
                        :model-value="experience.companyUrl || ''"
                        :placeholder="t('forms.experience.companyUrl')"
                        @update:model-value="(value) => resumeStore.updateExperience(index, 'companyUrl', value)"
                    />
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div class="space-y-2">
                    <MonthYearPicker
                        :model-value="experience.startDate"
                        :label="t('forms.experience.startDate')"
                        @update:model-value="(value) => resumeStore.updateExperience(index, 'startDate', value)"
                    />
                </div>
                <div class="space-y-2">
                    <MonthYearPicker
                        :disabled="experience.isPresent"
                        :model-value="experience.endDate"
                        :label="t('forms.experience.endDate')"
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
                        >{{ t('forms.experience.present') }}</Label>
                    </div>
                </div>
            </div>
            <div class="space-y-4">
                <div class="flex justify-between items-center">
                    <Label>{{ t('forms.experience.achievements') }}</Label>
                    <Button
                        size="sm"
                        variant="outline"
                        @click="resumeStore.addExperienceAchievement(index)"
                    >
                        <Plus class="w-4 h-4 mr-2" />
                        {{ t('forms.experience.addAchievement') }}
                    </Button>
                </div>
                <div class="space-y-2">
                    <div
                        v-for="(_, achievementIndex) in experience.achievements"
                        :key="achievementIndex"
                        class="space-y-2"
                    >
                        <div class="flex items-center space-x-2 md:space-x-2">
                            <Input
                                :model-value="experience.achievements[achievementIndex].text"
                                class="flex-1"
                                :placeholder="t('forms.experience.achievementPlaceholder')"
                                @update:model-value="(value) => resumeStore.updateExperienceAchievement(index, achievementIndex, value)"
                                @keydown.enter="resumeStore.addExperienceAchievement(index)"
                            />
                            <div class="hidden md:flex items-center space-x-1">
                                <Button
                                    :disabled="achievementIndex === 0"
                                    size="sm"
                                    variant="outline"
                                    @click="resumeStore.moveExperienceAchievement(index, achievementIndex, achievementIndex - 1)"
                                >
                                    <ChevronUp class="w-4 h-4" />
                                </Button>
                                <Button
                                    :disabled="achievementIndex === experience.achievements.length - 1"
                                    size="sm"
                                    variant="outline"
                                    @click="resumeStore.moveExperienceAchievement(index, achievementIndex, achievementIndex + 1)"
                                >
                                    <ChevronDown class="w-4 h-4" />
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    @click="resumeStore.removeExperienceAchievement(index, achievementIndex)"
                                >
                                    <Trash2 class="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                        <div class="flex md:hidden items-center justify-center space-x-2">
                            <Button
                                :disabled="achievementIndex === 0"
                                size="sm"
                                variant="outline"
                                @click="resumeStore.moveExperienceAchievement(index, achievementIndex, achievementIndex - 1)"
                            >
                                <ChevronUp class="w-4 h-4" />
                            </Button>
                            <Button
                                :disabled="achievementIndex === experience.achievements.length - 1"
                                size="sm"
                                variant="outline"
                                @click="resumeStore.moveExperienceAchievement(index, achievementIndex, achievementIndex + 1)"
                            >
                                <ChevronDown class="w-4 h-4" />
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                @click="resumeStore.removeExperienceAchievement(index, achievementIndex)"
                            >
                                <Trash2 class="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </FormCard>
    </FormContainer>
</template>

<script lang="ts" setup>
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Checkbox } from '~/components/ui/checkbox';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-vue-next';
import MonthYearPicker from '~/components/elements/MonthYearPicker.vue';
import FormCard from '~/components/elements/FormCard.vue';
import FormContainer from '~/components/elements/FormContainer.vue';

const resumeStore = useResumeStore();
const { t } = useI18n();
</script>
