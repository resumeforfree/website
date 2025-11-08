<template>
    <Dialog v-model:open="isOpen">
        <DialogContent class="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Resume Settings</DialogTitle>
                <DialogDescription>
                    Customize your resume appearance
                </DialogDescription>
            </DialogHeader>
            <div class="space-y-6 py-4">
                <div class="space-y-2">
                    <Label for="template">Template</Label>
                    <Select
                        v-model="selectedTemplate"
                        @update:model-value="updateTemplate"
                    >
                        <SelectTrigger id="template">
                            <SelectValue placeholder="Select a template">
                                {{ selectedTemplateName }}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem
                                v-for="template in availableTemplates"
                                :key="template.id"
                                :value="template.id"
                            >
                                <div class="flex flex-col space-y-1">
                                    <div class="font-medium">
                                        {{ template.name }}
                                    </div>
                                    <div class="text-xs text-muted-foreground">
                                        {{ template.description }}
                                    </div>
                                </div>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                    <p class="text-sm text-muted-foreground">
                        Choose the layout template for your resume
                    </p>
                </div>
                <div class="space-y-2">
                    <Label for="font-family">Font Family</Label>
                    <Select
                        v-model="selectedFont"
                        @update:model-value="updateFont"
                    >
                        <SelectTrigger id="font-family">
                            <SelectValue placeholder="Select a font" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem
                                v-for="font in availableFonts"
                                :key="font.family"
                                :value="font.family"
                            >
                                {{ font.name }}
                            </SelectItem>
                        </SelectContent>
                    </Select>
                    <p class="text-sm text-muted-foreground">
                        Choose the font family for your resume
                    </p>
                </div>
                <div class="space-y-2">
                    <Label for="font-size">Font Size</Label>
                    <div class="flex items-center space-x-4">
                        <Slider
                            id="font-size"
                            v-model="fontSize"
                            :max="16"
                            :min="10"
                            :step="1"
                            class="flex-1"
                            @update:model-value="updateFontSize"
                        />
                        <span class="w-12 text-center font-medium">{{ fontSize[0] }}pt</span>
                    </div>
                    <p class="text-sm text-muted-foreground">
                        Adjust the base font size for your resume (default: 14pt)
                    </p>
                </div>
                <div class="space-y-2">
                    <Label for="language">Language</Label>
                    <Select
                        v-model="selectedLanguage"
                        @update:model-value="updateLanguage"
                    >
                        <SelectTrigger id="language">
                            <SelectValue placeholder="Select a language" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="en">
                                English
                            </SelectItem>
                            <SelectItem value="fr">
                                French
                            </SelectItem>
                        </SelectContent>
                    </Select>
                    <p class="text-sm text-muted-foreground">
                        Choose the language for your resume
                    </p>
                </div>
            </div>
            <DialogFooter>
                <Button
                    variant="outline"
                    @click="resetToDefaults"
                >
                    Reset to Defaults
                </Button>
                <Button @click="close">
                    Done
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '~/components/ui/dialog';
import { Button } from '~/components/ui/button';
import { Label } from '~/components/ui/label';
import { Slider } from '~/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { useSettingsStore } from '~/stores/settings';
import { availableFonts, availableTemplates } from '~/types/resume';

const props = defineProps<{
    modelValue: boolean;
}>();
const emit = defineEmits<{
    'update:modelValue': [value: boolean];
}>();
const settingsStore = useSettingsStore();
const fontSize = ref([settingsStore.fontSize]);
const selectedFont = ref(settingsStore.selectedFont);
const selectedTemplate = ref(settingsStore.selectedTemplate);
const selectedLanguage = ref(settingsStore.language);

const isOpen = computed({
    get: () => props.modelValue,
    set: value => emit('update:modelValue', value),
});
const selectedTemplateName = computed(() => {
    const template = availableTemplates.find(t => t.id === selectedTemplate.value);
    return template ? template.name : '';
});
watch(() => settingsStore.fontSize, (newSize) => {
    fontSize.value = [newSize];
});
watch(() => settingsStore.selectedFont, (newFont) => {
    selectedFont.value = newFont;
});
watch(() => settingsStore.selectedTemplate, (newTemplate) => {
    selectedTemplate.value = newTemplate;
});
watch(() => settingsStore.language, (newLanguage) => {
    selectedLanguage.value = newLanguage;
});

const updateFontSize = (value: number[]) => {
    settingsStore.setFontSize(value[0]);
};

const updateFont = (value: string) => {
    settingsStore.setSelectedFont(value);
};

const updateTemplate = (value: string) => {
    settingsStore.setSelectedTemplate(value);
};

const updateLanguage = (value: string) => {
    settingsStore.setLanguage(value);
};

const resetToDefaults = () => {
    fontSize.value = [14];
    selectedFont.value = 'Calibri';
    selectedTemplate.value = 'default';
    selectedLanguage.value = 'en';
    settingsStore.setFontSize(14);
    settingsStore.setSelectedFont('Calibri');
    settingsStore.setSelectedTemplate('default');
    settingsStore.setLanguage('en');
};
const close = () => {
    isOpen.value = false;
};
</script>
