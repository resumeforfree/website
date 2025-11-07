<template>
    <main class="min-h-screen flex flex-col items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-2xl mx-auto">
            <h1 class="text-4xl font-bold text-black mb-8">
                Contact Us
            </h1>
            <Card class="p-8">
                <CardContent class="pt-0">
                    <p class="text-lg text-gray-700 leading-relaxed">
                        If you encounter any issues or need assistance, please feel free to contact us at
                        <a
                            class="text-blue-600 hover:text-blue-800 font-medium underline"
                            href="mailto:contact@resumeforfree.com"
                        >
                            contact@resumeforfree.com
                        </a>
                        or open a GitHub issue on our repository.
                    </p>
                </CardContent>
            </Card>
        </div>
    </main>
</template>

<script lang="ts" setup>
import { Card, CardContent } from '~/components/ui/card';

useHead({
    title: 'Contact Us - Get Help with Free Resume Builder | Support',
    meta: [
        {
            name: 'description',
            content: 'Need help with our free resume builder? Contact our support team for assistance with creating professional resumes. Fast and friendly customer service.',
        },
        {
            name: 'keywords',
            content: 'resume builder support, contact resume help, customer service, resume builder assistance, help with resume',
        },
        {
            name: 'robots',
            content: 'index, follow',
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
            content: 'Contact Us - Get Help with Free Resume Builder',
        },
        {
            property: 'og:description',
            content: 'Need help with our free resume builder? Contact our support team for assistance with creating professional resumes.',
        },
        {
            property: 'og:url',
            content: 'https://resumeforfree.com/contact',
        },
        {
            property: 'og:image',
            content: 'https://resumeforfree.com/og-image.png',
        },
        {
            name: 'twitter:card',
            content: 'summary_large_image',
        },
        {
            name: 'twitter:title',
            content: 'Contact Us - Get Help with Free Resume Builder',
        },
        {
            name: 'twitter:description',
            content: 'Need help with our free resume builder? Contact our support team for assistance.',
        },
        {
            name: 'twitter:image',
            content: 'https://resumeforfree.com/og-image.png',
        },
    ],
    link: [
        {
            rel: 'canonical',
            href: 'https://resumeforfree.com/contact',
        },
    ],
});
</script>
