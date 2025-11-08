/**
 * Utility functions for working with locales
 */

/**
 * Determines if a locale uses right-to-left (RTL) text direction
 * @param locale - The locale code (e.g., 'en', 'ar')
 * @returns true if the locale is RTL, false otherwise
 */
export const isRtlLocale = (locale: string): boolean => {
    // List of RTL locale codes
    // Based on ISO 639-1 codes for RTL languages
    const rtlLocales = [
        'ar', // Arabic
        'fa', // Persian (Farsi)
        'ur', // Urdu
        'yi', // Yiddish
        'ji', // Yiddish (alternative code)
        'ps', // Pashto
        'sd', // Sindhi
        'ug', // Uyghur
        'arc', // Aramaic
        'bcc', // Southern Balochi
        'bqi', // Bakhtiari
        'ckb', // Central Kurdish
        'dv', // Dhivehi
        'glk', // Gilaki
        'ku', // Kurdish
        'mzn', // Mazanderani
        'pnb', // Western Punjabi
    ];

    return rtlLocales.includes(locale.toLowerCase());
};

/**
 * Gets the text direction for a given locale
 * @param locale - The locale code (e.g., 'en', 'ar')
 * @returns 'rtl' or 'ltr'
 */
export const getLocaleDirection = (locale: string): 'rtl' | 'ltr' => {
    return isRtlLocale(locale) ? 'rtl' : 'ltr';
};
