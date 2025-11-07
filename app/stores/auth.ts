import { defineStore } from 'pinia';

interface AuthUser {
    id: string;
    email: string;
    name?: string;
    verified: boolean;
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
            return await api.auth.login(email, password, turnstileToken)
                .then((result) => {
                    if (result?.user) {
                        this.setAuth(result.user);
                    }
                    return { success: true };
                })
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .catch((error: any) => {
                    console.error('Login error:', error);
                    return {
                        success: false,
                        error: error?.message || 'Login failed',
                    };
                });
        },
        async register(email: string, password: string, passwordConfirm: string, name: string, turnstileToken?: string) {
            const api = useApi();
            return await api.auth.register(email, password, passwordConfirm, name, turnstileToken)
                .then((result) => {
                    if (result?.user) {
                        this.setAuth(result.user);
                    }
                    return { success: true };
                })
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .catch((error: any) => {
                    console.error('Registration error:', error);
                    return {
                        success: false,
                        error: error?.message || 'Registration failed',
                    };
                });
        },
        async logout() {
            const api = useApi();
            return await api.auth.logout()
                .then(() => {
                    this.clearAuth();
                    return { success: true };
                })
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .catch((error: any) => {
                    console.error('Logout error:', error);
                    return {
                        success: false,
                        error: error?.message || 'Logout failed',
                    };
                });
        },
        async refreshAuth() {
            const api = useApi();
            return await api.auth.getSession()
                .then((result) => {
                    if (result?.user) {
                        this.setAuth(result.user);
                        return { success: true };
                    }
                    return { success: false, error: 'No valid session' };
                })
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .catch((error: any) => {
                    console.error('Auth refresh error:', error);
                    this.clearAuth();
                    return {
                        success: false,
                        error: error?.message || 'Auth refresh failed',
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
