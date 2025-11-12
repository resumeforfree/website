import type { ResumeData, SectionOrder, TemplateLayoutConfig } from '~/types/resume';
import type { TemplateSettings } from '~/types/templateConfig';
import { COMPACT_LAYOUT_CONFIG } from '~/types/templateConfig';
import { escapeTypstText } from '~/utils/stringUtils';
import { convertEmail, convertLink, SECTION_SPACING } from '~/utils/typstUtils';
import { useSettingsStore } from '~/stores/settings';
import { getSharedSectionRenderers } from '~/utils/sectionRenderers';
import { RendererContext } from '~/utils/rendererContext';
import { isRtlLocale } from '~/utils/localeUtils';

export interface Template {
    id: string;
    name: string;
    description: string;
    layoutConfig: TemplateLayoutConfig;
    parse: (data: ResumeData, font: string, locale: string, t: (key: string) => string) => string;
}
const renderHeaderLeftColumn = (data: ResumeData, fontSize: number): string[] => {
    const rows: string[] = [];
    const fullName = `${escapeTypstText(data?.firstName || '')} ${escapeTypstText(data?.lastName || '')}`.trim();
    const position = escapeTypstText(data?.position || '');
    rows.push(`#text(size: ${fontSize + 12}pt, weight: "bold")[${fullName}]`);
    if (position) {
        rows.push(`#block(above: 0.8em)[#text(size: ${fontSize + 2}pt)[${position}]]`);
    }
    const socialLinks = (data?.socialLinks || [])
        .filter(link => link.platform && link.url && link.url.trim() !== '')
        .map((link) => {
            let linkText = '';
            if (link.platform === 'other' && link.customLabel) {
                linkText = link.customLabel;
            }
            else {
                const platformLabels = {
                    linkedin: 'LinkedIn',
                    github: 'GitHub',
                    twitter: 'Twitter',
                    portfolio: 'Portfolio',
                    dribbble: 'Dribbble',
                    medium: 'Medium',
                    devto: 'Dev.to',
                    personal: 'Personal',
                };
                linkText = platformLabels[link.platform as keyof typeof platformLabels] || link.platform;
            }
            return convertLink(link.url, linkText);
        });
    if (socialLinks.length > 0) {
        const linksSpacing = rows.length > 0 ? '0.8em' : '0em';
        const linksContent = socialLinks.join(' • ');
        rows.push(`#block(above: ${linksSpacing})[#text(size: ${fontSize - 1}pt)[${linksContent}]]`);
    }
    return rows;
};
const renderHeaderRightColumn = (data: ResumeData, fontSize: number): string[] => {
    const rows: string[] = [];
    if (data?.email) {
        const email = convertEmail(data.email);
        rows.push(`#block(above: 0em)[#text(size: ${fontSize - 1}pt)[${email}]]`);
    }
    if (data?.phone) {
        const phone = escapeTypstText(data.phone);
        const phoneSpacing = rows.length > 0 ? '0.8em' : '0em';
        rows.push(`#block(above: ${phoneSpacing})[#text(size: ${fontSize - 1}pt, dir: ltr)[${phone}]]`);
    }
    if (data?.location) {
        const location = escapeTypstText(data.location);
        const locationSpacing = rows.length > 0 ? '0.8em' : '0em';
        rows.push(`#block(above: ${locationSpacing})[#text(size: ${fontSize - 1}pt)[${location}]]`);
    }

    return rows;
};
const convertResumeHeader = (data: ResumeData, fontSize: number, isRtl = false) => {
    const leftColumnRows = renderHeaderLeftColumn(data, fontSize);
    const rightColumnRows = renderHeaderRightColumn(data, fontSize);
    const headerParts: string[] = [];
    const alignment = isRtl ? 'right, right' : 'left, left';
    headerParts.push('#grid(');
    headerParts.push('    columns: (6fr, 4fr),');
    headerParts.push('    column-gutter: 20pt,');
    headerParts.push(`    align: (${alignment}),`);
    headerParts.push('    [');
    leftColumnRows.forEach((row) => {
        headerParts.push(`        ${row}`);
    });
    headerParts.push('    ],');
    headerParts.push('    [');
    rightColumnRows.forEach((row) => {
        headerParts.push(`        ${row}`);
    });
    headerParts.push('    ]');
    headerParts.push(')');
    headerParts.push('#block(above: 1em, below: 1em)[#line(length: 100%, stroke: 1pt + black)]');
    if (data?.summary) {
        headerParts.push(`#block(above: 0em, below: ${SECTION_SPACING})[`
            + `#text(size: ${fontSize}pt)[${escapeTypstText(data.summary)}]`
            + ']');
    }
    return headerParts.join('\n');
};
const parse = (data: ResumeData, font: string, locale = 'en', t: (key: string) => string): string => {
    const settings: TemplateSettings = { font };
    const settingsStore = useSettingsStore();
    const fontSize = settingsStore.fontSize;
    const isRtl = isRtlLocale(locale);

    const config = COMPACT_LAYOUT_CONFIG;
    const context = new RendererContext(t, fontSize, config, locale);
    const sharedRenderers = getSharedSectionRenderers();

    const sectionRenderers: Record<string, () => string> = {
        education: () => sharedRenderers.education(data, context),
        experience: () => sharedRenderers.experience(data, context),
        internships: () => sharedRenderers.internships(data, context),
        skills: () => sharedRenderers.skills(data, context),
        projects: () => sharedRenderers.projects(data, context),
        volunteering: () => sharedRenderers.volunteering(data, context),
        languages: () => sharedRenderers.languages(data, context),
        certificates: () => sharedRenderers.certificates(data, context),
    };
    const sectionsToRender = Object.keys(sectionRenderers);
    const sortedSections = sectionsToRender.sort((a, b) => {
        const orderA = data.sectionOrder?.[a as keyof SectionOrder] ?? 999;
        const orderB = data.sectionOrder?.[b as keyof SectionOrder] ?? 999;
        return orderA - orderB;
    });
    const sections = sortedSections
        .map(section => sectionRenderers[section]())
        .filter(content => content.trim() !== '');
    const sectionsContent = sections.join('\n\n');
    const fullContent = `${convertResumeHeader(data, fontSize, isRtl)}${sectionsContent ? `\n\n${sectionsContent}` : ''}`;

    // Configure font and text direction for RTL languages
    const fontConfig = isRtl
        ? `#set text(font: ("${settings.font}", "Arial"), size: ${fontSize}pt, dir: rtl)`
        : `#set text(font: ("${settings.font}"), size: ${fontSize}pt)`;

    return `#set page(margin: 1cm)
${fontConfig}
#set par(leading: 0.4em)
${fullContent}
#pagebreak(weak: true)`;
};
export const compactTemplate: Template = {
    id: 'compact',
    name: 'Compact',
    description: 'Single column template for comprehensive resumes with more information',
    layoutConfig: {
        isTwoColumn: false,
        movableSections: [],
    },
    parse,
};
