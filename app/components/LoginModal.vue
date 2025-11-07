<template>
    <Dialog
        v-model:open="isOpen"
        @update:open="handleClose"
    >
        <DialogContent class="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Sign In</DialogTitle>
                <DialogDescription>
                    Sign in to your account to access your resumes
                </DialogDescription>
            </DialogHeader>
            <form
                class="space-y-4"
                @submit.prevent="handleLogin"
            >
                <div class="space-y-2">
                    <Label for="email">Email</Label>
                    <Input
                        id="email"
                        v-model="email"
                        type="email"
                        placeholder="Enter your email"
                        required
                        :disabled="loading"
                    />
                </div>
                <div class="space-y-2">
                    <Label for="password">Password</Label>
                    <Input
                        id="password"
                        v-model="password"
                        type="password"
                        placeholder="Enter your password"
                        required
                        :disabled="loading"
                    />
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
                    Sign In
                </Button>
                <div
                    v-if="error"
                    class="text-sm text-red-600 text-center"
                >
                    {{ error }}
                </div>
            </form>
            <div class="text-center text-sm text-muted-foreground">
                Don't have an account?
                <button
                    type="button"
                    class="text-primary hover:underline"
                    @click="switchToRegister"
                >
                    Sign up
                </button>
            </div>
        </DialogContent>
    </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-vue-next';
import TurnstileWidget from '@/components/elements/TurnstileWidget.vue';

interface Props {
    open: boolean;
}
interface Emits {
    (e: 'update:open', value: boolean): void;
    (e: 'switch-to-register'): void;
}
const props = defineProps<Props>();
const emit = defineEmits<Emits>();
const authStore = useAuthStore();
const isOpen = ref(props.open);
const email = ref('');
const password = ref('');
const turnstileToken = ref<string | null>(null);
const loading = ref(false);
const error = ref('');
watch(() => props.open, (newValue) => {
    isOpen.value = newValue;
});
watch(isOpen, (newValue) => {
    emit('update:open', newValue);
});
const handleClose = () => {
    if (!loading.value) {
        isOpen.value = false;
        resetForm();
    }
};
const resetForm = () => {
    email.value = '';
    password.value = '';
    turnstileToken.value = null;
    error.value = '';
    loading.value = false;
};
const handleLogin = async () => {
    if (loading.value || !turnstileToken.value) return;
    loading.value = true;
    error.value = '';
    const result = await authStore.login(email.value, password.value, turnstileToken.value);
    if (result.success) {
        isOpen.value = false;
        resetForm();
    }
    else {
        error.value = result.error || 'Login failed';
        turnstileToken.value = null;
    }
    loading.value = false;
};
const switchToRegister = () => {
    isOpen.value = false;
    resetForm();
    emit('switch-to-register');
};
</script>
