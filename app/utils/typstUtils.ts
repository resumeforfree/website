import { escapeTypstText } from './stringUtils';

export const HEADER_SPACING = '1em';
export const SECTION_SPACING = '1.6em';
export const ITEMS_SPACING = '0.8em';
export const convertEmail = (email: string): string => {
    if (!email) return '';
    return `#link("mailto:${email}")[#text(fill: blue, "${email}")]`;
};
export const convertLink = (url: string, text: string): string => {
    if (!url || !text) return '';
    return `#link("${url}")[#text(fill: blue, "${escapeTypstText(text)}")]`;
};
export const convertLinkWithColor = (url: string, text: string, color = 'blue'): string => {
    if (!url || !text) return '';
    return `#link("${url}")[#text(fill: ${color}, "${escapeTypstText(text)}")]`;
};
export const convertExternalLinkIcon = (url: string): string => {
    if (!url) return '';
    return `#link("${url}")[#text(size: 10pt, weight: "semibold", fill: blue)[↗]]`;
};
export const convertHeader = (title: string, size = '16pt'): string => {
    if (!title) return '';
    return `#block(below: ${HEADER_SPACING}, above: 0em)[#text("${escapeTypstText(title)}", size: ${size}, weight: "bold")]`;
};
export const convertSubHeader = (title: string, size = '14pt'): string => {
    if (!title) return '';
    return `#block(below: 1em)[#text("${escapeTypstText(title)}", size: ${size}, weight: "bold")]`;
};
export const formatDateToMonthYear = (date: string): string => {
    if (!date) return '';
    const parts = date.split('-');
    if (parts.length === 2) {
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1;
        const dateObj = new Date(year, month);
        return dateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
        });
    }
    return date;
};
export const convertDateRange = (startDate: string, endDate?: string, isPresent?: boolean): string => {
    if (!startDate && !endDate && !isPresent) return '';
    let dateText = '';
    if (startDate) {
        dateText = formatDateToMonthYear(startDate);
    }
    if (endDate && !isPresent) {
        dateText += dateText ? ` - ${formatDateToMonthYear(endDate)}` : formatDateToMonthYear(endDate);
    }
    if (isPresent) {
        dateText += dateText ? ' - Present' : 'Present';
    }
    return `#text(fill: gray, "${escapeTypstText(dateText)}")`;
};
export const convertList = (items: string[], indent = '1em'): string => {
    if (!items || items.length === 0) return '';
    const listItems = items
        .filter(item => item && item.trim() !== '')
        .map(item => `- ${escapeTypstText(item)}`)
        .join('\n');
    if (!listItems) return '';
    return `#set list(indent: ${indent})\n\n${listItems}`;
};
export const convertGrid = (content: string[], columns = '(1fr, 1fr)', gutter = '20pt'): string => {
    if (!content || content.length === 0) return '';
    const gridContent = content.map(item => `[${item}]`).join(',\n  ');
    return `#grid(
  columns: ${columns},
  gutter: ${gutter},
  ${gridContent}
)`;
};
export const convertSocialLinks = (links: Array<{ platform: string; url: string }>, separator = ' • '): string => {
    const linkItems = links
        .filter(link => link.platform && link.url)
        .map(link => convertLink(link.url, link.platform));
    if (linkItems.length === 0) return '';
    return linkItems.join(separator);
};
export const renderTemplateHeader = (text: string, fontSize: number): string => {
    return convertHeader(text, `${fontSize + 2}pt`);
};
export const renderTemplateSubHeader = (text: string, fontSize: number): string => {
    return `#block(below: 0.6em)[#text("${escapeTypstText(text)}", size: ${fontSize}pt, weight: "bold")]`;
};
export const renderTemplateDate = (dateText: string, fontSize: number): string => {
    return `#block(above: 0em, below: 0.6em)[#text(size: ${fontSize - 2}pt)[${dateText}]]`;
};
export const renderTemplateDateWithLink = (dateRange: string, link: string | null, fontSize: number): string => {
    if (link) {
        return `#block(above: 0em, below: 0.6em)[#text(size: ${fontSize - 2}pt)[${dateRange} • ${link}]]`;
    }
    return renderTemplateDate(dateRange, fontSize);
};
