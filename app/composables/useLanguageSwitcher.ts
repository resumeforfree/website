import { getDefaultFontForLanguage } from '~/types/resume';

/**
 * Composable for handling language switching throughout the application
 * Provides a centralized way to switch languages with proper RTL/LTR direction handling
 */
export const useLanguageSwitcher = () => {
    const { setLocale, locales } = useI18n();
    const settingsStore = useSettingsStore();

    /**
     * Switch to a new language and update document direction
     * @param newLocale - The locale code to switch to (e.g., 'en', 'ar')
     */
    const switchLanguage = (newLocale: string) => {
        setLocale(newLocale);

        // Update document direction immediately
        if (import.meta.client) {
            const localeConfig = locales.value.find(l => l.code === newLocale);
            const dir = localeConfig?.dir || 'ltr';

            document.documentElement.dir = dir;
            document.documentElement.lang = newLocale;

            // Update font to default for new language
            const newDefaultFont = getDefaultFontForLanguage(newLocale);
            settingsStore.setSelectedFont(newDefaultFont);
        }
    };

    return { switchLanguage };
};
