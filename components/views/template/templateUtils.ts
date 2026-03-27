import { TemplateStatus, TemplateHealth, TemplateCategory } from './templateTypes';

/**
 * Extract variables from template text in format {{1}}, {{2}}, etc.
 */
export function extractVariables(text: string): string[] {
    // Match {{variable}} where variable contains letters, numbers, or underscores
    const regex = /\{\{([\w]+)\}\}/g;
    console.log("text", text)
    const matches = text?.matchAll(regex);
    const variables = Array.from(matches, match => match[1]);

    // Remove duplicates and sort
    return Array.from(new Set(variables)).sort((a, b) => {
        const isNumA = /^\d+$/.test(a);
        const isNumB = /^\d+$/.test(b);

        // Both are numbers: numeric sort
        if (isNumA && isNumB) {
            return parseInt(a) - parseInt(b);
        }

        // One is number, one is string: numbers first
        if (isNumA) return -1;
        if (isNumB) return 1;

        // Both are strings: alphabetical sort
        return a.localeCompare(b);
    });
}

/**
 * Replace variables in text with provided values
 */
export function replaceVariables(
    text: string | { text_content?: string } | any,
    values: Record<string | number, any>
): string {
    let content: string = '';

    if (typeof text === 'string') {
        content = text;
    } else if (text && typeof text === 'object' && 'text_content' in text) {
        content = text.text_content || '';
    } else {
        console.error('replaceVariables: Invalid text input', text);
        return '';
    }

    if (typeof content !== 'string') {
        console.error('replaceVariables: content is not a string', content);
        return '';
    }

    let result: string = content;

    // Convert literal "\n" to real newlines
    result = result.replace(/\\n/g, '\n');

    Object.entries(values ?? {}).forEach(([key, value]) => {
        // Determine the key to use for regex matching (prefers variable_key in object, fallback to entry key)
        const keyForRegex = value?.variable_key || key;
        const escapedKey = keyForRegex.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\{\\{${escapedKey}\\}\\}`, 'g');

        // Debug logging
        console.log('replaceVariables Debug:', { key, value, keyForRegex, regex: regex.toString() });

        // Default replacement is the placeholder itself (preserve if no value provided)
        let replacement = `{{${keyForRegex}}}`;

        if (typeof value === 'string') {
            // If string is empty, keep default placeholder
            replacement = value || replacement;
        } else if (value && typeof value === 'object' && 'sample_value' in value) {
            // Use sample_value if present, otherwise keep the default placeholder
            replacement = value.sample_value || replacement;
        }

        result = result?.replace(regex, replacement);
    });

    return result;
}

/**
 * Format WhatsApp text with markdown-like syntax
 * *bold* -> <strong>bold</strong>
 * _italic_ -> <em>italic</em>
 * ~strikethrough~ -> <del>strikethrough</del>
 */
export function formatWhatsAppText(text: string): string {
    let formatted = text;

    // Bold: *text*
    formatted = formatted.replace(/\*([^*]+)\*/g, '<strong>$1</strong>');

    // Italic: _text_
    formatted = formatted.replace(/_([^_]+)_/g, '<em>$1</em>');

    // Strikethrough: ~text~
    formatted = formatted.replace(/~([^~]+)~/g, '<del>$1</del>');

    return formatted;
}

/**
 * Validate template name (lowercase, underscores, alphanumeric only)
 */
export function validateTemplateName(name: string): { valid: boolean; error?: string } {
    if (!name) {
        return { valid: false, error: 'Template name is required' };
    }

    if (name.length < 3) {
        return { valid: false, error: 'Template name must be at least 3 characters' };
    }

    const regex = /^[a-z0-9_]+$/;
    if (!regex.test(name)) {
        return {
            valid: false,
            error: 'Template name can only contain lowercase letters, numbers, and underscores'
        };
    }

    return { valid: true };
}

/**
 * Get status color classes for theme-aware styling
 */
export function getStatusColor(status: TemplateStatus, isDarkMode: boolean): string {
    const colors = {
        draft: isDarkMode ? 'bg-slate-500/10 text-slate-400' : 'bg-slate-100 text-slate-600',
        pending: isDarkMode ? 'bg-yellow-500/10 text-yellow-400' : 'bg-yellow-100 text-yellow-600',
        approved: isDarkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-100 text-emerald-600',
        rejected: isDarkMode ? 'bg-red-500/10 text-red-400' : 'bg-red-100 text-red-600',
        paused: isDarkMode ? 'bg-orange-500/10 text-orange-400' : 'bg-orange-100 text-orange-600',
        deleted: isDarkMode ? 'bg-gray-500/10 text-gray-400' : 'bg-gray-100 text-gray-600',
    };
    return colors[status] || colors.draft;
}

/**
 * Get health color classes for theme-aware styling
 */
export function getHealthColor(health: TemplateHealth, isDarkMode: boolean): string {
    const colors = {
        High: isDarkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-100 text-emerald-600',
        Medium: isDarkMode ? 'bg-yellow-500/10 text-yellow-400' : 'bg-yellow-100 text-yellow-600',
        Low: isDarkMode ? 'bg-red-500/10 text-red-400' : 'bg-red-100 text-red-600',
    };
    return colors[health] || colors.Medium;
}

/**
 * Get category icon name
 */
export function getCategoryIcon(category: TemplateCategory): string {
    const icons = {
        UTILITY: 'Wrench',
        MARKETING: 'TrendingUp',
        AUTHENTICATION: 'Shield',
    };
    return icons[category] || 'FileText';
}

/**
 * Get type icon name
 */
// export function getTypeIcon(type: string): string {
//     const icons = {
//         TEXT: 'FileText',
//         IMAGE: 'Image',
//         VIDEO: 'Video',
//         DOCUMENT: 'File',
//     };
//     return icons[type] || 'FileText';
// }

export function getTypeIcon(type: string): string {
    const icons = {
        TEXT: 'FileText',
        IMAGE: 'Image',
        VIDEO: 'Video',
        DOCUMENT: 'File',
    };

    if (type in icons) {
        return icons[type as keyof typeof icons];
    }

    return 'FileText';
}

/**
 * Generate unique ID
 */
export function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

// ─────────────────────────────────────────────────
// Language-Script Validation for Template Content
// ─────────────────────────────────────────────────

interface ScriptRange {
    name: string;
    regex: RegExp;
}

const SCRIPT_RANGES: ScriptRange[] = [
    { name: 'Devanagari', regex: /[\u0900-\u097F]/g },
    { name: 'Arabic', regex: /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/g },
    { name: 'Bengali', regex: /[\u0980-\u09FF]/g },
    { name: 'Gujarati', regex: /[\u0A80-\u0AFF]/g },
    { name: 'Gurmukhi', regex: /[\u0A00-\u0A7F]/g },
    { name: 'Kannada', regex: /[\u0C80-\u0CFF]/g },
    { name: 'Malayalam', regex: /[\u0D00-\u0D7F]/g },
    { name: 'Tamil', regex: /[\u0B80-\u0BFF]/g },
    { name: 'Telugu', regex: /[\u0C00-\u0C7F]/g },
    { name: 'Thai', regex: /[\u0E00-\u0E7F]/g },
    { name: 'Lao', regex: /[\u0E80-\u0EFF]/g },
    { name: 'Georgian', regex: /[\u10A0-\u10FF\u2D00-\u2D2F]/g },
    { name: 'Korean', regex: /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/g },
    { name: 'Japanese', regex: /[\u3040-\u309F\u30A0-\u30FF]/g },
    { name: 'CJK', regex: /[\u4E00-\u9FFF\u3400-\u4DBF]/g },
    { name: 'Cyrillic', regex: /[\u0400-\u04FF\u0500-\u052F]/g },
    { name: 'Greek', regex: /[\u0370-\u03FF\u1F00-\u1FFF]/g },
    { name: 'Hebrew', regex: /[\u0590-\u05FF]/g },
    { name: 'Latin', regex: /[a-zA-Z\u00C0-\u024F\u1E00-\u1EFF]/g },
];

const LANGUAGE_SCRIPT_MAP: Record<string, string[]> = {
    'Afrikaans': ['Latin'], 'Albanian': ['Latin'], 'Arabic': ['Arabic'],
    'Azerbaijani': ['Latin'], 'Bengali': ['Bengali'], 'Bulgarian': ['Cyrillic'],
    'Catalan': ['Latin'], 'Chinese (CHN)': ['CJK'], 'Chinese (HKG)': ['CJK'],
    'Chinese (TAI)': ['CJK'], 'Croatian': ['Latin'], 'Czech': ['Latin'],
    'Danish': ['Latin'], 'Dutch': ['Latin'], 'English': ['Latin'],
    'English (UK)': ['Latin'], 'English (US)': ['Latin'], 'Estonian': ['Latin'],
    'Filipino': ['Latin'], 'Finnish': ['Latin'], 'French': ['Latin'],
    'Georgian': ['Georgian'], 'German': ['Latin'], 'Greek': ['Greek'],
    'Gujarati': ['Gujarati'], 'Hausa': ['Latin'], 'Hebrew': ['Hebrew'],
    'Hindi': ['Devanagari'], 'Hungarian': ['Latin'], 'Indonesian': ['Latin'],
    'Irish': ['Latin'], 'Italian': ['Latin'], 'Japanese': ['Japanese', 'CJK'],
    'Kannada': ['Kannada'], 'Kazakh': ['Cyrillic'], 'Kinyarwanda': ['Latin'],
    'Korean': ['Korean'], 'Kyrgyz': ['Cyrillic'], 'Lao': ['Lao'],
    'Latvian': ['Latin'], 'Lithuanian': ['Latin'], 'Macedonian': ['Cyrillic'],
    'Malay': ['Latin'], 'Malayalam': ['Malayalam'], 'Marathi': ['Devanagari'],
    'Norwegian': ['Latin'], 'Persian': ['Arabic'], 'Polish': ['Latin'],
    'Portuguese (BR)': ['Latin'], 'Portuguese (POR)': ['Latin'],
    'Punjabi': ['Gurmukhi'], 'Romanian': ['Latin'], 'Russian': ['Cyrillic'],
    'Serbian': ['Cyrillic', 'Latin'], 'Slovak': ['Latin'], 'Slovenian': ['Latin'],
    'Spanish': ['Latin'], 'Spanish (ARG)': ['Latin'], 'Spanish (SPA)': ['Latin'],
    'Spanish (MEX)': ['Latin'], 'Swahili': ['Latin'], 'Swedish': ['Latin'],
    'Tamil': ['Tamil'], 'Telugu': ['Telugu'], 'Thai': ['Thai'],
    'Turkish': ['Latin'], 'Ukrainian': ['Cyrillic'], 'Urdu': ['Arabic'],
    'Uzbek': ['Latin'], 'Vietnamese': ['Latin'], 'Zulu': ['Latin'],
};

/**
 * Detect the dominant script in a text string
 */
export function detectDominantScript(text: string): string | null {
    if (!text || text.trim().length < 3) return null;

    // Remove template variables, formatting markers, whitespace, digits, punctuation
    const cleaned = text
        .replace(/\{\{[\w]+\}\}/g, '')
        .replace(/[\n\r*_~`\s\d.,!?;:'"()\-\/\\@#$%^&+=<>\[\]{}|]/g, '')
        .trim();
    if (!cleaned || cleaned.length < 2) return null;

    let maxCount = 0;
    let dominantScript: string | null = null;

    for (const { name, regex } of SCRIPT_RANGES) {
        const matches = cleaned.match(regex) || [];
        if (matches.length > maxCount) {
            maxCount = matches.length;
            dominantScript = name;
        }
    }

    return dominantScript;
}

/**
 * Validate that template content matches the selected language's expected script.
 * Returns null if valid, or an error message string if invalid.
 */
export function validateContentLanguageMatch(content: string, language: string): string | null {
    if (!content || !language) return null;

    const expectedScripts = LANGUAGE_SCRIPT_MAP[language];
    if (!expectedScripts) return null; // Unknown language, skip validation

    const dominantScript = detectDominantScript(content);
    if (!dominantScript) return null; // Can't determine script, skip

    const isMatch = expectedScripts.some(expected => {
        if (expected === dominantScript) return true;
        // CJK is also valid for Japanese/Chinese
        if (expected === 'CJK' && dominantScript === 'Japanese') return true;
        if (expected === 'Japanese' && dominantScript === 'CJK') return true;
        return false;
    });

    if (!isMatch) {
        return `Template content does not match the selected language "${language}". Please write the content in ${language} or change the language selection.`;
    }

    return null;
}
