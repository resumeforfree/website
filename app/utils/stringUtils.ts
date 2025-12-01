/**
 * Escape text for use inside Typst content blocks [...]
 * In content mode, # starts code mode and needs escaping
 */
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

/**
 * Escape text for use inside Typst quoted strings "..."
 * In strings, # does NOT need escaping (it's just a regular character)
 * Only valid string escapes: \\ \" \n \r \t \u{...}
 */
export function escapeTypstString(text: string): string {
    if (!text) return '';
    let cleaned = text.toString().trim();
    cleaned = cleaned
        .replace(/[""]/g, '"')
        .replace(/['']/g, '\'');
    return cleaned
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"');
}
