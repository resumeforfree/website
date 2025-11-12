<template>
    <FormContainer
        :is-empty="(resumeStore.resumeData.certificates?.length || 0) === 0"
        :title="certificatesHeader"
        :add-button-label="t('forms.certificates.addCertificate')"
        :empty-message="t('forms.certificates.emptyMessage')"
        section-key="certificates"
        collapsible
        @add="resumeStore.addCertificate"
        @edit-title="(value) => setSectionHeader('certificates', value)"
    >
        <template #header-actions>
            <div
                v-if="templateConfig.canMoveSection('certificates')"
                class="flex items-center gap-2"
            >
                <span class="text-sm text-gray-600">{{ t('forms.certificates.column') }}:</span>
                <select
                    :value="resumeStore.resumeData.sectionPlacement.certificates"
                    class="px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    @change="(e) => resumeStore.updateSectionPlacement('certificates', (e.target as HTMLSelectElement).value as 'left' | 'right')"
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
            v-for="(certificate, index) in (resumeStore.resumeData.certificates || [])"
            :key="index"
            :can-move-down="index < (resumeStore.resumeData.certificates?.length || 0) - 1"
            :can-move-up="index > 0"
            :confirm-message="t('forms.certificates.deleteConfirm.message')"
            :confirm-title="t('forms.certificates.deleteConfirm.title')"
            :title="`Certificate ${index + 1}`"
            @remove="resumeStore.removeCertificate(index)"
            @move-up="resumeStore.moveCertificate(index, index - 1)"
            @move-down="resumeStore.moveCertificate(index, index + 1)"
        >
            <div class="space-y-4">
                <div class="space-y-2">
                    <Label :for="`certificate-title-${index}`">{{ t('forms.certificates.certificateTitle') }}</Label>
                    <Input
                        :id="`certificate-title-${index}`"
                        :model-value="certificate.title"
                        :placeholder="t('forms.certificates.certificateTitle')"
                        @update:model-value="(value) => resumeStore.updateCertificate(index, 'title', value)"
                    />
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="space-y-2">
                        <Label :for="`certificate-issuer-${index}`">{{ t('forms.certificates.issuer') }}</Label>
                        <Input
                            :id="`certificate-issuer-${index}`"
                            :model-value="certificate.issuer"
                            :placeholder="t('forms.certificates.issuer')"
                            @update:model-value="(value) => resumeStore.updateCertificate(index, 'issuer', value)"
                        />
                    </div>
                    <div class="space-y-2">
                        <MonthYearPicker
                            :model-value="certificate.date"
                            :label="t('forms.certificates.date')"
                            @update:model-value="(value) => resumeStore.updateCertificate(index, 'date', value)"
                        />
                    </div>
                </div>
                <div class="space-y-2">
                    <Label :for="`certificate-url-${index}`">{{ t('forms.certificates.url') }}</Label>
                    <Input
                        :id="`certificate-url-${index}`"
                        :model-value="certificate.url || ''"
                        :placeholder="t('forms.certificates.url')"
                        type="url"
                        @update:model-value="(value) => resumeStore.updateCertificate(index, 'url', value)"
                    />
                </div>
                <div class="space-y-2">
                    <Label :for="`certificate-description-${index}`">{{ t('common.description') }}</Label>
                    <Textarea
                        :id="`certificate-description-${index}`"
                        :model-value="certificate.description || ''"
                        :placeholder="t('common.description')"
                        rows="3"
                        @update:model-value="(value) => resumeStore.updateCertificate(index, 'description', value)"
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
import MonthYearPicker from '~/components/elements/MonthYearPicker.vue';
import FormContainer from '~/components/elements/FormContainer.vue';
import FormCard from '~/components/elements/FormCard.vue';
import ConfirmationModal from '~/components/elements/ConfirmationModal.vue';

const resumeStore = useResumeStore();
const confirmation = useConfirmation();
const templateConfig = useTemplate();
const { t } = useI18n();
const { getSectionHeader, setSectionHeader } = useSectionHeader();
const certificatesHeader = getSectionHeader('certificates');
</script>
