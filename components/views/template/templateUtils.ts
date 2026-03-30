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
// Language-Script Detection & Validation
// ─────────────────────────────────────────────────

/**
 * Unicode-range script detectors.
 * Each regex matches characters belonging to that script family.
 */
const SCRIPT_RANGES: Record<string, RegExp> = {
    latin:      /[\u0041-\u007A\u00C0-\u024F\u1E00-\u1EFF]/g,
    cyrillic:   /[\u0400-\u04FF\u0500-\u052F]/g,
    arabic:     /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/g,
    hebrew:     /[\u0590-\u05FF]/g,
    devanagari: /[\u0900-\u097F]/g,
    bengali:    /[\u0980-\u09FF]/g,
    gujarati:   /[\u0A80-\u0AFF]/g,
    gurmukhi:   /[\u0A00-\u0A7F]/g,
    tamil:      /[\u0B80-\u0BFF]/g,
    telugu:     /[\u0C00-\u0C7F]/g,
    kannada:    /[\u0C80-\u0CFF]/g,
    malayalam:  /[\u0D00-\u0D7F]/g,
    thai:       /[\u0E00-\u0E7F]/g,
    lao:        /[\u0E80-\u0EFF]/g,
    georgian:   /[\u10A0-\u10FF\u2D00-\u2D2F]/g,
    hangul:     /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/g,
    cjk:        /[\u4E00-\u9FFF\u3400-\u4DBF]/g,
    hiragana:   /[\u3040-\u309F]/g,
    katakana:   /[\u30A0-\u30FF]/g,
    greek:      /[\u0370-\u03FF\u1F00-\u1FFF]/g,
};

/**
 * Maps display-language names → expected script key from SCRIPT_RANGES.
 * This is the single source of truth for language ↔ script mapping.
 */
const LANGUAGE_SCRIPT_MAP: Record<string, string> = {
    'Afrikaans': 'latin',    'Albanian': 'latin',     'Arabic': 'arabic',
    'Azerbaijani': 'latin',  'Bengali': 'bengali',    'Bulgarian': 'cyrillic',
    'Catalan': 'latin',      'Chinese (CHN)': 'cjk',  'Chinese (HKG)': 'cjk',
    'Chinese (TAI)': 'cjk',  'Croatian': 'latin',     'Czech': 'latin',
    'Danish': 'latin',       'Dutch': 'latin',        'English': 'latin',
    'English (UK)': 'latin', 'English (US)': 'latin',  'Estonian': 'latin',
    'Filipino': 'latin',     'Finnish': 'latin',      'French': 'latin',
    'Georgian': 'georgian',  'German': 'latin',       'Greek': 'greek',
    'Gujarati': 'gujarati',  'Hausa': 'latin',        'Hebrew': 'hebrew',
    'Hindi': 'devanagari',   'Hungarian': 'latin',    'Indonesian': 'latin',
    'Irish': 'latin',        'Italian': 'latin',      'Japanese': 'hiragana',
    'Kannada': 'kannada',    'Kazakh': 'cyrillic',    'Kinyarwanda': 'latin',
    'Korean': 'hangul',      'Kyrgyz': 'cyrillic',    'Lao': 'lao',
    'Latvian': 'latin',      'Lithuanian': 'latin',   'Macedonian': 'cyrillic',
    'Malay': 'latin',        'Malayalam': 'malayalam', 'Marathi': 'devanagari',
    'Norwegian': 'latin',    'Persian': 'arabic',     'Polish': 'latin',
    'Portuguese (BR)': 'latin', 'Portuguese (POR)': 'latin',
    'Punjabi': 'gurmukhi',   'Romanian': 'latin',     'Russian': 'cyrillic',
    'Serbian': 'cyrillic',   'Slovak': 'latin',       'Slovenian': 'latin',
    'Spanish': 'latin',      'Spanish (ARG)': 'latin','Spanish (SPA)': 'latin',
    'Spanish (MEX)': 'latin','Swahili': 'latin',      'Swedish': 'latin',
    'Tamil': 'tamil',        'Telugu': 'telugu',      'Thai': 'thai',
    'Turkish': 'latin',      'Ukrainian': 'cyrillic', 'Urdu': 'arabic',
    'Uzbek': 'latin',        'Vietnamese': 'latin',   'Zulu': 'latin',
};

