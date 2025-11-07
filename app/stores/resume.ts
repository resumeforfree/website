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
                    resume.data.sectionHeaders = { ...defaultResumeData.sectionHeaders };
                }
                else {
                    if (resume.data.sectionHeaders.internships === undefined) {
                        resume.data.sectionHeaders.internships = 'Internships';
                    }
                    if (resume.data.sectionHeaders.projects === undefined) {
                        resume.data.sectionHeaders.projects = 'Projects';
                    }
                    if (resume.data.sectionHeaders.languages === undefined) {
                        resume.data.sectionHeaders.languages = 'Languages';
                    }
                    if (resume.data.sectionHeaders.certificates === undefined) {
                        resume.data.sectionHeaders.certificates = 'Certificates';
                    }
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
        addExperience() {
            if (this.activeResumeId) {
                const currentData = this.resumes[this.activeResumeId].data;
                const newExperiences = [...currentData.experiences, {
                    company: '',
                    position: '',
                    location: '',
                    companyUrl: '',
                    startDate: '',
                    endDate: '',
                    isPresent: false,
                    achievements: [{ text: '' }],
                }];
                this.updateResumeData(this.activeResumeId, { experiences: newExperiences });
            }
        },
        updateExperience(index: number, field: keyof Experience, value: unknown) {
            if (this.activeResumeId) {
                const currentData = this.resumes[this.activeResumeId].data;
                if (currentData.experiences[index]) {
                    const newExperiences = [...currentData.experiences];
                    (newExperiences[index] as Record<string, unknown>)[field] = value;
                    this.updateResumeData(this.activeResumeId, { experiences: newExperiences });
                }
            }
        },
        removeExperience(index: number) {
            if (this.activeResumeId) {
                const currentData = this.resumes[this.activeResumeId].data;
                const newExperiences = [...currentData.experiences];
                newExperiences.splice(index, 1);
                this.updateResumeData(this.activeResumeId, { experiences: newExperiences });
            }
        },
        moveExperience(fromIndex: number, toIndex: number) {
            if (this.activeResumeId) {
                const currentData = this.resumes[this.activeResumeId].data;
                const newExperiences = [...currentData.experiences];
                const item = newExperiences.splice(fromIndex, 1)[0];
                newExperiences.splice(toIndex, 0, item);
                this.updateResumeData(this.activeResumeId, { experiences: newExperiences });
            }
        },
        addExperienceAchievement(experienceIndex: number, achievement = '') {
            if (this.activeResumeId) {
                const currentData = this.resumes[this.activeResumeId].data;
                if (currentData.experiences[experienceIndex]) {
                    const newExperiences = [...currentData.experiences];
                    newExperiences[experienceIndex] = {
                        ...newExperiences[experienceIndex],
                        achievements: [...newExperiences[experienceIndex].achievements, { text: achievement }],
                    };
                    this.updateResumeData(this.activeResumeId, { experiences: newExperiences });
                }
            }
        },
        updateExperienceAchievement(experienceIndex: number, achievementIndex: number, achievement: string) {
            if (this.activeResumeId) {
                const currentData = this.resumes[this.activeResumeId].data;
                if (currentData.experiences[experienceIndex]?.achievements[achievementIndex] !== undefined) {
                    const newExperiences = [...currentData.experiences];
                    const newAchievements = [...newExperiences[experienceIndex].achievements];
                    newAchievements[achievementIndex] = { text: achievement };
                    newExperiences[experienceIndex] = {
                        ...newExperiences[experienceIndex],
                        achievements: newAchievements,
                    };
                    this.updateResumeData(this.activeResumeId, { experiences: newExperiences });
                }
            }
        },
        removeExperienceAchievement(experienceIndex: number, achievementIndex: number) {
            if (this.activeResumeId) {
                const currentData = this.resumes[this.activeResumeId].data;
                if (currentData.experiences[experienceIndex]) {
                    const newExperiences = [...currentData.experiences];
                    const newAchievements = [...newExperiences[experienceIndex].achievements];
                    newAchievements.splice(achievementIndex, 1);
                    newExperiences[experienceIndex] = {
                        ...newExperiences[experienceIndex],
                        achievements: newAchievements,
                    };
                    this.updateResumeData(this.activeResumeId, { experiences: newExperiences });
                }
            }
        },
        moveExperienceAchievement(experienceIndex: number, fromIndex: number, toIndex: number) {
            if (this.activeResumeId) {
                const currentData = this.resumes[this.activeResumeId].data;
                if (currentData.experiences[experienceIndex]) {
                    const newExperiences = [...currentData.experiences];
                    const newAchievements = [...newExperiences[experienceIndex].achievements];
                    const item = newAchievements.splice(fromIndex, 1)[0];
                    newAchievements.splice(toIndex, 0, item);
                    newExperiences[experienceIndex] = {
                        ...newExperiences[experienceIndex],
                        achievements: newAchievements,
                    };
                    this.updateResumeData(this.activeResumeId, { experiences: newExperiences });
                }
            }
        },
        addInternship() {
            if (this.activeResumeId) {
                const currentData = this.resumes[this.activeResumeId].data;
                const newInternships = [...currentData.internships, {
                    company: '',
                    position: '',
                    location: '',
                    companyUrl: '',
                    startDate: '',
                    endDate: '',
                    isPresent: false,
                    achievements: [{ text: '' }],
                }];
                this.updateResumeData(this.activeResumeId, { internships: newInternships });
            }
        },
        updateInternship(index: number, field: keyof Internship, value: unknown) {
            if (this.activeResumeId) {
                const currentData = this.resumes[this.activeResumeId].data;
                if (currentData.internships[index]) {
                    const newInternships = [...currentData.internships];
                    (newInternships[index] as Record<string, unknown>)[field] = value;
                    this.updateResumeData(this.activeResumeId, { internships: newInternships });
                }
            }
        },
        removeInternship(index: number) {
            if (this.activeResumeId) {
                const currentData = this.resumes[this.activeResumeId].data;
                const newInternships = [...currentData.internships];
                newInternships.splice(index, 1);
                this.updateResumeData(this.activeResumeId, { internships: newInternships });
            }
        },
        moveInternship(fromIndex: number, toIndex: number) {
            if (this.activeResumeId) {
                const currentData = this.resumes[this.activeResumeId].data;
                const newInternships = [...currentData.internships];
                const item = newInternships.splice(fromIndex, 1)[0];
                newInternships.splice(toIndex, 0, item);
                this.updateResumeData(this.activeResumeId, { internships: newInternships });
            }
        },
        addInternshipAchievement(internshipIndex: number, achievement = '') {
            if (this.activeResumeId) {
                const currentData = this.resumes[this.activeResumeId].data;
                if (currentData.internships[internshipIndex]) {
                    const newInternships = [...currentData.internships];
                    newInternships[internshipIndex] = {
                        ...newInternships[internshipIndex],
                        achievements: [...newInternships[internshipIndex].achievements, { text: achievement }],
                    };
                    this.updateResumeData(this.activeResumeId, { internships: newInternships });
                }
            }
        },
        updateInternshipAchievement(internshipIndex: number, achievementIndex: number, achievement: string) {
            if (this.activeResumeId) {
                const currentData = this.resumes[this.activeResumeId].data;
                if (currentData.internships[internshipIndex]?.achievements[achievementIndex] !== undefined) {
                    const newInternships = [...currentData.internships];
                    const newAchievements = [...newInternships[internshipIndex].achievements];
                    newAchievements[achievementIndex] = { text: achievement };
                    newInternships[internshipIndex] = {
                        ...newInternships[internshipIndex],
                        achievements: newAchievements,
                    };
                    this.updateResumeData(this.activeResumeId, { internships: newInternships });
                }
            }
        },
        removeInternshipAchievement(internshipIndex: number, achievementIndex: number) {
            if (this.activeResumeId) {
                const currentData = this.resumes[this.activeResumeId].data;
                if (currentData.internships[internshipIndex]) {
                    const newInternships = [...currentData.internships];
                    const newAchievements = [...newInternships[internshipIndex].achievements];
                    newAchievements.splice(achievementIndex, 1);
                    newInternships[internshipIndex] = {
                        ...newInternships[internshipIndex],
                        achievements: newAchievements,
                    };
                    this.updateResumeData(this.activeResumeId, { internships: newInternships });
                }
            }
        },
        moveInternshipAchievement(internshipIndex: number, fromIndex: number, toIndex: number) {
            if (this.activeResumeId) {
                const currentData = this.resumes[this.activeResumeId].data;
                if (currentData.internships[internshipIndex]) {
                    const newInternships = [...currentData.internships];
                    const newAchievements = [...newInternships[internshipIndex].achievements];
                    const item = newAchievements.splice(fromIndex, 1)[0];
                    newAchievements.splice(toIndex, 0, item);
                    newInternships[internshipIndex] = {
                        ...newInternships[internshipIndex],
                        achievements: newAchievements,
                    };
                    this.updateResumeData(this.activeResumeId, { internships: newInternships });
                }
            }
        },
        addEducation() {
            if (this.activeResumeId) {
                const currentData = this.resumes[this.activeResumeId].data;
                const newEducation = [...currentData.education, {
                    institution: '',
                    degree: '',
                    fieldOfStudy: '',
                    location: '',
                    startDate: '',
                    endDate: '',
                    isPresent: false,
                    description: '',
                    graduationScore: '',
                }];
                this.updateResumeData(this.activeResumeId, { education: newEducation });
            }
        },
        updateEducation(index: number, field: keyof Education, value: unknown) {
            if (this.activeResumeId) {
                const currentData = this.resumes[this.activeResumeId].data;
                if (currentData.education[index]) {
                    const newEducation = [...currentData.education];
                    (newEducation[index] as Record<string, unknown>)[field] = value;
                    this.updateResumeData(this.activeResumeId, { education: newEducation });
                }
            }
        },
        removeEducation(index: number) {
            if (this.activeResumeId) {
                const currentData = this.resumes[this.activeResumeId].data;
                const newEducation = [...currentData.education];
                newEducation.splice(index, 1);
                this.updateResumeData(this.activeResumeId, { education: newEducation });
            }
        },
        moveEducation(fromIndex: number, toIndex: number) {
            if (this.activeResumeId) {
                const currentData = this.resumes[this.activeResumeId].data;
                const newEducation = [...currentData.education];
                const item = newEducation.splice(fromIndex, 1)[0];
                newEducation.splice(toIndex, 0, item);
                this.updateResumeData(this.activeResumeId, { education: newEducation });
            }
        },
        addVolunteering() {
            if (this.activeResumeId) {
                const currentData = this.resumes[this.activeResumeId].data;
                const newVolunteering = [...currentData.volunteering, {
                    organization: '',
                    position: '',
                    location: '',
                    startDate: '',
                    endDate: '',
                    isPresent: false,
                    achievements: [],
                }];
                this.updateResumeData(this.activeResumeId, { volunteering: newVolunteering });
            }
        },
        updateVolunteering(index: number, field: keyof Volunteering, value: unknown) {
            if (this.activeResumeId) {
                const currentData = this.resumes[this.activeResumeId].data;
                if (currentData.volunteering[index]) {
                    const newVolunteering = [...currentData.volunteering];
                    (newVolunteering[index] as Record<string, unknown>)[field] = value;
                    this.updateResumeData(this.activeResumeId, { volunteering: newVolunteering });
                }
            }
        },
        removeVolunteering(index: number) {
            if (this.activeResumeId) {
                const currentData = this.resumes[this.activeResumeId].data;
                const newVolunteering = [...currentData.volunteering];
                newVolunteering.splice(index, 1);
                this.updateResumeData(this.activeResumeId, { volunteering: newVolunteering });
            }
        },
        moveVolunteering(fromIndex: number, toIndex: number) {
            if (this.activeResumeId) {
                const currentData = this.resumes[this.activeResumeId].data;
                const newVolunteering = [...currentData.volunteering];
                const item = newVolunteering.splice(fromIndex, 1)[0];
                newVolunteering.splice(toIndex, 0, item);
                this.updateResumeData(this.activeResumeId, { volunteering: newVolunteering });
            }
        },
        addVolunteeringAchievement(volunteeringIndex: number, achievement = '') {
            if (this.activeResumeId) {
                const currentData = this.resumes[this.activeResumeId].data;
                if (currentData.volunteering[volunteeringIndex]) {
                    const newVolunteering = [...currentData.volunteering];
                    newVolunteering[volunteeringIndex] = {
                        ...newVolunteering[volunteeringIndex],
                        achievements: [...newVolunteering[volunteeringIndex].achievements, { text: achievement }],
                    };
                    this.updateResumeData(this.activeResumeId, { volunteering: newVolunteering });
                }
            }
        },
        updateVolunteeringAchievement(volunteeringIndex: number, achievementIndex: number, achievement: string) {
            if (this.activeResumeId) {
                const currentData = this.resumes[this.activeResumeId].data;
                if (currentData.volunteering[volunteeringIndex]?.achievements[achievementIndex] !== undefined) {
                    const newVolunteering = [...currentData.volunteering];
                    const newAchievements = [...newVolunteering[volunteeringIndex].achievements];
                    newAchievements[achievementIndex] = { text: achievement };
                    newVolunteering[volunteeringIndex] = {
                        ...newVolunteering[volunteeringIndex],
                        achievements: newAchievements,
                    };
                    this.updateResumeData(this.activeResumeId, { volunteering: newVolunteering });
                }
            }
        },
        removeVolunteeringAchievement(volunteeringIndex: number, achievementIndex: number) {
            if (this.activeResumeId) {
                const currentData = this.resumes[this.activeResumeId].data;
                if (currentData.volunteering[volunteeringIndex]) {
                    const newVolunteering = [...currentData.volunteering];
                    const newAchievements = [...newVolunteering[volunteeringIndex].achievements];
                    newAchievements.splice(achievementIndex, 1);
                    newVolunteering[volunteeringIndex] = {
                        ...newVolunteering[volunteeringIndex],
                        achievements: newAchievements,
                    };
                    this.updateResumeData(this.activeResumeId, { volunteering: newVolunteering });
                }
            }
        },
        moveVolunteeringAchievement(volunteeringIndex: number, fromIndex: number, toIndex: number) {
            if (this.activeResumeId) {
                const currentData = this.resumes[this.activeResumeId].data;
                if (currentData.volunteering[volunteeringIndex]) {
                    const newVolunteering = [...currentData.volunteering];
                    const newAchievements = [...newVolunteering[volunteeringIndex].achievements];
                    const item = newAchievements.splice(fromIndex, 1)[0];
                    newAchievements.splice(toIndex, 0, item);
                    newVolunteering[volunteeringIndex] = {
                        ...newVolunteering[volunteeringIndex],
                        achievements: newAchievements,
                    };
                    this.updateResumeData(this.activeResumeId, { volunteering: newVolunteering });
                }
            }
        },
        addSkill() {
            if (this.activeResumeId) {
                const currentData = this.resumes[this.activeResumeId].data;
                const newSkills = [...currentData.skills, {
                    title: '',
                    description: '',
                }];
                this.updateResumeData(this.activeResumeId, { skills: newSkills });
            }
        },
        updateSkill(index: number, field: keyof SkillItem, value: unknown) {
            if (this.activeResumeId) {
                const currentData = this.resumes[this.activeResumeId].data;
                if (currentData.skills[index]) {
                    const newSkills = [...currentData.skills];
                    (newSkills[index] as Record<string, unknown>)[field] = value;
                    this.updateResumeData(this.activeResumeId, { skills: newSkills });
                }
            }
        },
        removeSkill(index: number) {
            if (this.activeResumeId) {
                const currentData = this.resumes[this.activeResumeId].data;
                const newSkills = [...currentData.skills];
                newSkills.splice(index, 1);
                this.updateResumeData(this.activeResumeId, { skills: newSkills });
            }
        },
        moveSkill(fromIndex: number, toIndex: number) {
            if (this.activeResumeId) {
                const currentData = this.resumes[this.activeResumeId].data;
                const newSkills = [...currentData.skills];
                const item = newSkills.splice(fromIndex, 1)[0];
                newSkills.splice(toIndex, 0, item);
                this.updateResumeData(this.activeResumeId, { skills: newSkills });
            }
        },
        addSocialLink() {
            if (this.activeResumeId) {
                const currentData = this.resumes[this.activeResumeId].data;
                const newSocialLinks = [...currentData.socialLinks, {
                    platform: 'linkedin',
                    url: '',
                    customLabel: '',
                }];
                this.updateResumeData(this.activeResumeId, { socialLinks: newSocialLinks });
            }
        },
        updateSocialLink(index: number, field: keyof SocialLink, value: unknown) {
            if (this.activeResumeId) {
                const currentData = this.resumes[this.activeResumeId].data;
                if (currentData.socialLinks[index]) {
                    const newSocialLinks = [...currentData.socialLinks];
                    (newSocialLinks[index] as Record<string, unknown>)[field] = value;
                    this.updateResumeData(this.activeResumeId, { socialLinks: newSocialLinks });
                }
            }
        },
        removeSocialLink(index: number) {
            if (this.activeResumeId) {
                const currentData = this.resumes[this.activeResumeId].data;
                const newSocialLinks = [...currentData.socialLinks];
                newSocialLinks.splice(index, 1);
                this.updateResumeData(this.activeResumeId, { socialLinks: newSocialLinks });
            }
        },
        moveSocialLink(fromIndex: number, toIndex: number) {
            if (this.activeResumeId) {
                const currentData = this.resumes[this.activeResumeId].data;
                const newSocialLinks = [...currentData.socialLinks];
                const item = newSocialLinks.splice(fromIndex, 1)[0];
                newSocialLinks.splice(toIndex, 0, item);
                this.updateResumeData(this.activeResumeId, { socialLinks: newSocialLinks });
            }
        },
        addProject() {
            if (this.activeResumeId) {
                const currentData = this.resumes[this.activeResumeId].data;
                const newProjects = [...currentData.projects, {
                    title: '',
                    url: '',
                    description: '',
                }];
                this.updateResumeData(this.activeResumeId, { projects: newProjects });
            }
        },
        updateProject(index: number, field: keyof Project, value: unknown) {
            if (this.activeResumeId) {
                const currentData = this.resumes[this.activeResumeId].data;
                if (currentData.projects[index]) {
                    const newProjects = [...currentData.projects];
                    (newProjects[index] as Record<string, unknown>)[field] = value;
                    this.updateResumeData(this.activeResumeId, { projects: newProjects });
                }
            }
        },
        removeProject(index: number) {
            if (this.activeResumeId) {
                const currentData = this.resumes[this.activeResumeId].data;
                const newProjects = [...currentData.projects];
                newProjects.splice(index, 1);
                this.updateResumeData(this.activeResumeId, { projects: newProjects });
            }
        },
        moveProject(fromIndex: number, toIndex: number) {
            if (this.activeResumeId) {
                const currentData = this.resumes[this.activeResumeId].data;
                const newProjects = [...currentData.projects];
                const item = newProjects.splice(fromIndex, 1)[0];
                newProjects.splice(toIndex, 0, item);
                this.updateResumeData(this.activeResumeId, { projects: newProjects });
            }
        },
        addLanguage() {
            if (this.activeResumeId) {
                const currentData = this.resumes[this.activeResumeId].data;
                const newLanguages = [...currentData.languages, {
                    name: '',
                    proficiency: '',
                }];
                this.updateResumeData(this.activeResumeId, { languages: newLanguages });
            }
        },
        updateLanguage(index: number, field: keyof Language, value: unknown) {
            if (this.activeResumeId) {
                const currentData = this.resumes[this.activeResumeId].data;
                if (currentData.languages[index]) {
                    const newLanguages = [...currentData.languages];
                    (newLanguages[index] as Record<string, unknown>)[field] = value;
                    this.updateResumeData(this.activeResumeId, { languages: newLanguages });
                }
            }
        },
        removeLanguage(index: number) {
            if (this.activeResumeId) {
                const currentData = this.resumes[this.activeResumeId].data;
                const newLanguages = [...currentData.languages];
                newLanguages.splice(index, 1);
                this.updateResumeData(this.activeResumeId, { languages: newLanguages });
            }
        },
        moveLanguage(fromIndex: number, toIndex: number) {
            if (this.activeResumeId) {
                const currentData = this.resumes[this.activeResumeId].data;
                const newLanguages = [...currentData.languages];
                const item = newLanguages.splice(fromIndex, 1)[0];
                newLanguages.splice(toIndex, 0, item);
                this.updateResumeData(this.activeResumeId, { languages: newLanguages });
            }
        },
        addCertificate() {
            if (this.activeResumeId) {
                const currentData = this.resumes[this.activeResumeId].data;
                const newCertificates = [...currentData.certificates, {
                    title: '',
                    issuer: '',
                    date: '',
                    url: '',
                }];
                this.updateResumeData(this.activeResumeId, { certificates: newCertificates });
            }
        },
        updateCertificate(index: number, field: keyof Certificate, value: unknown) {
            if (this.activeResumeId) {
                const currentData = this.resumes[this.activeResumeId].data;
                if (currentData.certificates[index]) {
                    const newCertificates = [...currentData.certificates];
                    (newCertificates[index] as Record<string, unknown>)[field] = value;
                    this.updateResumeData(this.activeResumeId, { certificates: newCertificates });
                }
            }
        },
        removeCertificate(index: number) {
            if (this.activeResumeId) {
                const currentData = this.resumes[this.activeResumeId].data;
                const newCertificates = [...currentData.certificates];
                newCertificates.splice(index, 1);
                this.updateResumeData(this.activeResumeId, { certificates: newCertificates });
            }
        },
        moveCertificate(fromIndex: number, toIndex: number) {
            if (this.activeResumeId) {
                const currentData = this.resumes[this.activeResumeId].data;
                const newCertificates = [...currentData.certificates];
                const item = newCertificates.splice(fromIndex, 1)[0];
                newCertificates.splice(toIndex, 0, item);
                this.updateResumeData(this.activeResumeId, { certificates: newCertificates });
            }
        },
        updateSectionOrder(newOrder: SectionOrder) {
            if (this.activeResumeId) {
                this.updateResumeData(this.activeResumeId, { sectionOrder: { ...newOrder } });
            }
        },
        updateSectionHeader(section: keyof SectionHeaders, headerText: string) {
            if (this.activeResumeId) {
                const currentData = this.resumes[this.activeResumeId].data;
                const newHeaders = { ...currentData.sectionHeaders, [section]: headerText };
                this.updateResumeData(this.activeResumeId, { sectionHeaders: newHeaders });
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
