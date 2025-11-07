import tailwindcss from '@tailwindcss/vite';

// https://nuxt.com/docs/api/configuration/nuxt-config
// eslint-disable-next-line no-undef
export default defineNuxtConfig({
    modules: [
        'shadcn-nuxt',
        '@pinia/nuxt',
        'pinia-plugin-persistedstate/nuxt',
        '@nuxt/eslint',
        '@vite-pwa/nuxt',
        '@nuxtjs/i18n',
        'nitro-cloudflare-dev',
        '@nuxtjs/turnstile',
    ],

    imports: {
        dirs: ['stores'],
    },
    devtools: { enabled: false },

    app: {
        head: {
            link: [
                { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
                { rel: 'canonical', href: 'https://resumeforfree.com' },
            ],
            meta: [
                { charset: 'utf-8' },
                { name: 'viewport', content: 'width=device-width, initial-scale=1' },
                { name: 'format-detection', content: 'telephone=no' },
                { name: 'robots', content: 'index, follow' },
                { name: 'author', content: 'Resume Builder' },
                { name: 'theme-color', content: '#3b82f6' },
            ],
        },
    },

    css: ['~/assets/css/tailwind.css', '~/assets/css/app.css'],

    site: {
        url: 'https://resumeforfree.com',
        name: 'Resume Builder',
        description: 'Build professional resumes for free. No servers, no registration, no payments. Unlimited downloads and resumes with complete privacy.',
        defaultLocale: 'en',
    },

    runtimeConfig: {
        public: {
            pocketbaseUrl: process.env.NODE_ENV === 'production'
                ? 'https://api.resumeforfree.com'
                : 'http://localhost:8010',
            turnstile: {
                siteKey: process.env.NUXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA',
            },
        },
        turnstile: {
            secretKey: process.env.NUXT_TURNSTILE_SECRET_KEY || '1x0000000000000000000000000000000AA',
        },
    },
    future: {
        compatibilityVersion: 4,
    },
    compatibilityDate: '2025-07-15',
    nitro: {
        preset: 'cloudflare-module',
        cloudflare: {
            d1: {
                DB: process.env.NODE_ENV === 'production' ? undefined : './dev.db',
            },
        },
    },

    vite: {
        plugins: [
            tailwindcss(),
        ],
        optimizeDeps: {
            exclude: [
                '@myriaddreamin/typst-ts-web-compiler',
                '@myriaddreamin/typst-ts-renderer',
                '@myriaddreamin/typst.ts',
            ],
        },
        build: {
            target: 'esnext',
        },
    },

    eslint: {
        config: {
            stylistic: {
                indent: 4,
                semi: true,
                quotes: 'single',
            },
        },
    },

    i18n: {
        defaultLocale: 'en',
        locales: [
            {
                code: 'en',
                name: 'English',
                file: 'en.json',
                iso: 'en-US',
                dir: 'ltr',
            },
            {
                code: 'ar',
                name: 'العربية',
                file: 'ar.json',
                iso: 'ar-SA',
                dir: 'rtl',
            },
        ],
        lazy: true,
        langDir: 'locales',
        strategy: 'no_prefix',
        detectBrowserLanguage: {
            useCookie: true,
            cookieKey: 'i18n_redirected',
            redirectOn: 'root',
        },
    },

    piniaPluginPersistedstate: {
        storage: 'localStorage',
    },

    pwa: {
        manifest: {
            name: 'Resume Builder',
            short_name: 'Resume Builder',
            description: 'Build professional resumes for free',
            theme_color: '#3b82f6',
            background_color: '#ffffff',
            display: 'standalone',
            start_url: '/',
            icons: [
                {
                    src: '/icon.svg',
                    sizes: 'any',
                    type: 'image/svg+xml',
                    purpose: 'any maskable',
                },
            ],
        },
        workbox: {
            navigateFallback: '/',
        },
        devOptions: {
            enabled: false,
        },
    },

    seo: {
        redirectToCanonicalSiteUrl: true,
    },

    shadcn: {
        prefix: '',
        componentDir: './app/components/ui',
    },
});
