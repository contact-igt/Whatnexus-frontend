"use client";

import { useForm } from 'react-hook-form';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    TemplateCategory,
    TemplateType,
    TemplateFormData,
    InteractiveActionType,
    CTAButton,
    MessageStyle,
    OptimizationGoal,
    HeaderType
} from './template-types';
import { validateTemplateName, generateId } from './template-utils';
import { WhatsAppPreviewPanel } from './whatsapp-preview-panel';
import { VariableInputSection } from './variable-input-section';
import { InteractiveActionsSection } from './interactive-actions-section';
import { AIGeneratorSection } from './ai-generator-section';
import { toast } from 'sonner';
import { callOpenAI } from '@/lib/openai';
import { FileUpload } from '@/components/ui/file-upload';

interface TemplateFormPageProps {
    templateId?: string;
    initialData?: Partial<TemplateFormData>;
    onBack: () => void;
    onSave: (data: any) => void;
}

interface FormValues {
    category: TemplateCategory;
    language: string;
    templateName: string;
    templateType: TemplateType;
    headerType: HeaderType;
    headerValue: string;
    content: string;
    footer: string;
    variables: Record<string, string>;
    interactiveActions: InteractiveActionType;
    ctaButtons: CTAButton[];
    quickReplies: string[];
}

export const TemplateFormPage = ({
    templateId,
    initialData,
    onBack,
    onSave
}: TemplateFormPageProps) => {
    const { isDarkMode } = useTheme();

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<FormValues>({
        defaultValues: {
            category: initialData?.category || 'UTILITY',
            language: initialData?.language || 'English',
            templateName: initialData?.name || '',
            templateType: initialData?.type || 'TEXT',
            headerType: initialData?.headerType || 'NONE',
            headerValue: initialData?.headerValue || '',
            content: initialData?.content || '',
            footer: initialData?.footer || '',
            variables: initialData?.variables || {},
            interactiveActions: initialData?.interactiveActions || 'None',
            ctaButtons: initialData?.ctaButtons || [],
            quickReplies: initialData?.quickReplies || []
        }
    });

    // Watch form values for preview
    const category = watch('category');
    const language = watch('language');
    const templateName = watch('templateName');
    const templateType = watch('templateType');
    const headerType = watch('headerType');
    const headerValue = watch('headerValue');
    const content = watch('content');
    const footer = watch('footer');
    const variables = watch('variables');
    const interactiveActions = watch('interactiveActions');
    const ctaButtons = watch('ctaButtons');
    const quickReplies = watch('quickReplies');

    const categories: TemplateCategory[] = ['UTILITY', 'MARKETING', 'AUTHENTICATION'];
    const templateTypes: TemplateType[] = ['TEXT', 'IMAGE', 'VIDEO', 'DOCUMENT'];
    const headerTypes: HeaderType[] = ['NONE', 'TEXT', 'MEDIA', 'DOCUMENT'];
    const languages = ['English', 'Hindi', 'Spanish', 'French', 'German'];
    const SYSTEM_TEMPLATE_PROMPT = `
You are a WhatsApp Business Template Generator for Meta approval.

GENERAL RULES:
- Generate ONLY Meta-approved WhatsApp message templates.
- Use professional, polite, and neutral language.
- Do NOT include emojis, symbols, or excessive formatting.
- Do NOT include URLs unless explicitly required.
- Output ONLY the template body text (no headings, no explanations).
- Keep content concise and business-appropriate.
- Use placeholders in double curly braces {{ }} only.
- Placeholders must be generic and reusable.

ALLOWED PLACEHOLDERS (use only when relevant):
{{customer_name}}, {{user_name}}, {{business_name}}, {{event_name}},
{{date}}, {{time}}, {{location}}, {{order_id}}, {{amount}}, {{otp}}

TEMPLATE CATEGORY RULES:

UTILITY:
- Purpose: transactional, informational, reminders, confirmations, alerts.
- Tone: neutral, helpful, non-promotional.
- Allowed CTAs: "View details", "Confirm", "Track order".
- Examples: appointment reminders, service updates, webinar details.

MARKETING:
- Purpose: promotions, announcements, product or service awareness.
- Tone: informative, soft promotional.
- MUST avoid urgency, pressure, discounts, or misleading claims.
- Avoid words like: "Buy now", "Limited time", "Hurry", "Free".
- Allowed CTAs: "Learn more", "View details".

AUTHENTICATION:
- Purpose: login verification, OTP, account security.
- Must include {{otp}} or verification code.
- Must mention validity duration if possible.
- No branding, offers, or extra text allowed.

CATEGORY SELECTION:
- If a category is provided, STRICTLY generate content for that category.
- If user intent conflicts with the selected category, adapt the message to fit the category safely.
- If intent is unclear, default to a GENERAL UTILITY template.

IMPORTANT:
- Ensure high likelihood of Meta approval.
- Avoid policy violations.
`;

    const handleAIGenerate = async (prompt: string, style: MessageStyle, goal: OptimizationGoal) => {
        const finalPrompt = `Selected Template Category: ${category} User request: ${prompt}`
        const generatedContent = await callOpenAI(finalPrompt, SYSTEM_TEMPLATE_PROMPT);
        setValue('content', generatedContent);
        toast.success('Template generated successfully!');
    };

    // Transform variables object to array format
    const transformVariables = (vars: Record<string, string>) => {
        return Object.entries(vars).map(([key, value]) => ({
            key: `{{${key}}}`,
            sample: value
        }));
    };

    // Get language code from language name
    const getLanguageCode = (lang: string): string => {
        const langMap: Record<string, string> = {
            'English': 'en',
            'Hindi': 'hi',
            'Spanish': 'es',
            'French': 'fr',
            'German': 'de'
        };
        return langMap[lang] || 'en';
    };

    const onSubmit = async (data: FormValues) => {
        // Validate template name
        const nameValidation = validateTemplateName(data.templateName);
        if (!nameValidation.valid) {
            toast.error(nameValidation.error || 'Invalid template name');
            return;
        }

        // Validate required content
        if (!data.content.trim()) {
            toast.error('Template content is required');
            return;
        }

        // Validate that body doesn't end with a variable
        const trimmedContent = data.content.trim();
        const endsWithVariablePattern = /\{\{\d+\}\}$/;
        if (endsWithVariablePattern.test(trimmedContent)) {
            toast.error('Body cannot end with a variable. Please add some text after the variable.');
            return;
        }

        // Build API payload
        const payload: any = {
            template_name: data.templateName,
            category: data.category.toLowerCase(),
            language: getLanguageCode(data.language),
            components: {
                body: {
                    text: data.content
                }
            }
        };

        // Add header if provided
        if (data.headerType !== 'NONE' && data.headerValue) {
            const headerTypeMap: Record<string, string> = {
                'TEXT': 'text',
                'MEDIA': 'media',
                'DOCUMENT': 'document'
            };

            payload.components.header = {
                type: headerTypeMap[data.headerType] || 'text',
                [data.headerType === 'TEXT' ? 'text' : 'url']: data.headerValue
            };
        }

        // Add footer if provided
        if (data.footer && data.footer.trim()) {
            payload.components.footer = {
                text: data.footer
            };
        }

        // Add variables if any
        if (Object.keys(data.variables).length > 0) {
            payload.variables = transformVariables(data.variables);
        }

        // Call onSave with transformed payload
        onSave(payload);
        toast.success(templateId ? 'Template updated successfully!' : 'Template created successfully!');
    };

    return (
        <div className="h-full overflow-y-auto">
            <div className={cn(
                "s`ticky top-0 z-10 border-b backdrop-blur-xl",
                isDarkMode
                    ? 'bg-slate-950/80 border-white/10'
                    : 'bg-white/80 border-slate-200'
            )}>
                <div className="max-w-[1800px] mx-auto px-10 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className={cn(
                                "p-2 rounded-lg transition-colors",
                                isDarkMode ? 'hover:bg-white/10' : 'hover:bg-slate-100'
                            )}
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className={cn("text-xl font-bold", isDarkMode ? 'text-white' : 'text-slate-900')}>
                                {templateId ? 'Edit Template' : 'New Template Message'}
                            </h1>
                            <p className={cn("text-xs", isDarkMode ? 'text-white/50' : 'text-slate-500')}>
                                {templateName || 'Untitled Template'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleSubmit(onSubmit)}
                        disabled={isSubmitting}
                        className="h-11 px-6 rounded-xl font-bold text-sm bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                <span>Saving...</span>
                            </>
                        ) : (
                            <>
                                <Save size={16} />
                                <span>Save</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="max-w-[1800px] mx-auto px-10 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Template Metadata */}
                        <div className="space-y-4">
                            <h2 className={cn("text-sm font-bold uppercase tracking-wide", isDarkMode ? 'text-white/60' : 'text-slate-600')}>
                                Template Metadata
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Category */}
                                <div>
                                    <Select
                                        isDarkMode={isDarkMode}
                                        label="Template Category"
                                        required
                                        value={category}
                                        onChange={(value) => setValue('category', value as TemplateCategory)}
                                        options={categories.map(cat => ({ value: cat, label: cat }))}
                                    />
                                    <p className={cn("text-[10px] mt-1 ml-1", isDarkMode ? 'text-white/40' : 'text-slate-500')}>
                                        Your template should fall under one of these categories
                                    </p>
                                </div>

                                {/* Language */}
                                <div>
                                    <Select
                                        isDarkMode={isDarkMode}
                                        label="Template Language"
                                        required
                                        value={language}
                                        onChange={(value) => setValue('language', value)}
                                        options={languages.map(lang => ({ value: lang, label: lang }))}
                                    />
                                    <p className={cn("text-[10px] mt-1 ml-1", isDarkMode ? 'text-white/40' : 'text-slate-500')}>
                                        You will need to specify the language in which message template is submitted
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* AI Generator */}
                        <AIGeneratorSection
                            isDarkMode={isDarkMode}
                            onGenerate={handleAIGenerate}
                            generationsLeft={3}
                        />

                        {/* Template Name */}
                        <div>
                            <Input
                                isDarkMode={isDarkMode}
                                label="Template Name"
                                required
                                type="text"
                                value={templateName}
                                onChange={(e) => setValue('templateName', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'))}
                                placeholder="e.g. app_verification_code"
                                error={errors.templateName?.message}
                            />
                            <p className={cn("text-[10px] mt-1 ml-1", isDarkMode ? 'text-white/40' : 'text-slate-500')}>
                                Name can only be in lowercase alphanumeric characters and underscores. Special characters and white-space are not allowed
                            </p>
                        </div>

                        {/* Template Type */}
                        <div>
                            <Select
                                isDarkMode={isDarkMode}
                                label="Template Type"
                                required
                                value={templateType}
                                onChange={(value) => setValue('templateType', value as TemplateType)}
                                options={templateTypes.map(type => ({ value: type, label: type }))}
                            />
                            <p className={cn("text-[10px] mt-1 ml-1", isDarkMode ? 'text-white/40' : 'text-slate-500')}>
                                Your template type should fall under one of these categories
                            </p>
                        </div>

                        {/* Template Header Section */}
                        <div className="space-y-4">
                            <h2 className={cn("text-xs font-bold tracking-wide", isDarkMode ? 'text-white/60' : 'text-slate-600')}>
                                Template Header (Optional)
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Header Type */}
                                <div>
                                    <Select
                                        isDarkMode={isDarkMode}
                                        label="Header Type"
                                        value={headerType}
                                        onChange={(value) => {
                                            setValue('headerType', value as HeaderType);
                                            if (value === 'NONE') setValue('headerValue', '');
                                        }}
                                        options={headerTypes.map(type => ({
                                            value: type,
                                            label: type === 'NONE' ? 'None' : type.charAt(0) + type.slice(1).toLowerCase()
                                        }))}
                                    />
                                    <p className={cn("text-[10px] mt-1 ml-1", isDarkMode ? 'text-white/40' : 'text-slate-500')}>
                                        Select the type of header for your template
                                    </p>
                                </div>

                                {/* Header Value - Conditional based on type */}
                                {headerType === 'TEXT' && (
                                    <div>
                                        <Input
                                            isDarkMode={isDarkMode}
                                            label="Header Text"
                                            type="text"
                                            value={headerValue}
                                            onChange={(e) => setValue('headerValue', e.target.value.slice(0, 60))}
                                            placeholder="Enter header text"
                                            maxLength={60}
                                        />
                                        <div className="flex justify-between mt-1">
                                            <p className={cn("text-[10px] ml-1", isDarkMode ? 'text-white/40' : 'text-slate-500')}>
                                                Header text, up to 60 characters
                                            </p>
                                            <span className={cn("text-xs mr-1", isDarkMode ? 'text-white/40' : 'text-slate-500')}>
                                                {headerValue.length}/60
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {headerType === 'MEDIA' && (
                                    <div>
                                        <FileUpload
                                            isDarkMode={isDarkMode}
                                            label="Media File"
                                            accept="image/*,video/*"
                                            value={headerValue}
                                            onChange={(file, preview) => setValue('headerValue', preview)}
                                            placeholder="Upload image or video"
                                            uploadType="image"
                                        />
                                        <p className={cn("text-[10px] mt-1 ml-1", isDarkMode ? 'text-white/40' : 'text-slate-500')}>
                                            Upload an image or video for the header
                                        </p>
                                    </div>
                                )}

                                {headerType === 'DOCUMENT' && (
                                    <div>
                                        <FileUpload
                                            isDarkMode={isDarkMode}
                                            label="Document File"
                                            accept=".pdf,.doc,.docx,.txt"
                                            value={headerValue}
                                            onChange={(file, preview) => setValue('headerValue', preview)}
                                            placeholder="Upload document (PDF, DOC, etc.)"
                                            uploadType="document"
                                        />
                                        <p className={cn("text-[10px] mt-1 ml-1", isDarkMode ? 'text-white/40' : 'text-slate-500')}>
                                            Upload a document file for the header
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Template Content */}
                        <div>
                            <Textarea
                                isDarkMode={isDarkMode}
                                label="Template Format"
                                required
                                value={content}
                                onChange={(e) => setValue('content', e.target.value)}
                                placeholder="Enter your message in here..."
                                rows={6}
                                maxLength={1024}
                                showCharCount
                                error={errors.content?.message}
                            />
                            <p className={cn("text-[10px] mt-1 ml-1", isDarkMode ? 'text-white/40' : 'text-slate-500')}>
                                Use text formatting: *bold*, _italic_, ~strikethrough~<br />
                                Your message content. Upto 1024 characters are allowed.<br />
                                e.g. Hello {`{{1}}`}, your code will expire in {`{{2}}`} mins.
                            </p>
                        </div>

                        {/* Variables */}
                        <VariableInputSection
                            isDarkMode={isDarkMode}
                            content={content}
                            variables={variables}
                            onVariablesChange={(vars) => setValue('variables', vars)}
                        />

                        {/* Footer */}
                        <div>
                            <Input
                                isDarkMode={isDarkMode}
                                label="Template Footer (Optional)"
                                type="text"
                                value={footer}
                                onChange={(e) => setValue('footer', e.target.value.slice(0, 60))}
                                placeholder="Enter footer text here"
                                maxLength={60}
                            />
                            <div className="flex justify-between mt-1">
                                <p className={cn("text-[10px] ml-1", isDarkMode ? 'text-white/40' : 'text-slate-500')}>
                                    Your message content. Upto 60 characters are allowed
                                </p>
                                <span className={cn("text-xs mr-1", isDarkMode ? 'text-white/40' : 'text-slate-500')}>
                                    {footer.length}/60
                                </span>
                            </div>
                        </div>

                        {/* Interactive Actions */}
                        <InteractiveActionsSection
                            isDarkMode={isDarkMode}
                            actionType={interactiveActions}
                            onActionTypeChange={(type) => setValue('interactiveActions', type)}
                            ctaButtons={ctaButtons}
                            onCTAButtonsChange={(buttons) => setValue('ctaButtons', buttons)}
                            quickReplies={quickReplies}
                            onQuickRepliesChange={(replies) => setValue('quickReplies', replies)}
                        />
                    </div>

                    {/* Right Column - Preview */}
                    <div className="lg:col-span-1">
                        <WhatsAppPreviewPanel
                            isDarkMode={isDarkMode}
                            templateType={templateType}
                            headerType={headerType}
                            headerValue={headerValue}
                            content={content}
                            footer={footer}
                            variables={variables}
                            ctaButtons={ctaButtons}
                            quickReplies={quickReplies.filter(r => r.trim() !== '')}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
