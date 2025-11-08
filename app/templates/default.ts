import type { ResumeData, TemplateLayoutConfig } from '~/types/resume';
import type { TemplateSettings } from '~/types/templateConfig';
import { DEFAULT_LAYOUT_CONFIG } from '~/types/templateConfig';
import { escapeTypstText } from '~/utils/stringUtils';
import { convertGrid, SECTION_SPACING } from '~/utils/typstUtils';
import { useSettingsStore } from '~/stores/settings';
import { getSharedSectionRenderers } from '~/utils/sectionRenderers';

export interface Template {
    id: string;
    name: string;
    description: string;
    layoutConfig: TemplateLayoutConfig;
    parse: (data: ResumeData, font: string) => string;
}
const convertResumeHeader = (data: ResumeData, fontSize: number, sharedRenderers: ReturnType<typeof getSharedSectionRenderers>, config: TemplateLayoutConfig) => {
    const fullName = `${escapeTypstText(data?.firstName || '')} ${escapeTypstText(data?.lastName || '')}`.trim();
    const position = escapeTypstText(data?.position || '');
    const positionBlock = position ? `#block(above: 0em, below: ${SECTION_SPACING})[${position}]` : '';
    const profileSection = sharedRenderers.profile(data, fontSize, config);
    return `= ${fullName}
${positionBlock}
${profileSection}`;
};
const parse = (data: ResumeData, font: string): string => {
    const settings: TemplateSettings = { font };
    const settingsStore = useSettingsStore();
    const fontSize = settingsStore.fontSize;
    const language = settingsStore.language;
    const sharedRenderers = getSharedSectionRenderers();
    const config = DEFAULT_LAYOUT_CONFIG;
    const allSections = {
        experiences: () => sharedRenderers.experience(data, fontSize, config, language),
        internships: () => sharedRenderers.internships(data, fontSize, config, language),
        education: () => sharedRenderers.education(data, fontSize, config, language),
        contact: () => sharedRenderers.contactInfo(data, fontSize, config, language),
        socialLinks: () => sharedRenderers.socialLinks(data, fontSize, config, language),
        projects: () => sharedRenderers.projects(data, fontSize, config, language),
        languages: () => sharedRenderers.languages(data, fontSize, config, language),
        technicalSkills: () => sharedRenderers.skills(data, fontSize, config, language),
        volunteering: () => sharedRenderers.volunteering(data, fontSize, config, language),
        certificates: () => sharedRenderers.certificates(data, fontSize, config, language),
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
    const headerAndLeftContent = `${convertResumeHeader(data, fontSize, sharedRenderers, config)}
${leftContent}`;
    const twoColumnLayout = convertGrid([headerAndLeftContent, rightContent], '(7fr, 3fr)');
    return `#set page(margin: 1.2cm)
#set text(font: ("${settings.font}"), size: ${fontSize}pt)
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
