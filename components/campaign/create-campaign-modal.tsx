"use client";

import { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Check, Upload, Users, Calendar as CalendarIcon, AlertTriangle } from 'lucide-react';
import { GlassCard } from "@/components/ui/glass-card";
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
import { TemplateSelectionModal, ProcessedTemplate } from './template-selection-modal';
import { CSVPreviewModal } from './csv-preview-modal';
import { useGetAllGroupsQuery } from '@/hooks/useContactGroupQuery';
import type { ContactGroup } from "@/types/contactGroup";

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
    });

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
    const [manualInputError, setManualInputError] = useState('');

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
                return true;

            case 2: // Template
                if (!formData.template_id.trim()) {
                    setError('Template ID is required');
                    return false;
                }
                return true;

            case 3: // Recipients
                if (formData.recipient_source === 'csv') {
                    if (!csvValidation?.isValid || !formData.csv_data || formData.csv_data.length === 0) {
                        setError('Please upload a valid CSV file with recipients');
                        return false;
                    }
                } else if (formData.recipient_source === 'group') {
                    if (!formData.group_id?.trim()) {
                        setError('Group ID is required');
                        return false;
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

            // Parse CSV data into CSVRecipient format
            const parsedData: CSVRecipient[] = dataRows.map(row => ({
                mobile_number: row[0] || '',
                dynamic_variables: row.slice(1) // All columns after phone number
            }));

            // Validate using template variable count
            const validation = validateCSVData(dataRows, templateVariableCount);
            setCsvValidation(validation);
            setCsvRawData(parsedData);

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
        setVariableValues(initialValues);

        setError(null);
    };

    const handleAddManualRecipient = () => {
        if (!manualPhoneInput) return;

        // Validate India Number format 91XXXXXXXXXX
        if (!/^91\d{10}$/.test(manualPhoneInput)) {
            setManualInputError('Number must be 12 digits starting with 91 (e.g. 919876543210)');
            return;
        }

        // Check for duplicates
        if (formData.manual_recipients?.some((r: any) => r.mobile_number === manualPhoneInput)) {
            setManualInputError('Number already added');
            return;
        }

        setFormData(prev => ({
            ...prev,
            manual_recipients: [...(prev.manual_recipients || []), { mobile_number: manualPhoneInput, dynamic_variables: [] }]
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

            // Prepare global variables from Step 2 (ordered by template definition)
            const orderedVariables = selectedTemplate?.variableArray?.map((v: any) => variableValues[v.variable_key] || '') || [];

            // Build audience_data based on recipient_source
            let audienceData: CSVRecipient[] | string;

            if (formData.recipient_source === 'group') {
                // For group, audience_data is just the group_id string
                audienceData = formData.group_id || '';
            } else if (formData.recipient_source === 'csv') {
                // For CSV, we respect the variables defining in the CSV file itself
                audienceData = formData.csv_data || [];
            } else {
                // For manual, we inject the Global Variables defined in Step 2
                // as manual recipients usually just provide mobile numbers here
                audienceData = (formData.manual_recipients || []).map(r => ({
                    ...r,
                    dynamic_variables: (r.dynamic_variables && r.dynamic_variables.length > 0)
                        ? r.dynamic_variables
                        : orderedVariables
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
                                            {selectedTemplate.type !== 'text' && (
                                                <div className="mb-2 w-full h-32 bg-black/10 rounded flex items-center justify-center text-xs opacity-50 flex-col gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center">
                                                        {/* Icon placeholder */}
                                                    </div>
                                                    {selectedTemplate.type.toUpperCase()} HEADER
                                                </div>
                                            )}
                                            {selectedTemplate.headerText && (
                                                <div className={cn("font-bold text-sm mb-1", isDarkMode ? "text-gray-100" : "text-gray-900")}>
                                                    {selectedTemplate.headerText}
                                                </div>
                                            )}

                                            {/* Preview Body */}
                                            <p className={cn("text-sm whitespace-pre-wrap leading-relaxed", isDarkMode ? "text-gray-100" : "text-gray-900")}>
                                                {/* Replaces {{1}} with variable values if available or keeps placeholders */}
                                                {selectedTemplate.description.split(/(\{\{\d+\}\})/).map((part, i) => {
                                                    if (part.match(/\{\{\d+\}\}/)) {
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
                                            {selectedTemplate.footerText && (
                                                <div className={cn("text-xs mt-2 opacity-60", isDarkMode ? "text-gray-300" : "text-gray-600")}>
                                                    {selectedTemplate.footerText}
                                                </div>
                                            )}

                                            {/* Preview Timestamp */}
                                            <div className={cn("text-[10px] text-right mt-1 opacity-60", isDarkMode ? "text-white" : "text-gray-500")}>
                                                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Variable Inputs */}
                                {selectedTemplate?.variableArray && selectedTemplate.variableArray.length > 0 && (
                                    <div className="mt-4 space-y-3">
                                        <label className={cn("block text-sm font-semibold", isDarkMode ? 'text-white' : 'text-slate-900')}>
                                            Template Variables
                                        </label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {selectedTemplate.variableArray.map((v: any) => (
                                                <div key={v.id || v.variable_key}>
                                                    <label className={cn("text-xs mb-1 block", isDarkMode ? 'text-white/60' : 'text-slate-500')}>
                                                        Variable {'{{' + v.variable_key + '}}'}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={variableValues[v.variable_key] || ''}
                                                        onChange={(e) => setVariableValues(prev => ({ ...prev, [v.variable_key]: e.target.value }))}
                                                        placeholder={v.sample_value ? `e.g. ${v.sample_value}` : 'Value'}
                                                        className={cn(
                                                            "w-full px-3 py-2 rounded-lg border text-sm outline-none transition-all",
                                                            isDarkMode
                                                                ? 'bg-white/5 border-white/10 text-white placeholder:text-white/30'
                                                                : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
                                                        )}
                                                    />
                                                </div>
                                            ))}
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

                            {/* Group Warning for Variables */}
                            {formData.recipient_source === 'group' && selectedTemplate?.variableArray && selectedTemplate.variableArray.length > 0 && (
                                <div className={cn(
                                    "p-4 rounded-xl border flex gap-3 items-start",
                                    isDarkMode ? "bg-orange-500/10 border-orange-500/20" : "bg-orange-50 border-orange-200"
                                )}>
                                    <AlertTriangle className="text-orange-500 shrink-0" size={18} />
                                    <div className="space-y-1">
                                        <p className="text-xs font-semibold text-orange-500">
                                            Variables Not Supported for Groups
                                        </p>
                                        <p className={cn("text-xs leading-relaxed", isDarkMode ? 'text-white/60' : 'text-slate-600')}>
                                            You selected a template with variables, but "Contact Groups" currently do not support dynamic variables. The variables you entered will be ignored. Use "Manual" or "CSV" if you need variables.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* CSV Upload */}
                            {formData.recipient_source === 'csv' && (
                                <div className="space-y-4">
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
                                        onClick={() => downloadCSVTemplate(2, formData.template_id || 'template')}
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
                            {formData.recipient_source === 'group' && (
                                <div className="space-y-4">
                                    <p className={cn("text-xs mt-1", isDarkMode ? 'text-white/40' : 'text-slate-500')}>
                                        {groups.length === 0 ? 'No groups found' : 'Choose a group to send this campaign to'}
                                    </p>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                                        {groups.map((group) => (
                                            <button
                                                key={group.group_id}
                                                onClick={() => setFormData(prev => ({ ...prev, group_id: group.group_id }))}
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
                                                    {group.members?.length || group.total_contacts || 0} contacts
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Manual Selection */}
                            {formData.recipient_source === 'manual' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className={cn("block text-sm font-semibold mb-2", isDarkMode ? 'text-white' : 'text-slate-900')}>
                                            Add Phone Numbers
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={manualPhoneInput}
                                                onChange={(e) => {
                                                    setManualPhoneInput(e.target.value.replace(/\D/g, '')); // Numbers only
                                                    setManualInputError('');
                                                }}
                                                onKeyDown={(e) => e.key === 'Enter' && handleAddManualRecipient()}
                                                placeholder="919876543210"
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
                                            Enter 12-digit number starting with country code (e.g. 91) without +
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
                    {
                        currentStep === 4 && (
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
                                                            ? (groups.find(g => g.group_id === formData.group_id)?.members?.length || groups.find(g => g.group_id === formData.group_id)?.total_contacts || 0)
                                                            : 0
                                                } contacts
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                                        <p className="text-red-500 text-sm">{error}</p>
                                    </div>
                                )}
                            </div>
                        )
                    }
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
