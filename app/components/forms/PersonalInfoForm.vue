<template>
    <FormContainer
        :editable="false"
        :is-empty="false"
        :show-add-button="false"
        add-button-label=""
        empty-message=""
        :title="t('forms.personalInfo.title')"
        section-key="personal"
    >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
                <Label for="firstName">{{ t('forms.personalInfo.firstName') }}</Label>
                <Input
                    id="firstName"
                    :model-value="resumeStore.resumeData.firstName"
                    :placeholder="t('forms.personalInfo.firstName')"
                    @update:model-value="(value) => resumeStore.updateField('firstName', value)"
                />
            </div>
            <div class="space-y-2">
                <Label for="lastName">{{ t('forms.personalInfo.lastName') }}</Label>
                <Input
                    id="lastName"
                    :model-value="resumeStore.resumeData.lastName"
                    :placeholder="t('forms.personalInfo.lastName')"
                    @update:model-value="(value) => resumeStore.updateField('lastName', value)"
                />
            </div>
            <div class="space-y-2">
                <Label for="position">{{ t('forms.personalInfo.position') }}</Label>
                <Input
                    id="position"
                    :model-value="resumeStore.resumeData.position"
                    :placeholder="t('forms.personalInfo.position')"
                    @update:model-value="(value) => resumeStore.updateField('position', value)"
                />
            </div>
            <div class="space-y-2">
                <Label for="location">{{ t('forms.personalInfo.location') }}</Label>
                <Input
                    id="location"
                    :model-value="resumeStore.resumeData.location"
                    :placeholder="t('forms.personalInfo.location')"
                    @update:model-value="(value) => resumeStore.updateField('location', value)"
                />
            </div>
        </div>
        <div class="mt-6 space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                    <Label for="email">{{ t('forms.personalInfo.email') }}</Label>
                    <Input
                        id="email"
                        :model-value="resumeStore.resumeData.email"
                        :placeholder="t('forms.personalInfo.email')"
                        type="email"
                        @update:model-value="(value) => resumeStore.updateField('email', value)"
                    />
                </div>
                <div class="space-y-2">
                    <Label for="phone">{{ t('forms.personalInfo.phone') }}</Label>
                    <Input
                        id="phone"
                        :model-value="resumeStore.resumeData.phone"
                        :placeholder="t('forms.personalInfo.phone')"
                        type="tel"
                        @update:model-value="(value) => resumeStore.updateField('phone', value)"
                    />
                </div>
            </div>
        </div>
        <div class="mt-6 space-y-4">
            <EditableHeader
                :value="t('forms.personalInfo.summary')"
                @update="(value) => resumeStore.updateSectionHeader('profile', value)"
            />
            <div class="space-y-2">
                <Textarea
                    id="summary"
                    :model-value="resumeStore.resumeData.summary"
                    :placeholder="t('forms.personalInfo.summary')"
                    rows="4"
                    @update:model-value="(value) => resumeStore.updateField('summary', value)"
                />
            </div>
        </div>
        <div class="mt-6 space-y-4">
            <div class="flex justify-between items-center">
                <EditableHeader
                    :value="t('forms.personalInfo.socialLinks')"
                    @update="(value) => resumeStore.updateSectionHeader('socialLinks', value)"
                />
                <Button
                    size="sm"
                    variant="outline"
                    @click="resumeStore.addSocialLink"
                >
                    <Plus class="w-4 h-4 mr-2" />
                    {{ t('forms.personalInfo.addSocialLink') }}
                </Button>
            </div>
            <div class="space-y-3">
                <div
                    v-for="(link, linkIndex) in resumeStore.resumeData.socialLinks"
                    :key="linkIndex"
                    class="space-y-2"
                >
                    <div class="flex items-center space-x-2 md:space-x-2">
                        <div class="flex-none">
                            <component
                                :is="getPlatformIcon(link.platform)"
                                class="w-5 h-5 text-gray-600"
                            />
                        </div>
                        <div class="w-32 md:w-40">
                            <select
                                :value="link.platform"
                                class="w-full px-3 py-2 border rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                                @change="(e) => resumeStore.updateSocialLink(linkIndex, 'platform', (e.target as HTMLSelectElement).value)"
                            >
                                <option
                                    v-for="platform in SOCIAL_PLATFORMS"
                                    :key="platform.value"
                                    :value="platform.value"
                                >
                                    {{ platform.label }}
                                </option>
                            </select>
                        </div>
                        <div class="flex-1">
                            <Input
                                :model-value="link.url"
                                :placeholder="t('forms.personalInfo.url')"
                                type="url"
                                @update:model-value="(value) => resumeStore.updateSocialLink(linkIndex, 'url', value)"
                            />
                        </div>
                        <div
                            v-if="link.platform === 'other'"
                            class="w-32"
                        >
                            <Input
                                :model-value="link.customLabel || ''"
                                :placeholder="t('forms.personalInfo.customLabel')"
                                @update:model-value="(value) => resumeStore.updateSocialLink(linkIndex, 'customLabel', value)"
                            />
                        </div>
                        <div class="hidden md:flex items-center space-x-1">
                            <Button
                                :disabled="linkIndex === 0"
                                size="sm"
                                variant="outline"
                                @click="resumeStore.moveSocialLink(linkIndex, linkIndex - 1)"
                            >
                                <ChevronUp class="w-4 h-4" />
                            </Button>
                            <Button
                                :disabled="linkIndex === resumeStore.resumeData.socialLinks.length - 1"
                                size="sm"
                                variant="outline"
                                @click="resumeStore.moveSocialLink(linkIndex, linkIndex + 1)"
                            >
                                <ChevronDown class="w-4 h-4" />
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                @click="handleRemoveSocialLink(linkIndex)"
                            >
                                <Trash2 class="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                    <div class="flex md:hidden items-center justify-center space-x-2">
                        <Button
                            :disabled="linkIndex === 0"
                            size="sm"
                            variant="outline"
                            @click="resumeStore.moveSocialLink(linkIndex, linkIndex - 1)"
                        >
                            <ChevronUp class="w-4 h-4" />
                        </Button>
                        <Button
                            :disabled="linkIndex === resumeStore.resumeData.socialLinks.length - 1"
                            size="sm"
                            variant="outline"
                            @click="resumeStore.moveSocialLink(linkIndex, linkIndex + 1)"
                        >
                            <ChevronDown class="w-4 h-4" />
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            @click="handleRemoveSocialLink(linkIndex)"
                        >
                            <Trash2 class="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
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
import { Button } from '~/components/ui/button';
import {
    BookOpen,
    ChevronDown,
    ChevronUp,
    Dribbble,
    Edit3,
    Github,
    Globe,
    Link,
    Linkedin,
    Plus,
    Trash2,
    Twitter,
} from 'lucide-vue-next';
import FormContainer from '~/components/elements/FormContainer.vue';
import ConfirmationModal from '~/components/elements/ConfirmationModal.vue';
import EditableHeader from '~/components/elements/EditableHeader.vue';

