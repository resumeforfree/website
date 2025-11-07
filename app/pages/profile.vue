<script lang="ts" setup>
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Separator } from '~/components/ui/separator';
import { User, Lock, Eye, EyeOff } from 'lucide-vue-next';

const authStore = useAuthStore();

// Redirect if not logged in
if (!authStore.isLoggedIn) {
    await navigateTo('/auth/login');
}

const activeSection = ref<'personal' | 'password'>('personal');
const isChangingPassword = ref(false);
const showCurrentPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

// Password change form
const passwordForm = ref({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
});

const passwordErrors = ref<string[]>([]);

const handleChangePassword = async () => {
    passwordErrors.value = [];

    if (!passwordForm.value.currentPassword) {
        passwordErrors.value.push('Current password is required');
        return;
    }

    if (!passwordForm.value.newPassword) {
        passwordErrors.value.push('New password is required');
        return;
    }

    if (passwordForm.value.newPassword.length < 8) {
        passwordErrors.value.push('New password must be at least 8 characters');
        return;
    }

    if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
        passwordErrors.value.push('New passwords do not match');
        return;
    }

    const { toast } = await import('vue-sonner');

    try {
        isChangingPassword.value = true;

        // Call change password API
        const api = useApi();
        await api.auth.changePassword(
            passwordForm.value.currentPassword,
            passwordForm.value.newPassword,
        );

        // Reset form
        passwordForm.value = {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        };

        toast.success('Password changed successfully');
    }
    catch (error: unknown) {
        console.error('Password change error:', error);
        const errorMessage = (error as Error)?.message || 'Failed to change password';
        passwordErrors.value.push(errorMessage);
        toast.error(errorMessage);
    }
    finally {
        isChangingPassword.value = false;
    }
};

useHead({
    title: 'Profile - Free Resume Builder',
    meta: [
        {
            name: 'description',
            content: 'Manage your account settings and profile information.',
        },
    ],
});
</script>

