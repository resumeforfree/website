import { getTemplate } from '~/templates';
import type { ResumeData } from '~/types/resume';

export const useResumeGenerator = () => {
    const { isReady: typstReady, isLoading: typstLoading } = useTypstLoader();
    const { locale, t } = useI18n();

    const generateTypstContent = (
        resumeData: ResumeData,
        templateId = 'default',
        font = 'Calibri',
    ): string => {
        const template = getTemplate(templateId);
        return template.parse(resumeData, font, locale.value, t);
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
    // Shared filename builder
    const buildFilename = (resumeData: ResumeData, extension: string): string => {
        const firstName = resumeData.firstName || 'Resume';
        const lastName = resumeData.lastName || '';
        const position = resumeData.position || '';
        const parts = [firstName, lastName, position, 'resume'].filter(Boolean);
        return `${parts.join('_')}.${extension}`;
    };

    // Generic download helper
    const downloadBlob = (blob: Blob, filename: string): void => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    };

    // Generic async download function factory
    const createDownloader = <T>(
        generator: (resumeData: ResumeData, templateId: string, font: string) => Promise<T> | T,
        blobConfig: { type: string; extension: string },
    ) => {
        return async (
            resumeData: ResumeData,
            templateId = 'default',
            font = 'Calibri',
        ): Promise<void> => {
            try {
                const content = await generator(resumeData, templateId, font);
                const filename = buildFilename(resumeData, blobConfig.extension);
                const blob = new Blob([content as Uint8Array | string], { type: blobConfig.type });
                downloadBlob(blob, filename);
            }
            catch (error) {
                console.error(`${blobConfig.extension.toUpperCase()} download error:`, error);
                throw error;
            }
        };
    };

    // Create all downloaders using the factory
    const downloadPDF = createDownloader(
        generatePDF,
        { type: 'application/pdf', extension: 'pdf' },
    );

    const downloadSVG = createDownloader(
        generatePreview,
        { type: 'image/svg+xml', extension: 'svg' },
    );

    const downloadTypst = createDownloader(
        generateTypstContent,
        { type: 'text/plain', extension: 'typ' },
    );

    const downloadTypstText = createDownloader(
        generateTypstContent,
        { type: 'text/plain', extension: 'txt' },
    );
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
