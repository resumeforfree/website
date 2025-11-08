import type { ResumeData } from '~/types/resume';
import type { SectionRenderer, TemplateLayoutConfig } from '~/types/templateConfig';
import { ITEMS_SPACING, renderTemplateHeader } from './typstUtils';
import { escapeTypstText } from '~/utils/stringUtils';
import {
    generateCertificatesContent,
    generateContactContent,
    generateEducationContent,
    generateExperienceContent,
    generateInternshipsContent,
    generateLanguagesContent,
    generateProjectsContent,
    generateSkillsContent,
    generateSocialLinksContent,
    generateVolunteeringContent,
} from './templateRenderers';
import {
    formatCertificatesItems,
    formatEducationItems,
    formatExperienceItems,
    formatProjectsItems,
    formatSectionItems,
    formatSimpleItems,
    formatSocialLinks,
    wrapInSectionBlock,
} from './layoutFormatters';

const DEFAULT_SECTION_HEADERS = {
    experience: 'Employment History',
    internships: 'Internships',
    education: 'Education',
    skills: 'Skills',
    projects: 'Projects',
    languages: 'Languages',
    volunteering: 'Volunteering',
    info: 'Info',
    socialLinks: 'Links',
    certificates: 'Certificates',
} as const;
export const renderSharedExperience: SectionRenderer = (data: ResumeData, fontSize: number, config: TemplateLayoutConfig, language: string): string => {
    if (!data?.experiences || data.experiences.length === 0) {
        return '';
    }
    const sectionContent = generateExperienceContent(data.experiences, language);
    const formattedContent = formatExperienceItems(sectionContent, config, fontSize);
    const headerText = data?.sectionHeaders?.experience || DEFAULT_SECTION_HEADERS.experience;
    return wrapInSectionBlock(headerText, formattedContent, fontSize, renderTemplateHeader);
};
export const renderSharedInternships: SectionRenderer = (data: ResumeData, fontSize: number, config: TemplateLayoutConfig, language: string): string => {
    if (!data?.internships || data.internships.length === 0) {
        return '';
    }
    const sectionContent = generateInternshipsContent(data.internships, language);
    const formattedContent = formatExperienceItems(sectionContent, config, fontSize);
    const headerText = data?.sectionHeaders?.internships || DEFAULT_SECTION_HEADERS.internships;
    return wrapInSectionBlock(headerText, formattedContent, fontSize, renderTemplateHeader);
};
export const renderSharedEducation: SectionRenderer = (data: ResumeData, fontSize: number, config: TemplateLayoutConfig, language: string): string => {
    if (!data?.education || data.education.length === 0) {
        return '';
    }
    const sectionContent = generateEducationContent(data.education, language);
    const formattedContent = formatEducationItems(sectionContent, config, fontSize, language);
    const headerText = data?.sectionHeaders?.education || DEFAULT_SECTION_HEADERS.education;
    return wrapInSectionBlock(headerText, formattedContent, fontSize, renderTemplateHeader);
};
export const renderSharedVolunteering: SectionRenderer = (data: ResumeData, fontSize: number, config: TemplateLayoutConfig, language: string): string => {
    if (!data?.volunteering || data.volunteering.length === 0) {
        return '';
    }
    const sectionContent = generateVolunteeringContent(data.volunteering, language);
    const formattedContent = formatExperienceItems(sectionContent, config, fontSize);
    const headerText = data?.sectionHeaders?.volunteering || DEFAULT_SECTION_HEADERS.volunteering;
    return wrapInSectionBlock(headerText, formattedContent, fontSize, renderTemplateHeader);
};
export const renderSharedProjects: SectionRenderer = (data: ResumeData, fontSize: number, config: TemplateLayoutConfig, language: string): string => {
    if (!data?.projects || data.projects.length === 0) {
        return '';
    }
    const sectionContent = generateProjectsContent(data.projects);
    if (sectionContent.length === 0) return '';
    const formattedContent = formatProjectsItems(sectionContent, config, fontSize);
    const headerText = data?.sectionHeaders?.projects || DEFAULT_SECTION_HEADERS.projects;
    return wrapInSectionBlock(headerText, formattedContent, fontSize, renderTemplateHeader);
};
export const renderSharedSkills: SectionRenderer = (data: ResumeData, fontSize: number, _config: TemplateLayoutConfig, language: string): string => {
    if (data?.skills && data.skills.length > 0) {
        const sectionContent = generateSkillsContent(data.skills);
        if (sectionContent.length === 0) return '';
        const formattedContent = formatSectionItems(sectionContent.map(item => item.content || ''), {
            spacing: 'block',
            itemSpacing: ITEMS_SPACING,
            joinSeparator: '',
        });
        const headerText = data?.sectionHeaders?.skills || DEFAULT_SECTION_HEADERS.skills;
        return wrapInSectionBlock(headerText, formattedContent, fontSize, renderTemplateHeader);
    }
    if (!data?.technicalSkills || data.technicalSkills.trim() === '') {
        return '';
    }
    const content = data.technicalSkills.trim();
    return wrapInSectionBlock('Technical Skills', content, fontSize, renderTemplateHeader);
};
export const renderSharedLanguages: SectionRenderer = (data: ResumeData, fontSize: number, _config: TemplateLayoutConfig, language: string): string => {
    if (!data?.languages || data.languages.length === 0) {
        return '';
    }
    const sectionContent = generateLanguagesContent(data.languages, language);
    if (sectionContent.length === 0) return '';
    const formattedContent = formatSectionItems(sectionContent.map(item => item.content || ''), {
        spacing: 'block',
        itemSpacing: ITEMS_SPACING,
        joinSeparator: '',
    });
    const headerText = data?.sectionHeaders?.languages || DEFAULT_SECTION_HEADERS.languages;
    return wrapInSectionBlock(headerText, formattedContent, fontSize, renderTemplateHeader);
};
export const renderSharedContactInfo: SectionRenderer = (data: ResumeData, fontSize: number, config: TemplateLayoutConfig, language: string): string => {
    const sectionContent = generateContactContent(data);
    if (sectionContent.length === 0) return '';
    const formattedContent = formatSimpleItems(sectionContent, config);
    const headerText = data?.sectionHeaders?.info || DEFAULT_SECTION_HEADERS.info;
    return wrapInSectionBlock(headerText, formattedContent, fontSize, renderTemplateHeader);
};
export const renderSharedSocialLinks: SectionRenderer = (data: ResumeData, fontSize: number, config: TemplateLayoutConfig, language: string): string => {
    const sectionContent = generateSocialLinksContent(data);
    if (sectionContent.length === 0) return '';
    const formattedContent = formatSocialLinks(sectionContent, config.socialLinks);
    const headerText = data?.sectionHeaders?.socialLinks || DEFAULT_SECTION_HEADERS.socialLinks;
    if (config.socialLinks.placement === 'header' && config.socialLinks.orientation === 'horizontal') {
        return formattedContent;
    }
    return wrapInSectionBlock(headerText, formattedContent, fontSize, renderTemplateHeader);
};
export const renderSharedProfile: SectionRenderer = (data: ResumeData, fontSize: number, _config: TemplateLayoutConfig, language: string): string => {
    if (!data?.summary || !data.summary.trim()) {
        return '';
    }
    const headerText = data?.sectionHeaders?.profile || 'Profile';
    const content = escapeTypstText(data.summary.trim());
    return wrapInSectionBlock(headerText, content, fontSize, renderTemplateHeader);
};
export const renderSharedCertificates: SectionRenderer = (data: ResumeData, fontSize: number, config: TemplateLayoutConfig, language: string): string => {
    if (!data?.certificates || data.certificates.length === 0) {
        return '';
    }
    const sectionContent = generateCertificatesContent(data.certificates, language);
    if (sectionContent.length === 0) return '';
    const formattedContent = formatCertificatesItems(sectionContent, config, fontSize, language);
    const headerText = data?.sectionHeaders?.certificates || DEFAULT_SECTION_HEADERS.certificates;
    return wrapInSectionBlock(headerText, formattedContent, fontSize, renderTemplateHeader);
};
export const getSharedSectionRenderers = () => ({
    experience: renderSharedExperience,
    internships: renderSharedInternships,
    education: renderSharedEducation,
    volunteering: renderSharedVolunteering,
    projects: renderSharedProjects,
    skills: renderSharedSkills,
    languages: renderSharedLanguages,
    contactInfo: renderSharedContactInfo,
    socialLinks: renderSharedSocialLinks,
    profile: renderSharedProfile,
    certificates: renderSharedCertificates,
});
