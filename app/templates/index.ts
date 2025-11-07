import type { Template } from './default';
import { defaultTemplate } from './default';
import { compactTemplate } from './compact';

export const templates: Record<string, Template> = {
    default: defaultTemplate,
    compact: compactTemplate,
};
export const getTemplate = (id: string): Template => {
    return templates[id] || defaultTemplate;
};
export const getTemplateList = () => {
    return Object.values(templates);
};
export * from './default';
export * from './compact';
