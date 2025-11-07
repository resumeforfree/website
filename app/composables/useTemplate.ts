import type { Template, TemplateLayoutConfig } from '~/templates/default';
import { defaultTemplate } from '~/templates/default';
import { compactTemplate } from '~/templates/compact';

export const useTemplate = () => {
    const settingsStore = useSettingsStore();
    const getCurrentTemplate = (): Template => {
        const templateId = settingsStore.selectedTemplate;
        switch (templateId) {
            case 'default':
                return defaultTemplate;
            case 'compact':
                return compactTemplate;
            default:
                return defaultTemplate;
        }
    };
    const getCurrentLayoutConfig = (): TemplateLayoutConfig => {
        return getCurrentTemplate().layoutConfig;
    };
    const isCurrentTemplateTwoColumn = (): boolean => {
        return getCurrentLayoutConfig().isTwoColumn;
    };
    const getMovableSections = (): string[] => {
        return getCurrentLayoutConfig().movableSections || [];
    };
    const canMoveSection = (sectionName: string): boolean => {
        const movableSections = getMovableSections();
        return movableSections.includes(sectionName);
    };
    return {
        getCurrentTemplate,
        getCurrentLayoutConfig,
        isCurrentTemplateTwoColumn,
        getMovableSections,
        canMoveSection,
    };
};
