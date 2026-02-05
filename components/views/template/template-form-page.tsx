"use client";

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { useGenerateAiTemplateMutation } from '@/hooks/useTemplateQuery';
import { FileUpload } from '@/components/ui/file-upload';
import { useEffect } from 'react';

interface TemplateFormPageProps {
    templateId?: string;
    initialData?: Partial<TemplateFormData>;
    onBack: () => void;
    onSave: (data: any) => void;
    isViewMode?: boolean;
}

const templateSchema = z.object({
    category: z.enum(['UTILITY', 'MARKETING', 'AUTHENTICATION']),
    language: z.string().min(1, "Language is required"),
    templateName: z.string()
        .min(1, "Template name is required")
        .regex(/^[a-z0-9_]+$/, "Name can only contain lowercase alphanumeric characters and underscores"),
    templateType: z.enum(['TEXT', 'IMAGE', 'VIDEO', 'DOCUMENT']),
    headerType: z.enum(['NONE', 'TEXT', 'text', 'MEDIA', 'media', 'DOCUMENT']),
    headerValue: z.string().optional(),
    content: z.string()
        .min(1, "Template content is required")
        .max(1024, "Content exceeds 1024 characters")
        .refine(val => !val.trim().endsWith('}}'), "Body cannot end with a variable. Please add point or text after the variable."),
    previous_content: z.string().optional(),
    footer: z.string().max(60, "Footer exceeds 60 characters").optional(),
    variables: z.record(z.string(), z.string().min(1, "Sample value is required")),
    // interactiveActions: z.enum(['None', 'CTA', 'QuickReplies', 'All']),
    // ctaButtons: z.array(
    //     z.object({
    //         type: z.enum(['URL', 'PHONE', 'QUICK_REPLY']),
    //         label: z.string().min(1),
    //         value: z.string().optional()
    //     })
    // ),
    // quickReplies: z.array(z.string())
});

type FormValues = z.infer<typeof templateSchema>;