const { t } = useI18n();

const SOCIAL_PLATFORMS = computed(() => [
    { value: 'linkedin', label: t('platforms.linkedin'), icon: Linkedin },
    { value: 'github', label: t('platforms.github'), icon: Github },
    { value: 'twitter', label: t('platforms.twitter'), icon: Twitter },
    { value: 'portfolio', label: t('platforms.portfolio'), icon: Globe },
    { value: 'dribbble', label: t('platforms.dribbble'), icon: Dribbble },
    { value: 'medium', label: t('platforms.medium'), icon: BookOpen },
    { value: 'devto', label: t('platforms.devto'), icon: Edit3 },
    { value: 'personal', label: t('platforms.personal'), icon: Globe },
    { value: 'other', label: t('platforms.other'), icon: Link },
]);

const resumeStore = useResumeStore();
const confirmation = useConfirmation();
const getPlatformIcon = (platform: string) => {
    const found = SOCIAL_PLATFORMS.value.find(p => p.value === platform);
    return found?.icon || Link;
};
const handleRemoveSocialLink = async (index: number) => {
    const confirmed = await confirmation.confirm({
        title: 'Delete Social Link',
        message: 'Are you sure you want to delete this social link? This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel',
    });
    if (confirmed) {
        resumeStore.removeSocialLink(index);
    }
};
</script>
