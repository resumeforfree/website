import { computed } from 'vue';
import type { SectionHeaders } from '~/types/resume';

/**
 * Mapping of section keys to their i18n translation keys
 * Used for fallback when custom section headers are not set
 */
export const SECTION_TRANSLATION_MAP: Record<keyof SectionHeaders, string> = {
    personalInfo: 'forms.personalInfo.title',
    profile: 'forms.personalInfo.summary',
    info: 'forms.personalInfo.title',
    socialLinks: 'forms.personalInfo.socialLinks',
    projects: 'forms.projects.title',
    languages: 'forms.languages.title',
    experience: 'forms.experience.title',
    internships: 'forms.internships.title',
    education: 'forms.education.title',
    skills: 'forms.skills.title',
    volunteering: 'forms.volunteering.title',
    certificates: 'forms.certificates.title',
} as const;

/**
 * Composable for managing localized section headers
 * Handles both custom user headers and default translations
 *
 * Priority order:
 * 1. Custom header for current locale (from sectionHeadersI18n)
 * 2. Default translation key (from SECTION_TRANSLATION_MAP)
 */
export function useSectionHeader() {
    const { t, locale } = useI18n();
    const resumeStore = useResumeStore();

    /**
     * Get the localized section header for a given section
     * Returns a computed ref that automatically updates when locale changes
     */
    const getSectionHeader = (section: keyof SectionHeaders) => {
        return computed(() => {
            const data = resumeStore.resumeData;

            // Priority 1: Check if user has customized this header for current locale
            const customHeader = data.sectionHeadersI18n?.[locale.value]?.[section];
            if (customHeader) {
                return customHeader as string;
            }

            // Priority 2: Use default translation key
            const translationKey = SECTION_TRANSLATION_MAP[section];
            return translationKey ? t(translationKey) : '';
        });
    };

    /**
     * Set a custom header for a section in the current locale
     * @param section - The section key to update
     * @param value - The custom header value
     */
    const setSectionHeader = (section: keyof SectionHeaders, value: string) => {
        resumeStore.updateSectionHeader(section, value, locale.value);
    };

    return {
        getSectionHeader,
        setSectionHeader,
    };
}
