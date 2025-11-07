export function escapeTypstText(text: string): string {
    if (!text) return '';
    let cleaned = text.toString().trim();
    cleaned = cleaned
        .replace(/[""]/g, '"')
        .replace(/['']/g, '\'');
    return cleaned
        .replace(/\\/g, '\\\\')
        .replace(/\$/g, '\\$')
        .replace(/"/g, '\\"')
        .replace(/'/g, '\\\'')
        .replace(/#/g, '\\#')
        .replace(/\{/g, '\\{')
        .replace(/\}/g, '\\}')
        .replace(/\[/g, '\\[')
        .replace(/\]/g, '\\]')
        .replace(/</g, '\\<')
        .replace(/>/g, '\\>')
        .replace(/~/g, '\\~')
        .replace(/\^/g, '\\^')
        .replace(/_/g, '\\_')
        .replace(/\*/g, '\\*');
}
