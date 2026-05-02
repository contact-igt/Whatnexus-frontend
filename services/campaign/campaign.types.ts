// Campaign API Type Definitions

// ============================================
// ENUMS & CONSTANTS
// ============================================

export type CampaignType = 'immediate' | 'scheduled' | 'broadcast' | 'api';
export type RecipientSource = 'csv' | 'group' | 'manual';
export type CampaignStatus = 'draft' | 'active' | 'scheduled' | 'completed' | 'failed' | 'paused' | 'cancelled' | 'deleted';
export type RecipientStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed' | 'permanently_failed';
export type RecipientDynamicVariables = string[] | string | Record<string, string> | null;

// ============================================
// REQUEST INTERFACES
// ============================================

export interface CSVRecipient {
    mobile_number: string;
    dynamic_variables?: any;
    contact_id?: string; // Optional for manual selection
}

export interface ManualRecipient {
    contact_id: string;
    mobile_number: string;
    dynamic_variables?: any;
}

export interface CreateCampaignRequest {
    campaign_name: string;
    campaign_type: CampaignType;
    template_id: string;
    audience_type: RecipientSource; // 'csv', 'group', or 'manual'
    audience_data: CSVRecipient[] | string; // Array for csv/manual, String (group_id) for group
    scheduled_at?: string | null; // ISO 8601 format, required if campaign_type = 'scheduled'
    variable_values?: Record<string, string>; // Optional variable values for template
    header_media_url?: string | null;
    header_file_name?: string | null;
    location_params?: {
        latitude: string;
        longitude: string;
        name: string;
        address: string;
    } | null;
    card_media_urls?: Record<number, string> | null;
    media_asset_id?: string | null;
    media_handle?: string | null;
}

export interface CampaignListParams {
    page?: number;
    limit?: number;
    status?: CampaignStatus;
    search?: string;
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
    header_media_url?: string | null;
    createdAt: string;
    updatedAt?: string;
    template: TemplateInfo;
    // Soft-delete / trash fields (populated in Trash tab responses)
    is_deleted?: boolean;
    deleted_at?: string | null;
    days_remaining?: number;
    can_restore?: boolean;
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
    dynamic_variables: RecipientDynamicVariables;
    meta_message_id: string | null;
    sent_at?: string | null; // Backend might not return this explicitly in recipient model
    error_message?: string | null;
    retry_count?: number | null;
    next_retry_at?: string | null;
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

export interface CampaignStatsResponse {
    success: boolean;
    message: string;
    data: {
        total_sent: number;
        total_delivered: number;
        total_opened: number;
        total_clicked: number;
        open_rate: number;
        click_rate: number;
        latest_failed_error?: string | null;
        status_counts?: {
            all: number;
            pending: number;
            sent: number;
            delivered: number;
            read: number;
            failed: number;
        };
    };
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
