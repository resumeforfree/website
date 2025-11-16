import { defineStore } from 'pinia';

interface AuthUser {
    id: string;
    email: string;
    name?: string;
    verified: boolean;
    role?: 'user' | 'admin';
}
interface AuthState {
    user: AuthUser | null;
    token: string | null;
    isAuthenticated: boolean;
}
export const useAuthStore = defineStore('auth', {
    state: (): AuthState => ({
        user: null,
        token: null,
        isAuthenticated: false,
    }),
    getters: {
        currentUser: state => state.user,
        isLoggedIn: state => state.isAuthenticated && Boolean(state.user),
    },
    actions: {
        async login(email: string, password?: string, turnstileToken?: string) {
            const api = useApi();
            const { extractErrorMessage } = useErrorHandler();

            return await api.auth.login(email, password, turnstileToken)
                .then((result) => {
                    if (result?.user) {
                        this.setAuth(result.user);
                    }
                    return { success: true };
                })
                .catch((error: unknown) => {
                    const errorMessage = extractErrorMessage(error);
                    console.error('Login error:', errorMessage);
                    return {
                        success: false,
                        error: errorMessage,
                    };
                });
        },
        async register(email: string, password: string, passwordConfirm: string, name: string, turnstileToken?: string) {
            const api = useApi();
            const { extractErrorMessage } = useErrorHandler();

            return await api.auth.register(email, password, passwordConfirm, name, turnstileToken)
                .then((result) => {
                    if (result?.user) {
                        this.setAuth(result.user);
                    }
                    return { success: true };
                })
                .catch((error: unknown) => {
                    const errorMessage = extractErrorMessage(error);
                    console.error('Registration error:', errorMessage);
                    return {
                        success: false,
                        error: errorMessage,
                    };
                });
        },
        async logout() {
            const api = useApi();
            const { extractErrorMessage } = useErrorHandler();

            return await api.auth.logout()
                .then(() => {
                    this.clearAuth();
                    return { success: true };
                })
                .catch((error: unknown) => {
                    const errorMessage = extractErrorMessage(error);
                    console.error('Logout error:', errorMessage);
                    return {
                        success: false,
                        error: errorMessage,
                    };
                });
        },
        async refreshAuth() {
            const api = useApi();
            const { extractErrorMessage } = useErrorHandler();

            return await api.auth.getSession()
                .then((result) => {
                    if (result?.user) {
                        this.setAuth(result.user);
                        return { success: true };
                    }
                    return { success: false, error: 'No valid session' };
                })
                .catch((error: unknown) => {
                    const errorMessage = extractErrorMessage(error);
                    console.error('Auth refresh error:', errorMessage);
                    this.clearAuth();
                    return {
                        success: false,
                        error: errorMessage,
                    };
                });
        },
        setAuth(user: AuthUser) {
            this.user = user;
            this.token = 'session';
            this.isAuthenticated = true;
        },
        clearAuth() {
            this.user = null;
            this.token = null;
            this.isAuthenticated = false;
        },
        async initializeAuth() {
            await this.refreshAuth().catch((error) => {
                console.error('Auth initialization error:', error);
                this.clearAuth();
            });
        },
    },
    persist: {
        key: 'auth-store',
    },
});
