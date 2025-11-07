export const useApi = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleError = (error: any) => {
        console.error('API Error:', error);
        const message = error?.data?.message || error?.statusMessage || error?.message || 'An error occurred';
        throw new Error(message);
    };
    return {
        auth: {
            async login(email: string, password?: string, turnstileToken?: string) {
                return await $fetch('/api/auth/login', {
                    method: 'POST',
                    body: { email, password, turnstileToken },
                }).catch(handleError);
            },
            async register(email: string, password: string, passwordConfirm: string, name: string, turnstileToken?: string) {
                return await $fetch('/api/auth/register', {
                    method: 'POST',
                    body: { email, password, name, turnstileToken },
                }).catch(handleError);
            },
            async logout() {
                return await $fetch('/api/auth/logout', {
                    method: 'POST',
                }).catch(handleError);
            },
            async getSession() {
                return await $fetch('/api/auth/session').catch(handleError);
            },
            async changePassword(currentPassword: string, newPassword: string) {
                return await $fetch('/api/auth/change-password', {
                    method: 'POST',
                    body: { currentPassword, newPassword },
                }).catch(handleError);
            },
        },
        resumes: {
            async list() {
                return await $fetch('/api/resumes').then(({ resumes }) => resumes).catch(handleError);
            },
            async get(id: string) {
                return await $fetch(`/api/resumes/${id}`).then(({ resume }) => resume).catch(handleError);
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            async create(name: string, data: any, template?: string) {
                return await $fetch('/api/resumes', {
                    method: 'POST',
                    body: { name, data, template },
                }).then(({ resume }) => resume).catch(handleError);
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            async update(id: string, updates: any) {
                return await $fetch(`/api/resumes/${id}`, {
                    method: 'PUT',
                    body: updates,
                }).then(({ resume }) => resume).catch(handleError);
            },
            async delete(id: string) {
                return await $fetch(`/api/resumes/${id}`, {
                    method: 'DELETE',
                }).then(() => true).catch(handleError);
            },
            async duplicate(id: string, name?: string) {
                return await $fetch(`/api/resumes/${id}/duplicate`, {
                    method: 'POST',
                    body: { name },
                }).then(({ resume }) => resume).catch(handleError);
            },
            async activate(id: string) {
                return await $fetch(`/api/resumes/${id}/activate`, {
                    method: 'POST',
                }).then(() => true).catch(handleError);
            },
            async share(id: string, expiresInDays?: number) {
                return await $fetch(`/api/resumes/${id}/share`, {
                    method: 'POST',
                    body: { expiresInDays },
                }).catch(handleError);
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            async sync(data: { resumes: any[] }) {
                return await $fetch('/api/resumes/sync', {
                    method: 'POST',
                    body: data,
                }).catch(handleError);
            },
        },
        share: {
            async getByToken(token: string) {
                return await $fetch(`/api/share/${token}`).then(({ resume }) => resume).catch(handleError);
            },
        },
        settings: {
            async get() {
                return await $fetch('/api/settings').catch(handleError);
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            async update(settings: any) {
                return await $fetch('/api/settings', {
                    method: 'PUT',
                    body: { settings },
                }).catch(handleError);
            },
        },
    };
};
