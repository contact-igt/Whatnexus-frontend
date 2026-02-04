// Template Type Definitions for WhatsApp Template Management

export type TemplateCategory = 'UTILITY' | 'MARKETING' | 'AUTHENTICATION';
export type TemplateType = 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT';
export type TemplateStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'paused' | 'deleted';
export type TemplateHealth = 'High' | 'Medium' | 'Low';
export type InteractiveActionType = 'None' | 'CTA' | 'QuickReplies' | 'All';
export type CTAType = 'URL' | 'PHONE' | 'COPY_CODE';
export type MessageStyle = 'Normal' | 'Poetic' | 'Exciting' | 'Funny';
export type OptimizationGoal = 'Click Rate' | 'Reply Rate';
export type HeaderType = 'NONE' | 'TEXT' | 'text' | 'media' | 'MEDIA' | 'DOCUMENT';

export interface Template {
    template_id: string;
    template_name: string;
    category: TemplateCategory;
    language: string;
    status: TemplateStatus;
    template_type: TemplateType;
    health: TemplateHealth;
    headerType?: HeaderType;
    headerValue?: string;
    content: string;
    footer?: string;
    variables: Record<string, string>;
    interactiveActions: InteractiveActionType;
    ctaButtons?: CTAButton[];
    quickReplies?: string[];
    components?: any[];
    created_at: string;
    updated_at?: string;
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
    headerType: HeaderType;
    headerValue: string;
    content: string;
    previous_content: string;
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
