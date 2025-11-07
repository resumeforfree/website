declare global {
    interface Window {
        $typst: {
            svg: (options: { mainContent: string }) => Promise<string>;
            pdf: (options: { mainContent: string }) => Promise<Uint8Array>;
            setCompilerInitOptions: (options: Record<string, unknown>) => void;
            setRendererInitOptions: (options: Record<string, unknown>) => void;
        };
    }
}
export {};
