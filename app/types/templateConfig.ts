import type { ResumeData } from './resume';
import { HEADER_SPACING, ITEMS_SPACING } from '~/utils/typstUtils';

export interface SectionContent {
    title: string;
    date?: string;
    content?: string;
    achievements?: string[];
    links?: string[];
    additionalInfo?: string;
}
export interface TemplateLayoutConfig {
    layout: 'single-column' | 'two-column';
    sections: {
        spacing: 'block' | 'joined';
        itemSpacing: string;
        joinSeparator: string;
    };
    socialLinks: {
        orientation: 'vertical' | 'horizontal';
        placement: 'header' | 'sidebar' | 'section';
        separator: string;
    };
    header: {
        style: 'simple' | 'grid';
        includeContact: boolean;
    };
    projects: {
        itemSpacing: string;
    };
}
export const DEFAULT_LAYOUT_CONFIG: TemplateLayoutConfig = {
    layout: 'two-column',
    sections: {
        spacing: 'block',
        itemSpacing: ITEMS_SPACING,
        joinSeparator: '',
    },
    socialLinks: {
        orientation: 'vertical',
        placement: 'sidebar',
        separator: '',
    },
    header: {
        style: 'simple',
        includeContact: false,
    },
    projects: {
        itemSpacing: HEADER_SPACING,
    },
};
export const COMPACT_LAYOUT_CONFIG: TemplateLayoutConfig = {
    layout: 'single-column',
    sections: {
        spacing: 'joined',
        itemSpacing: '',
        joinSeparator: '\n\n',
    },
    socialLinks: {
        orientation: 'horizontal',
        placement: 'header',
        separator: ' • ',
    },
    header: {
        style: 'grid',
        includeContact: true,
    },
    projects: {
        itemSpacing: '',
    },
};
export type SectionRenderer = (data: ResumeData, fontSize: number, config: TemplateLayoutConfig) => string;