export const TemplateFormPage = ({
    templateId,
    initialData,
    onBack,
    onSave,
    isViewMode = false
}: TemplateFormPageProps) => {
    const { isDarkMode } = useTheme();

    // Get language name from code
    const getLanguageName = (code: string): string => {
        const codeMap: Record<string, string> = {
            'en': 'English',
            'hi': 'Hindi',
            'es': 'Spanish',
            'fr': 'French',
            'de': 'German'
        };
        return codeMap[code] || code; // Return original if no match (e.g. already full name or unknown)
    };

    // Normalize variables from API (array) to Form (Record)
    const normalizeVariables = (vars: any): Record<string, string> => {
        if (!vars) return {};

        // If it's already a record (not an array), return it
        if (!Array.isArray(vars) && typeof vars === 'object') return vars;

        // If it's an array, transform to Record
        if (Array.isArray(vars)) {
            const result: Record<string, string> = {};
            vars.forEach((v: any, index: number) => {
                // Try to find the key (variable name like "1", "2")
                // APIs usually return { custom_variable_name: "1", sample_value: "John" }
                // Or sometimes just ordered values.
                // We'll trust the custom_variable_name if present, else use index+1 string
                const key = v.custom_variable_name || String(index + 1);
                // The value we want to edit is the sample value
                const value = v.sample_value || v.value || '';
                result[key] = value;
            });
            return result;
        }

        return {};
    };

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        getValues,
        reset,
        control,
        formState: { errors, isSubmitting }
    } = useForm<FormValues>({
        resolver: zodResolver(templateSchema),
        defaultValues: {
            category: (initialData?.category?.toUpperCase() as TemplateCategory) || 'UTILITY',
            language: getLanguageName(initialData?.language || '') || 'English',
            templateName: initialData?.name || '',
            templateType: initialData?.type || 'TEXT',
            headerType: initialData?.headerType?.toUpperCase() as HeaderType || 'NONE',
            headerValue: initialData?.headerValue || '',
            content: initialData?.content || '',
            previous_content: initialData?.previous_content || '',
            footer: initialData?.footer || '',
            variables: normalizeVariables(initialData?.variables),
            // interactiveActions: initialData?.interactiveActions || 'None',
            // ctaButtons: initialData?.ctaButtons || [],
            // quickReplies: initialData?.quickReplies || []
        }
    });
    console.log("initialData", initialData)
    // Update form when initialData changes (e.g. when API data arrives)
    useEffect(() => {
        if (initialData) {
            const currentValues = getValues();
            // Only reset if we are switching templates or loading fresh data for the same template
            // Checking if templateId matches is tricky here as it's not in FormValues.
            // But initialData update usually means data refinement.
            reset({
                ...currentValues, // Keep current values (like UI state if any, though form state is separate)
                // Actually we should overwrite with initialData, but maybe preserve dirty if user typed?
                // For now, simpler: hard reset to fresh data to ensure we see what we edit.
                category: (initialData.category?.toUpperCase() as TemplateCategory) || 'UTILITY',
                language: getLanguageName(initialData.language || '') || 'English',
                templateName: initialData.name || '',
                templateType: initialData.type?.toUpperCase() as TemplateType || 'TEXT',
                headerType: initialData.headerType?.toUpperCase() as HeaderType || 'NONE',
                headerValue: initialData.headerValue || '',
                content: initialData.content || '',
                previous_content: initialData.previous_content || '',
                footer: initialData.footer || '',
                variables: normalizeVariables(initialData.variables),
            });
        }
    }, [initialData, reset]);

    // Watch form values for preview
    const category = watch('category');
    const language = watch('language');
    const templateName = watch('templateName');
    const templateType = watch('templateType');
    const headerType = watch('headerType');
    const headerValue = watch('headerValue');
    const content = watch('content');
    const previous_content = watch('previous_content');
    const footer = watch('footer');
    const variables = watch('variables');
    // const interactiveActions = watch('interactiveActions');
    // const ctaButtons = watch('ctaButtons');
    // const quickReplies = watch('quickReplies');
    console.log("initialData", initialData)
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

    const { mutateAsync: generateTemplate } = useGenerateAiTemplateMutation();
    const handleAIGenerate = async (prompt: string, style: MessageStyle, goal: OptimizationGoal, aiCategory: string) => {
        try {
            const payload: any = {
                prompt,
                focus: aiCategory,
                style,
                optimization: goal,
                ...(previous_content && { previous_content })
            };
            console.log("payload", payload)
            const data = await generateTemplate(payload);

            if (data?.data?.content) {
                setValue('content', data.data.content);
                toast.success('Template generated successfully!');
            } else {
                toast.error('No content generated');
            }
        } catch (error: any) {
            console.error('AI Generation error:', error);
            // toast.error(error.message || 'Failed to generate template'); 
            // Error toast is already handled in the mutation hook, but we can keep it simple or let the hook handle it.
            // The hook has onError toast. So we might not need one here unless we want specific control.
            // However, AIGeneratorSection expects a promise rejection to stop loading state? 
            // Actually AIGeneratorSection just waits for the promise. `mutateAsync` throws on error by default.
            // So if `generateTemplate` fails, it throws, we catch it here.
            // But the hook ALREADY showed a toast.
            // We can just log it here.
        }
    };
    console.log("content", content)
    const handleAIGenerateTitle = async (prompt: string) => {
        const titlePrompt = `Generate a suitable WhatsApp Template Name (internal name) based on this description: "${prompt}". 
        Format rules: Lowercase alphanumeric and underscores only. No spaces. Max 30 chars. concise.
        Example input: "Order confirmation message" -> Output: "order_confirmation"`;

        const systemPrompt = "You are a naming assistant. Output ONLY the generated name string. No explanation.";

        try {
            const generatedTitle = await callOpenAI(titlePrompt, systemPrompt);
            const cleanTitle = generatedTitle.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
            setValue('templateName', cleanTitle);
            toast.success('Template title generated successfully!');
        } catch (error) {
            toast.error('Failed to generate title');
        }
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
        // Build API payload
        const payload: any = {
            template_name: data.templateName,
            template_type: data.templateType.toLowerCase(),
            category: data.category.toLowerCase(),
            language: getLanguageCode(data.language),
            components: {
                body: {
                    text: data.content
                }
            },
            variables: Object.entries(data?.variables)?.map(([key, value]) => ({ key: key, sample: value }))
        };

        // Add header if provided
        if (data.headerType !== 'NONE' && data.headerValue) {
            const headerTypeMap: Record<string, string> = {
                'TEXT': 'text',
                'text': 'text',
                'MEDIA': 'media',
                'media': 'media',
                'DOCUMENT': 'document'
            };

            const normalizedHeaderType = data.headerType.toUpperCase();

            payload.components.header = {
                type: headerTypeMap[data.headerType] || 'text',
                [normalizedHeaderType === 'TEXT' ? 'text' : 'url']: data.headerValue
            };
        }

        // Add footer if provided
        if (data.footer && data.footer.trim()) {
            payload.components.footer = {
                text: data.footer
            };
        }

        // Add variables if any
        // if (Object.keys(data.variables).length > 0) {
        //     payload.variables = transformVariables(data.variables as Record<string, string>);
        // }

        // Call onSave with transformed payload
        onSave(payload);
        toast.success(templateId ? 'Template updated successfully!' : 'Template created successfully!');
    };

    return (
        <div className="h-full overflow-y-auto">
            <div className={cn(
                "sticky top-0 z-10 border-b backdrop-blur-xl",
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
                                {isViewMode ? 'View Template' : templateId ? 'Edit Template' : 'New Template Message'}
                            </h1>
                            <p className={cn("text-xs", isDarkMode ? 'text-white/50' : 'text-slate-500')}>
                                {templateName || 'Untitled Template'}
                            </p>
                        </div>
                    </div>
                    {!isViewMode && (
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
                    )}
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
                                    <Controller
                                        name="category"
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                isDarkMode={isDarkMode}
                                                label="Template Category"
                                                required
                                                value={field.value}
                                                onChange={field.onChange}
                                                options={categories.map(cat => ({ value: cat, label: cat }))}
                                                error={errors.category?.message}
                                                disabled={isViewMode}
                                            />
                                        )}
                                    />
                                    <p className={cn("text-[10px] mt-1 ml-1", isDarkMode ? 'text-white/40' : 'text-slate-500')}>
                                        Your template should fall under one of these categories
                                    </p>
                                </div>

                                {/* Language */}
                                <div>
                                    <Controller
                                        name="language"
                                        control={control}
                                        render={({ field }) => {
                                            console.log("field", field)
                                            return (
                                                <Select
                                                    isDarkMode={isDarkMode}
                                                    label="Template Language"
                                                    required
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    options={languages.map(lang => ({ value: lang, label: lang }))}
                                                    error={errors.language?.message}
                                                    disabled={isViewMode}
                                                />
                                            )
                                        }}
                                    />
                                    <p className={cn("text-[10px] mt-1 ml-1", isDarkMode ? 'text-white/40' : 'text-slate-500')}>
                                        You will need to specify the language in which message template is submitted
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* AI Generator */}
                        {!isViewMode && (
                            <AIGeneratorSection
                                isDarkMode={isDarkMode}
                                onGenerate={handleAIGenerate}
                                onGenerateTitle={handleAIGenerateTitle}
                                generationsLeft={3}
                            />
                        )}

                        {/* Template Name */}
                        <div>
                            <Controller
                                name="templateName"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        isDarkMode={isDarkMode}
                                        label="Template Name"
                                        required
                                        type="text"
                                        placeholder="e.g. app_verification_code"
                                        onChange={(e) => field.onChange(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'))}
                                        error={errors.templateName?.message}
                                        disabled={isViewMode}
                                    />
                                )}
                            />
                            <p className={cn("text-[10px] mt-1 ml-1", isDarkMode ? 'text-white/40' : 'text-slate-500')}>
                                Name can only be in lowercase alphanumeric characters and underscores. Special characters and white-space are not allowed
                            </p>
                        </div>

                        {/* Template Type */}
                        <div>
                            <Controller
                                name="templateType"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        isDarkMode={isDarkMode}
                                        label="Template Type"
                                        required
                                        value={field.value}
                                        onChange={field.onChange}
                                        options={templateTypes.map(type => ({ value: type, label: type }))}
                                        error={errors.templateType?.message}
                                        disabled={isViewMode}
                                    />
                                )}
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
                                    <Controller
                                        name="headerType"
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                isDarkMode={isDarkMode}
                                                label="Header Type"
                                                value={field.value}
                                                onChange={(value) => {
                                                    field.onChange(value);
                                                    setValue('headerValue', '');
                                                }}
                                                options={headerTypes.map(type => ({
                                                    value: type,
                                                    label: type === 'NONE' ? 'None' : type.charAt(0) + type.slice(1).toLowerCase()
                                                }))}
                                                error={errors.headerType?.message}
                                                disabled={isViewMode}
                                            />
                                        )}
                                    />
                                    <p className={cn("text-[10px] mt-1 ml-1", isDarkMode ? 'text-white/40' : 'text-slate-500')}>
                                        Select the type of header for your template
                                    </p>
                                </div>

                                {/* Header Value - Conditional based on type */}
                                {headerType === 'TEXT' && (
                                    <div>
                                        <Controller
                                            name="headerValue"
                                            control={control}
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    isDarkMode={isDarkMode}
                                                    label="Header Text"
                                                    type="text"
                                                    placeholder="Enter header text"
                                                    value={field.value || ''}
                                                    onChange={(e) => field.onChange(e.target.value.slice(0, 60))}
                                                    maxLength={60}
                                                    error={errors.headerValue?.message}
                                                    disabled={isViewMode}
                                                />
                                            )}
                                        />
                                        <div className="flex justify-between mt-1">
                                            <p className={cn("text-[10px] ml-1", isDarkMode ? 'text-white/40' : 'text-slate-500')}>
                                                Header text, up to 60 characters
                                            </p>
                                            <span className={cn("text-xs mr-1", isDarkMode ? 'text-white/40' : 'text-slate-500')}>
                                                {(headerValue || '').length}/60
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {headerType === 'MEDIA' && (
                                    <div>
                                        <Controller
                                            name="headerValue"
                                            control={control}
                                            render={({ field }) => (
                                                <FileUpload
                                                    isDarkMode={isDarkMode}
                                                    label="Media File"
                                                    accept="image/*,video/*"
                                                    value={field.value || ''}
                                                    onChange={(file, preview) => field.onChange(preview)}
                                                    placeholder="Upload image or video"
                                                    uploadType="image"
                                                    disabled={isViewMode}
                                                />
                                            )}
                                        />
                                        <p className={cn("text-[10px] mt-1 ml-1", isDarkMode ? 'text-white/40' : 'text-slate-500')}>
                                            Upload an image or video for the header
                                        </p>
                                    </div>
                                )}

                                {headerType === 'DOCUMENT' && (
                                    <div>
                                        <Controller
                                            name="headerValue"
                                            control={control}
                                            render={({ field }) => (
                                                <FileUpload
                                                    isDarkMode={isDarkMode}
                                                    label="Document File"
                                                    accept=".pdf,.doc,.docx,.txt"
                                                    value={field.value || ''}
                                                    onChange={(file, preview) => field.onChange(preview)}
                                                    placeholder="Upload document (PDF, DOC, etc.)"
                                                    uploadType="document"
                                                    disabled={isViewMode}
                                                />
                                            )}
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
                            <Controller
                                name="content"
                                control={control}
                                render={({ field }) => (
                                    <Textarea
                                        {...field}
                                        isDarkMode={isDarkMode}
                                        label="Template Format"
                                        required
                                        placeholder="Enter your message in here..."
                                        rows={6}
                                        maxLength={1024}
                                        showCharCount
                                        error={errors.content?.message}
                                        disabled={isViewMode}
                                    />
                                )}
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
                            variables={variables as Record<string, string>}
                            onVariablesChange={(vars) => setValue('variables', vars, { shouldValidate: !!errors.variables })}
                            variableErrors={errors.variables as any}
                            disabled={isViewMode}
                        />

                        {/* Footer */}
                        <div>
                            <Controller
                                name="footer"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        isDarkMode={isDarkMode}
                                        label="Template Footer (Optional)"
                                        type="text"
                                        placeholder="Enter footer text here"
                                        value={field.value || ''}
                                        onChange={(e) => field.onChange(e.target.value.slice(0, 60))}
                                        maxLength={60}
                                        error={errors.footer?.message}
                                        disabled={isViewMode}
                                    />
                                )}
                            />
                            <div className="flex justify-between mt-1">
                                <p className={cn("text-[10px] ml-1", isDarkMode ? 'text-white/40' : 'text-slate-500')}>
                                    Your message content. Upto 60 characters are allowed
                                </p>
                                <span className={cn("text-xs mr-1", isDarkMode ? 'text-white/40' : 'text-slate-500')}>
                                    {(footer || '').length}/60
                                </span>
                            </div>
                        </div>

                        {/* Interactive Actions */}
                        {/* <InteractiveActionsSection
                            isDarkMode={isDarkMode}
                            actionType={interactiveActions}
                            onActionTypeChange={(type) => setValue('interactiveActions', type)}
                            ctaButtons={ctaButtons}
                            onCTAButtonsChange={(buttons) => setValue('ctaButtons', buttons)}
                            quickReplies={quickReplies}
                            onQuickRepliesChange={(replies) => setValue('quickReplies', replies)}
                        /> */}
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
                        // ctaButtons={ctaButtons}
                        // quickReplies={quickReplies.filter(r => r.trim() !== '')}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
