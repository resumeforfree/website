import { defineStore } from 'pinia';
import type {
    Certificate,
    Education,
    Experience,
    Internship,
    Language,
    Project,
    Resume,
    ResumeData,
    SectionHeaders,
    SectionOrder,
    SectionPlacement,
    SkillItem,
    SocialLink,
    Volunteering,
} from '~/types/resume';
import { defaultResumeData } from '~/types/resume';
import { useArrayCRUD, useNestedAchievementsCRUD } from '~/composables/useArrayCRUD';

interface ResumeStoreState {
    resumes: Record<string, Resume>;
    activeResumeId: string | null;
    nextId: number;
    isLoading: boolean;
    error: string | null;
    isSyncing: boolean;
    userId: string | null;
}

export const useResumeStore = defineStore('resume', {
    state: (): ResumeStoreState => ({
        resumes: {},
        activeResumeId: null,
        nextId: 1,
        isLoading: false,
        error: null,
        isSyncing: false,
        userId: null,
    }),
    persist: true,
    getters: {
        activeResume: (state): Resume | null => {
            if (!state.activeResumeId) return null;
            return state.resumes[state.activeResumeId] || null;
        },
        activeResumeData: (state): ResumeData | null => {
            if (!state.activeResumeId) return null;
            const resume = state.resumes[state.activeResumeId];
            return resume ? resume.data : null;
        },
        resumesList: (state): Resume[] => {
            return Object.values(state.resumes).sort((a, b) =>
                new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
            );
        },
        resumeCount: (state): number => {
            return Object.keys(state.resumes).length;
        },
        cloudInfo: (state) => {
            const syncedCount = Object.values(state.resumes).filter(resume => resume.serverId).length;
            return {
                count: syncedCount,
                limit: 3,
                remaining: Math.max(0, 3 - syncedCount),
            };
        },
        canSaveToCloud(): boolean {
            return this.cloudInfo.remaining > 0;
        },
        resumeData: (state): ResumeData => {
            const activeData = state.activeResumeId ? state.resumes[state.activeResumeId]?.data : null;
            if (!activeData) return { ...defaultResumeData };
            return activeData;
        },
        fullName: (state): string => {
            const resumeData = state.activeResumeId ? state.resumes[state.activeResumeId]?.data : null;
            if (!resumeData) return '';
            const firstName = resumeData.firstName?.trim() || '';
            const lastName = resumeData.lastName?.trim() || '';
            return [firstName, lastName].filter(Boolean).join(' ');
        },
        hasPersonalInfo: (state): boolean => {
            const resumeData = state.activeResumeId ? state.resumes[state.activeResumeId]?.data : null;
            if (!resumeData) return false;
            return Boolean(resumeData.firstName || resumeData.lastName
                || resumeData.email || resumeData.phone);
        },
        sectionsWithData: (state): string[] => {
            const resumeData = state.activeResumeId ? state.resumes[state.activeResumeId]?.data : null;
            if (!resumeData) return [];
            const sections = [];
            if (resumeData.summary) sections.push('summary');
            if (resumeData.experiences.length) sections.push('experience');
            if (resumeData.education.length) sections.push('education');
            if (resumeData.skills.length) sections.push('skills');
            if (resumeData.volunteering.length) sections.push('volunteering');
            if (resumeData.socialLinks.length) sections.push('socialLinks');
            if (resumeData.projects.length) sections.push('projects');
            if (resumeData.languages.length) sections.push('languages');
            return sections;
        },
        orderedSections: (state): Array<{ key: string; order: number }> => {
            const resumeData = state.activeResumeId ? state.resumes[state.activeResumeId]?.data : null;
            if (!resumeData) return [];
            const sections = [
                { key: 'summary', order: resumeData.sectionOrder.summary },
                { key: 'experience', order: resumeData.sectionOrder.experience },
                { key: 'education', order: resumeData.sectionOrder.education },
                { key: 'skills', order: resumeData.sectionOrder.skills },
                { key: 'volunteering', order: resumeData.sectionOrder.volunteering },
                { key: 'socialLinks', order: resumeData.sectionOrder.socialLinks },
                { key: 'projects', order: resumeData.sectionOrder.projects ?? 6 },
                { key: 'languages', order: resumeData.sectionOrder.languages ?? 7 },
            ];
            return sections.sort((a, b) => a.order - b.order);
        },
    },
    actions: {
        initialize() {
            Object.keys(this.resumes).forEach((resumeId) => {
                const resume = this.resumes[resumeId];
                if (resume === undefined) {
                    return;
                }
                if (resume.data.sectionOrder) {
                    if (resume.data.sectionOrder.internships === undefined) {
                        resume.data.sectionOrder.internships = 3;
                        if (resume.data.sectionOrder.skills === 3) resume.data.sectionOrder.skills = 4;
                        if (resume.data.sectionOrder.volunteering === 4) resume.data.sectionOrder.volunteering = 5;
                        if (resume.data.sectionOrder.socialLinks === 5) resume.data.sectionOrder.socialLinks = 6;
                        if (resume.data.sectionOrder.projects === 6) resume.data.sectionOrder.projects = 7;
                        if (resume.data.sectionOrder.languages === 7) resume.data.sectionOrder.languages = 8;
                        if (resume.data.sectionOrder.certificates === 8) resume.data.sectionOrder.certificates = 9;
                    }
                    if (resume.data.sectionOrder.projects === undefined) {
                        resume.data.sectionOrder.projects = 7;
                    }
                    if (resume.data.sectionOrder.languages === undefined) {
                        resume.data.sectionOrder.languages = 8;
                    }
                    if (resume.data.sectionOrder.certificates === undefined) {
                        resume.data.sectionOrder.certificates = 9;
                    }
                }
                if (!resume.data.sectionHeaders) {
                    resume.data.sectionHeaders = {} as SectionHeaders;
                }
                if (!resume.data.sectionPlacement) {
                    resume.data.sectionPlacement = { ...defaultResumeData.sectionPlacement };
                }
                else {
                    if (resume.data.sectionPlacement.projects === undefined) {
                        resume.data.sectionPlacement.projects = 'right';
                    }
                    if (resume.data.sectionPlacement.languages === undefined) {
                        resume.data.sectionPlacement.languages = 'right';
                    }
                    if (resume.data.sectionPlacement.certificates === undefined) {
                        resume.data.sectionPlacement.certificates = 'right';
                    }
                }
                if (!resume.data.internships) {
                    resume.data.internships = [];
                }
                if (!resume.data.certificates) {
                    resume.data.certificates = [];
                }
                if (resume.serverId === undefined) {
                    resume.serverId = undefined;
                }
            });
            if (!this.activeResumeId && Object.keys(this.resumes).length > 0) {
                this.activeResumeId = Object.keys(this.resumes)[0];
            }
        },

        // Resume management
        createResume(name?: string): string {
            const id = `resume-${this.nextId}`;
            const timestamp = new Date().toISOString();
            this.resumes[id] = {
                id,
                name: name || `Resume ${this.nextId}`,
                data: { ...defaultResumeData },
                createdAt: timestamp,
                updatedAt: timestamp,
            };
            this.nextId++;
            if (this.resumeCount === 1) {
                this.activeResumeId = id;
            }
            return id;
        },

        setActiveResume(id: string): void {
            if (this.resumes[id]) {
                this.activeResumeId = id;
            }
        },

        updateResumeData(id: string, data: Partial<ResumeData>): void {
            if (this.resumes[id]) {
                this.resumes[id].data = { ...this.resumes[id].data, ...data };
                this.resumes[id].updatedAt = new Date().toISOString();
            }
        },

        updateActiveResumeData(data: Partial<ResumeData>): void {
            if (this.activeResumeId) {
                this.updateResumeData(this.activeResumeId, data);
            }
        },

        renameResume(id: string, name: string): void {
            if (this.resumes[id]) {
                this.resumes[id].name = name;
                this.resumes[id].updatedAt = new Date().toISOString();
            }
        },

        updateServerId(id: string, serverId: string): void {
            if (this.resumes[id]) {
                this.resumes[id].serverId = serverId;
                this.resumes[id].updatedAt = new Date().toISOString();
            }
        },

        deleteResume(id: string): void {
            if (this.resumes[id]) {
                const { [id]: deletedResume, ...remainingResumes } = this.resumes;
                this.resumes = remainingResumes;
                if (this.activeResumeId === id) {
                    const remainingIds = Object.keys(this.resumes);
                    this.activeResumeId = remainingIds.length > 0 ? remainingIds[0] : null;
                }
            }
        },

        duplicateResume(id: string, customName?: string): string {
            if (this.resumes[id]) {
                const originalResume = this.resumes[id];
                const newId = `resume-${this.nextId}`;
                const timestamp = new Date().toISOString();
                this.resumes[newId] = {
                    id: newId,
                    name: customName || `${originalResume.name} (Copy)`,
                    data: { ...originalResume.data },
                    createdAt: timestamp,
                    updatedAt: timestamp,
                };
                this.nextId++;
                return newId;
            }
            return '';
        },

        updateField(field: keyof ResumeData, value: unknown) {
            if (this.activeResumeId) {
                const currentData = this.resumes[this.activeResumeId].data;
                const updateData = { ...currentData, [field]: value };
                this.updateResumeData(this.activeResumeId, updateData);
            }
        },

        // Factory methods for creating CRUD operations
        createArrayCRUD<T>(
            arrayKey: keyof ResumeData,
            defaultItem: () => T,
        ) {
            if (!this.activeResumeId) return null;

            const activeId = this.activeResumeId;
            return useArrayCRUD<T>(
                () => this.resumes[activeId].data[arrayKey] as T[],
                (items: T[]) => this.updateResumeData(activeId, { [arrayKey]: items } as Partial<ResumeData>),
                defaultItem,
            );
        },

        createNestedAchievementsCRUD<T extends { achievements: Array<{ text: string }> }>(
            arrayKey: keyof ResumeData,
        ) {
            if (!this.activeResumeId) return null;

            const activeId = this.activeResumeId;
            return useNestedAchievementsCRUD<T>(
                () => this.resumes[activeId].data[arrayKey] as T[],
                (items: T[]) => this.updateResumeData(activeId, { [arrayKey]: items } as Partial<ResumeData>),
            );
        },

        // Experience methods
        addExperience() {
            const crud = this.createArrayCRUD<Experience>('experiences', () => ({
                company: '',
                position: '',
                location: '',
                companyUrl: '',
                startDate: '',
                endDate: '',
                isPresent: false,
                achievements: [{ text: '' }],
            }));
            crud?.add();
        },

        updateExperience(index: number, field: keyof Experience, value: unknown) {
            const crud = this.createArrayCRUD<Experience>('experiences', () => ({} as Experience));
            crud?.update(index, field, value);
        },

        removeExperience(index: number) {
            const crud = this.createArrayCRUD<Experience>('experiences', () => ({} as Experience));
            crud?.remove(index);
        },

        moveExperience(fromIndex: number, toIndex: number) {
            const crud = this.createArrayCRUD<Experience>('experiences', () => ({} as Experience));
            crud?.move(fromIndex, toIndex);
        },

        addExperienceAchievement(experienceIndex: number, achievement = '') {
            const crud = this.createNestedAchievementsCRUD<Experience>('experiences');
            crud?.addAchievement(experienceIndex, achievement);
        },

        updateExperienceAchievement(experienceIndex: number, achievementIndex: number, achievement: string) {
            const crud = this.createNestedAchievementsCRUD<Experience>('experiences');
            crud?.updateAchievement(experienceIndex, achievementIndex, achievement);
        },

        removeExperienceAchievement(experienceIndex: number, achievementIndex: number) {
            const crud = this.createNestedAchievementsCRUD<Experience>('experiences');
            crud?.removeAchievement(experienceIndex, achievementIndex);
        },

        moveExperienceAchievement(experienceIndex: number, fromIndex: number, toIndex: number) {
            const crud = this.createNestedAchievementsCRUD<Experience>('experiences');
            crud?.moveAchievement(experienceIndex, fromIndex, toIndex);
        },

        // Internship methods
        addInternship() {
            const crud = this.createArrayCRUD<Internship>('internships', () => ({
                company: '',
                position: '',
                location: '',
                companyUrl: '',
                startDate: '',
                endDate: '',
                isPresent: false,
                achievements: [{ text: '' }],
            }));
            crud?.add();
        },

        updateInternship(index: number, field: keyof Internship, value: unknown) {
            const crud = this.createArrayCRUD<Internship>('internships', () => ({} as Internship));
            crud?.update(index, field, value);
        },

        removeInternship(index: number) {
            const crud = this.createArrayCRUD<Internship>('internships', () => ({} as Internship));
            crud?.remove(index);
        },

        moveInternship(fromIndex: number, toIndex: number) {
            const crud = this.createArrayCRUD<Internship>('internships', () => ({} as Internship));
            crud?.move(fromIndex, toIndex);
        },

        addInternshipAchievement(internshipIndex: number, achievement = '') {
            const crud = this.createNestedAchievementsCRUD<Internship>('internships');
            crud?.addAchievement(internshipIndex, achievement);
        },

        updateInternshipAchievement(internshipIndex: number, achievementIndex: number, achievement: string) {
            const crud = this.createNestedAchievementsCRUD<Internship>('internships');
            crud?.updateAchievement(internshipIndex, achievementIndex, achievement);
        },

        removeInternshipAchievement(internshipIndex: number, achievementIndex: number) {
            const crud = this.createNestedAchievementsCRUD<Internship>('internships');
            crud?.removeAchievement(internshipIndex, achievementIndex);
        },

        moveInternshipAchievement(internshipIndex: number, fromIndex: number, toIndex: number) {
            const crud = this.createNestedAchievementsCRUD<Internship>('internships');
            crud?.moveAchievement(internshipIndex, fromIndex, toIndex);
        },

        // Education methods
        addEducation() {
            const crud = this.createArrayCRUD<Education>('education', () => ({
                institution: '',
                degree: '',
                fieldOfStudy: '',
                location: '',
                startDate: '',
                endDate: '',
                isPresent: false,
                description: '',
                graduationScore: '',
            }));
            crud?.add();
        },

        updateEducation(index: number, field: keyof Education, value: unknown) {
            const crud = this.createArrayCRUD<Education>('education', () => ({} as Education));
            crud?.update(index, field, value);
        },

        removeEducation(index: number) {
            const crud = this.createArrayCRUD<Education>('education', () => ({} as Education));
            crud?.remove(index);
        },

        moveEducation(fromIndex: number, toIndex: number) {
            const crud = this.createArrayCRUD<Education>('education', () => ({} as Education));
            crud?.move(fromIndex, toIndex);
        },

        // Volunteering methods
        addVolunteering() {
            const crud = this.createArrayCRUD<Volunteering>('volunteering', () => ({
                organization: '',
                position: '',
                location: '',
                startDate: '',
                endDate: '',
                isPresent: false,
                achievements: [],
            }));
            crud?.add();
        },

        updateVolunteering(index: number, field: keyof Volunteering, value: unknown) {
            const crud = this.createArrayCRUD<Volunteering>('volunteering', () => ({} as Volunteering));
            crud?.update(index, field, value);
        },

        removeVolunteering(index: number) {
            const crud = this.createArrayCRUD<Volunteering>('volunteering', () => ({} as Volunteering));
            crud?.remove(index);
        },

        moveVolunteering(fromIndex: number, toIndex: number) {
            const crud = this.createArrayCRUD<Volunteering>('volunteering', () => ({} as Volunteering));
            crud?.move(fromIndex, toIndex);
        },

        addVolunteeringAchievement(volunteeringIndex: number, achievement = '') {
            const crud = this.createNestedAchievementsCRUD<Volunteering>('volunteering');
            crud?.addAchievement(volunteeringIndex, achievement);
        },

        updateVolunteeringAchievement(volunteeringIndex: number, achievementIndex: number, achievement: string) {
            const crud = this.createNestedAchievementsCRUD<Volunteering>('volunteering');
            crud?.updateAchievement(volunteeringIndex, achievementIndex, achievement);
        },

        removeVolunteeringAchievement(volunteeringIndex: number, achievementIndex: number) {
            const crud = this.createNestedAchievementsCRUD<Volunteering>('volunteering');
            crud?.removeAchievement(volunteeringIndex, achievementIndex);
        },

        moveVolunteeringAchievement(volunteeringIndex: number, fromIndex: number, toIndex: number) {
            const crud = this.createNestedAchievementsCRUD<Volunteering>('volunteering');
            crud?.moveAchievement(volunteeringIndex, fromIndex, toIndex);
        },

        // Skills methods
        addSkill() {
            const crud = this.createArrayCRUD<SkillItem>('skills', () => ({
                title: '',
                description: '',
            }));
            crud?.add();
        },

        updateSkill(index: number, field: keyof SkillItem, value: unknown) {
            const crud = this.createArrayCRUD<SkillItem>('skills', () => ({} as SkillItem));
            crud?.update(index, field, value);
        },

        removeSkill(index: number) {
            const crud = this.createArrayCRUD<SkillItem>('skills', () => ({} as SkillItem));
            crud?.remove(index);
        },

        moveSkill(fromIndex: number, toIndex: number) {
            const crud = this.createArrayCRUD<SkillItem>('skills', () => ({} as SkillItem));
            crud?.move(fromIndex, toIndex);
        },

        // Social Links methods
        addSocialLink() {
            const crud = this.createArrayCRUD<SocialLink>('socialLinks', () => ({
                platform: 'linkedin',
                url: '',
                customLabel: '',
            }));
            crud?.add();
        },

        updateSocialLink(index: number, field: keyof SocialLink, value: unknown) {
            const crud = this.createArrayCRUD<SocialLink>('socialLinks', () => ({} as SocialLink));
            crud?.update(index, field, value);
        },

        removeSocialLink(index: number) {
            const crud = this.createArrayCRUD<SocialLink>('socialLinks', () => ({} as SocialLink));
            crud?.remove(index);
        },

        moveSocialLink(fromIndex: number, toIndex: number) {
            const crud = this.createArrayCRUD<SocialLink>('socialLinks', () => ({} as SocialLink));
            crud?.move(fromIndex, toIndex);
        },

        // Projects methods
        addProject() {
            const crud = this.createArrayCRUD<Project>('projects', () => ({
                title: '',
                url: '',
                description: '',
            }));
            crud?.add();
        },

        updateProject(index: number, field: keyof Project, value: unknown) {
            const crud = this.createArrayCRUD<Project>('projects', () => ({} as Project));
            crud?.update(index, field, value);
        },

        removeProject(index: number) {
            const crud = this.createArrayCRUD<Project>('projects', () => ({} as Project));
            crud?.remove(index);
        },

        moveProject(fromIndex: number, toIndex: number) {
            const crud = this.createArrayCRUD<Project>('projects', () => ({} as Project));
            crud?.move(fromIndex, toIndex);
        },

        // Languages methods
        addLanguage() {
            const crud = this.createArrayCRUD<Language>('languages', () => ({
                name: '',
                proficiency: '',
            }));
            crud?.add();
        },

        updateLanguage(index: number, field: keyof Language, value: unknown) {
            const crud = this.createArrayCRUD<Language>('languages', () => ({} as Language));
            crud?.update(index, field, value);
        },

        removeLanguage(index: number) {
            const crud = this.createArrayCRUD<Language>('languages', () => ({} as Language));
            crud?.remove(index);
        },

        moveLanguage(fromIndex: number, toIndex: number) {
            const crud = this.createArrayCRUD<Language>('languages', () => ({} as Language));
            crud?.move(fromIndex, toIndex);
        },

        // Certificates methods
        addCertificate() {
            const crud = this.createArrayCRUD<Certificate>('certificates', () => ({
                title: '',
                issuer: '',
                date: '',
                url: '',
            }));
            crud?.add();
        },

        updateCertificate(index: number, field: keyof Certificate, value: unknown) {
            const crud = this.createArrayCRUD<Certificate>('certificates', () => ({} as Certificate));
            crud?.update(index, field, value);
        },

        removeCertificate(index: number) {
            const crud = this.createArrayCRUD<Certificate>('certificates', () => ({} as Certificate));
            crud?.remove(index);
        },

        moveCertificate(fromIndex: number, toIndex: number) {
            const crud = this.createArrayCRUD<Certificate>('certificates', () => ({} as Certificate));
            crud?.move(fromIndex, toIndex);
        },

        // Section management
        updateSectionOrder(newOrder: SectionOrder) {
            if (this.activeResumeId) {
                this.updateResumeData(this.activeResumeId, { sectionOrder: { ...newOrder } });
            }
        },

        updateSectionHeader(section: keyof SectionHeaders, headerText: string, locale: string) {
            if (this.activeResumeId) {
                const currentData = this.resumes[this.activeResumeId].data;

                // Initialize sectionHeadersI18n if it doesn't exist
                const i18nHeaders = currentData.sectionHeadersI18n || {};

                // Initialize locale object if it doesn't exist
                const localeHeaders = i18nHeaders[locale] || {};

                // Update the header for the current locale
                const newLocaleHeaders = { ...localeHeaders, [section]: headerText };
                const newI18nHeaders = { ...i18nHeaders, [locale]: newLocaleHeaders };

                this.updateResumeData(this.activeResumeId, { sectionHeadersI18n: newI18nHeaders });
            }
        },

        updateSectionPlacement(section: keyof SectionPlacement, placement: 'left' | 'right') {
            if (this.activeResumeId) {
                const currentData = this.resumes[this.activeResumeId].data;
                const newPlacement = { ...currentData.sectionPlacement, [section]: placement };
                this.updateResumeData(this.activeResumeId, { sectionPlacement: newPlacement });
            }
        },

        moveSectionUp(sectionKey: keyof SectionOrder) {
            if (this.activeResumeId) {
                const currentData = this.resumes[this.activeResumeId].data;
                const currentOrder = currentData.sectionOrder[sectionKey];
                if (currentOrder > 0) {
                    const targetSection = Object.keys(currentData.sectionOrder).find(key =>
                        currentData.sectionOrder[key as keyof SectionOrder] === currentOrder - 1,
                    ) as keyof SectionOrder;
                    if (targetSection) {
                        const newSectionOrder = { ...currentData.sectionOrder };
                        newSectionOrder[sectionKey] = currentOrder - 1;
                        newSectionOrder[targetSection] = currentOrder;
                        this.updateResumeData(this.activeResumeId, { sectionOrder: newSectionOrder });
                    }
                }
            }
        },

        moveSectionDown(sectionKey: keyof SectionOrder) {
            if (this.activeResumeId) {
                const currentData = this.resumes[this.activeResumeId].data;
                const currentOrder = currentData.sectionOrder[sectionKey];
                const maxOrder = Math.max(...Object.values(currentData.sectionOrder));
                if (currentOrder < maxOrder) {
                    const targetSection = Object.keys(currentData.sectionOrder).find(key =>
                        currentData.sectionOrder[key as keyof SectionOrder] === currentOrder + 1,
                    ) as keyof SectionOrder;
                    if (targetSection) {
                        const newSectionOrder = { ...currentData.sectionOrder };
                        newSectionOrder[sectionKey] = currentOrder + 1;
                        newSectionOrder[targetSection] = currentOrder;
                        this.updateResumeData(this.activeResumeId, { sectionOrder: newSectionOrder });
                    }
                }
            }
        },

        // Data operations
        setResumeData(data: ResumeData) {
            if (this.activeResumeId) {
                this.updateResumeData(this.activeResumeId, data);
            }
        },

        resetResumeData() {
            if (this.activeResumeId) {
                this.updateResumeData(this.activeResumeId, { ...defaultResumeData });
            }
        },

        exportData(): string {
            const currentData = this.activeResumeId ? this.resumes[this.activeResumeId]?.data : null;
            return JSON.stringify(currentData || { ...defaultResumeData }, null, 2);
        },

        importData(jsonString: string): boolean {
            try {
                const data = JSON.parse(jsonString);
                this.setResumeData(data);
                return true;
            }
            catch (error) {
                console.error('Failed to import data:', error);
                this.error = 'Failed to import data. Please check the file format.';
                return false;
            }
        },

        // Server sync operations
        async fetchServerResumes() {
            this.isLoading = true;
            this.error = null;
            try {
                const api = useApi();
                const serverResumes = await api.resumes.list();
                await this.reconcileServerResumes(serverResumes);
            }
            catch (error: unknown) {
                console.error('Failed to fetch server resumes:', error);
                this.error = (error as Error).message || 'Failed to fetch resumes from server';
            }
            finally {
                this.isLoading = false;
            }
        },

        async reconcileServerResumes(serverResumes: Array<{ id: string; name: string; data: ResumeData; createdAt: string; updatedAt: string }>) {
            for (const serverResume of serverResumes) {
                const localResumeId = this.findLocalResumeByServerId(serverResume.id);
                if (localResumeId) {
                    const localResume = this.resumes[localResumeId];
                    const serverUpdatedAt = new Date(serverResume.updatedAt);
                    const localUpdatedAt = new Date(localResume.updatedAt);
                    if (serverUpdatedAt > localUpdatedAt) {
                        this.resumes[localResumeId] = {
                            ...localResume,
                            name: serverResume.name,
                            data: serverResume.data,
                            updatedAt: serverResume.updatedAt,
                            serverId: serverResume.id,
                        };
                    }
                    else {
                        this.resumes[localResumeId].serverId = serverResume.id;
                    }
                }
                else {
                    const newLocalId = `resume-${this.nextId}`;
                    this.nextId += 1;
                    this.resumes[newLocalId] = {
                        id: newLocalId,
                        serverId: serverResume.id,
                        name: serverResume.name,
                        data: serverResume.data || { ...defaultResumeData },
                        createdAt: serverResume.createdAt,
                        updatedAt: serverResume.updatedAt,
                    };
                }
            }

            const serverResumeIds = new Set(serverResumes.map(r => r.id));
            let orphanedCount = 0;

            for (const [localId, localResume] of Object.entries(this.resumes)) {
                if (localResume.serverId && !serverResumeIds.has(localResume.serverId)) {
                    console.log(`Resume "${localResume.name}" (${localId}) was deleted from server, clearing serverId`);
                    this.resumes[localId].serverId = undefined;
                    this.resumes[localId].updatedAt = new Date().toISOString();
                    orphanedCount++;
                }
            }

            if (orphanedCount > 0 && import.meta.client) {
                const { toast } = await import('vue-sonner');
                toast.info(`${orphanedCount} resume${orphanedCount > 1 ? 's' : ''} removed from cloud sync`);
            }
        },

        findLocalResumeByServerId(serverId: string): string | null {
            for (const [localId, resume] of Object.entries(this.resumes)) {
                if (resume.serverId === serverId) {
                    return localId;
                }
            }
            return null;
        },

        async syncResumeToServer(resumeId: string) {
            const resume = this.resumes[resumeId];
            if (!resume) return;

            try {
                const api = useApi();

                if (resume.serverId) {
                    await api.resumes.update(resume.serverId, {
                        name: resume.name,
                        data: resume.data,
                    });
                }

                else {
                    const serverResume = await api.resumes.create(resume.name, resume.data);
                    this.resumes[resumeId].serverId = serverResume.id;
                }
                this.resumes[resumeId].updatedAt = new Date().toISOString();
            }
            catch (error: unknown) {
                console.error('Failed to sync resume to server:', error);
                throw error;
            }
        },
    },
});
