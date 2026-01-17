import { TemplateStatus, TemplateHealth, TemplateCategory } from './template-types';

/**
 * Extract variables from template text in format {{1}}, {{2}}, etc.
 */
export function extractVariables(text: string): string[] {
    const regex = /\{\{(\d+)\}\}/g;
    const matches = text.matchAll(regex);
    const variables = Array.from(matches, match => match[1]);
    return Array.from(new Set(variables)).sort((a, b) => parseInt(a) - parseInt(b));
}

/**
 * Replace variables in text with provided values
 */
export function replaceVariables(text: string, values: Record<string, string>): string {
    let result = text;
    Object.entries(values).forEach(([key, value]) => {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        result = result.replace(regex, value || `{{${key}}}`);
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
        Draft: isDarkMode ? 'bg-slate-500/10 text-slate-400' : 'bg-slate-100 text-slate-600',
        Pending: isDarkMode ? 'bg-yellow-500/10 text-yellow-400' : 'bg-yellow-100 text-yellow-600',
        Approved: isDarkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-100 text-emerald-600',
        Rejected: isDarkMode ? 'bg-red-500/10 text-red-400' : 'bg-red-100 text-red-600',
    };
    return colors[status] || colors.Draft;
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
