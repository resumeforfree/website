<script lang="ts" setup>
import { Button } from '~/components/ui/button';
import { Check, Download, FileText, Shield, Users, Zap, Languages } from 'lucide-vue-next';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { createSoftwareApplicationStructuredData, createWebsiteStructuredData } from '~/composables/useSEO';

const { t, locale, locales } = useI18n();
const { switchLanguage } = useLanguageSwitcher();

useHead({
    title: t('homepage.heroTitle'),
    meta: [
        {
            name: 'description',
            content: t('homepage.heroDescription'),
        },
        {
            name: 'keywords',
            content: 'free resume builder, privacy resume maker, no registration resume, unlimited downloads, local resume builder, professional resume, CV maker',
        },
        {
            name: 'author',
            content: 'Resume Builder',
        },
        {
            property: 'og:type',
            content: 'website',
        },
        {
            property: 'og:site_name',
            content: 'Free Resume Builder',
        },
        {
            property: 'og:title',
            content: t('homepage.heroTitle'),
        },
        {
            property: 'og:description',
            content: t('homepage.heroDescription'),
        },
        {
            property: 'og:url',
            content: 'https://resumeforfree.com',
        },
        {
            property: 'og:image',
            content: 'https://resumeforfree.com/og-image.png',
        },
        {
            property: 'og:image:width',
            content: '1200',
        },
        {
            property: 'og:image:height',
            content: '630',
        },
        {
            property: 'og:locale',
            content: 'en_US',
        },
        {
            name: 'twitter:card',
            content: 'summary_large_image',
        },
        {
            name: 'twitter:title',
            content: t('homepage.heroTitle'),
        },
        {
            name: 'twitter:description',
            content: t('homepage.heroDescription'),
        },
        {
            name: 'twitter:image',
            content: 'https://resumeforfree.com/og-image.png',
        },
        {
            name: 'application-name',
            content: 'Resume Builder',
        },
        {
            name: 'apple-mobile-web-app-title',
            content: 'Resume Builder',
        },
        {
            name: 'apple-mobile-web-app-capable',
            content: 'yes',
        },
        {
            name: 'mobile-web-app-capable',
            content: 'yes',
        },
    ],
    link: [
        {
            rel: 'canonical',
            href: 'https://resumeforfree.com',
        },
    ],
    script: [
        {
            type: 'application/ld+json',
            children: JSON.stringify(createWebsiteStructuredData()),
        },
        {
            type: 'application/ld+json',
            children: JSON.stringify(createSoftwareApplicationStructuredData()),
        },
    ],
});
</script>

<template>
    <main class="min-h-screen flex flex-col items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
        <div class="text-center">
            <h1 class="text-6xl font-bold text-black mb-16">
                {{ t('homepage.title') }}<br>
                <span class="text-gray-600">{{ t('homepage.subtitle') }}</span>
            </h1>
            <div class="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
                <NuxtLink to="/resumes">
                    <Button size="lg">
                        {{ t('common.buildNow') }}
                    </Button>
                </NuxtLink>
                <Select
                    :model-value="locale"
                    @update:model-value="switchLanguage"
                >
                    <SelectTrigger class="w-[180px]">
                        <Languages class="w-4 h-4 me-2" />
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem
                            v-for="lang in locales"
                            :key="lang.code"
                            :value="lang.code"
                        >
                            {{ lang.name }}
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <p class="text-xs text-gray-500">
                By using this website you agree to
                <NuxtLink
                    to="/terms"
                    class="text-blue-600 hover:text-blue-800 underline"
                >
                    terms and conditions
                </NuxtLink>
            </p>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-16">
            <div class="text-center">
                <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Check class="w-6 h-6 text-green-600" />
                </div>
                <h3 class="text-lg font-semibold mb-1">
                    {{ t('homepage.features.free.title') }}
                </h3>
                <p class="text-sm text-gray-600">
                    {{ t('homepage.features.free.description') }}
                </p>
            </div>
            <div class="text-center">
                <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Shield class="w-6 h-6 text-blue-600" />
                </div>
                <h3 class="text-lg font-semibold mb-1">
                    {{ t('homepage.features.noServers.title') }}
                </h3>
                <p class="text-sm text-gray-600">
                    {{ t('homepage.features.noServers.description') }}
                </p>
            </div>
            <div class="text-center">
                <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users class="w-6 h-6 text-purple-600" />
                </div>
                <h3 class="text-lg font-semibold mb-1">
                    {{ t('homepage.features.noRegistration.title') }}
                </h3>
                <p class="text-sm text-gray-600">
                    {{ t('homepage.features.noRegistration.description') }}
                </p>
            </div>
            <div class="text-center">
                <div class="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Download class="w-6 h-6 text-orange-600" />
                </div>
                <h3 class="text-lg font-semibold mb-1">
                    {{ t('homepage.features.unlimitedDownloads.title') }}
                </h3>
                <p class="text-sm text-gray-600">
                    {{ t('homepage.features.unlimitedDownloads.description') }}
                </p>
            </div>
            <div class="text-center">
                <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FileText class="w-6 h-6 text-red-600" />
                </div>
                <h3 class="text-lg font-semibold mb-1">
                    {{ t('homepage.features.unlimitedResumes.title') }}
                </h3>
                <p class="text-sm text-gray-600">
                    {{ t('homepage.features.unlimitedResumes.description') }}
                </p>
            </div>
            <div class="text-center">
                <div class="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Zap class="w-6 h-6 text-indigo-600" />
                </div>
                <h3 class="text-lg font-semibold mb-1">
                    {{ t('homepage.features.fastEfficient.title') }}
                </h3>
                <p class="text-sm text-gray-600">
                    {{ t('homepage.features.fastEfficient.description') }}
                </p>
            </div>
        </div>
    </main>
</template>

<style scoped>
</style>