<template>
    <div class="min-h-screen bg-gray-50">
        <div class="container mx-auto px-4 py-8">
            <div class="max-w-6xl mx-auto">
                <!-- Page Header -->
                <div class="mb-8">
                    <h1 class="text-3xl font-bold text-gray-900 mb-2">
                        Profile Settings
                    </h1>
                    <p class="text-gray-600">
                        Manage your account settings and preferences
                    </p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <!-- Sidebar -->
                    <div class="md:col-span-1">
                        <Card>
                            <CardContent class="p-4">
                                <nav class="space-y-1">
                                    <button
                                        class="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors text-left"
                                        :class="activeSection === 'personal' ? 'bg-blue-100 text-blue-900 font-medium' : 'text-gray-700 hover:bg-gray-100'"
                                        @click="activeSection = 'personal'"
                                    >
                                        <User class="w-4 h-4" />
                                        Personal Information
                                    </button>
                                    <button
                                        class="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors text-left"
                                        :class="activeSection === 'password' ? 'bg-blue-100 text-blue-900 font-medium' : 'text-gray-700 hover:bg-gray-100'"
                                        @click="activeSection = 'password'"
                                    >
                                        <Lock class="w-4 h-4" />
                                        Change Password
                                    </button>
                                </nav>
                            </CardContent>
                        </Card>
                    </div>

                    <!-- Main Content -->
                    <div class="md:col-span-3">
                        <!-- Personal Information Section -->
                        <Card v-if="activeSection === 'personal'">
                            <CardHeader>
                                <CardTitle class="flex items-center gap-2">
                                    <User class="w-5 h-5" />
                                    Personal Information
                                </CardTitle>
                                <CardDescription>
                                    View and manage your account details
                                </CardDescription>
                            </CardHeader>
                            <CardContent class="space-y-8">
                                <div class="space-y-6">
                                    <div>
                                        <Label
                                            for="name"
                                            class="text-sm font-medium text-gray-700 mb-2 block"
                                        >Name</Label>
                                        <div class="p-4 bg-gray-50 rounded-lg border border-gray-200 text-base">
                                            {{ authStore.currentUser?.name || 'Not provided' }}
                                        </div>
                                    </div>
                                    <div>
                                        <Label
                                            for="email"
                                            class="text-sm font-medium text-gray-700 mb-2 block"
                                        >Email Address</Label>
                                        <div class="p-4 bg-gray-50 rounded-lg border border-gray-200 text-base">
                                            {{ authStore.currentUser?.email }}
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div class="flex items-start gap-3">
                                        <div class="w-5 h-5 text-blue-600 mt-0.5">
                                            ℹ️
                                        </div>
                                        <div>
                                            <h4 class="text-sm font-medium text-blue-900 mb-1">
                                                Account Information
                                            </h4>
                                            <p class="text-sm text-blue-700">
                                                Your account allows you to sync up to 3 resumes to the cloud.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <!-- Change Password Section -->
                        <Card v-if="activeSection === 'password'">
                            <CardHeader>
                                <CardTitle class="flex items-center gap-2">
                                    <Lock class="w-5 h-5" />
                                    Change Password
                                </CardTitle>
                                <CardDescription>
                                    Update your password to keep your account secure
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form
                                    class="space-y-6"
                                    @submit.prevent="handleChangePassword"
                                >
                                    <!-- Error Messages -->
                                    <div
                                        v-if="passwordErrors.length > 0"
                                        class="bg-red-50 border border-red-200 rounded-md p-4"
                                    >
                                        <div class="flex items-start gap-3">
                                            <div class="w-5 h-5 text-red-600 mt-0.5">
                                                ⚠️
                                            </div>
                                            <div>
                                                <h4 class="text-sm font-medium text-red-900 mb-2">
                                                    Please fix the following errors:
                                                </h4>
                                                <ul class="text-sm text-red-700 space-y-1">
                                                    <li
                                                        v-for="error in passwordErrors"
                                                        :key="error"
                                                    >
                                                        • {{ error }}
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Current Password -->
                                    <div>
                                        <Label
                                            for="current-password"
                                            class="text-sm font-medium text-gray-700"
                                        >Current Password</Label>
                                        <div class="relative mt-1">
                                            <Input
                                                id="current-password"
                                                v-model="passwordForm.currentPassword"
                                                :type="showCurrentPassword ? 'text' : 'password'"
                                                placeholder="Enter your current password"
                                                class="pr-10"
                                                :disabled="isChangingPassword"
                                                required
                                            />
                                            <button
                                                type="button"
                                                class="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                @click="showCurrentPassword = !showCurrentPassword"
                                            >
                                                <Eye
                                                    v-if="!showCurrentPassword"
                                                    class="w-4 h-4 text-gray-400"
                                                />
                                                <EyeOff
                                                    v-else
                                                    class="w-4 h-4 text-gray-400"
                                                />
                                            </button>
                                        </div>
                                    </div>

                                    <!-- New Password -->
                                    <div>
                                        <Label
                                            for="new-password"
                                            class="text-sm font-medium text-gray-700"
                                        >New Password</Label>
                                        <div class="relative mt-1">
                                            <Input
                                                id="new-password"
                                                v-model="passwordForm.newPassword"
                                                :type="showNewPassword ? 'text' : 'password'"
                                                placeholder="Enter your new password"
                                                class="pr-10"
                                                :disabled="isChangingPassword"
                                                required
                                                minlength="8"
                                            />
                                            <button
                                                type="button"
                                                class="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                @click="showNewPassword = !showNewPassword"
                                            >
                                                <Eye
                                                    v-if="!showNewPassword"
                                                    class="w-4 h-4 text-gray-400"
                                                />
                                                <EyeOff
                                                    v-else
                                                    class="w-4 h-4 text-gray-400"
                                                />
                                            </button>
                                        </div>
                                        <p class="mt-1 text-xs text-gray-500">
                                            Password must be at least 8 characters long
                                        </p>
                                    </div>

                                    <!-- Confirm New Password -->
                                    <div>
                                        <Label
                                            for="confirm-password"
                                            class="text-sm font-medium text-gray-700"
                                        >Confirm New Password</Label>
                                        <div class="relative mt-1">
                                            <Input
                                                id="confirm-password"
                                                v-model="passwordForm.confirmPassword"
                                                :type="showConfirmPassword ? 'text' : 'password'"
                                                placeholder="Confirm your new password"
                                                class="pr-10"
                                                :disabled="isChangingPassword"
                                                required
                                            />
                                            <button
                                                type="button"
                                                class="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                @click="showConfirmPassword = !showConfirmPassword"
                                            >
                                                <Eye
                                                    v-if="!showConfirmPassword"
                                                    class="w-4 h-4 text-gray-400"
                                                />
                                                <EyeOff
                                                    v-else
                                                    class="w-4 h-4 text-gray-400"
                                                />
                                            </button>
                                        </div>
                                    </div>

                                    <!-- Submit Button -->
                                    <div class="flex gap-3 pt-4">
                                        <Button
                                            type="submit"
                                            :disabled="isChangingPassword"
                                            class="flex items-center gap-2"
                                        >
                                            <Lock class="w-4 h-4" />
                                            {{ isChangingPassword ? 'Changing Password...' : 'Change Password' }}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            :disabled="isChangingPassword"
                                            @click="passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' }; passwordErrors = []"
                                        >
                                            Clear Form
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