/**
 * Detect the dominant script of a text string.
 * Strips template variables and punctuation, then counts Unicode-range matches.
 */
export function detectTemplateScript(text: string): string | null {
    if (!text || text.trim().length < 5) return null;

    // Strip {{variables}}, formatting markers, digits, punctuation, whitespace
    const cleaned = text
        .replace(/\{\{[^}]+\}\}/g, '')
        .replace(/[\n\r*_~`\s\d.,!?;:'"()\-\/\\@#$%^&+=<>\[\]{}|]/g, '')
        .trim();
    if (!cleaned || cleaned.length < 2) return null;

    const scores: Record<string, number> = {};
    for (const [script, pattern] of Object.entries(SCRIPT_RANGES)) {
        const matches = cleaned.match(new RegExp(pattern.source, 'g')) || [];
        scores[script] = matches.length;
    }

    // Japanese: hiragana/katakana presence is definitive over CJK
    if ((scores.hiragana || 0) > 2 || (scores.katakana || 0) > 2) return 'hiragana';

    const dominant = Object.entries(scores)
        .filter(([, count]) => count > 0)
        .sort(([, a], [, b]) => b - a)[0];

    return dominant ? dominant[0] : null;
}

// ─────────────────────────────────────────────────
// Intra-Latin Language Detection (English vs. others)
// ─────────────────────────────────────────────────

const ENGLISH_COMMON_WORDS = new Set([
    'the', 'a', 'an', 'this', 'that', 'these', 'those',
    'my', 'your', 'his', 'her', 'its', 'our', 'their',
    'i', 'me', 'you', 'he', 'she', 'it', 'we', 'they', 'him', 'us', 'them',
    'in', 'on', 'at', 'to', 'for', 'with', 'from', 'by', 'of', 'about',
    'into', 'through', 'during', 'before', 'after',
    'and', 'but', 'or', 'so', 'yet', 'if', 'as', 'than',
    'is', 'are', 'was', 'were', 'am', 'be', 'been', 'being',
    'has', 'have', 'had', 'do', 'does', 'did',
    'will', 'would', 'could', 'should', 'shall', 'can', 'may', 'might', 'must',
    'not', 'no', 'just', 'also', 'very', 'here', 'there', 'now', 'then',
    'hello', 'hi', 'dear', 'please', 'thank', 'thanks', 'welcome',
    'your', 'order', 'appointment', 'code', 'verification', 'confirmed',
]);

/**
 * Non-English diacritics / special Latin chars that do NOT appear in standard English.
 * Covers Turkish (ğ,ş,ı,İ), Azerbaijani (ə,Ə), French (ç,ê,ë), German (ß,ü,ö),
 * Polish (ł,ń,ą,ę), Romanian (ț,ș), Scandinavian (ø,å,æ), etc.
 */
const NON_ENGLISH_CHARS_RE = /[\u00C0-\u00C5\u00C8-\u00CF\u00D1-\u00D6\u00D8-\u00DD\u00DF-\u00E5\u00E8-\u00EF\u00F1-\u00F6\u00F8-\u00FD\u00FF-\u024F\u0259\u018F]/g;

/**
 * Returns true when ≥25 % of words are common English function/template words.
 */
export function isContentLikelyEnglish(text: string): boolean {
    if (!text || text.trim().length < 10) return false;

    const cleaned = text
        .replace(/\{\{[^}]+\}\}/g, '')
        .replace(/[*_~`]/g, '')
        .toLowerCase();

    const words = cleaned
        .split(/[\s.,!?;:\-\/()'"@#$%&+=\[\]{}|\\<>:]+/)
        .filter(w => w.length > 1);

    if (words.length < 3) return false;

    const englishCount = words.filter(w => ENGLISH_COMMON_WORDS.has(w)).length;
    return (englishCount / words.length) >= 0.25;
}

/**
 * Returns true when the text contains a significant density of
 * non-English Latin diacritics (ə, ğ, ş, ñ, ß, ø, etc.).
 */
export function hasNonEnglishLatinChars(text: string): boolean {
    if (!text || text.trim().length < 5) return false;

    const cleaned = text
        .replace(/\{\{[^}]+\}\}/g, '')
        .replace(/[*_~`\n\r\s\d.,!?;:'"()\-\/\\@#$%^&+=<>\[\]{}|]/g, '');

    if (cleaned.length < 3) return false;

    const nonEnglish = (cleaned.match(NON_ENGLISH_CHARS_RE) || []).length;
    const english    = (cleaned.match(/[a-zA-Z]/g) || []).length;
    const total      = nonEnglish + english;
    if (total < 3) return false;

    // ≥ 5 % non-English chars AND at least 2 occurrences
    return (nonEnglish / total) >= 0.05 && nonEnglish >= 2;
}

// ─────────────────────────────────────────────────
// Main Validation Entry Point
// ─────────────────────────────────────────────────

export interface LanguageValidationResult {
    valid: boolean;
    detectedScript?: string;
    expectedScript?: string;
    message?: string;
}

/**
 * Core validator — checks whether template content matches the selected language.
 *
 * Layer 1 — Script check (Latin vs Cyrillic vs Devanagari …).
 * Layer 2 — Intra-Latin check (English ↔ non-English Latin languages).
 *
 * Returns { valid: true } when OK, or { valid: false, message: "…" } when mismatched.
 */
export function validateLanguageMatch(language: string, content: string): LanguageValidationResult {
    if (!content || !language) return { valid: true };

    const expectedScript = LANGUAGE_SCRIPT_MAP[language];
    if (!expectedScript) {
        console.log('[LanguageValidation] Unknown language, skipping:', language);
        return { valid: true };
    }

    const detectedScript = detectTemplateScript(content);
    if (!detectedScript) {
        console.log('[LanguageValidation] Could not detect script, content too short');
        return { valid: true };
    }

    console.log('[LanguageValidation] Layer 1:', { language, expectedScript, detectedScript });

    // ── Layer 1: Script family mismatch ──────────────────────────
    // Japanese can match hiragana, katakana, OR cjk
    const scriptMatches = (() => {
        if (detectedScript === expectedScript) return true;
        if (expectedScript === 'hiragana' && (detectedScript === 'katakana' || detectedScript === 'cjk')) return true;
        if (expectedScript === 'cjk' && (detectedScript === 'hiragana' || detectedScript === 'katakana')) return true;
        // Serbian can use both Cyrillic and Latin
        if (language === 'Serbian' && (detectedScript === 'latin' || detectedScript === 'cyrillic')) return true;
        return false;
    })();

    if (!scriptMatches) {
        return {
            valid: false,
            detectedScript,
            expectedScript,
            message: `Template content uses ${detectedScript} script, but "${language}" expects ${expectedScript}. Please write the content in ${language} or change the language.`,
        };
    }

    // ── Layer 2: Intra-Latin language check ──────────────────────
    if (detectedScript === 'latin') {
        const isEnglishVariant = ['English', 'English (UK)', 'English (US)'].includes(language);
        const hasNonEng = hasNonEnglishLatinChars(content);
        const isEng = isContentLikelyEnglish(content);
        console.log('[LanguageValidation] Layer 2 (Latin):', { isEnglishVariant, hasNonEng, isEng });

        if (isEnglishVariant) {
            // English selected → content must actually be English
            if (hasNonEng) {
                return {
                    valid: false,
                    detectedScript: 'non-english-latin',
                    expectedScript: 'latin (English)',
                    message: `Template content contains non-English characters (special diacritics) and does not appear to be in English. Please write the content in English or change the language to match your content.`,
                };
            }
            if (!isEng) {
                return {
                    valid: false,
                    detectedScript: 'foreign-latin',
                    expectedScript: 'latin (English)',
                    message: `Template content does not appear to be written in English. Please write the content in English or change the language to match your content.`,
                };
            }
        } else {
            // Non-English Latin language selected → content must NOT be plain English
            if (isEng && !hasNonEng) {
                return {
                    valid: false,
                    detectedScript: 'english',
                    expectedScript: `latin (${language})`,
                    message: `Template content appears to be written in English, but you selected "${language}". Please write the content in ${language} or change the language to English.`,
                };
            }
        }
    }

    return { valid: true };
}

/**
 * Legacy wrapper — returns null if valid, or error message string if invalid.
 * Used by Zod superRefine, handleSaveClick, and real-time mismatch detection.
 */
export function validateContentLanguageMatch(content: string, language: string): string | null {
    const result = validateLanguageMatch(language, content);
    console.log('[LanguageValidation] validateContentLanguageMatch:', { language, contentSnippet: content?.substring(0, 60), valid: result.valid, message: result.message });
    return result.valid ? null : (result.message ?? null);
}
