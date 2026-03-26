// Template Type Definitions for WhatsApp Template Management

export type TemplateCategory = 'UTILITY' | 'MARKETING' | 'AUTHENTICATION';
export type TemplateType = 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'LOCATION' | 'CAROUSEL';
export type TemplateStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'paused' | 'deleted';
export type TemplateHealth = 'High' | 'Medium' | 'Low';
export type InteractiveActionType = 'None' | 'CTA' | 'QuickReplies' | 'Marketing' | 'Authentication' | 'All';
export type CTAType = 'URL' | 'PHONE' | 'COPY_CODE' | 'CATALOG' | 'MPM';
export type MessageStyle = 'Normal' | 'Poetic' | 'Exciting' | 'Funny';
export type OptimizationGoal = 'Click Rate' | 'Reply Rate';
export type HeaderType = 'NONE' | 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'LOCATION';

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

export interface CarouselCard {
    id: string;
    mediaType: 'IMAGE' | 'VIDEO';
    mediaUrl: string;
    bodyText: string;
    buttons: CTAButton[];
}

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
    carouselCards?: CarouselCard[];
    carouselMediaType?: 'IMAGE' | 'VIDEO';
    status?: TemplateStatus; // Passed in edit mode to enforce Meta edit limitations
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
