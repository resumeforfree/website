<script lang="ts" setup>
import { Edit, FileText, Github, HelpCircle, Mail, LogOut, User } from 'lucide-vue-next';
import { Toaster } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import 'vue-sonner/style.css';
import { getDefaultFontForLanguage } from '~/types/resume';

const { t, locale, setLocale } = useI18n();

const switchLanguage = (newLocale: string) => {
    setLocale(newLocale);
    // Update document direction immediately
    if (import.meta.client) {
        document.documentElement.dir = newLocale === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = newLocale;

        // Update font to default for new language
        const settingsStore = useSettingsStore();
        const newDefaultFont = getDefaultFontForLanguage(newLocale);
        settingsStore.setSelectedFont(newDefaultFont);
    }
};

const authStore = useAuthStore();
const handleLogout = async () => {
    await authStore.logout();
};
onMounted(async () => {
    await authStore.initializeAuth();
});
</script>

<template>
    <div class="min-h-screen bg-white flex flex-col">
        <nav class="border-b border-gray-200">
            <div class="px-4 lg:px-8">
                <div class="flex justify-between items-center h-16">
                    <div class="flex items-center space-x-6">
                        <NuxtLink to="/">
                            <div class="flex items-center">
                                <span
                                    class="ml-2 text-lg md:text-xl font-semibold text-black"
                                >{{ t('homepage.heroTitle').split(' - ')[0] }}</span>
                            </div>
                        </NuxtLink>
                        <div class="flex items-center space-x-4">
                            <NuxtLink
                                class="flex items-center space-x-1 md:space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                                to="/resumes"
                            >
                                <FileText class="w-4 h-4" />
                                <span class="hidden sm:inline text-sm font-medium">{{ t('navigation.resumes', 'Your Resumes') }}</span>
                            </NuxtLink>
                            <NuxtLink
                                class="flex items-center space-x-1 md:space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                                to="/builder"
                            >
                                <Edit class="w-4 h-4" />
                                <span class="hidden sm:inline text-sm font-medium">{{ t('navigation.builder') }}</span>
                            </NuxtLink>
                        </div>
                    </div>
                    <div class="flex items-center space-x-2 md:space-x-6">
                        <template v-if="!authStore.isLoggedIn">
                            <NuxtLink to="/auth/login">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    class="text-gray-600 hover:text-gray-900"
                                >
                                    <User class="w-4 h-4 mr-1" />
                                    <span class="hidden sm:inline">Sign In</span>
                                </Button>
                            </NuxtLink>
                            <NuxtLink to="/auth/register">
                                <Button
                                    size="sm"
                                >
                                    <span class="text-sm">Sign Up</span>
                                </Button>
                            </NuxtLink>
                        </template>
                        <template v-else>
                            <NuxtLink
                                to="/profile"
                                class="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                <User class="w-4 h-4" />
                                <span class="hidden sm:inline">{{ authStore.currentUser?.name || authStore.currentUser?.email }}</span>
                            </NuxtLink>
                            <Button
                                variant="ghost"
                                size="sm"
                                class="text-gray-600 hover:text-gray-900"
                                @click="handleLogout"
                            >
                                <LogOut class="w-4 h-4 mr-1" />
                                <span class="hidden sm:inline">Sign Out</span>
                            </Button>
                        </template>
                        <div class="h-4 w-px bg-gray-300 hidden md:block" />
                        <NuxtLink
                            class="flex items-center space-x-1 md:space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                            to="/contact"
                        >
                            <Mail class="w-4 h-4" />
                            <span class="hidden sm:inline text-sm font-medium">{{ t('navigation.contact', 'Contact') }}</span>
                        </NuxtLink>
                        <NuxtLink
                            class="flex items-center space-x-1 md:space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                            target="_blank"
                            to="/qa"
                        >
                            <HelpCircle class="w-4 h-4" />
                            <span class="hidden sm:inline text-sm font-medium">{{ t('navigation.qa') }}</span>
                        </NuxtLink>
                        <a
                            class="flex items-center space-x-1 md:space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                            href="https://github.com/imkonsowa/resume-builder"
                            rel="noopener noreferrer"
                            target="_blank"
                        >
                            <Github class="w-4 h-4" />
                            <span class="hidden sm:inline text-sm font-medium">{{ t('navigation.github', 'GitHub') }}</span>
                        </a>

                        <!-- Language Selector -->
                        <div class="relative">
                            <select
                                :value="locale"
                                class="flex items-center space-x-1 md:space-x-2 text-gray-600 hover:text-gray-900 transition-colors bg-transparent border-none text-sm font-medium cursor-pointer"
                                @change="switchLanguage($event.target.value)"
                            >
                                <option value="en">
                                    English
                                </option>
                                <option value="ar">
                                    العربية
                                </option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
        <main class="flex-1">
            <slot />
        </main>
        <footer
            v-if="$route.path !== '/builder'"
            class="bg-gray-50 border-t border-gray-200 mt-auto"
        >
            <div class="px-4 lg:px-8 py-6">
                <div class="text-center space-y-3">
                    <p class="text-sm text-gray-600">
                        Built by <a
                            class="font-medium text-gray-900 hover:text-blue-600 transition-colors"
                            href="https://konsowa.com"
                            rel="noopener noreferrer"
                            target="_blank"
                        >Ibrahim
                            Konsowa</a>
                    </p>
                    <div class="flex items-center justify-center space-x-2 text-xs text-gray-500">
                        <span>Powered by</span>
                        <a
                            class="text-gray-700 hover:text-blue-600 transition-colors"
                            href="https://github.com/Myriad-Dreamin/typst.ts"
                            rel="noopener noreferrer"
                            target="_blank"
                        >Typst.ts</a>
                        <span>&</span>
                        <a
                            class="text-gray-700 hover:text-blue-600 transition-colors"
                            href="https://nuxt.com"
                            rel="noopener noreferrer"
                            target="_blank"
                        >Nuxt</a>
                    </div>
                </div>
            </div>
        </footer>
        <ClientOnly>
            <Toaster position="top-right" />
        </ClientOnly>
    </div>
</template>
