"use client";

import { useState, useRef } from 'react';
import { X, ChevronRight, ChevronLeft, Check, Upload, Users, Calendar as CalendarIcon, AlertTriangle, Image as ImageIcon, FileText, MapPin } from 'lucide-react';
import { GlassCard } from "@/components/ui/glassCard";
import { cn } from "@/lib/utils";
import { useTheme } from '@/hooks/useTheme';
import { campaignService } from '@/services/campaign/campaign.service';
import type {
    CampaignType,
    RecipientSource,
    CSVRecipient,
    CreateCampaignRequest
} from '@/services/campaign/campaign.types';
import { parseCSV, validateCSVData, downloadCSVTemplate } from '@/utils/campaign.utils';
import { TemplateSelectionModal, ProcessedTemplate } from './templateSelectionModal';
import { CSVPreviewModal } from './csvPreviewModal';
import { useGetAllGroupsQuery } from '@/hooks/useContactGroupQuery';
import type { ContactGroup } from "@/types/contactGroup";
import { WhatsAppPreviewPanel } from '@/components/views/template/whatsappPreviewPanel';
import { CarouselCard } from '@/components/views/template/templateTypes';
import { FileUpload } from '@/components/ui/fileUpload';

interface CreateCampaignModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (campaignId: string) => void;
}

type Step = 1 | 2 | 3 | 4;

interface FormData {
    campaign_name: string;
    campaign_type: CampaignType;
    scheduled_at: string | null;
    template_id: string;
    recipient_source: RecipientSource;
    csv_data: CSVRecipient[] | null;
    group_id: string | null;
    manual_recipients: any[] | null;
    location_params: {
        latitude: string;
        longitude: string;
        name: string;
        address: string;
    } | null;
    header_media_url?: string | null;
    card_media_urls?: Record<number, string> | null;
}

