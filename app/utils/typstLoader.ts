import { $typst } from '@myriaddreamin/typst.ts';
import { preloadRemoteFonts } from '@myriaddreamin/typst.ts/dist/esm/options.init.mjs';

export interface TypstLoaderState {
    isLoading: boolean;
    isReady: boolean;
    error: string | null;
    hasInitialized: boolean;
}
class TypstLoader {
    private static instance: TypstLoader;
    private state: TypstLoaderState = {
        isLoading: false,
        isReady: false,
        error: null,
        hasInitialized: false,
    };

    private listeners = new Set<(state: TypstLoaderState) => void>();
    private initPromise: Promise<void> | null = null;
    static getInstance(): TypstLoader {
        if (!TypstLoader.instance) {
            TypstLoader.instance = new TypstLoader();
        }
        return TypstLoader.instance;
    }

    getState(): TypstLoaderState {
        return { ...this.state };
    }

    subscribe(listener: (state: TypstLoaderState) => void): () => void {
        this.listeners.add(listener);
        setTimeout(() => listener({ ...this.state }), 0);
        return () => {
            this.listeners.delete(listener);
        };
    }

    async initialize(): Promise<void> {
        if (this.initPromise) {
            return this.initPromise;
        }
        if (this.state.isReady && this.state.hasInitialized) {
            return Promise.resolve();
        }
        if (this.state.isLoading) {
            return this.initPromise || Promise.resolve();
        }
        this.setState({ isLoading: true, error: null });
        this.initPromise = this.performInitialization();
        try {
            await this.initPromise;
            this.setState({
                isLoading: false,
                isReady: true,
                error: null,
                hasInitialized: true,
            });
            window.$typst = $typst;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to initialize Typst';
            this.setState({
                isLoading: false,
                isReady: false,
                error: errorMessage,
                hasInitialized: false,
            });
            throw error;
        }
        finally {
            this.initPromise = null;
        }
    }

    reset() {
        this.state = {
            isLoading: false,
            isReady: false,
            error: null,
            hasInitialized: false,
        };
        this.initPromise = null;
        this.notifyListeners();
    }

    async retry(): Promise<void> {
        this.setState({ hasInitialized: false, error: null });
        await this.initialize();
    }

    private setState(newState: Partial<TypstLoaderState>) {
        this.state = { ...this.state, ...newState };
        this.notifyListeners();
    }

    private notifyListeners() {
        setTimeout(() => {
            this.listeners.forEach((listener) => {
                try {
                    listener({ ...this.state });
                }
                catch (error) {
                    console.error('Error in typst loader listener:', error);
                }
            });
        }, 0);
    }

    private async performInitialization(): Promise<void> {
        try {
            console.log('Initializing Typst...');
            $typst.setCompilerInitOptions({
                getModule: async () => {
                    const wasmUrl = new URL('@myriaddreamin/typst-ts-web-compiler/pkg/typst_ts_web_compiler_bg.wasm', import.meta.url);
                    const wasmResponse = await fetch(wasmUrl);
                    if (!wasmResponse.ok) {
                        throw new Error(`Failed to fetch compiler WASM: ${wasmResponse.status}`);
                    }
                    return await wasmResponse.arrayBuffer();
                },
                beforeBuild: [
                    preloadRemoteFonts([
                        // English fonts
                        '/fonts/roboto-regular.ttf',
                        '/fonts/roboto-bold.ttf',
                        '/fonts/calibri-regular.ttf',
                        '/fonts/calibri-bold.ttf',
                        '/fonts/geist-bold.ttf',
                        '/fonts/geist-regular.ttf',
                        // Arabic fonts
                        '/fonts/ar/naskh.ttf',
                        '/fonts/ar/naskh-bold.ttf',
                    ], { assets: false }),
                ],
            });
            $typst.setRendererInitOptions({
                getModule: async () => {
                    const wasmUrl = new URL('@myriaddreamin/typst-ts-renderer/pkg/typst_ts_renderer_bg.wasm', import.meta.url);
                    const wasmResponse = await fetch(wasmUrl);
                    if (!wasmResponse.ok) {
                        throw new Error(`Failed to fetch renderer WASM: ${wasmResponse.status}`);
                    }
                    return await wasmResponse.arrayBuffer();
                },
            });
            console.log('Typst initialized successfully');
        }
        catch (error) {
            console.error('Failed to initialize Typst:', error);
            throw error;
        }
    }
}
export const typstLoader = TypstLoader.getInstance();
