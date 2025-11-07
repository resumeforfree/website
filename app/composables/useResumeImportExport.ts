import type { ImportResumePreview } from '~/components/elements/ImportConfirmationModal.vue';

export const useResumeImportExport = () => {
    const resumeStore = useResumeStore();
    const exportResumes = (resumeIds: string[]) => {
        const resumes = resumeStore.resumesList.filter(r => resumeIds.includes(r.id));
        if (resumes.length === 0) {
            console.error('No resumes to export');
            return;
        }
        const exportData = resumes.map(resume => ({
            name: resume.name,
            data: resume.data,
            createdAt: resume.createdAt,
            updatedAt: resume.updatedAt,
        }));
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = resumes.length === 1
            ? `resume-${resumes[0].name.toLowerCase().replace(/\s+/g, '-')}-${timestamp}.json`
            : `resumes-export-${timestamp}.json`;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };
    const exportSingleResume = (resumeId: string) => {
        exportResumes([resumeId]);
    };
    const parseImportFile = (file: File): Promise<{
        success: boolean;
        previews?: ImportResumePreview[];
        error?: string;
    }> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const content = e.target?.result as string;
                    const data = JSON.parse(content);
                    if (!Array.isArray(data)) {
                        throw new Error('Invalid file format. Expected an array of resumes.');
                    }
                    const existingNames = resumeStore.resumesList.map(r => r.name.toLowerCase());
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const previews: ImportResumePreview[] = data.map((resumeData: any) => {
                        if (!resumeData.name || !resumeData.data) {
                            return null;
                        }
                        const itemCount
                            = (resumeData.data.experiences?.length || 0)
                                + (resumeData.data.education?.length || 0)
                                + (resumeData.data.skills?.length || 0)
                                + (resumeData.data.projects?.length || 0)
                                + (resumeData.data.languages?.length || 0)
                                + (resumeData.data.volunteering?.length || 0)
                                + (resumeData.data.certificates?.length || 0);
                        return {
                            name: resumeData.name,
                            data: resumeData.data,
                            isDuplicate: existingNames.includes(resumeData.name.toLowerCase()),
                            itemCount,
                        };
                    }).filter(Boolean);
                    resolve({
                        success: true,
                        previews,
                    });
                }
                catch (error) {
                    console.error('Parse error:', error);
                    resolve({
                        success: false,
                        error: error instanceof Error ? error.message : 'Failed to parse import file',
                    });
                }
            };
            reader.onerror = () => {
                resolve({
                    success: false,
                    error: 'Failed to read file',
                });
            };
            reader.readAsText(file);
        });
    };
    const importSelectedResumes = (previews: ImportResumePreview[], selectedIndexes: number[]) => {
        let importedCount = 0;
        selectedIndexes.forEach((index) => {
            const resumeData = previews[index];
            if (resumeData) {
                const newResumeId = resumeStore.createResume(resumeData.name);
                resumeStore.updateResumeData(newResumeId, resumeData.data);
                importedCount++;
            }
        });
        return importedCount;
    };
    return {
        exportResumes,
        exportSingleResume,
        parseImportFile,
        importSelectedResumes,
    };
};
