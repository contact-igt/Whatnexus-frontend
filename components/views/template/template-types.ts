// Template Type Definitions for WhatsApp Template Management

export type TemplateCategory = 'UTILITY' | 'MARKETING' | 'AUTHENTICATION';
export type TemplateType = 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT';
export type TemplateStatus = 'Draft' | 'Pending' | 'Approved' | 'Rejected';
export type TemplateHealth = 'High' | 'Medium' | 'Low';
export type InteractiveActionType = 'None' | 'CTA' | 'QuickReplies' | 'All';
export type CTAType = 'URL' | 'PHONE' | 'COPY_CODE';
export type MessageStyle = 'Normal' | 'Poetic' | 'Exciting' | 'Funny';
export type OptimizationGoal = 'Click Rate' | 'Reply Rate';

export interface Template {
    id: string;
    name: string;
    category: TemplateCategory;
    language: string;
    status: TemplateStatus;
    type: TemplateType;
    health: TemplateHealth;
    content: string;
    footer?: string;
    variables: Record<string, string>;
    interactiveActions: InteractiveActionType;
    ctaButtons?: CTAButton[];
    quickReplies?: string[];
    createdAt: string;
    updatedAt?: string;
}

export interface CTAButton {
    id: string;
    type: CTAType;
    label: string;
    value: string; // URL, phone number, or code to copy
}

export interface QuickReply {
    id: string;
    text: string;
}

export interface TemplateFormData {
    category: TemplateCategory;
    language: string;
    name: string;
    type: TemplateType;
    content: string;
    footer: string;
    variables: Record<string, string>;
    interactiveActions: InteractiveActionType;
    ctaButtons: CTAButton[];
    quickReplies: string[];
}

export interface AIGeneratorData {
    prompt: string;
    messageStyle: MessageStyle;
    optimizationGoal: OptimizationGoal;
}

export interface TemplateListFilters {
    search: string;
    category?: TemplateCategory;
    status?: TemplateStatus;
    type?: TemplateType;
}
