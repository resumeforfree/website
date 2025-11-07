import { getTemplate } from '~/templates';
import type { ResumeData } from '~/types/resume';

export const useResumeGenerator = () => {
    const { isReady: typstReady, isLoading: typstLoading } = useTypstLoader();
    const generateTypstContent = (
        resumeData: ResumeData,
        templateId = 'default',
        font = 'Calibri',
    ): string => {
        const template = getTemplate(templateId);
        return template.parse(resumeData, font);
    };
    const generatePreview = async (
        resumeData: ResumeData,
        templateId = 'default',
        font = 'Calibri',
    ): Promise<string> => {
        if (!typstReady.value) {
            throw new Error('Typst not ready');
        }
        if (!window.$typst) {
            throw new Error('Typst global object not available yet');
        }
        const typstContent = generateTypstContent(resumeData, templateId, font);
        return await window.$typst.svg({ mainContent: typstContent });
    };
    const generatePDF = async (
        resumeData: ResumeData,
        templateId = 'default',
        font = 'Calibri',
    ): Promise<Uint8Array> => {
        if (!typstReady.value) {
            throw new Error('Typst not ready');
        }
        if (!window.$typst) {
            throw new Error('Typst global object not available');
        }
        const typstContent = generateTypstContent(resumeData, templateId, font);
        try {
            const pdfData = await window.$typst.pdf({ mainContent: typstContent });
            return pdfData;
        }
        catch (error) {
            console.error('PDF generation error:', error);
            throw error;
        }
    };
    const downloadPDF = async (
        resumeData: ResumeData,
        templateId = 'default',
        font = 'Calibri',
    ): Promise<void> => {
        try {
            const pdfData = await generatePDF(resumeData, templateId, font);
            const firstName = resumeData.firstName || 'Resume';
            const lastName = resumeData.lastName || '';
            const position = resumeData.position || '';
            const filenameParts = [firstName, lastName, position, 'resume'].filter(Boolean);
            const filename = `${filenameParts.join('_')}.pdf`;
            const blob = new Blob([pdfData], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.click();
            URL.revokeObjectURL(url);
        }
        catch (error) {
            console.error('PDF download error:', error);
            throw error;
        }
    };
    const downloadSVG = async (
        resumeData: ResumeData,
        templateId = 'default',
        font = 'Calibri',
    ): Promise<void> => {
        try {
            const svgContent = await generatePreview(resumeData, templateId, font);
            const firstName = resumeData.firstName || 'Resume';
            const lastName = resumeData.lastName || '';
            const position = resumeData.position || '';
            const filenameParts = [firstName, lastName, position, 'resume'].filter(Boolean);
            const filename = `${filenameParts.join('_')}.svg`;
            const blob = new Blob([svgContent], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.click();
            URL.revokeObjectURL(url);
        }
        catch (error) {
            console.error('SVG download error:', error);
            throw error;
        }
    };
    const downloadTypst = (
        resumeData: ResumeData,
        templateId = 'default',
        font = 'Calibri',
    ): void => {
        try {
            const typstContent = generateTypstContent(resumeData, templateId, font);
            const firstName = resumeData.firstName || 'Resume';
            const lastName = resumeData.lastName || '';
            const position = resumeData.position || '';
            const filenameParts = [firstName, lastName, position, 'resume'].filter(Boolean);
            const filename = `${filenameParts.join('_')}.typ`;
            const blob = new Blob([typstContent], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.click();
            URL.revokeObjectURL(url);
        }
        catch (error) {
            console.error('Typst download error:', error);
            throw error;
        }
    };
    const downloadTypstText = (
        resumeData: ResumeData,
        templateId = 'default',
        font = 'Calibri',
    ): void => {
        try {
            const typstContent = generateTypstContent(resumeData, templateId, font);
            const firstName = resumeData.firstName || 'Resume';
            const lastName = resumeData.lastName || '';
            const position = resumeData.position || '';
            const filenameParts = [firstName, lastName, position, 'resume'].filter(Boolean);
            const filename = `${filenameParts.join('_')}.txt`;
            const blob = new Blob([typstContent], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.click();
            URL.revokeObjectURL(url);
        }
        catch (error) {
            console.error('Typst text download error:', error);
            throw error;
        }
    };
    return {
        typstReady,
        typstLoading,
        generateTypstContent,
        generatePreview,
        generatePDF,
        downloadPDF,
        downloadSVG,
        downloadTypst,
        downloadTypstText,
    };
};