export const CreateCampaignModal = ({ isOpen, onClose, onSuccess }: CreateCampaignModalProps) => {
    const { isDarkMode } = useTheme();
    const [currentStep, setCurrentStep] = useState<Step>(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<FormData>({
        campaign_name: '',
        campaign_type: 'immediate',
        scheduled_at: null,
        template_id: '',
        recipient_source: 'csv',
        csv_data: null,
        group_id: null,
        manual_recipients: null,
        location_params: {
            latitude: '',
            longitude: '',
            name: '',
            address: ''
        },
        card_media_urls: {}
    });

    const [cardUploading, setCardUploading] = useState<Record<number, boolean>>({});

    // CSV Upload State
    const [csvFile, setCsvFile] = useState<File | null>(null);
    const [csvValidation, setCsvValidation] = useState<any>(null);
    const [csvRawData, setCsvRawData] = useState<CSVRecipient[]>([]);

    // Modal States
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const [isCSVPreviewOpen, setIsCSVPreviewOpen] = useState(false);
    const [templateVariableCount, setTemplateVariableCount] = useState(2);
    const [selectedTemplate, setSelectedTemplate] = useState<ProcessedTemplate | null>(null);
    const [variableValues, setVariableValues] = useState<Record<string, string>>({});
    const [manualPhoneInput, setManualPhoneInput] = useState('');
    const [manualCountryCode, setManualCountryCode] = useState('+91');
    const [manualInputError, setManualInputError] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [headerFileName, setHeaderFileName] = useState<string | null>(null);
    const [cardFileNames, setCardFileNames] = useState<Record<number, string>>({});
    const fileInputRef = useRef<HTMLInputElement>(null);
    // { [contactId]: { [varKey]: value } }
    const [groupMemberVariables, setGroupMemberVariables] = useState<Record<string, Record<string, string>>>({});
    const [selectedGroupMembers, setSelectedGroupMembers] = useState<any[]>([]);

    // Normalize template type: both 'file' and 'document' should be treated as document
    const isMediaType = (type?: string) => ['image', 'video', 'document', 'file'].includes(type || '');
    const isDocType = (type?: string) => type === 'document' || type === 'file';
    const getUploadType = (type?: string): 'image' | 'video' | 'document' => {
        if (type === 'image') return 'image';
        if (type === 'video') return 'video';
        return 'document'; // 'document', 'file', or any other → 'document'
    };

    const handleHeaderFileUpload = async (file: File) => {
        if (!file || !selectedTemplate) return;

        const headerFormat = getUploadType(selectedTemplate.type); // always sends 'image', 'video', or 'document'
        
        setIsUploading(true);
        setHeaderFileName(file.name);
        setError(null);

        try {
            const result = await campaignService.uploadMedia(file, headerFormat as any);
            setFormData(prev => ({ ...prev, header_media_url: result.url }));
        } catch (err: any) {
            setError(err.message || 'Failed to upload media');
        } finally {
            setIsUploading(false);
        }
    };

    const handleCardMediaUpload = async (cardIndex: number, file: File, type: 'image' | 'video') => {
        setCardUploading(prev => ({ ...prev, [cardIndex]: true }));
        setCardFileNames(prev => ({ ...prev, [cardIndex]: file.name }));
        setError(null);

        try {
            const result = await campaignService.uploadMedia(file, type as any);
            setFormData(prev => ({
                ...prev,
                card_media_urls: {
                    ...(prev.card_media_urls || {}),
                    [cardIndex]: result.url
                }
            }));
        } catch (err: any) {
            setError(err.message || `Failed to upload media for Card ${cardIndex + 1}`);
        } finally {
            setCardUploading(prev => ({ ...prev, [cardIndex]: false }));
        }
    };

    // Fetch Groups
    const { data: groupsData, isLoading: isGroupsLoading } = useGetAllGroupsQuery();
    // Safely extract groups array handling different response structures
    const groups: ContactGroup[] = (() => {
        // Handle User Provided Structure: { message: "Success", data: { groups: [...] } }
        // groupsData is the response object. groupsData.data is the payload. groupsData.data.groups is the array.
        if (groupsData?.data?.groups && Array.isArray(groupsData.data.groups)) {
            return groupsData.data.groups;
        }

        // Fallbacks for other potential structures
        if (Array.isArray(groupsData?.data?.data)) return groupsData.data.data;
        if (Array.isArray(groupsData?.data)) return groupsData.data;
        if (Array.isArray(groupsData)) return groupsData;

        return [];
    })();

    const steps = [
        { number: 1, title: 'Campaign Info', icon: CalendarIcon },
        { number: 2, title: 'Template', icon: Check },
        { number: 3, title: 'Recipients', icon: Users },
        { number: 4, title: 'Review', icon: Check },
    ];

    const handleNext = () => {
        if (currentStep < 4 && isStepValid(currentStep)) {
            setCurrentStep((prev) => (prev + 1) as Step);
            setError(null); // Clear any previous errors
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep((prev) => (prev - 1) as Step);
            setError(null); // Clear any previous errors
        }
    };

    // Validation for each step
    const isStepValid = (step: Step): boolean => {
        switch (step) {
            case 1: // Campaign Info
                if (!formData.campaign_name.trim()) {
                    setError('Campaign name is required');
                    return false;
                }
                if (formData.campaign_type === 'scheduled' && !formData.scheduled_at) {
                    setError('Schedule date and time is required for scheduled campaigns');
                    return false;
                }
                if (!formData.recipient_source) {
                    setError('Please select a recipient source');
                    return false;
                }
                return true;

            case 2: // Template
                if (!formData.template_id.trim()) {
                    setError('Template ID is required');
                    return false;
                }

                // Skip variable check for authentication, CSV, and group sources (per-member inputs)
                if (selectedTemplate?.category !== 'authentication' && 
                    formData.recipient_source !== 'csv' &&
                    formData.recipient_source !== 'group') {
                    // Strictly validate all template variables are filled
                    if (selectedTemplate?.variableArray && selectedTemplate.variableArray.length > 0) {
                        const missingVars = selectedTemplate.variableArray.filter(
                            (v: any) => !variableValues[v.variable_key]?.trim()
                        );

                        if (missingVars.length > 0) {
                            setError(`Please fill all template variables: ${missingVars.map(v => '{{' + v.variable_key + '}}').join(', ')}`);
                            return false;
                        }
                    }
                }

                // Validate Media Header
                if (isMediaType(selectedTemplate?.type) && !(formData as any).header_media_url) {
                    setError(`Please provide or upload a ${isDocType(selectedTemplate?.type) ? 'document' : selectedTemplate?.type} for the header`);
                    return false;
                }

                // Validate Location Params
                if (selectedTemplate?.type === 'location') {
                    if (!formData.location_params?.latitude || !formData.location_params?.longitude || !formData.location_params?.name || !formData.location_params?.address) {
                        setError('Please fill in all the location details (Latitude, Longitude, Name, and Address).');
                        return false;
                    }
                }

                // Validate Carousel Media
                if (selectedTemplate?.type === 'carousel') {
                    const cards = selectedTemplate.carouselCards || [];
                    for (let i = 0; i < cards.length; i++) {
                        const card = cards[i];
                        const header = card.components?.find((c: any) => c.type === 'HEADER');
                        if (header && (header.format === 'IMAGE' || header.format === 'VIDEO')) {
                            if (!formData.card_media_urls?.[i]) {
                                setError(`Please upload media for Card ${i + 1}`);
                                return false;
                            }
                        }
                    }
                }
                return true;

            case 3: // Recipients
                if (formData.recipient_source === 'csv') {
                    if (!csvFile) {
                        setError('Please upload a CSV file');
                        return false;
                    }
                    if (!csvValidation?.isValid) {
                        setError('The uploaded CSV has validation errors. Please fix them before proceeding.');
                        return false;
                    }
                    if (!formData.csv_data || formData.csv_data.length === 0) {
                        setError('No valid recipients found in the CSV');
                        return false;
                    }
                } else if (formData.recipient_source === 'group') {
                    if (!formData.group_id?.trim()) {
                        setError('Please select a group');
                        return false;
                    }
                    // If template has variables, ensure all members have all variables filled
                    if (selectedTemplate?.variableArray && selectedTemplate.variableArray.length > 0 && selectedTemplate.category !== 'authentication') {
                        for (const member of selectedGroupMembers) {
                            const memberVars = groupMemberVariables[member.contact?.contact_id || member.contact_id] || {};
                            const missing = selectedTemplate.variableArray.filter((v: any) => !memberVars[v.variable_key]?.trim());
                            if (missing.length > 0) {
                                setError(`Fill all variables for ${member.contact?.name || member.mobile_number || 'a member'}: ${missing.map((v: any) => '{{' + v.variable_key + '}}').join(', ')}`);
                                return false;
                            }
                        }
                    }
                } else if (formData.recipient_source === 'manual') {
                    if (!formData.manual_recipients || formData.manual_recipients.length === 0) {
                        setError('Please add at least one mobile number');
                        return false;
                    }
                }
                return true;

            case 4: // Review
                return true;

            default:
                return false;
        }
    };

    const handleCSVUpload = async (file: File) => {
        try {
            setCsvFile(file);
            setError(null); // Clear previous errors
            const rows = await parseCSV(file);

            // Remove header row
            const dataRows = rows.slice(1);

            // Validate using template variable count
            const validation = validateCSVData(dataRows, templateVariableCount);
            setCsvValidation(validation);
            
            // Raw data for preview (unvalidated)
            const rawParsedData: CSVRecipient[] = dataRows.map(row => ({
                mobile_number: (row[0] || '') + (row[1] || ''),
                dynamic_variables: row.slice(2)
            }));
            setCsvRawData(rawParsedData);

            // Open preview modal
            setIsCSVPreviewOpen(true);
        } catch (err) {
            setError('Failed to parse CSV file. Please check the format.');
        }
    };

    const handleCSVConfirm = (validData: CSVRecipient[]) => {
        setFormData(prev => ({ ...prev, csv_data: validData }));
        setError(null);
    };

    const handleTemplateSelect = (template: ProcessedTemplate) => {
        setFormData(prev => ({ ...prev, template_id: template.id }));
        setTemplateVariableCount(template.variables);
        setSelectedTemplate(template);

        // Initialize variable values
        const initialValues: Record<string, string> = {};
        template.variableArray?.forEach((v: any) => {
            initialValues[v.variable_key] = '';
        });
        
        // Initialize button variables
        template.buttonVariables?.forEach((v: any) => {
            initialValues[v.variable_key] = '';
        });
        
        setVariableValues(initialValues);

        setError(null);
    };

    const handleAddManualRecipient = () => {
        if (!manualPhoneInput) return;

        // Validate 10 digits
        if (!/^\d{10}$/.test(manualPhoneInput)) {
            setManualInputError('Mobile number must be 10 digits');
            return;
        }

        const fullNumber = manualCountryCode.replace('+', '') + manualPhoneInput;

        // Check for duplicates
        if (formData.manual_recipients?.some((r: any) => r.mobile_number === fullNumber)) {
            setManualInputError('Number already added');
            return;
        }

        setFormData(prev => ({
            ...prev,
            manual_recipients: [...(prev.manual_recipients || []), { mobile_number: fullNumber, dynamic_variables: [] }]
        }));
        setManualPhoneInput('');
        setManualInputError('');
        setError(null);
    };

    const handleRemoveManualRecipient = (index: number) => {
        setFormData(prev => ({
            ...prev,
            manual_recipients: (prev.manual_recipients || []).filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            setError(null);

            // Prepare variables structure (Body + Buttons)
            const getRecipientVariables = (vals: Record<string, string>) => {
                const bodyVars = selectedTemplate?.variableArray?.map((v: any) => vals[v.variable_key] || '') || [];
                const buttonVars = selectedTemplate?.buttonVariables?.map((v: any) => ({
                    index: v.index,
                    parameters: [vals[v.variable_key] || '']
                })) || [];
                
                return { body: bodyVars, buttons: buttonVars };
            };

            // Prepare global variables from Step 2
            const globalDynamicVariables = getRecipientVariables(variableValues);

            // Build audience_data based on recipient_source
            let audienceData: CSVRecipient[] | string;

            if (formData.recipient_source === 'group') {
                const hasVars = ( (selectedTemplate?.variableArray && selectedTemplate.variableArray.length > 0) || (selectedTemplate?.buttonVariables && selectedTemplate.buttonVariables.length > 0) ) && selectedTemplate.category !== 'authentication';
                if (hasVars && selectedGroupMembers.length > 0) {
                    // Send as per-member CSVRecipient array for personalized group campaigns
                    audienceData = selectedGroupMembers.map(member => {
                        const contactId = member.contact?.contact_id || member.contact_id;
                        const phone = member.contact?.phone || member.mobile_number || '';
                        const memberVars = groupMemberVariables[contactId] || {};
                        return { 
                            mobile_number: phone, 
                            dynamic_variables: getRecipientVariables(memberVars) 
                        };
                    });
                } else {
                    // No variables — use plain group_id so backend sends same message to all
                    audienceData = formData.group_id || '';
                }
            } else if (formData.recipient_source === 'csv') {
                // For CSV, we respect the variables defining in the CSV file itself
                // Backend will handle array format for now
                audienceData = formData.csv_data || [];
            } else {
                // For manual, we inject the Global Variables defined in Step 2
                audienceData = (formData.manual_recipients || []).map(r => ({
                    ...r,
                    dynamic_variables: globalDynamicVariables
                }));
            }

            const request: CreateCampaignRequest = {
                campaign_name: formData.campaign_name,
                campaign_type: formData.campaign_type,
                template_id: formData.template_id,
                audience_type: formData.recipient_source,
                audience_data: audienceData,
                scheduled_at: formData.scheduled_at,
                variable_values: variableValues, // Kept for reference, though backend uses audience_data
                header_media_url: formData.header_media_url || null,
                location_params: selectedTemplate?.type === 'location' ? formData.location_params : null,
                card_media_urls: selectedTemplate?.type === 'carousel' ? formData.card_media_urls : null,
            };

            const response = await campaignService.createCampaign(request);
            // Handle both flat and nested response structures
            // Valid paths based on observation: response.campaign.campaign_id (Actual API), response.campaign_id (Spec), response.data.campaign_id (Standard)
            const campaignId =
                (response as any).campaign?.campaign_id ||
                (response as any).campaign?.id ||
                response.campaign_id ||
                (response as any).data?.campaign_id ||
                (response as any).id ||
                (response as any).data?.id;

            if (campaignId) {
                onSuccess(campaignId);
                onClose();
            } else {
                console.error("Campaign Creation Response:", response);
                throw new Error("Campaign created but ID was missing in response. Check console.");
            }
        } catch (err: any) {
            console.error("Submit Error:", err);
            setError(err?.response?.data?.message || err.message || 'Failed to create campaign');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <GlassCard
                isDarkMode={isDarkMode}
                className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            >
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-white/10">
                    <h2 className={cn("text-2xl font-bold", isDarkMode ? 'text-white' : 'text-slate-900')}>
                        Create New Campaign
                    </h2>
                    <button
                        onClick={onClose}
                        className={cn(
                            "p-2 rounded-lg transition-all",
                            isDarkMode ? 'hover:bg-white/10' : 'hover:bg-slate-100'
                        )}
                    >
                        <X size={20} className={isDarkMode ? 'text-white/60' : 'text-slate-600'} />
                    </button>
                </div>

                {/* Progress Steps */}
                <div className="px-6 py-4 border-b border-white/10">
                    <div className="flex items-center justify-between">
                        {steps.map((step, index) => (
                            <div key={step.number} className="flex items-center flex-1">
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                                        currentStep >= step.number
                                            ? 'bg-emerald-500 text-white'
                                            : isDarkMode
                                                ? 'bg-white/10 text-white/40'
                                                : 'bg-slate-100 text-slate-400'
                                    )}>
                                        {currentStep > step.number ? <Check size={16} /> : step.number}
                                    </div>
                                    <span className={cn(
                                        "text-sm font-semibold hidden md:block",
                                        currentStep >= step.number
                                            ? isDarkMode ? 'text-white' : 'text-slate-900'
                                            : isDarkMode ? 'text-white/40' : 'text-slate-400'
                                    )}>
                                        {step.title}
                                    </span>
                                </div>
                                {index < steps.length - 1 && (
                                    <div className={cn(
                                        "flex-1 h-0.5 mx-4",
                                        currentStep > step.number
                                            ? 'bg-emerald-500'
                                            : isDarkMode ? 'bg-white/10' : 'bg-slate-200'
                                    )} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Step 1: Campaign Info */}
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <div>
                                <label className={cn("block text-sm font-semibold mb-2", isDarkMode ? 'text-white' : 'text-slate-900')}>
                                    Campaign Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.campaign_name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, campaign_name: e.target.value }))}
                                    placeholder="e.g., Diwali Offer 2024"
                                    className={cn(
                                        "w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all",
                                        isDarkMode
                                            ? 'bg-white/5 border-white/10 text-white placeholder:text-white/30'
                                            : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
                                    )}
                                />
                            </div>

                            <div>
                                <label className={cn("block text-sm font-semibold mb-2", isDarkMode ? 'text-white' : 'text-slate-900')}>
                                    Campaign Type *
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {(['immediate', 'scheduled', 'broadcast', 'api'] as CampaignType[]).map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => setFormData(prev => ({ ...prev, campaign_type: type }))}
                                            className={cn(
                                                "px-4 py-3 rounded-xl border text-sm font-semibold capitalize transition-all",
                                                formData.campaign_type === type
                                                    ? 'bg-emerald-500 border-emerald-500 text-white'
                                                    : isDarkMode
                                                        ? 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                            )}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className={cn("block text-sm font-semibold mb-2", isDarkMode ? 'text-white' : 'text-slate-900')}>
                                    Recipient Source *
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    {(['csv', 'group', 'manual'] as RecipientSource[]).map((source) => (
                                        <button
                                            key={source}
                                            onClick={() => setFormData(prev => ({ ...prev, recipient_source: source }))}
                                            className={cn(
                                                "px-4 py-3 rounded-xl border text-sm font-semibold capitalize transition-all",
                                                formData.recipient_source === source
                                                    ? 'bg-emerald-500 border-emerald-500 text-white'
                                                    : isDarkMode
                                                        ? 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                            )}
                                        >
                                            {source}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {formData.campaign_type === 'scheduled' && (
                                <div>
                                    <label className={cn("block text-sm font-semibold mb-2", isDarkMode ? 'text-white' : 'text-slate-900')}>
                                        Schedule Date & Time *
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={formData.scheduled_at || ''}
                                        onChange={(e) => setFormData(prev => ({ ...prev, scheduled_at: e.target.value }))}
                                        className={cn(
                                            "w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all",
                                            isDarkMode
                                                ? 'bg-white/5 border-white/10 text-white'
                                                : 'bg-white border-slate-200 text-slate-900'
                                        )}
                                    />
                                </div>
                            )}

                            {/* Error Display */}
                            {error && currentStep === 1 && (
                                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                                    <p className="text-red-500 text-sm">{error}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 2: Template Selection */}
                    {currentStep === 2 && (
                        <div className="space-y-6">
                            <div>
                                <label className={cn("block text-sm font-semibold mb-2", isDarkMode ? 'text-white' : 'text-slate-900')}>
                                    Select Template *
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setIsTemplateModalOpen(true)}
                                    className={cn(
                                        "w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all text-left flex items-center justify-between",
                                        isDarkMode
                                            ? 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                                            : 'bg-white border-slate-200 text-slate-900 hover:bg-slate-50'
                                    )}
                                >
                                    <span className={formData.template_id ? '' : cn(isDarkMode ? 'text-white/30' : 'text-slate-400')}>
                                        {selectedTemplate?.name || formData.template_id || 'Click to select template'}
                                    </span>
                                    <ChevronRight size={16} className={cn(isDarkMode ? 'text-white/40' : 'text-slate-400')} />
                                </button>
                                <p className={cn("text-xs mt-2", isDarkMode ? 'text-white/40' : 'text-slate-500')}>
                                    Browse templates by category and type
                                </p>

                                {/* Template Preview */}
                                {selectedTemplate && (
                                    <div className={cn(
                                        "mt-4 p-4 rounded-xl border border-dashed transition-all",
                                        isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
                                    )}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={cn("text-xs font-semibold uppercase", isDarkMode ? "text-white/60" : "text-slate-500")}>
                                                Message Preview
                                            </span>
                                        </div>
                                        <div className={cn(
                                            "relative p-3 rounded-lg max-w-[90%] shadow-sm",
                                            isDarkMode ? "bg-[#202c33]" : "bg-[#d9fdd3]"
                                        )}>
                                            {/* Preview Header */}
                                            {selectedTemplate.type !== 'text' && selectedTemplate.type !== 'location' && (
                                                <div className="mb-2 w-full min-h-[128px] bg-black/10 rounded overflow-hidden flex items-center justify-center text-xs opacity-80 flex-col gap-2">
                                                    {formData.header_media_url ? (
                                                        selectedTemplate.type === 'image' ? (
                                                            <img 
                                                                src={formData.header_media_url} 
                                                                alt="Header" 
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    (e.target as any).style.display = 'none';
                                                                }}
                                                            />
                                                        ) : selectedTemplate.type === 'video' ? (
                                                            <video 
                                                                src={formData.header_media_url} 
                                                                className="w-full h-full object-cover"
                                                                muted
                                                            />
                                                        ) : (
                                                            <div className="flex flex-col items-center gap-2 p-4 text-center">
                                                                <FileText size={32} />
                                                                <span className="font-semibold">DOCUMENT ATTACHED</span>
                                                            </div>
                                                        )
                                                    ) : (
                                                        <>
                                                            <div className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center">
                                                                {/* Icon placeholder */}
                                                                {selectedTemplate.type === 'image' ? <ImageIcon size={16} /> : <FileText size={16} />}
                                                            </div>
                                                            {getUploadType(selectedTemplate.type).toUpperCase()} HEADER
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                            {/* Location Preview */}
                                            {selectedTemplate.type === 'location' && (
                                                <div className={cn("mb-2 w-full rounded overflow-hidden flex items-center gap-3 p-3", isDarkMode ? 'bg-black/20' : 'bg-black/5')}>
                                                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", isDarkMode ? 'bg-emerald-500/20' : 'bg-emerald-100')}>
                                                        <MapPin size={18} className="text-emerald-500" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={cn("text-xs font-bold truncate", isDarkMode ? 'text-gray-100' : 'text-gray-900')}>
                                                            {formData.location_params?.name || 'Location Name'}
                                                        </p>
                                                        <p className={cn("text-[10px] truncate", isDarkMode ? 'text-gray-400' : 'text-gray-500')}>
                                                            {formData.location_params?.address || 'Full address will appear here'}
                                                        </p>
                                                        {(formData.location_params?.latitude && formData.location_params?.longitude) && (
                                                            <p className={cn("text-[9px] mt-0.5", isDarkMode ? 'text-gray-500' : 'text-gray-400')}>
                                                                {formData.location_params.latitude}, {formData.location_params.longitude}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                            {selectedTemplate.headerText && (
                                                <div className={cn("font-bold text-sm mb-1", isDarkMode ? "text-gray-100" : "text-gray-900")}>
                                                    {selectedTemplate.headerText}
                                                </div>
                                            )}

                                            {/* Preview Body */}
                                            <p className={cn("text-sm whitespace-pre-wrap leading-relaxed", isDarkMode ? "text-gray-100" : "text-gray-900")}>
                                                {/* Replaces {{variable}} with variable values if available or keeps placeholders */}
                                                {(selectedTemplate.bodyText || selectedTemplate.description).split(/(\{\{[\w]+\}\})/).map((part, i) => {
                                                    if (part.match(/\{\{[\w]+\}\}/)) {
                                                        const key = part.replace(/[{}]/g, '');
                                                        const val = variableValues[key];
                                                        return (
                                                            <span key={i} className={cn("font-semibold px-1 rounded", val ? (isDarkMode ? "bg-white/20" : "bg-black/5") : "opacity-70")}>
                                                                {val || part}
                                                            </span>
                                                        );
                                                    }
                                                    return part;
                                                })}
                                            </p>

                                            {/* Preview Footer */}
                                            {selectedTemplate?.footerText && (
                                                <div className={cn("text-xs mt-2 opacity-60", isDarkMode ? "text-gray-300" : "text-gray-600")}>
                                                    {selectedTemplate.footerText}
                                                </div>
                                            )}
                                            
                                            {/* Preview Buttons */}
                                            {selectedTemplate?.buttonVariables && selectedTemplate.buttonVariables.length > 0 && (
                                                <div className="mt-2 space-y-1">
                                                    {selectedTemplate.buttonVariables.map((btn: any) => {
                                                        const val = variableValues[btn.variable_key];
                                                        return (
                                                            <div key={btn.variable_key} className={cn(
                                                                "py-2 px-3 rounded-lg text-sm text-center font-medium",
                                                                isDarkMode ? "bg-white/5 text-blue-400" : "bg-white text-blue-600"
                                                            )}>
                                                                {btn.text} {val ? `(${val})` : ''}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                            
                                            {/* Preview Timestamp */}
                                            <div className={cn("text-[10px] text-right mt-1 opacity-60", isDarkMode ? "text-white" : "text-gray-500")}>
                                                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                 {/* Variable Inputs — only for 'manual' source with non-auth templates */}
                                 {( (selectedTemplate?.variableArray && selectedTemplate.variableArray.length > 0) || (selectedTemplate?.buttonVariables && selectedTemplate.buttonVariables.length > 0) ) && 
                                  selectedTemplate.category !== 'authentication' && 
                                  formData.recipient_source === 'manual' && (
                                    <div className="mt-4 space-y-3">
                                        <label className={cn("block text-sm font-semibold", isDarkMode ? 'text-white' : 'text-slate-900')}>
                                            Template Variables
                                        </label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Body Variables */}
                                            {selectedTemplate.variableArray?.map((v: any) => (
                                                <div key={v.id || v.variable_key}>
                                                    <label className={cn("text-xs mb-1 block", isDarkMode ? 'text-white/60' : 'text-slate-500')}>
                                                        Body Variable {'{{' + v.variable_key + '}}'}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={variableValues[v.variable_key] || ''}
                                                        onChange={(e) => {
                                                            setVariableValues(prev => ({ ...prev, [v.variable_key]: e.target.value }));
                                                            if (error) setError(null);
                                                        }}
                                                        placeholder={v.sample_value ? `e.g. ${v.sample_value}` : 'Value'}
                                                        className={cn(
                                                            "w-full px-3 py-2 rounded-lg border text-sm outline-none transition-all",
                                                            !variableValues[v.variable_key]?.trim() && error?.includes(v.variable_key)
                                                                ? 'border-red-500 bg-red-500/5'
                                                                : isDarkMode
                                                                    ? 'bg-white/5 border-white/10 text-white placeholder:text-white/30'
                                                                    : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
                                                        )}
                                                    />
                                                </div>
                                            ))}
                                            
                                            {/* Button Variables */}
                                            {selectedTemplate.buttonVariables?.map((v: any) => (
                                                <div key={v.variable_key}>
                                                    <label className={cn("text-xs mb-1 block", isDarkMode ? 'text-white/60' : 'text-blue-400 font-semibold')}>
                                                        Button Variable: {v.text} (URL)
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={variableValues[v.variable_key] || ''}
                                                        onChange={(e) => {
                                                            setVariableValues(prev => ({ ...prev, [v.variable_key]: e.target.value }));
                                                            if (error) setError(null);
                                                        }}
                                                        placeholder={v.sample_value ? `e.g. ${v.sample_value}` : 'Dynamic URL part'}
                                                        className={cn(
                                                            "w-full px-3 py-2 rounded-lg border border-blue-500/30 text-sm outline-none transition-all",
                                                            !variableValues[v.variable_key]?.trim() && error?.includes(v.variable_key)
                                                                ? 'border-red-500 bg-red-500/5'
                                                                : isDarkMode
                                                                    ? 'bg-blue-500/5 border-blue-500/20 text-white placeholder:text-blue-500/30'
                                                                    : 'bg-blue-50 border-blue-200 text-slate-900 placeholder:text-blue-300'
                                                        )}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                 )}

                                {/* Info banner for CSV/Group — variables filled per-recipient in Step 3 */}
                                {selectedTemplate?.variableArray && selectedTemplate.variableArray.length > 0 &&
                                 selectedTemplate.category !== 'authentication' &&
                                 (formData.recipient_source === 'csv' || formData.recipient_source === 'group') && (
                                    <div className={cn(
                                        "mt-4 p-3 rounded-xl border flex items-start gap-3",
                                        isDarkMode ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-emerald-50 border-emerald-200'
                                    )}>
                                        <Check size={15} className="text-emerald-500 mt-0.5 shrink-0" />
                                        <div>
                                            <p className={cn("text-xs font-semibold", isDarkMode ? 'text-emerald-400' : 'text-emerald-700')}>
                                                {formData.recipient_source === 'csv' ? 'Variables go in your CSV file' : 'Variables filled per-member in Step 3'}
                                            </p>
                                            <p className={cn("text-xs mt-0.5", isDarkMode ? 'text-white/50' : 'text-slate-500')}>
                                                {formData.recipient_source === 'csv'
                                                    ? `Columns: country_code, mobile_number, ${selectedTemplate.variableArray.map((v: any) => v.variable_key).join(', ')}`
                                                    : `You'll fill ${selectedTemplate.variableArray.length} variable(s) for each group member in the next step.`
                                                }
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Authentication OTP Info Banner */}
                                {selectedTemplate?.category === 'authentication' && (
                                    <div className={cn(
                                        "mt-4 rounded-xl p-4 border flex gap-3 items-start",
                                        isDarkMode ? 'bg-violet-500/10 border-violet-500/30' : 'bg-violet-50 border-violet-200'
                                    )}>
                                        <div className="text-2xl shrink-0">🔐</div>
                                        <div className="space-y-1">
                                            <p className={cn("text-sm font-bold", isDarkMode ? 'text-violet-300' : 'text-violet-800')}>
                                                OTP Template — Auto-Generated Per Recipient
                                            </p>
                                            <p className={cn("text-xs leading-relaxed", isDarkMode ? 'text-violet-300/70' : 'text-violet-700')}>
                                                A unique 6-digit OTP will be automatically generated for each recipient when the campaign runs.<br />
                                                You do not need to fill in any variables — the system handles it.
                                            </p>
                                            <div className={cn("flex items-center gap-3 mt-2 p-2.5 rounded-lg", isDarkMode ? 'bg-white/5' : 'bg-white')}>
                                                <span className={cn("text-xs font-mono font-bold px-2 py-1 rounded", isDarkMode ? 'bg-violet-500/20 text-violet-300' : 'bg-violet-100 text-violet-700')}>
                                                    {'{{1}}'} = ••••••
                                                </span>
                                                <span className={cn("text-xs", isDarkMode ? 'text-white/50' : 'text-slate-500')}>
                                                    OTP expires in 10 minutes after send
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}


                                {/* Media Header Input */}
                                {selectedTemplate && isMediaType(selectedTemplate.type) && (
                                    <div className="mt-4 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <label className={cn("block text-sm font-semibold", isDarkMode ? 'text-white' : 'text-slate-900')}>
                                                {getUploadType(selectedTemplate.type).toUpperCase()} Header Media *
                                            </label>
                                            {isUploading && (
                                                <span className="text-xs text-emerald-500 animate-pulse flex items-center gap-1">
                                                    <Upload size={12} className="animate-bounce" /> uploading...
                                                </span>
                                            )}
                                        </div>
                                        
                                        <div className="w-full md:w-2/5">
                                            <FileUpload
                                                isDarkMode={isDarkMode}
                                                accept={selectedTemplate.type === 'image' ? 'image/*' : selectedTemplate.type === 'video' ? 'video/*' : '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar'}
                                                uploadedUrl={formData.header_media_url || ''}
                                                onFileSelected={handleHeaderFileUpload}
                                                onRemove={() => {
                                                    setFormData(prev => ({ ...prev, header_media_url: '' }));
                                                    setHeaderFileName(null);
                                                }}
                                                uploadType={getUploadType(selectedTemplate.type)}
                                                isUploading={isUploading}
                                                fileName={headerFileName}
                                                compact
                                            />
                                            <p className={cn("text-[10px] mt-2 opacity-60", isDarkMode ? 'text-white' : 'text-slate-500')}>
                                                Upload your {getUploadType(selectedTemplate.type)} file (max 20MB) to be sent as the message header
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Location Header Input */}
                                {selectedTemplate?.type === 'location' && (
                                    <div className="mt-4 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <label className={cn("block text-sm font-semibold", isDarkMode ? 'text-white' : 'text-slate-900')}>
                                                Location Details *
                                            </label>
                                        </div>
                                        <p className={cn("text-xs mb-2", isDarkMode ? 'text-white/60' : 'text-slate-500')}>
                                            Fill in the latitude, longitude, name, and address to send location message
                                        </p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <input
                                                type="number"
                                                value={formData.location_params?.latitude || ''}
                                                onChange={(e) => setFormData(prev => ({ 
                                                    ...prev, 
                                                    location_params: { ...prev.location_params!, latitude: e.target.value } 
                                                }))}
                                                placeholder="Latitude (e.g. 77.0797)"
                                                step="any"
                                                className={cn(
                                                    "w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all",
                                                    isDarkMode
                                                        ? 'bg-white/5 border-white/10 text-white placeholder:text-white/30'
                                                        : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
                                                )}
                                            />
                                            <input
                                                type="number"
                                                value={formData.location_params?.longitude || ''}
                                                onChange={(e) => setFormData(prev => ({ 
                                                    ...prev, 
                                                    location_params: { ...prev.location_params!, longitude: e.target.value } 
                                                }))}
                                                placeholder="Longitude (e.g. 28.4968)"
                                                step="any"
                                                className={cn(
                                                    "w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all",
                                                    isDarkMode
                                                        ? 'bg-white/5 border-white/10 text-white placeholder:text-white/30'
                                                        : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
                                                )}
                                            />
                                            <input
                                                type="text"
                                                value={formData.location_params?.name || ''}
                                                onChange={(e) => setFormData(prev => ({ 
                                                    ...prev, 
                                                    location_params: { ...prev.location_params!, name: e.target.value } 
                                                }))}
                                                placeholder="Location Name"
                                                className={cn(
                                                    "w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all md:col-span-2",
                                                    isDarkMode
                                                        ? 'bg-white/5 border-white/10 text-white placeholder:text-white/30'
                                                        : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
                                                )}
                                            />
                                            <textarea
                                                value={formData.location_params?.address || ''}
                                                onChange={(e) => setFormData(prev => ({ 
                                                    ...prev, 
                                                    location_params: { ...prev.location_params!, address: e.target.value } 
                                                }))}
                                                placeholder="Full Address"
                                                rows={2}
                                                className={cn(
                                                    "w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all md:col-span-2 resize-none",
                                                    isDarkMode
                                                        ? 'bg-white/5 border-white/10 text-white placeholder:text-white/30'
                                                        : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
                                                )}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Carousel Media Headers Input */}
                                {selectedTemplate?.type === 'carousel' && (
                                    <div className="mt-4 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <label className={cn("block text-sm font-semibold", isDarkMode ? 'text-white' : 'text-slate-900')}>
                                                Carousel Card Media *
                                            </label>
                                        </div>
                                        <p className={cn("text-xs mb-4", isDarkMode ? 'text-white/60' : 'text-slate-500')}>
                                            Upload media for each card in the carousel.
                                        </p>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                            {selectedTemplate?.carouselCards?.map((card: any, idx: number) => {
                                                const headerComp = card.components?.find((c: any) => c.type === 'HEADER');
                                                const isMediaHeader = headerComp && (headerComp.format === 'IMAGE' || headerComp.format === 'VIDEO');
                                                
                                                if (!isMediaHeader) return null;
                                                
                                                const cardMediaUrl = formData.card_media_urls?.[idx];
                                                const isCardUploading = !!cardUploading[idx];
                                                
                                                return (
                                                    <div key={idx} className={cn(
                                                        "p-4 rounded-xl border flex flex-col gap-3",
                                                        isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
                                                    )}>
                                                        <div className="flex items-center justify-between border-b border-dashed pb-2 mb-1" style={{ borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                                                            <span className={cn("text-xs font-bold uppercase tracking-wider", isDarkMode ? "text-white/60" : "text-slate-600")}>
                                                                Card {idx + 1}
                                                            </span>
                                                            <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold", 
                                                                headerComp.format === 'IMAGE' ? "bg-blue-500/10 text-blue-500" : "bg-purple-500/10 text-purple-500"
                                                            )}>
                                                                {headerComp.format}
                                                            </span>
                                                        </div>
                                                        
                                                        <FileUpload
                                                            isDarkMode={isDarkMode}
                                                            accept={headerComp.format === 'IMAGE' ? 'image/*' : 'video/*'}
                                                            uploadedUrl={cardMediaUrl || ''}
                                                            onFileSelected={(file) => handleCardMediaUpload(idx, file, headerComp.format.toLowerCase() as any)}
                                                            onRemove={() => {
                                                                setFormData(prev => ({
                                                                    ...prev,
                                                                    card_media_urls: { ...(prev.card_media_urls || {}), [idx]: '' }
                                                                }));
                                                                setCardFileNames(prev => {
                                                                    const next = { ...prev };
                                                                    delete next[idx];
                                                                    return next;
                                                                });
                                                            }}
                                                            uploadType={headerComp.format.toLowerCase() as any}
                                                            isUploading={isCardUploading}
                                                            fileName={cardFileNames[idx]}
                                                            compact
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Error Display */}
                            {error && currentStep === 2 && (
                                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                                    <p className="text-red-500 text-sm">{error}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 3: Recipients */}
                    {currentStep === 3 && (
                        <div className="space-y-6">
                            <div>
                                <label className={cn("block text-sm font-semibold mb-1", isDarkMode ? 'text-white' : 'text-slate-900')}>
                                    Selected Recipient Source: <span className="text-emerald-500 capitalize">{formData.recipient_source}</span>
                                </label>
                                <p className={cn("text-xs mb-4", isDarkMode ? 'text-white/40' : 'text-slate-500')}>
                                    You can change the source in Step 1 if needed.
                                </p>
                            </div>


                            {/* CSV Upload */}
                            {formData.recipient_source === 'csv' && (
                                <div className="space-y-4">
                                    {/* CSV Data Requirements Banner */}
                                    <div className={cn(
                                        "p-4 rounded-xl border flex flex-col gap-3 transition-all",
                                        csvValidation?.isValid 
                                            ? (isDarkMode ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-emerald-50 border-emerald-200')
                                            : (isDarkMode ? 'bg-blue-500/5 border-blue-500/20' : 'bg-blue-50 border-blue-200')
                                    )}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                {csvValidation?.isValid ? (
                                                    <Check size={16} className="text-emerald-500" />
                                                ) : (
                                                    <AlertTriangle size={16} className="text-blue-500" />
                                                )}
                                                <span className={cn("text-sm font-bold", isDarkMode ? 'text-white' : 'text-slate-900')}>
                                                    {csvValidation?.isValid ? 'CSV Verification Successful' : 'CSV Data Requirements'}
                                                </span>
                                            </div>
                                            {csvValidation?.isValid && (
                                                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">
                                                    READY
                                                </span>
                                            )}
                                        </div>

                                        {!csvValidation?.isValid ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <p className={cn("text-xs font-semibold", isDarkMode ? 'text-white/80' : 'text-slate-700')}>Required Columns (Fixed):</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold rounded border border-emerald-500/20">1. country_code (e.g. 91)</span>
                                                        <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold rounded border border-emerald-500/20">2. mobile_number (10 digits)</span>
                                                    </div>
                                                </div>
                                                {selectedTemplate?.variableArray && selectedTemplate.variableArray.length > 0 && selectedTemplate.category !== 'authentication' && (
                                                    <div className="space-y-2">
                                                        <p className={cn("text-xs font-semibold", isDarkMode ? 'text-white/80' : 'text-slate-700')}>Template Variables (Required):</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {selectedTemplate.variableArray.map((v, i) => (
                                                                <span key={i} className="px-2 py-1 bg-blue-500/10 text-blue-500 text-[10px] font-bold rounded border border-blue-500/20">
                                                                    {i + 3}. {v.variable_key || v.name}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-xs space-y-2">
                                                <p className={isDarkMode ? 'text-white/60' : 'text-slate-600'}>
                                                    All columns verified. Found {csvValidation.validRows.length} valid recipients with the following variables:
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    <span className="text-[10px] font-medium text-emerald-500 px-2 py-1 bg-emerald-500/5 rounded border border-emerald-500/10">✓ country_code</span>
                                                    <span className="text-[10px] font-medium text-emerald-500 px-2 py-1 bg-emerald-500/5 rounded border border-emerald-500/10">✓ mobile_number</span>
                                                    {selectedTemplate?.variableArray?.map((v, i) => (
                                                        <span key={i} className="text-[10px] font-medium text-emerald-500 px-2 py-1 bg-emerald-500/5 rounded border border-emerald-500/10">
                                                            ✓ {v.variable_key || v.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className={cn(
                                        "border-2 border-dashed rounded-xl p-8 text-center transition-all",
                                        isDarkMode ? 'border-white/20 hover:border-white/40' : 'border-slate-300 hover:border-slate-400'
                                    )}>
                                        <Upload size={32} className={cn("mx-auto mb-3", isDarkMode ? 'text-white/40' : 'text-slate-400')} />
                                        <p className={cn("text-sm font-semibold mb-2", isDarkMode ? 'text-white' : 'text-slate-900')}>
                                            Upload CSV File
                                        </p>
                                        <p className={cn("text-xs mb-4", isDarkMode ? 'text-white/40' : 'text-slate-500')}>
                                            Drag and drop or click to browse
                                        </p>
                                        <input
                                            type="file"
                                            accept=".csv"
                                            onChange={(e) => e.target.files?.[0] && handleCSVUpload(e.target.files[0])}
                                            className="hidden"
                                            id="csv-upload"
                                        />
                                        <label
                                            htmlFor="csv-upload"
                                            className="inline-block px-4 py-2 bg-emerald-500 text-white rounded-lg text-xs font-semibold cursor-pointer hover:bg-emerald-600 transition-all"
                                        >
                                            Choose File
                                        </label>
                                    </div>

                                    {csvFile && (
                                        <div className={cn(
                                            "p-4 rounded-xl",
                                            csvValidation?.isValid
                                                ? 'bg-emerald-500/10 border border-emerald-500/20'
                                                : 'bg-red-500/10 border border-red-500/20'
                                        )}>
                                            <p className={cn(
                                                "text-sm font-semibold",
                                                csvValidation?.isValid ? 'text-emerald-500' : 'text-red-500'
                                            )}>
                                                {csvFile.name}
                                            </p>
                                            {csvValidation && (
                                                <p className={cn("text-xs mt-1", isDarkMode ? 'text-white/60' : 'text-slate-600')}>
                                                    {csvValidation.isValid
                                                        ? `${csvValidation.validRows.length} valid recipients`
                                                        : `${csvValidation.errors.length} errors found`
                                                    }
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    <button
                                        onClick={() => downloadCSVTemplate(selectedTemplate?.variableArray || [], selectedTemplate?.name || 'template')}
                                        className={cn(
                                            "text-xs font-semibold underline",
                                            isDarkMode ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-600 hover:text-emerald-700'
                                        )}
                                    >
                                        Download CSV Template
                                    </button>
                                </div>
                            )}

                            {/* Group Selection */}
                            {formData.recipient_source === 'group' && (() => {
                                const hasTemplateVars = selectedTemplate?.variableArray && 
                                    selectedTemplate.variableArray.length > 0 && 
                                    selectedTemplate.category !== 'authentication';
                                const selectedGroup = groups.find(g => g.group_id === formData.group_id);

                                return (
                                    <div className="space-y-4">
                                        {/* Step A: Group Picker */}
                                        <div>
                                            <p className={cn("text-xs mb-3", isDarkMode ? 'text-white/40' : 'text-slate-500')}>
                                                {groups.length === 0 ? 'No groups found' : 'Step 1: Choose a group'}
                                            </p>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                                                {groups.map((group) => (
                                                    <button
                                                        key={group.group_id}
                                                        onClick={() => {
                                                            setFormData(prev => ({ ...prev, group_id: group.group_id }));
                                                            // Pre-load members into selectedGroupMembers
                                                            setSelectedGroupMembers((group as any).members || []);
                                                            setGroupMemberVariables({});
                                                        }}
                                                        className={cn(
                                                            "p-3 rounded-lg border text-left transition-all",
                                                            formData.group_id === group.group_id
                                                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                                                : isDarkMode
                                                                    ? 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                                                                    : 'bg-white border-slate-200 text-slate-900 hover:bg-slate-50'
                                                        )}
                                                    >
                                                        <div className="font-semibold text-sm">{group.group_name}</div>
                                                        <div className={cn("text-xs opacity-80", formData.group_id === group.group_id ? 'text-white/80' : 'text-slate-500')}>
                                                            {(group as any).members?.length || (group as any).total_contacts || 0} contacts
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Step B: Per-Member Variable Inputs */}
                                        {selectedGroup && hasTemplateVars && selectedGroupMembers.length > 0 && (
                                            <div className="space-y-3">
                                                <div className={cn("p-3 rounded-lg border flex items-center gap-2",
                                                    isDarkMode ? 'bg-blue-500/5 border-blue-500/20' : 'bg-blue-50 border-blue-200'
                                                )}>
                                                    <AlertTriangle size={14} className="text-blue-500 shrink-0" />
                                                    <p className={cn("text-xs", isDarkMode ? 'text-blue-300' : 'text-blue-700')}>
                                                        <strong>Step 2:</strong> Fill personalized variables for each member below.
                                                    </p>
                                                </div>

                                                <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                                                    {selectedGroupMembers.map((member: any, idx: number) => {
                                                        const contactId = member.contact?.contact_id || member.contact_id;
                                                        const phone = member.contact?.phone || member.mobile_number || '';
                                                        const name = member.contact?.name || phone || `Contact ${idx + 1}`;
                                                        const memberVars = groupMemberVariables[contactId] || {};

                                                        return (
                                                            <div key={contactId || idx} className={cn(
                                                                "p-4 rounded-xl border",
                                                                isDarkMode ? 'bg-white/3 border-white/10' : 'bg-white border-slate-200'
                                                            )}>
                                                                {/* Member Header */}
                                                                <div className="flex items-center gap-2 mb-3">
                                                                    <div className={cn(
                                                                        "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                                                                        isDarkMode ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-700'
                                                                    )}>
                                                                        {name.charAt(0).toUpperCase()}
                                                                    </div>
                                                                    <div>
                                                                        <p className={cn("text-sm font-semibold", isDarkMode ? 'text-white' : 'text-slate-900')}>{name}</p>
                                                                        <p className={cn("text-[10px]", isDarkMode ? 'text-white/40' : 'text-slate-400')}>{phone}</p>
                                                                    </div>
                                                                    {/* Completion badge */}
                                                                    {selectedTemplate?.variableArray?.every((v: any) => memberVars[v.variable_key]?.trim()) && (
                                                                        <span className="ml-auto text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">✓ Done</span>
                                                                    )}
                                                                </div>

                                                                {/* Variable Inputs */}
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                                    {selectedTemplate?.variableArray?.map((v: any) => (
                                                                        <div key={v.variable_key}>
                                                                            <label className={cn("text-[10px] font-semibold mb-1 block", isDarkMode ? 'text-white/50' : 'text-slate-500')}>
                                                                                {'{{'}{v.variable_key}{'}}'}
                                                                            </label>
                                                                            <input
                                                                                type="text"
                                                                                value={memberVars[v.variable_key] || ''}
                                                                                onChange={(e) => {
                                                                                    setGroupMemberVariables(prev => ({
                                                                                        ...prev,
                                                                                        [contactId]: { ...(prev[contactId] || {}), [v.variable_key]: e.target.value }
                                                                                    }));
                                                                                    setError(null);
                                                                                }}
                                                                                placeholder={v.sample_value ? `e.g. ${v.sample_value}` : `Value for ${name}`}
                                                                                className={cn(
                                                                                    "w-full px-3 py-2 rounded-lg border text-xs outline-none transition-all",
                                                                                    isDarkMode
                                                                                        ? 'bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-emerald-500'
                                                                                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500'
                                                                                )}
                                                                            />
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* No variables — plain group selected confirmation */}
                                        {selectedGroup && !hasTemplateVars && (
                                            <div className={cn("p-3 rounded-lg border flex items-center gap-2",
                                                isDarkMode ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-emerald-50 border-emerald-200'
                                            )}>
                                                <Check size={14} className="text-emerald-500 shrink-0" />
                                                <p className={cn("text-xs font-medium", isDarkMode ? 'text-emerald-400' : 'text-emerald-700')}>
                                                    All members of <strong>{selectedGroup.group_name}</strong> will receive the same message.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}

                            {/* Manual Selection */}
                            {formData.recipient_source === 'manual' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className={cn("block text-sm font-semibold mb-2", isDarkMode ? 'text-white' : 'text-slate-900')}>
                                            Add Phone Numbers
                                        </label>
                                        <div className="flex gap-2">
                                            <select
                                                value={manualCountryCode}
                                                onChange={(e) => setManualCountryCode(e.target.value)}
                                                className={cn(
                                                    "px-3 py-3 rounded-xl border text-sm outline-none transition-all",
                                                    isDarkMode
                                                        ? 'bg-white/5 border-white/10 text-white [&>option]:bg-slate-800 [&>option]:text-white'
                                                        : 'bg-white border-slate-200 text-slate-900'
                                                )}
                                            >
                                                <option value="+91">+91</option>
                                                <option value="+1">+1</option>
                                                <option value="+44">+44</option>
                                                <option value="+971">+971</option>
                                            </select>
                                            <input
                                                type="text"
                                                value={manualPhoneInput}
                                                onChange={(e) => {
                                                    setManualPhoneInput(e.target.value.replace(/\D/g, '')); // Numbers only
                                                    setManualInputError('');
                                                }}
                                                onKeyDown={(e) => e.key === 'Enter' && handleAddManualRecipient()}
                                                placeholder="9876543210"
                                                maxLength={10}
                                                className={cn(
                                                    "flex-1 px-4 py-3 rounded-xl border text-sm outline-none transition-all",
                                                    manualInputError
                                                        ? 'border-red-500 focus:border-red-500'
                                                        : isDarkMode
                                                            ? 'bg-white/5 border-white/10 text-white focus:border-emerald-500'
                                                            : 'bg-white border-slate-200 text-slate-900 focus:border-emerald-500'
                                                )}
                                            />
                                            <button
                                                onClick={handleAddManualRecipient}
                                                disabled={!manualPhoneInput}
                                                className={cn(
                                                    "px-6 py-3 rounded-xl font-semibold text-sm transition-all flex items-center gap-2",
                                                    !manualPhoneInput
                                                        ? isDarkMode ? 'bg-white/10 text-white/40' : 'bg-slate-100 text-slate-400'
                                                        : 'bg-emerald-500 text-white hover:bg-emerald-600'
                                                )}
                                            >
                                                <Users size={18} />
                                                Add
                                            </button>
                                        </div>
                                        {manualInputError && (
                                            <p className="text-red-500 text-xs mt-2">{manualInputError}</p>
                                        )}
                                        <p className={cn("text-xs mt-2", isDarkMode ? 'text-white/40' : 'text-slate-500')}>
                                            Select country code and enter 10-digit mobile number
                                        </p>
                                    </div>

                                    {/* Added Numbers List */}
                                    {formData.manual_recipients && formData.manual_recipients.length > 0 && (
                                        <div className="space-y-2">
                                            <p className={cn("text-xs font-semibold uppercase", isDarkMode ? 'text-white/60' : 'text-slate-500')}>
                                                Added Recipients ({formData.manual_recipients.length})
                                            </p>
                                            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                                                {formData.manual_recipients.map((recipient: any, idx: number) => (
                                                    <div
                                                        key={idx}
                                                        className={cn(
                                                            "pl-3 pr-2 py-1.5 rounded-full flex items-center gap-2 text-sm",
                                                            isDarkMode ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-900'
                                                        )}
                                                    >
                                                        <span>{recipient.mobile_number}</span>
                                                        <button
                                                            onClick={() => handleRemoveManualRecipient(idx)}
                                                            className={cn(
                                                                "p-0.5 rounded-full transition-colors",
                                                                isDarkMode ? 'hover:bg-white/20' : 'hover:bg-slate-200'
                                                            )}
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}


                            {/* Error Display */}
                            {error && currentStep === 3 && (
                                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                                    <p className="text-red-500 text-sm">{error}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 4: Review */}
                    {currentStep === 4 && (
                        <div className="space-y-6">
                            <div className={cn(
                                "p-6 rounded-xl border",
                                isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'
                            )}>
                                <h3 className={cn("text-lg font-bold mb-4", isDarkMode ? 'text-white' : 'text-slate-900')}>
                                    Campaign Summary
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className={cn("text-sm", isDarkMode ? 'text-white/60' : 'text-slate-600')}>Campaign Name:</span>
                                        <span className={cn("text-sm font-semibold", isDarkMode ? 'text-white' : 'text-slate-900')}>{formData.campaign_name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className={cn("text-sm", isDarkMode ? 'text-white/60' : 'text-slate-600')}>Type:</span>
                                        <span className={cn("text-sm font-semibold capitalize", isDarkMode ? 'text-white' : 'text-slate-900')}>{formData.campaign_type}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className={cn("text-sm", isDarkMode ? 'text-white/60' : 'text-slate-600')}>Template:</span>
                                        <span className={cn("text-sm font-semibold", isDarkMode ? 'text-white' : 'text-slate-900')}>{selectedTemplate?.name || formData.template_id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className={cn("text-sm", isDarkMode ? 'text-white/60' : 'text-slate-600')}>Recipients:</span>
                                        <span className={cn("text-sm font-semibold", isDarkMode ? 'text-white' : 'text-slate-900')}>
                                            {formData.recipient_source === 'csv'
                                                ? (formData.csv_data?.length || 0)
                                                : formData.recipient_source === 'manual'
                                                    ? (formData.manual_recipients?.length || 0)
                                                    : formData.recipient_source === 'group'
                                                        ? (groups.find(g => (g as any).group_id === formData.group_id)?.group_name || 'Selected Group')
                                                        : 0
                                            }
                                        </span>
                                    </div>
                                    {selectedTemplate?.type === 'location' && formData.location_params?.name && (
                                        <div className="flex justify-between">
                                            <span className={cn("text-sm", isDarkMode ? 'text-white/60' : 'text-slate-600')}>Location:</span>
                                            <span className={cn("text-sm font-semibold", isDarkMode ? 'text-white' : 'text-slate-900')}>
                                                {formData.location_params.name}
                                            </span>
                                        </div>
                                    )}
                                    {formData.header_media_url && isMediaType(selectedTemplate?.type) && (
                                        <div className="flex justify-between">
                                            <span className={cn("text-sm", isDarkMode ? 'text-white/60' : 'text-slate-600')}>Media:</span>
                                            <span className={cn("text-sm font-semibold text-emerald-500")}>
                                                {headerFileName || 'Uploaded'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* WhatsApp Preview for Review */}
                            <div className="space-y-4">
                                <h3 className={cn("text-lg font-bold", isDarkMode ? 'text-white' : 'text-slate-900')}>
                                    Message Preview
                                </h3>
                                <div className="flex justify-center bg-black/5 rounded-2xl p-6">
                                    <div className="w-full max-w-[320px]">
                                        <WhatsAppPreviewPanel
                                            isDarkMode={isDarkMode}
                                            templateType={selectedTemplate?.type?.toUpperCase() as any || 'MARKETING'}
                                            content={selectedTemplate?.description || ''}
                                            footer={selectedTemplate?.originalDetails?.components?.find((c: any) => c.type === 'FOOTER')?.text || ''}
                                            headerType={(selectedTemplate?.type?.toUpperCase() as any) || 'NONE'}
                                            headerValue={(formData as any).header_media_url || ''}
                                            variables={variableValues}
                                            fileName={headerFileName}
                                            carouselCards={(() => {
                                                if (selectedTemplate?.type !== 'carousel') return undefined;
                                                const cards = selectedTemplate.carouselCards || [];
                                                
                                                return cards.map((card: any, idx: number) => {
                                                    const header = card.components?.find((c: any) => c.type === 'HEADER');
                                                    const body = card.components?.find((c: any) => c.type === 'BODY');
                                                    const btnComp = card.components?.find((c: any) => c.type === 'BUTTONS');
                                                    
                                                    return {
                                                        id: `card-${idx}`,
                                                        mediaType: (header?.format || 'IMAGE') as any,
                                                        mediaUrl: formData.card_media_urls?.[idx] || (header?.example?.header_handle?.[0] || ''),
                                                        bodyText: body?.text || '',
                                                        buttons: btnComp?.buttons?.map((b: any, bIdx: number) => ({
                                                            id: `card-${idx}-btn-${bIdx}`,
                                                            type: (b.type === 'PHONE_NUMBER' ? 'PHONE' : 'URL') as any,
                                                            label: b.text,
                                                            value: b.url || b.phone_number
                                                        })) || []
                                                    };
                                                });
                                            })()}
                                        />
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                                    <p className="text-red-500 text-sm">{error}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center p-6 border-t border-white/10">
                    <button
                        onClick={handleBack}
                        disabled={currentStep === 1}
                        className={cn(
                            "px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2",
                            currentStep === 1
                                ? 'opacity-50 cursor-not-allowed'
                                : isDarkMode
                                    ? 'text-white hover:bg-white/10'
                                    : 'text-slate-700 hover:bg-slate-100'
                        )}
                    >
                        <ChevronLeft size={16} />
                        Back
                    </button>

                    {
                        currentStep < 4 ? (
                            <button
                                onClick={handleNext}
                                className="px-6 py-2 rounded-xl bg-emerald-500 text-white text-sm font-semibold transition-all hover:bg-emerald-600 flex items-center gap-2"
                            >
                                Next
                                <ChevronRight size={16} />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className={cn(
                                    "px-6 py-2 rounded-xl bg-emerald-500 text-white text-sm font-semibold transition-all hover:bg-emerald-600",
                                    loading && 'opacity-50 cursor-not-allowed'
                                )}
                            >
                                {loading ? 'Creating...' : 'Create Campaign'}
                            </button>
                        )
                    }
                </div>
            </GlassCard>

            {/* Template Selection Modal */}
            <TemplateSelectionModal
                isOpen={isTemplateModalOpen}
                onClose={() => setIsTemplateModalOpen(false)}
                onSelect={handleTemplateSelect}
            />

            {/* CSV Preview Modal */}
            <CSVPreviewModal
                isOpen={isCSVPreviewOpen}
                onClose={() => setIsCSVPreviewOpen(false)}
                onConfirm={handleCSVConfirm}
                csvData={csvRawData}
                fileName={csvFile?.name || ''}
                validation={csvValidation || { isValid: false, validRows: [], errors: [] }}
            />
        </div>
    );
};
