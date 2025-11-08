export interface Experience {
    company: string;
    position: string;
    location: string;
    companyUrl?: string;
    startDate: string;
    endDate: string;
    isPresent?: boolean;
    achievements: Array<{ text: string }>;
}
export interface Internship {
    company: string;
    position: string;
    location: string;
    companyUrl?: string;
    startDate: string;
    endDate: string;
    isPresent?: boolean;
    achievements: Array<{ text: string }>;
}
export interface Education {
    institution: string;
    degree: string;
    fieldOfStudy: string;
    location: string;
    startDate: string;
    endDate: string;
    isPresent?: boolean;
    description: string;
    graduationScore?: string;
}
export interface Volunteering {
    organization: string;
    position: string;
    location: string;
    startDate: string;
    endDate: string;
    isPresent?: boolean;
    achievements: Array<{ text: string }>;
}
export interface SkillItem {
    title: string;
    description: string;
}
export interface SocialLink {
    platform: string;
    url: string;
    customLabel?: string;
}
export interface Project {
    title: string;
    url: string;
    description: string;
}
export interface Language {
    name: string;
    proficiency: string;
}
export interface Certificate {
    title: string;
    issuer: string;
    date: string;
    url?: string;
    description?: string;
}
export interface SectionOrder {
    summary: number;
    experience: number;
    internships: number;
    education: number;
    skills: number;
    volunteering: number;
    socialLinks: number;
    projects: number;
    languages: number;
    certificates: number;
}
export interface TemplateLayoutConfig {
    isTwoColumn: boolean;
    leftColumnRatio?: string;
    rightColumnRatio?: string;
    movableSections?: string[];
}
export interface SectionPlacement {
    skills: 'left' | 'right';
    projects: 'left' | 'right';
    volunteering: 'left' | 'right';
    languages: 'left' | 'right';
    certificates: 'left' | 'right';
}
export interface SectionHeaders {
    personalInfo: string;
    profile: string;
    info: string;
    socialLinks: string;
    projects: string;
    languages: string;
    experience: string;
    internships: string;
    education: string;
    skills: string;
    volunteering: string;
    certificates: string;
}
export interface ResumeData {
    version: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    position: string;
    location: string;
    summary: string;
    experiences: Experience[];
    internships: Internship[];
    education: Education[];
    volunteering: Volunteering[];
    skills: SkillItem[];
    socialLinks: SocialLink[];
    projects: Project[];
    languages: Language[];
    certificates: Certificate[];
    technicalSkills: string;
    softSkills: string;
    sectionOrder: SectionOrder;
    sectionHeaders: SectionHeaders;
    sectionPlacement: SectionPlacement;
    language?: string;
}
export interface Resume {
    id: string;
    name: string;
    data: ResumeData;
    createdAt: string;
    updatedAt: string;
    serverId?: string;
}
export interface MultiResumeState {
    resumes: Record<string, Resume>;
    activeResumeId: string | null;
    nextId: number;
}
export interface AppSettings {
    selectedFont: string;
    selectedTemplate: string;
    isRawMode: boolean;
    showDownloadMenu: boolean;
    showFontMenu: boolean;
    showTemplateMenu: boolean;
    fontSize: number;
    sectionCollapsed: Record<string, boolean>;
    language: string;
}
export const defaultResumeData: ResumeData = {
    version: 'v1',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    location: '',
    summary: '',
    experiences: [],
    internships: [],
    education: [],
    volunteering: [],
    skills: [],
    socialLinks: [],
    projects: [],
    languages: [],
    certificates: [],
    technicalSkills: '',
    softSkills: '',
    sectionOrder: {
        summary: 0,
        education: 1,
        experience: 2,
        internships: 3,
        skills: 4,
        volunteering: 5,
        socialLinks: 6,
        projects: 7,
        languages: 8,
        certificates: 9,
    },
    sectionHeaders: {
        personalInfo: 'Personal Information',
        profile: 'Profile',
        info: 'Info',
        socialLinks: 'Links',
        projects: 'Projects',
        languages: 'Languages',
        experience: 'Employment History',
        internships: 'Internships',
        education: 'Education',
        skills: 'Skills',
        volunteering: 'Volunteering',
        certificates: 'Certificates',
    },
    sectionPlacement: {
        skills: 'right',
        projects: 'right',
        volunteering: 'right',
        languages: 'right',
        certificates: 'right',
    },
};
export const defaultAppSettings: AppSettings = {
    selectedFont: 'Calibri',
    selectedTemplate: 'default',
    isRawMode: false,
    showDownloadMenu: false,
    showFontMenu: false,
    showTemplateMenu: false,
    fontSize: 12,
    sectionCollapsed: {
        personal: false,
        experience: true,
        internships: true,
        education: true,
        skills: true,
        volunteering: true,
        projects: true,
        languages: true,
        certificates: true,
    },
    language: 'en',
};
export const availableFonts = [
    { name: 'Calibri', family: 'Calibri' },
    { name: 'Geist', family: 'Geist' },
    { name: 'Roboto', family: 'Roboto' },
];
export const availableTemplates = [
    {
        id: 'default',
        name: 'Default',
        description: 'Optimal for one or two pages resumes',
    },
    {
        id: 'compact',
        name: 'Compact',
        description: 'Single column template for longer resumes',
    },
];
