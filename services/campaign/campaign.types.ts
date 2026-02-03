// Campaign API Type Definitions

// ============================================
// ENUMS & CONSTANTS
// ============================================

export type CampaignType = 'immediate' | 'scheduled' | 'broadcast' | 'api';
export type RecipientSource = 'csv' | 'group' | 'manual';
export type CampaignStatus = 'draft' | 'active' | 'scheduled' | 'completed' | 'failed';
export type RecipientStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed';

// ============================================
// REQUEST INTERFACES
// ============================================

export interface CSVRecipient {
    mobile_number: string;
    dynamic_variables?: string[];
    contact_id?: string; // Optional for manual selection
}

export interface ManualRecipient {
    contact_id: string;
    mobile_number: string;
    dynamic_variables?: string[];
}

export interface CreateCampaignRequest {
    campaign_name: string;
    campaign_type: CampaignType;
    template_id: string;
    audience_type: RecipientSource; // 'csv', 'group', or 'manual'
    audience_data: CSVRecipient[] | string; // Array for csv/manual, String (group_id) for group
    scheduled_at?: string | null; // ISO 8601 format, required if campaign_type = 'scheduled'
    variable_values?: Record<string, string>; // Optional variable values for template
}

export interface CampaignListParams {
    page?: number;
    limit?: number;
    status?: CampaignStatus;
}

export interface CampaignDetailsParams {
    recipient_status?: RecipientStatus;
}

// ============================================
// RESPONSE INTERFACES
// ============================================

export interface CreateCampaignResponse {
    message: string;
    // API returns nested campaign object
    campaign?: {
        id: number;
        campaign_id: string;
        campaign_name: string;
        campaign_type: CampaignType;
        status: CampaignStatus;
        created_at?: string;
        // ... other fields
    };
    // Flat fields (kept for compatibility if API varies)
    campaign_id?: string;
    status?: CampaignStatus;
}

export interface TemplateInfo {
    template_id: string;
    template_name: string;
    category: string;
    language?: string;
}

export interface Campaign {
    campaign_id: string;
    campaign_name: string;
    campaign_type: CampaignType;
    status: CampaignStatus;
    total_audience: number;
    delivered_count: number;
    read_count: number;
    replied_count: number;
    scheduled_at: string | null;
    created_at: string;
    template: TemplateInfo;
}

export interface CampaignListResponse {
    message: string;
    data: {
        campaigns: Campaign[];
        totalItems: number; // Matches Backend
        totalPages: number;
        currentPage: number;
    };
}

export interface Recipient {
    id: number;
    mobile_number: string;
    status: RecipientStatus;
    dynamic_variables: string[] | string; // API may return string or array
    meta_message_id: string | null;
    sent_at?: string | null; // Backend might not return this explicitly in recipient model
}

export interface CampaignDetails {
    campaign_id: string;
    campaign_name: string;
    campaign_type: CampaignType;
    status: CampaignStatus;
    total_audience: number;
    delivered_count: number;
    read_count: number;
    replied_count: number;
    scheduled_at?: string | null;
    template: TemplateInfo;
    recipients: Recipient[];
}

export interface CampaignDetailsResponse {
    message: string;
    data: CampaignDetails;
}

export interface ExecuteCampaignResponse {
    message: string;
    campaign_id: string;
}

// ============================================
// UTILITY TYPES
// ============================================

export interface CampaignStatistics {
    total_audience: number;
    delivered_count: number;
    read_count: number;
    replied_count: number;
    delivered_percentage: number;
    read_percentage: number;
    replied_percentage: number;
}

export interface ValidationError {
    field: string;
    message: string;
}

export interface CSVValidationResult {
    isValid: boolean;
    errors: ValidationError[];
    validRows: CSVRecipient[];
    invalidRows: number[];
}
