import type { ResumeData, TemplateLayoutConfig } from '~/types/resume';
import type { TemplateSettings } from '~/types/templateConfig';
import { DEFAULT_LAYOUT_CONFIG } from '~/types/templateConfig';
import { escapeTypstText } from '~/utils/stringUtils';
import { convertGrid, SECTION_SPACING } from '~/utils/typstUtils';
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
const convertResumeHeader = (data: ResumeData, context: RendererContext, sharedRenderers: ReturnType<typeof getSharedSectionRenderers>) => {
    const fullName = `${escapeTypstText(data?.firstName || '')} ${escapeTypstText(data?.lastName || '')}`.trim();
    const position = escapeTypstText(data?.position || '');
    const positionBlock = position ? `#block(above: 0em, below: ${SECTION_SPACING})[${position}]` : '';
    const profileSection = sharedRenderers.profile(data, context);
    return `= ${fullName}
${positionBlock}
${profileSection}`;
};
const parse = (data: ResumeData, font: string, locale = 'en', t: (key: string) => string): string => {
    const settings: TemplateSettings = { font };
    const settingsStore = useSettingsStore();
    const fontSize = settingsStore.fontSize;
    const isRtl = isRtlLocale(locale);

    const config = DEFAULT_LAYOUT_CONFIG;
    const context = new RendererContext(t, fontSize, config);
    const sharedRenderers = getSharedSectionRenderers();

    const allSections = {
        experiences: () => sharedRenderers.experience(data, context),
        internships: () => sharedRenderers.internships(data, context),
        education: () => sharedRenderers.education(data, context),
        contact: () => sharedRenderers.contactInfo(data, context),
        socialLinks: () => sharedRenderers.socialLinks(data, context),
        projects: () => sharedRenderers.projects(data, context),
        languages: () => sharedRenderers.languages(data, context),
        technicalSkills: () => sharedRenderers.skills(data, context),
        volunteering: () => sharedRenderers.volunteering(data, context),
        certificates: () => sharedRenderers.certificates(data, context),
    };
    const fixedLeftSections = ['experiences', 'internships', 'education'];
    const movableSections = ['projects', 'languages', 'technicalSkills', 'volunteering', 'certificates'];
    const leftSections = [...fixedLeftSections];
    const rightSections = [];
    movableSections.forEach((section) => {
        if (section === 'technicalSkills') {
            const placement = data.sectionPlacement?.skills || 'right';
            if (placement === 'left') {
                leftSections.push(section);
            }
            else {
                rightSections.push(section);
            }
        }
        else {
            const placement = data.sectionPlacement?.[section as keyof typeof data.sectionPlacement] || (section === 'certificates' ? 'right' : 'right');
            if (placement === 'left') {
                leftSections.push(section);
            }
            else {
                rightSections.push(section);
            }
        }
    });
    const leftSectionOrder = {
        experiences: data.sectionOrder?.experience || 1,
        internships: data.sectionOrder?.internships || 2,
        education: data.sectionOrder?.education || 3,
        technicalSkills: data.sectionOrder?.skills || 4,
        projects: data.sectionOrder?.projects || 5,
        languages: data.sectionOrder?.languages || 6,
        volunteering: data.sectionOrder?.volunteering || 7,
        certificates: data.sectionOrder?.certificates || 8,
    };
    const rightSectionOrder = {
        technicalSkills: data.sectionOrder?.skills || 1,
        projects: data.sectionOrder?.projects || 2,
        languages: data.sectionOrder?.languages || 3,
        volunteering: data.sectionOrder?.volunteering || 4,
        certificates: data.sectionOrder?.certificates || 5,
    };
    const leftContent = leftSections
        .sort((a, b) => (leftSectionOrder[a] || 999) - (leftSectionOrder[b] || 999))
        .map(section => allSections[section]())
        .filter(content => content.trim() !== '')
        .join('\n\n');
    const dynamicRightContent = rightSections
        .sort((a, b) => (rightSectionOrder[a] || 999) - (rightSectionOrder[b] || 999))
        .map(section => allSections[section]())
        .filter(content => content.trim() !== '');
    const staticRightContent = [
        allSections['contact'](),
        allSections['socialLinks'](),
    ].filter(content => content.trim() !== '');
    const rightContent = [...staticRightContent, ...dynamicRightContent].join('\n\n');
    const headerAndLeftContent = `${convertResumeHeader(data, context, sharedRenderers)}
${leftContent}`;
    const twoColumnLayout = convertGrid([headerAndLeftContent, rightContent], '(7fr, 3fr)');

    // Configure font and text direction for RTL languages
    const fontConfig = isRtl
        ? `#set text(font: ("${settings.font}", "Arial"), size: ${fontSize}pt, dir: rtl)`
        : `#set text(font: ("${settings.font}"), size: ${fontSize}pt)`;

    return `#set page(margin: 1.2cm)
${fontConfig}

${twoColumnLayout}
#pagebreak(weak: true)`;
};
export const defaultTemplate: Template = {
    id: 'default',
    name: 'Default',
    description: 'A clean and professional resume template',
    layoutConfig: {
        isTwoColumn: true,
        leftColumnRatio: '7fr',
        rightColumnRatio: '3fr',
        movableSections: ['skills', 'projects', 'languages', 'volunteering', 'certificates'],
    },
    parse,
};
