import { defineStore } from 'pinia';
import type { AppSettings } from '~/types/resume';
import { defaultAppSettings, getFontsForLanguage } from '~/types/resume';

export const useSettingsStore = defineStore('settings', {
    state: () => ({
        settings: { ...defaultAppSettings } as AppSettings,
    }),
    persist: true,
    getters: {
        selectedFont: state => state.settings.selectedFont,
        selectedTemplate: state => state.settings.selectedTemplate,
        availableFontsForCurrentLanguage: () => {
            const { locale } = useI18n();
            return getFontsForLanguage(locale.value);
        },
        isRawMode: state => state.settings.isRawMode,
        showDownloadMenu: state => state.settings.showDownloadMenu,
        showFontMenu: state => state.settings.showFontMenu,
        showTemplateMenu: state => state.settings.showTemplateMenu,
        fontSize: state => state.settings.fontSize ?? 14,
        sectionCollapsed: state => state.settings.sectionCollapsed || {},
    },
    actions: {
        setSelectedFont(font: string) {
            this.settings.selectedFont = font;
        },
        setFontSize(size: number) {
            this.settings.fontSize = size;
        },
        setSelectedTemplate(template: string) {
            this.settings.selectedTemplate = template;
        },
        toggleRawMode() {
            this.settings.isRawMode = !this.settings.isRawMode;
        },
        setIsRawMode(value: boolean) {
            this.settings.isRawMode = value;
        },
        setShowDownloadMenu(value: boolean) {
            this.settings.showDownloadMenu = value;
        },
        setShowFontMenu(value: boolean) {
            this.settings.showFontMenu = value;
        },
        setShowTemplateMenu(value: boolean) {
            this.settings.showTemplateMenu = value;
        },
        closeAllMenus() {
            this.settings.showDownloadMenu = false;
            this.settings.showFontMenu = false;
            this.settings.showTemplateMenu = false;
        },
        resetSettings() {
            this.settings = { ...defaultAppSettings };
        },
        updateSettings(newSettings: Partial<AppSettings>) {
            this.settings = { ...this.settings, ...newSettings };
        },
        toggleSectionCollapse(sectionKey: string) {
            if (!this.settings.sectionCollapsed) {
                this.settings.sectionCollapsed = {};
            }
            this.settings.sectionCollapsed[sectionKey] = !this.settings.sectionCollapsed[sectionKey];
        },
        setSectionCollapsed(sectionKey: string, collapsed: boolean) {
            if (!this.settings.sectionCollapsed) {
                this.settings.sectionCollapsed = {};
            }
            this.settings.sectionCollapsed[sectionKey] = collapsed;
        },
        collapseAllSections() {
            const sections = ['personal', 'experience', 'internships', 'education', 'skills', 'volunteering', 'projects', 'languages', 'certificates'];
            sections.forEach((section) => {
                this.setSectionCollapsed(section, true);
            });
        },
        expandAllSections() {
            const sections = ['personal', 'experience', 'internships', 'education', 'skills', 'volunteering', 'projects', 'languages', 'certificates'];
            sections.forEach((section) => {
                this.setSectionCollapsed(section, false);
            });
        },
        initialize() {
            if (!this.settings.sectionCollapsed || Object.keys(this.settings.sectionCollapsed).length === 0) {
                this.settings.sectionCollapsed = {
                    personal: false,
                    experience: true,
                    internships: true,
                    education: true,
                    skills: true,
                    volunteering: true,
                    projects: true,
                    languages: true,
                    certificates: true,
                };
            }
        },
    },
});
