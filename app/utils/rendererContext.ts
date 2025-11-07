import type { TemplateLayoutConfig } from '~/types/templateConfig';

export class RendererContext {
    constructor(
        public readonly t: (key: string) => string,
        public readonly fontSize: number,
        public readonly config: TemplateLayoutConfig,
    ) {}
}
