import type { ResumeData, Resume, AppSettings } from '~/types/resume';

interface ApiError {
    data?: { message?: string };
    statusMessage?: string;
    message?: string;
}

interface AuthUser {
    id: string;
    email: string;
    name?: string;
    verified: boolean;
    role?: 'user' | 'admin';
}

interface AuthResponse {
    user?: AuthUser;
    message?: string;
}

interface ResumeResponse {
    resume: Resume;
}

interface ResumesResponse {
    resumes: Resume[];
}

interface ShareResponse {
    shareToken: string;
    expiresAt: string;
}

interface SettingsResponse {
    settings: AppSettings;
    updatedAt: string;
}

export const useApi = () => {
    const handleError = (error: unknown): never => {
        console.error('API Error:', error);
        const apiError = error as ApiError;
        const message = apiError?.data?.message || apiError?.statusMessage || apiError?.message || 'An error occurred';
        throw new Error(message);
    };
    return {
        auth: {
            async login(email: string, password?: string, turnstileToken?: string): Promise<AuthResponse> {
                return await $fetch<AuthResponse>('/api/auth/login', {
                    method: 'POST',
                    body: { email, password, turnstileToken },
                }).catch(handleError);
            },
            async register(email: string, password: string, passwordConfirm: string, name: string, turnstileToken?: string): Promise<AuthResponse> {
                return await $fetch<AuthResponse>('/api/auth/register', {
                    method: 'POST',
                    body: { email, password, name, turnstileToken },
                }).catch(handleError);
            },
            async logout(): Promise<{ message: string }> {
                return await $fetch<{ message: string }>('/api/auth/logout', {
                    method: 'POST',
                }).catch(handleError);
            },
            async getSession(): Promise<AuthResponse> {
                return await $fetch<AuthResponse>('/api/auth/session').catch(handleError);
            },
            async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
                return await $fetch<{ message: string }>('/api/auth/change-password', {
                    method: 'POST',
                    body: { currentPassword, newPassword },
                }).catch(handleError);
            },
        },
        resumes: {
            async list(): Promise<Resume[]> {
                return await $fetch<ResumesResponse>('/api/resumes').then(({ resumes }) => resumes).catch(handleError);
            },
            async get(id: string): Promise<Resume> {
                return await $fetch<ResumeResponse>(`/api/resumes/${id}`).then(({ resume }) => resume).catch(handleError);
            },
            async create(name: string, data: ResumeData, template?: string): Promise<Resume> {
                return await $fetch<ResumeResponse>('/api/resumes', {
                    method: 'POST',
                    body: { name, data, template },
                }).then(({ resume }) => resume).catch(handleError);
            },
            async update(id: string, updates: Partial<{ name: string; data: ResumeData; template: string }>): Promise<Resume> {
                return await $fetch<ResumeResponse>(`/api/resumes/${id}`, {
                    method: 'PUT',
                    body: updates,
                }).then(({ resume }) => resume).catch(handleError);
            },
            async delete(id: string): Promise<boolean> {
                return await $fetch<{ message: string }>(`/api/resumes/${id}`, {
                    method: 'DELETE',
                }).then(() => true).catch(handleError);
            },
            async duplicate(id: string, name?: string): Promise<Resume> {
                return await $fetch<ResumeResponse>(`/api/resumes/${id}/duplicate`, {
                    method: 'POST',
                    body: { name },
                }).then(({ resume }) => resume).catch(handleError);
            },
            async activate(id: string): Promise<boolean> {
                return await $fetch<{ message: string }>(`/api/resumes/${id}/activate`, {
                    method: 'POST',
                }).then(() => true).catch(handleError);
            },
            async share(id: string, expiresInDays?: number): Promise<ShareResponse> {
                return await $fetch<ShareResponse>(`/api/resumes/${id}/share`, {
                    method: 'POST',
                    body: { expiresInDays },
                }).catch(handleError);
            },
            async sync(data: { resumes: Resume[] }): Promise<{ resumes: Resume[] }> {
                return await $fetch<{ resumes: Resume[] }>('/api/resumes/sync', {
                    method: 'POST',
                    body: data,
                }).catch(handleError);
            },
        },
        share: {
            async getByToken(token: string): Promise<Resume> {
                return await $fetch<ResumeResponse>(`/api/share/${token}`).then(({ resume }) => resume).catch(handleError);
            },
        },
        settings: {
            async get(): Promise<SettingsResponse> {
                return await $fetch<SettingsResponse>('/api/settings').catch(handleError);
            },
            async update(settings: AppSettings): Promise<SettingsResponse> {
                return await $fetch<SettingsResponse>('/api/settings', {
                    method: 'PUT',
                    body: { settings },
                }).catch(handleError);
            },
        },
    };
};
