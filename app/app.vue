<template>
    <div ref="rootEl">
        <NuxtRouteAnnouncer />
        <NuxtLayout>
            <NuxtPage />
        </NuxtLayout>
    </div>
</template>

<script lang="ts" setup>
const { locale, locales } = useI18n();
const rootEl = ref<HTMLElement | null>(null);

// Set initial direction after mount to avoid hydration mismatch
onMounted(() => {
    updateDirection();
});

// Watch for language changes to update document direction
watch(locale, () => {
    updateDirection();
});

function updateDirection() {
    if (import.meta.client) {
        const localeConfig = locales.value.find(l => l.code === locale.value);
        const dir = localeConfig?.dir || 'ltr';
        const isRtl = dir === 'rtl';

        // Update document element
        document.documentElement.dir = dir;
        document.documentElement.lang = locale.value;

        // Update root element
        if (rootEl.value) {
            rootEl.value.dir = dir;
            if (isRtl) {
                rootEl.value.classList.add('rtl-mode');
            }
            else {
                rootEl.value.classList.remove('rtl-mode');
            }
        }
    }
}
</script>
