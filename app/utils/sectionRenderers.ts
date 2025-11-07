import type { ResumeData } from '~/types/resume';
import type { SectionRenderer } from '~/types/templateConfig';
import { ITEMS_SPACING, renderTemplateHeader } from './typstUtils';
import { escapeTypstText } from '~/utils/stringUtils';
import type { RendererContext } from './rendererContext';
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


/**
 * Render experience section using shared logic
 */
export const renderSharedExperience: SectionRenderer = (data: ResumeData, context: RendererContext): string => {
    if (!data?.experiences || data.experiences.length === 0) {
        return '';
    }

    const sectionContent = generateExperienceContent(data.experiences, context.t);
    const formattedContent = formatExperienceItems(sectionContent, context.config, context.fontSize);
    const headerText = context.t('forms.experience.title');

    return wrapInSectionBlock(headerText, formattedContent, context.fontSize, renderTemplateHeader);
};

/**
 * Render internships section using shared logic
 */
export const renderSharedInternships: SectionRenderer = (data: ResumeData, context: RendererContext): string => {
    if (!data?.internships || data.internships.length === 0) {
        return '';
    }

    const sectionContent = generateInternshipsContent(data.internships, context.t);
    const formattedContent = formatExperienceItems(sectionContent, context.config, context.fontSize);
    const headerText = context.t('forms.internships.title');

    return wrapInSectionBlock(headerText, formattedContent, context.fontSize, renderTemplateHeader);
};

/**
 * Render education section using shared logic
 */
export const renderSharedEducation: SectionRenderer = (data: ResumeData, context: RendererContext): string => {
    if (!data?.education || data.education.length === 0) {
        return '';
    }

    const sectionContent = generateEducationContent(data.education, context.t);
    const formattedContent = formatEducationItems(sectionContent, context.config, context.fontSize);
    const headerText = context.t('forms.education.title');

    return wrapInSectionBlock(headerText, formattedContent, context.fontSize, renderTemplateHeader);
};

/**
 * Render volunteering section using shared logic
 */
export const renderSharedVolunteering: SectionRenderer = (data: ResumeData, context: RendererContext): string => {
    if (!data?.volunteering || data.volunteering.length === 0) {
        return '';
    }

    const sectionContent = generateVolunteeringContent(data.volunteering, context.t);
    const formattedContent = formatExperienceItems(sectionContent, context.config, context.fontSize);
    const headerText = context.t('forms.volunteering.title');

    return wrapInSectionBlock(headerText, formattedContent, context.fontSize, renderTemplateHeader);
};

/**
 * Render projects section using shared logic
 */
export const renderSharedProjects: SectionRenderer = (data: ResumeData, context: RendererContext): string => {
    if (!data?.projects || data.projects.length === 0) {
        return '';
    }

    const sectionContent = generateProjectsContent(data.projects);
    if (sectionContent.length === 0) return '';

    const formattedContent = formatProjectsItems(sectionContent, context.config, context.fontSize);
    const headerText = context.t('forms.projects.title');

    return wrapInSectionBlock(headerText, formattedContent, context.fontSize, renderTemplateHeader);
};

/**
 * Render skills section using shared logic
 */
export const renderSharedSkills: SectionRenderer = (data: ResumeData, context: RendererContext): string => {
    if (data?.skills && data.skills.length > 0) {
        const sectionContent = generateSkillsContent(data.skills);
        if (sectionContent.length === 0) return '';

        const formattedContent = formatSectionItems(sectionContent.map(item => item.content || ''), {
            spacing: 'block',
            itemSpacing: ITEMS_SPACING,
            joinSeparator: '',
        });
        const headerText = context.t('forms.skills.title');

        return wrapInSectionBlock(headerText, formattedContent, context.fontSize, renderTemplateHeader);
    }

    // Handle legacy technicalSkills format
    if (!data?.technicalSkills || data.technicalSkills.trim() === '') {
        return '';
    }

    const content = data.technicalSkills.trim();
    const headerText = context.t('forms.skills.title');
    return wrapInSectionBlock(headerText, content, context.fontSize, renderTemplateHeader);
};

/**
 * Render languages section using shared logic
 */
export const renderSharedLanguages: SectionRenderer = (data: ResumeData, context: RendererContext): string => {
    if (!data?.languages || data.languages.length === 0) {
        return '';
    }

    const sectionContent = generateLanguagesContent(data.languages);
    if (sectionContent.length === 0) return '';

    const formattedContent = formatSectionItems(sectionContent.map(item => item.content || ''), {
        spacing: 'block',
        itemSpacing: ITEMS_SPACING,
        joinSeparator: '',
    });
    const headerText = context.t('forms.languages.title');

    return wrapInSectionBlock(headerText, formattedContent, context.fontSize, renderTemplateHeader);
};

/**
 * Render contact info section using shared logic
 */
export const renderSharedContactInfo: SectionRenderer = (data: ResumeData, context: RendererContext): string => {
    const sectionContent = generateContactContent(data);
    if (sectionContent.length === 0) return '';

    const formattedContent = formatSimpleItems(sectionContent, context.config);
    const headerText = context.t('forms.personalInfo.title');

    return wrapInSectionBlock(headerText, formattedContent, context.fontSize, renderTemplateHeader);
};

/**
 * Render social links section using shared logic
 */
export const renderSharedSocialLinks: SectionRenderer = (data: ResumeData, context: RendererContext): string => {
    const sectionContent = generateSocialLinksContent(data);
    if (sectionContent.length === 0) return '';

    const formattedContent = formatSocialLinks(sectionContent, context.config.socialLinks);
    const headerText = context.t('forms.personalInfo.socialLinks');

    // For horizontal links in header, don't wrap in section block
    if (context.config.socialLinks.placement === 'header' && context.config.socialLinks.orientation === 'horizontal') {
        return formattedContent;
    }

    return wrapInSectionBlock(headerText, formattedContent, context.fontSize, renderTemplateHeader);
};

/**
 * Render profile/summary section using shared logic
 */
export const renderSharedProfile: SectionRenderer = (data: ResumeData, context: RendererContext): string => {
    if (!data?.summary || !data.summary.trim()) {
        return '';
    }

    const headerText = context.t('forms.personalInfo.summary');
    const content = escapeTypstText(data.summary.trim());

    return wrapInSectionBlock(headerText, content, context.fontSize, renderTemplateHeader);
};

/**
 * Render certificates section using shared logic
 */
export const renderSharedCertificates: SectionRenderer = (data: ResumeData, context: RendererContext): string => {
    if (!data?.certificates || data.certificates.length === 0) {
        return '';
    }

    const sectionContent = generateCertificatesContent(data.certificates);
    if (sectionContent.length === 0) return '';

    const formattedContent = formatCertificatesItems(sectionContent, context.config, context.fontSize);
    const headerText = context.t('forms.certificates.title');

    return wrapInSectionBlock(headerText, formattedContent, context.fontSize, renderTemplateHeader);
};

/**
 * Get all available shared section renderers
 */
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
