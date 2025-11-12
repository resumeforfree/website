import { defineStore } from 'pinia';
import type { AppSettings } from '~/types/resume';
import { defaultAppSettings, getFontsForLanguage } from '~/types/resume';

export const useSettingsStore = defineStore('settings', {
    state: () => ({
        settings: { ...defaultAppSettings } as AppSettings,
        lastUpdated: Date.now() as number,
        isSyncing: false as boolean,
        lastSyncTime: null as number | null,
        lastSyncError: null as string | null,
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
        updateTimestamp() {
            this.lastUpdated = Date.now();
        },
        setSelectedFont(font: string) {
            this.settings.selectedFont = font;
            this.updateTimestamp();
        },
        setFontSize(size: number) {
            this.settings.fontSize = size;
            this.updateTimestamp();
        },
        setSelectedTemplate(template: string) {
            this.settings.selectedTemplate = template;
            this.updateTimestamp();
        },
        toggleRawMode() {
            this.settings.isRawMode = !this.settings.isRawMode;
            this.updateTimestamp();
        },
        setIsRawMode(value: boolean) {
            this.settings.isRawMode = value;
            this.updateTimestamp();
        },
        setShowDownloadMenu(value: boolean) {
            this.settings.showDownloadMenu = value;
            this.updateTimestamp();
        },
        setShowFontMenu(value: boolean) {
            this.settings.showFontMenu = value;
            this.updateTimestamp();
        },
        setShowTemplateMenu(value: boolean) {
            this.settings.showTemplateMenu = value;
            this.updateTimestamp();
        },
        closeAllMenus() {
            this.settings.showDownloadMenu = false;
            this.settings.showFontMenu = false;
            this.settings.showTemplateMenu = false;
            this.updateTimestamp();
        },
        resetSettings() {
            this.settings = { ...defaultAppSettings };
            this.updateTimestamp();
        },
        updateSettings(newSettings: Partial<AppSettings>) {
            this.settings = { ...this.settings, ...newSettings };
            this.updateTimestamp();
        },
        toggleSectionCollapse(sectionKey: string) {
            if (!this.settings.sectionCollapsed) {
                this.settings.sectionCollapsed = {};
            }
            this.settings.sectionCollapsed[sectionKey] = !this.settings.sectionCollapsed[sectionKey];
            this.updateTimestamp();
        },
        setSectionCollapsed(sectionKey: string, collapsed: boolean) {
            if (!this.settings.sectionCollapsed) {
                this.settings.sectionCollapsed = {};
            }
            this.settings.sectionCollapsed[sectionKey] = collapsed;
            this.updateTimestamp();
        },
        collapseAllSections() {
            const sections = ['personal', 'experience', 'internships', 'education', 'skills', 'volunteering', 'projects', 'languages', 'certificates'];
            sections.forEach((section) => {
                this.setSectionCollapsed(section, true);
            });
            this.updateTimestamp();
        },
        expandAllSections() {
            const sections = ['personal', 'experience', 'internships', 'education', 'skills', 'volunteering', 'projects', 'languages', 'certificates'];
            sections.forEach((section) => {
                this.setSectionCollapsed(section, false);
            });
            this.updateTimestamp();
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
        initializeFromServer(serverSettings: AppSettings, serverUpdatedAt: string) {
            const serverTimestamp = new Date(serverUpdatedAt).getTime();
            if (serverTimestamp > this.lastUpdated) {
                this.settings = { ...serverSettings };
                this.lastUpdated = serverTimestamp;
                return true; // Server won
            }
            return false;
        },
        setIsSyncing(value: boolean) {
            this.isSyncing = value;
        },
        setLastSyncTime(time: number) {
            this.lastSyncTime = time;
        },
        setLastSyncError(error: string | null) {
            this.lastSyncError = error;
        },
    },
});
