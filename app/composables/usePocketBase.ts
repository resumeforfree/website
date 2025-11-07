import PocketBase from 'pocketbase';

let pb: PocketBase;
export const usePocketBase = () => {
    if (!pb) {
        const config = useRuntimeConfig();
        pb = new PocketBase(config.public.pocketbaseUrl);
    }
    return pb;
};
