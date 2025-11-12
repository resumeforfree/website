<script lang="ts" setup>
import { Edit, FileText, Github, HelpCircle, Languages, LogOut, Mail, Menu, User, X, LayoutDashboard } from 'lucide-vue-next';
import { Toaster } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import 'vue-sonner/style.css';

const { t, locale, locales } = useI18n();
const { switchLanguage } = useLanguageSwitcher();

const localesList = computed(() => {
    return locales.value.map(l => ({
        code: l.code,
        name: l.name || l.code,
    }));
});

const authStore = useAuthStore();
const settingsStore = useSettingsStore();
const isMobileMenuOpen = ref(false);
const { initializeSettingsFromServer, startSettingsSync, stopSettingsSync } = useSettingsSync();

const handleLogout = async () => {
    await authStore.logout();
    stopSettingsSync();
};

const closeMobileMenu = () => {
    isMobileMenuOpen.value = false;
};

onMounted(async () => {
    await authStore.initializeAuth();

    if (authStore.isAuthenticated) {
        await initializeSettingsFromServer();
        startSettingsSync();
    }
});

watch(
    () => authStore.isAuthenticated,
    async (isAuthenticated) => {
        if (isAuthenticated) {
            await initializeSettingsFromServer();
            startSettingsSync();
        } else {
            stopSettingsSync();
        }
    },
);
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
                                <span class="hidden sm:inline text-sm font-medium">{{
                                    t('navigation.resumes', 'Your Resumes')
                                }}</span>
                            </NuxtLink>
                            <NuxtLink
                                class="flex items-center space-x-1 md:space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                                to="/builder"
                            >
                                <Edit class="w-4 h-4" />
                                <span class="hidden sm:inline text-sm font-medium">{{ t('navigation.builder') }}</span>
                            </NuxtLink>

                            <!-- Admin Dashboard Link (only for admins) -->
                            <ClientOnly>
                                <NuxtLink
                                    v-if="authStore.user?.role === 'admin'"
                                    class="flex items-center space-x-1 md:space-x-2 text-purple-600 hover:text-purple-900 transition-colors"
                                    to="/admin"
                                >
                                    <LayoutDashboard class="w-4 h-4" />
                                    <span class="hidden sm:inline text-sm font-medium">{{ t('navigation.admin') }}</span>
                                </NuxtLink>
                            </ClientOnly>

                            <!-- Language Selector -->
                            <div class="relative flex items-center space-x-1 md:space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
                                <Languages class="w-4 h-4" />
                                <select
                                    :value="locale"
                                    class="bg-transparent border-none text-sm font-medium cursor-pointer focus:outline-none"
                                    @change="(e) => switchLanguage((e.target as HTMLSelectElement).value)"
                                >
                                    <option
                                        v-for="loc in localesList"
                                        :key="loc.code"
                                        :value="loc.code"
                                    >
                                        {{ loc.name }}
                                    </option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="hidden md:flex items-center space-x-2 md:space-x-6">
                        <ClientOnly>
                            <template v-if="!authStore.isLoggedIn">
                                <NuxtLink to="/auth/login">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        class="text-gray-600 hover:text-gray-900"
                                    >
                                        <User class="w-4 h-4 mr-1" />
                                        <span class="hidden sm:inline">{{ t('navigation.signIn') }}</span>
                                    </Button>
                                </NuxtLink>
                                <NuxtLink to="/auth/register">
                                    <Button
                                        size="sm"
                                    >
                                        <span class="text-sm">{{ t('navigation.signUp') }}</span>
                                    </Button>
                                </NuxtLink>
                            </template>
                            <template v-else>
                                <NuxtLink
                                    to="/profile"
                                    class="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                                >
                                    <User class="w-4 h-4" />
                                    <span class="hidden sm:inline">{{
                                        authStore.currentUser?.name || authStore.currentUser?.email
                                    }}</span>
                                </NuxtLink>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    class="text-gray-600 hover:text-gray-900"
                                    @click="handleLogout"
                                >
                                    <LogOut class="w-4 h-4 mr-1" />
                                    <span class="hidden sm:inline">{{ t('navigation.signOut') }}</span>
                                </Button>
                            </template>
                        </ClientOnly>
                        <div class="h-4 w-px bg-gray-300 hidden md:block" />
                        <NuxtLink
                            class="flex items-center space-x-1 md:space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                            to="/contact"
                        >
                            <Mail class="w-4 h-4" />
                            <span class="hidden sm:inline text-sm font-medium">{{
                                t('navigation.contact', 'Contact')
                            }}</span>
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
                            <span class="hidden sm:inline text-sm font-medium">{{
                                t('navigation.github', 'GitHub')
                            }}</span>
                        </a>
                    </div>
                    <!-- Mobile Menu Button -->
                    <button
                        class="md:hidden p-2 text-gray-600 hover:text-gray-900"
                        @click="isMobileMenuOpen = !isMobileMenuOpen"
                    >
                        <Menu
                            v-if="!isMobileMenuOpen"
                            class="w-6 h-6"
                        />
                        <X
                            v-else
                            class="w-6 h-6"
                        />
                    </button>
                </div>
            </div>
            <!-- Mobile Menu -->
            <div
                v-if="isMobileMenuOpen"
                class="md:hidden border-t border-gray-200 bg-white"
            >
                <div class="px-4 py-4 space-y-4">
                    <!-- Auth Section -->
                    <ClientOnly>
                        <div
                            v-if="!authStore.isLoggedIn"
                            class="flex flex-col space-y-2"
                        >
                            <NuxtLink
                                to="/auth/login"
                                @click="closeMobileMenu"
                            >
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    class="w-full justify-start text-gray-600 hover:text-gray-900"
                                >
                                    <User class="w-4 h-4 mr-2" />
                                    {{ t('navigation.signIn') }}
                                </Button>
                            </NuxtLink>
                            <NuxtLink
                                to="/auth/register"
                                @click="closeMobileMenu"
                            >
                                <Button
                                    size="sm"
                                    class="w-full"
                                >
                                    {{ t('navigation.signUp') }}
                                </Button>
                            </NuxtLink>
                        </div>
                        <div
                            v-else
                            class="flex flex-col space-y-2"
                        >
                            <NuxtLink
                                to="/profile"
                                class="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 p-2"
                                @click="closeMobileMenu"
                            >
                                <User class="w-4 h-4" />
                                <span>{{ authStore.currentUser?.name || authStore.currentUser?.email }}</span>
                            </NuxtLink>
                            <NuxtLink
                                v-if="authStore.user?.role === 'admin'"
                                to="/admin"
                                class="flex items-center space-x-2 text-sm text-purple-600 hover:text-purple-900 p-2"
                                @click="closeMobileMenu"
                            >
                                <LayoutDashboard class="w-4 h-4" />
                                <span>{{ t('navigation.admin') }}</span>
                            </NuxtLink>
                            <Button
                                variant="ghost"
                                size="sm"
                                class="w-full justify-start text-gray-600 hover:text-gray-900"
                                @click="handleLogout(); closeMobileMenu()"
                            >
                                <LogOut class="w-4 h-4 mr-2" />
                                {{ t('navigation.signOut') }}
                            </Button>
                        </div>
                    </ClientOnly>

                    <div class="h-px bg-gray-200" />

                    <!-- Navigation Links -->
                    <div class="flex flex-col space-y-2">
                        <NuxtLink
                            to="/contact"
                            class="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 p-2"
                            @click="closeMobileMenu"
                        >
                            <Mail class="w-4 h-4" />
                            <span>{{ t('navigation.contact', 'Contact') }}</span>
                        </NuxtLink>
                        <NuxtLink
                            to="/qa"
                            target="_blank"
                            class="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 p-2"
                            @click="closeMobileMenu"
                        >
                            <HelpCircle class="w-4 h-4" />
                            <span>{{ t('navigation.qa') }}</span>
                        </NuxtLink>
                        <a
                            href="https://github.com/imkonsowa/resume-builder"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 p-2"
                            @click="closeMobileMenu"
                        >
                            <Github class="w-4 h-4" />
                            <span>{{ t('navigation.github', 'GitHub') }}</span>
                        </a>
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
                        Built by
                        <a
                            class="font-medium text-gray-900 hover:text-blue-600 transition-colors"
                            href="https://konsowa.com"
                            rel="noopener noreferrer"
                            target="_blank"
                        >
                            Ibrahim Konsowa
                        </a>
                        and <a
                            class="font-medium text-gray-900 hover:text-blue-600 transition-colors"
                            href="https://www.claude.com/product/claude-code"
                            rel="noopener noreferrer"
                            target="_blank"
                        >Claude Code</a>
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
