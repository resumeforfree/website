<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-md w-full space-y-8">
            <div class="text-center">
                <h1 class="text-3xl font-bold text-gray-900">
                    Create Account
                </h1>
                <p class="mt-2 text-gray-600">
                    Create a free account to save and access your resumes
                </p>
            </div>
            <form
                class="mt-6 space-y-6 p-6 border border-gray-200 rounded-lg bg-white"
                @submit.prevent="handleRegister"
            >
                <div class="space-y-4">
                    <div>
                        <Label for="name">Name</Label>
                        <Input
                            id="name"
                            v-model="name"
                            type="text"
                            placeholder="Enter your name"
                            required
                            :disabled="loading"
                            class="mt-1"
                        />
                    </div>
                    <div>
                        <Label for="email">Email</Label>
                        <Input
                            id="email"
                            v-model="email"
                            type="email"
                            placeholder="Enter your email"
                            required
                            :disabled="loading"
                            class="mt-1"
                        />
                    </div>
                    <div>
                        <Label for="password">Password</Label>
                        <Input
                            id="password"
                            v-model="password"
                            type="password"
                            placeholder="Create a password (min 6 characters)"
                            required
                            minlength="6"
                            :disabled="loading"
                            class="mt-1"
                        />
                    </div>
                    <div>
                        <Label for="passwordConfirm">Confirm Password</Label>
                        <Input
                            id="passwordConfirm"
                            v-model="passwordConfirm"
                            type="password"
                            placeholder="Confirm your password"
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
                    :disabled="loading || !isFormValid || !turnstileToken"
                >
                    <Loader2
                        v-if="loading"
                        class="mr-2 h-4 w-4 animate-spin"
                    />
                    Create Account
                </Button>
                <div
                    v-if="error"
                    class="text-sm text-red-600 text-center"
                >
                    {{ error }}
                </div>
                <div
                    v-if="success"
                    class="text-sm text-green-600 text-center"
                >
                    {{ success }}
                </div>
            </form>
            <div class="text-center">
                <p class="text-sm text-gray-600">
                    Already have an account?
                    <NuxtLink
                        to="/auth/login"
                        class="font-medium text-blue-600 hover:text-blue-500 hover:underline"
                    >
                        Sign in
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

const authStore = useAuthStore();
const router = useRouter();
const name = ref('');
const email = ref('');
const password = ref('');
const passwordConfirm = ref('');
const turnstileToken = ref<string | null>(null);
const loading = ref(false);
const error = ref('');
const success = ref('');
const isFormValid = computed(() => {
    return name.value
        && email.value
        && password.value
        && password.value.length >= 6
        && passwordConfirm.value
        && password.value === passwordConfirm.value;
});
watch([password, passwordConfirm], () => {
    if (password.value && passwordConfirm.value && password.value !== passwordConfirm.value) {
        error.value = 'Passwords do not match';
    }
    else {
        error.value = '';
    }
});
const handleRegister = async () => {
    if (loading.value || !isFormValid.value || !turnstileToken.value) return;
    loading.value = true;
    error.value = '';
    success.value = '';
    const result = await authStore.register(
        email.value,
        password.value,
        passwordConfirm.value,
        name.value,
        turnstileToken.value,
    );
    if (result.success) {
        success.value = 'Account created successfully! Redirecting...';
        setTimeout(() => {
            router.push('/resumes');
        }, 1500);
    }
    else {
        error.value = result.error || 'Registration failed';
        turnstileToken.value = null;
    }
    loading.value = false;
};
useHead({
    title: 'Create Account - Resume Builder',
    meta: [
        { name: 'description', content: 'Create a free Resume Builder account to save up to 3 resumes in the cloud.' },
    ],
});
</script>
