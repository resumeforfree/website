<template>
    <Dialog
        v-model:open="isOpen"
        @update:open="handleClose"
    >
        <DialogContent class="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Create Account</DialogTitle>
                <DialogDescription>
                    Create a free account to save and access your resumes
                </DialogDescription>
            </DialogHeader>
            <form
                class="space-y-4"
                @submit.prevent="handleRegister"
            >
                <div class="space-y-2">
                    <Label for="reg-name">Name</Label>
                    <Input
                        id="reg-name"
                        v-model="name"
                        type="text"
                        placeholder="Enter your name"
                        required
                        :disabled="loading"
                    />
                </div>
                <div class="space-y-2">
                    <Label for="reg-email">Email</Label>
                    <Input
                        id="reg-email"
                        v-model="email"
                        type="email"
                        placeholder="Enter your email"
                        required
                        :disabled="loading"
                    />
                </div>
                <div class="space-y-2">
                    <Label for="reg-password">Password</Label>
                    <Input
                        id="reg-password"
                        v-model="password"
                        type="password"
                        placeholder="Create a password (min 8 characters)"
                        required
                        minlength="8"
                        :disabled="loading"
                    />
                </div>
                <div class="space-y-2">
                    <Label for="reg-password-confirm">Confirm Password</Label>
                    <Input
                        id="reg-password-confirm"
                        v-model="passwordConfirm"
                        type="password"
                        placeholder="Confirm your password"
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
            <div class="text-center text-sm text-muted-foreground">
                Already have an account?
                <button
                    type="button"
                    class="text-primary hover:underline"
                    @click="switchToLogin"
                >
                    Sign in
                </button>
            </div>
        </DialogContent>
    </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
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
    (e: 'switch-to-login'): void;
}
const props = defineProps<Props>();
const emit = defineEmits<Emits>();
const authStore = useAuthStore();
const isOpen = ref(props.open);
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
        && password.value.length >= 8
        && passwordConfirm.value
        && password.value === passwordConfirm.value;
});
watch(() => props.open, (newValue) => {
    isOpen.value = newValue;
});
watch(isOpen, (newValue) => {
    emit('update:open', newValue);
});
watch([password, passwordConfirm], () => {
    if (password.value && passwordConfirm.value && password.value !== passwordConfirm.value) {
        error.value = 'Passwords do not match';
    }
    else {
        error.value = '';
    }
});
const handleClose = () => {
    if (!loading.value) {
        isOpen.value = false;
        resetForm();
    }
};
const resetForm = () => {
    name.value = '';
    email.value = '';
    password.value = '';
    passwordConfirm.value = '';
    turnstileToken.value = null;
    error.value = '';
    success.value = '';
    loading.value = false;
};
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
        success.value = 'Account created successfully! You are now signed in.';
        setTimeout(() => {
            isOpen.value = false;
            resetForm();
        }, 2000);
    }
    else {
        error.value = result.error || 'Registration failed';
        turnstileToken.value = null;
    }
    loading.value = false;
};
const switchToLogin = () => {
    isOpen.value = false;
    resetForm();
    emit('switch-to-login');
};
</script>
