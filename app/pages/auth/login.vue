<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-md w-full space-y-8">
            <div class="text-center">
                <h1 class="text-3xl font-bold text-gray-900">
                    {{ $t('auth.signIn') }}
                </h1>
                <p class="mt-2 text-gray-600">
                    {{ $t('auth.signInDescription') }}
                </p>
            </div>
            <form
                class="mt-6 space-y-6 p-6 border border-gray-200 rounded-lg bg-white"
                @submit.prevent="handleLogin"
            >
                <div class="space-y-4">
                    <div>
                        <Label for="email">{{ $t('auth.email') }}</Label>
                        <Input
                            id="email"
                            v-model="email"
                            type="email"
                            :placeholder="$t('auth.enterEmail')"
                            required
                            :disabled="loading"
                            class="mt-1"
                        />
                    </div>
                    <div>
                        <Label for="password">{{ $t('auth.password') }}</Label>
                        <Input
                            id="password"
                            v-model="password"
                            type="password"
                            :placeholder="$t('auth.enterPassword')"
                            required
                            :disabled="loading"
                            class="mt-1"
                        />
                    </div>
                </div>
                <TurnstileWidget
                    v-model="turnstileToken"
                />
                <Button
                    type="submit"
                    class="w-full"
                    :disabled="loading || !turnstileToken"
                >
                    <Loader2
                        v-if="loading"
                        class="mr-2 h-4 w-4 animate-spin"
                    />
                    {{ $t('auth.signIn') }}
                </Button>
                <div
                    v-if="error"
                    class="text-sm text-red-600 text-center"
                >
                    {{ error }}
                </div>
            </form>
            <div class="text-center">
                <p class="text-sm text-gray-600">
                    {{ $t('auth.dontHaveAccount') }}
                    <NuxtLink
                        to="/auth/register"
                        class="font-medium text-blue-600 hover:text-blue-500 hover:underline"
                    >
                        {{ $t('auth.signUp') }}
                    </NuxtLink>
                </p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Loader2 } from 'lucide-vue-next';
import TurnstileWidget from '~/components/elements/TurnstileWidget.vue';

const { t } = useI18n();
const authStore = useAuthStore();
const router = useRouter();
const email = ref('');
const password = ref('');
const turnstileToken = ref<string | null>(null);
const loading = ref(false);
const error = ref('');
const handleLogin = async () => {
    if (loading.value || !turnstileToken.value) return;
    loading.value = true;
    error.value = '';
    const result = await authStore.login(email.value, password.value, turnstileToken.value);
    if (result.success) {
        router.push('/resumes');
    }
    else {
        error.value = result.error || t('auth.loginFailed');
        turnstileToken.value = null;
    }
    loading.value = false;
};
useHead({
    title: `${t('auth.signIn')} - Resume Builder`,
    meta: [
        { name: 'description', content: t('auth.signInDescription') },
    ],
});
</script>
