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
            <div
                v-if="templateConfig.canMoveSection('volunteering')"
                class="flex items-center gap-2"
            >
                <span class="text-sm text-gray-600">{{ t('forms.volunteering.column') }}:</span>
                <select
                    :value="resumeStore.resumeData.sectionPlacement.volunteering"
                    class="px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    @change="(e) => resumeStore.updateSectionPlacement('volunteering', (e.target as HTMLSelectElement).value as 'left' | 'right')"
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
            <div class="space-y-4">
                <div class="flex justify-between items-center">
                    <Label>{{ t('common.achievements') }}</Label>
                    <Button
                        size="sm"
                        variant="outline"
                        @click="resumeStore.addVolunteeringAchievement(index)"
                    >
                        <Plus class="w-4 h-4 mr-2" />
                        {{ t('common.addAchievement') }}
                    </Button>
                </div>
                <div class="space-y-2">
                    <div
                        v-for="(_, achievementIndex) in volunteering.achievements"
                        :key="achievementIndex"
                        class="space-y-2"
                    >
                        <div class="flex items-center space-x-2 md:space-x-2">
                            <Input
                                :model-value="volunteering.achievements[achievementIndex].text"
                                class="flex-1"
                                :placeholder="t('common.achievementPlaceholder')"
                                @update:model-value="(value) => resumeStore.updateVolunteeringAchievement(index, achievementIndex, value)"
                                @keydown.enter="resumeStore.addVolunteeringAchievement(index)"
                            />
                            <div class="hidden md:flex items-center space-x-1">
                                <Button
                                    :disabled="achievementIndex === 0"
                                    size="sm"
                                    variant="outline"
                                    @click="resumeStore.moveVolunteeringAchievement(index, achievementIndex, achievementIndex - 1)"
                                >
                                    <ChevronUp class="w-4 h-4" />
                                </Button>
                                <Button
                                    :disabled="achievementIndex === volunteering.achievements.length - 1"
                                    size="sm"
                                    variant="outline"
                                    @click="resumeStore.moveVolunteeringAchievement(index, achievementIndex, achievementIndex + 1)"
                                >
                                    <ChevronDown class="w-4 h-4" />
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    @click="resumeStore.removeVolunteeringAchievement(index, achievementIndex)"
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
                                @click="resumeStore.moveVolunteeringAchievement(index, achievementIndex, achievementIndex - 1)"
                            >
                                <ChevronUp class="w-4 h-4" />
                            </Button>
                            <Button
                                :disabled="achievementIndex === volunteering.achievements.length - 1"
                                size="sm"
                                variant="outline"
                                @click="resumeStore.moveVolunteeringAchievement(index, achievementIndex, achievementIndex + 1)"
                            >
                                <ChevronDown class="w-4 h-4" />
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                @click="resumeStore.removeVolunteeringAchievement(index, achievementIndex)"
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
const templateConfig = useTemplate();
const { t } = useI18n();
const { getSectionHeader, setSectionHeader } = useSectionHeader();
const volunteeringHeader = getSectionHeader('volunteering');
</script>
