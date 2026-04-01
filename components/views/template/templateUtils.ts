import { TemplateStatus, TemplateHealth, TemplateCategory } from './templateTypes';
import { franc } from 'franc-min';

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
// Intra-Latin Language Detection (franc-min library)
// ─────────────────────────────────────────────────

/**
 * Maps display language names → ISO 639-3 codes used by franc.
 */
const LANGUAGE_FRANC_MAP: Record<string, string> = {
    'Afrikaans': 'afr',    'Albanian': 'sqi',       'Arabic': 'ara',
    'Azerbaijani': 'aze',  'Bengali': 'ben',        'Bulgarian': 'bul',
    'Catalan': 'cat',      'Chinese (CHN)': 'cmn',  'Chinese (HKG)': 'cmn',
    'Chinese (TAI)': 'cmn','Croatian': 'hrv',        'Czech': 'ces',
    'Danish': 'dan',       'Dutch': 'nld',          'English': 'eng',
    'English (UK)': 'eng', 'English (US)': 'eng',   'Estonian': 'est',
    'Filipino': 'fil',     'Finnish': 'fin',        'French': 'fra',
    'Georgian': 'kat',     'German': 'deu',         'Greek': 'ell',
    'Gujarati': 'guj',     'Hausa': 'hau',          'Hebrew': 'heb',
    'Hindi': 'hin',        'Hungarian': 'hun',      'Indonesian': 'ind',
    'Irish': 'gle',        'Italian': 'ita',        'Japanese': 'jpn',
    'Kannada': 'kan',      'Kazakh': 'kaz',         'Kinyarwanda': 'kin',
    'Korean': 'kor',       'Kyrgyz': 'kir',         'Lao': 'lao',
    'Latvian': 'lav',      'Lithuanian': 'lit',     'Macedonian': 'mkd',
    'Malay': 'msa',        'Malayalam': 'mal',      'Marathi': 'mar',
    'Norwegian': 'nob',    'Persian': 'fas',        'Polish': 'pol',
    'Portuguese (BR)': 'por', 'Portuguese (POR)': 'por',
    'Punjabi': 'pan',      'Romanian': 'ron',       'Russian': 'rus',
    'Serbian': 'srp',      'Slovak': 'slk',         'Slovenian': 'slv',
    'Spanish': 'spa',      'Spanish (ARG)': 'spa',  'Spanish (SPA)': 'spa',
    'Spanish (MEX)': 'spa','Swahili': 'swa',        'Swedish': 'swe',
    'Tamil': 'tam',        'Telugu': 'tel',         'Thai': 'tha',
    'Turkish': 'tur',      'Ukrainian': 'ukr',      'Urdu': 'urd',
    'Uzbek': 'uzb',        'Vietnamese': 'vie',     'Zulu': 'zul',
};

/**
 * Detect the language of template content using the franc library.
 * Strips template variables and formatting before detection.
 * Returns ISO 639-3 code (e.g., 'eng', 'spa', 'fra') or 'und' if undetermined.
 */
function detectContentLanguage(text: string): string {
    if (!text || text.trim().length < 10) return 'und';

    const cleaned = text
        .replace(/\{\{[^}]+\}\}/g, '')   // Strip template variables
        .replace(/[*_~`]/g, '')           // Strip formatting markers
        .trim();

    if (cleaned.length < 10) return 'und';

    return franc(cleaned);
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
        const detectedLang = detectContentLanguage(content);
        const expectedIso = LANGUAGE_FRANC_MAP[language];
        console.log('[LanguageValidation] Layer 2 (franc):', { isEnglishVariant, detectedLang, expectedIso });

        // If franc can't determine the language, allow it
        if (detectedLang === 'und') return { valid: true };

        if (isEnglishVariant) {
            // English selected → franc should detect English
            if (detectedLang !== 'eng') {
                return {
                    valid: false,
                    detectedScript: detectedLang,
                    expectedScript: 'eng',
                    message: `Template content does not appear to be written in English. Please write the content in English or change the language to match your content.`,
                };
            }
        } else {
            // Non-English Latin language selected

            // 1. Content should NOT be plain English
            if (detectedLang === 'eng') {
                return {
                    valid: false,
                    detectedScript: 'english',
                    expectedScript: `latin (${language})`,
                    message: `Template content appears to be written in English, but you selected "${language}". Please write the content in ${language} or change the language to English.`,
                };
            }

            // 2. Check specific language match — if franc identifies a specific language
            //    that does NOT match what the user selected, show a mismatch error.
            if (expectedIso && detectedLang !== 'und') {
                // Groups of mutually acceptable ISO codes (linguistically close / franc confuses these)
                const LANGUAGE_GROUPS: string[][] = [
                    ['nob', 'dan', 'swe'],              // Norwegian, Danish, Swedish
                    ['msa', 'ind'],                      // Malay, Indonesian
                    ['spa'],                             // All Spanish variants share 'spa'
                    ['por'],                             // All Portuguese variants share 'por'
                    ['afr', 'nld'],                      // Afrikaans ↔ Dutch (very similar roots)
                    ['ces', 'slk'],                      // Czech ↔ Slovak (mutually intelligible)
                    ['hrv', 'slv', 'srp'],               // Croatian, Slovenian, Serbian (Latin)
                    ['cat', 'spa', 'por', 'ita', 'fra'], // Romance family (franc often confuses)
                    ['lav', 'lit'],                      // Latvian ↔ Lithuanian (Baltic)
                    ['est', 'fin'],                      // Estonian ↔ Finnish (Finnic family)
                    ['ron', 'ita', 'fra', 'spa', 'por'], // Romanian with Romance family
                ];

                // Languages franc-min does not reliably identify → skip specific check
                const FRANC_UNRELIABLE = new Set([
                    'fil', 'hau', 'gle', 'kin', 'kir', 'uzb', 'zul', 'swa',
                    'sqi', // Albanian — franc-min often misidentifies
                    'aze', // Azerbaijani
                    'hun', // Hungarian — unique language, low training data in franc-min
                    'tur', // Turkish — franc sometimes confuses with other Turkic
                    'vie', // Vietnamese — tone marks trip up franc-min
                ]);

                const isExpectedUnreliable = FRANC_UNRELIABLE.has(expectedIso);
                const isDetectedUnreliable = FRANC_UNRELIABLE.has(detectedLang);

                if (!isExpectedUnreliable && !isDetectedUnreliable) {
                    const inSameGroup = LANGUAGE_GROUPS.some(
                        group => group.includes(expectedIso) && group.includes(detectedLang)
                    );

                    if (!inSameGroup && detectedLang !== expectedIso) {
                        // Find a human-readable name for the detected language
                        const detectedName =
                            Object.entries(LANGUAGE_FRANC_MAP).find(([, iso]) => iso === detectedLang)?.[0]
                            || detectedLang;
                        return {
                            valid: false,
                            detectedScript: detectedLang,
                            expectedScript: expectedIso,
                            message: `Template content appears to be written in ${detectedName}, but you selected "${language}". Please write the content in ${language} or change the language to match your content.`,
                        };
                    }
                }
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