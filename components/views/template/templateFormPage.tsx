"use client";
import { useState, useEffect, useRef } from 'react';
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
} from './templateTypes';
import { validateTemplateName, generateId } from './templateUtils';
import { WhatsAppPreviewPanel } from './whatsappPreviewPanel';
import { VariableInputSection } from './variableInputSection';
import { InteractiveActionsSection } from './interactiveActionsSection';
import { AIGeneratorSection } from './aiGeneratorSection';
import { toast } from 'sonner';
import { callOpenAI } from '@/lib/openai';
import { useGenerateAiTemplateMutation, useUploadTemplateMediaMutation } from '@/hooks/useTemplateQuery';
import { FileUpload } from '@/components/ui/fileUpload';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { setUploadedMedia, setUploading, clearUploadedMedia } from '@/redux/slices/template/templateSlice';
import { CarouselCardEditor } from './carouselCardEditor';
import { CarouselCard } from './templateTypes';

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
    templateType: z.enum(['TEXT', 'IMAGE', 'VIDEO', 'DOCUMENT', 'LOCATION', 'CAROUSEL']),
    headerType: z.enum(['NONE', 'TEXT', 'IMAGE', 'VIDEO', 'DOCUMENT', 'LOCATION']),
    headerValue: z.string().optional(),
    content: z.string()
        .min(1, "Template content is required")
        .max(1024, "Content exceeds 1024 characters"),
    previous_content: z.string().optional(),
    footer: z.string().max(60, "Footer exceeds 60 characters").optional(),
    variables: z.record(z.string(), z.string().min(1, "Sample value is required")),
    interactiveActions: z.enum(['None', 'CTA', 'QuickReplies', 'Marketing', 'Authentication', 'All']),
    ctaButtons: z.array(
        z.object({
            id: z.string(),
            type: z.enum(['URL', 'PHONE', 'COPY_CODE', 'CATALOG', 'MPM']),
            label: z.string().min(1, "Label is required").max(25, "Label too long"),
            value: z.string().min(1, "Value is required")
        }).superRefine((data, ctx) => {
            if (data.type === 'PHONE') {
                const parts = data.value.trim().split(/\s+/);
                const cc = parts[0] || '';
                const num = parts.slice(1).join('');

                if (!cc.startsWith('+')) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "Country code must start with + (e.g. +91)",
                        path: ['value']
                    });
                } else if (!/^\+[1-9]\d{0,3}$/.test(cc)) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "Invalid country code",
                        path: ['value']
                    });
                } else if (!num) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "Phone number is required",
                        path: ['value']
                    });
                } else if (!/^\d{10,14}$/.test(num)) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "Phone number must be between 10 and 14 digits",
                        path: ['value']
                    });
                }
            }
            if (data.type === 'URL') {
                if (!/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(data.value)) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "Invalid URL format",
                        path: ['value']
                    });
                }
            }
        })
    ),
    quickReplies: z.array(z.string().max(25)),
    carouselMediaType: z.enum(['IMAGE', 'VIDEO']),
    carouselCards: z.array(z.object({
        id: z.string(),
        mediaType: z.enum(['IMAGE', 'VIDEO']),
        mediaUrl: z.string(),
        bodyText: z.string().max(160, "Card body text too long"),
        buttons: z.array(z.any())
    })).min(2, "At least 2 cards are required for a carousel template")
}).superRefine((data, ctx) => {
    // Utility Category Validation - No Marketing Language
    if (data.category === 'UTILITY') {
        const marketingKeywords = ['offer', 'discount', 'sale', 'buy', 'promo', 'free', 'limited', 'hurry', 'deal', 'shop', 'save', 'win', 'prize', 'get it now', 'order now'];
        const contentLower = data.content.toLowerCase();
        const foundKeywords = marketingKeywords.filter(word => contentLower.includes(word));

        if (foundKeywords.length > 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Utility templates cannot contain marketing language (found: ${foundKeywords.slice(0, 3).join(', ')}). Please change category to MARKETING or remove promotional text.`,
                path: ['content']
            });
        }
    }

    // Authentication Category Validation - Must have variables
    if (data.category === 'AUTHENTICATION' && !data.content.includes('{{')) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Authentication templates must contain at least one variable (e.g., {{1}}) for the verification code.",
            path: ['content']
        });
    }

    // Body cannot end with a variable
    if (data.content.trim().endsWith('}}')) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Body cannot end with a variable. Please add a period or closing text after the variable.",
            path: ['content']
        });
    }

    // Media Header Validation
    if (['IMAGE', 'VIDEO', 'DOCUMENT'].includes(data.templateType) && !data.headerValue) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Please upload a ${data.templateType.toLowerCase()} file for the header.`,
            path: ['headerValue']
        });
    }
});

type FormValues = z.infer<typeof templateSchema>;

export const TemplateFormPage: React.FC<TemplateFormPageProps> = ({
    templateId,
    initialData,
    onBack,
    onSave,
    isViewMode = false
}): JSX.Element => {
    const { isDarkMode } = useTheme();
    const dispatch = useDispatch();
    const lastInitialDataNameRef = useRef<string | null | undefined>(null);

    // Disable category for all existing templates — once created, category should not change.
    // Meta enforces this for approved templates; we enforce it consistently for all statuses EXCEPT draft.
    const isExistingTemplate = !!templateId && initialData?.status !== 'draft';
    const isDraft = initialData?.status === 'draft';

    const uploadedMediaUrl = useSelector((state: RootState) => state.template.uploadedMediaUrl);
    const uploadedMediaType = useSelector((state: RootState) => state.template.uploadedMediaType);
    const isMediaUploading = useSelector((state: RootState) => state.template.isUploading);
    const { mutateAsync: uploadMedia } = useUploadTemplateMediaMutation();
    const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

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
                // Backend uses variable_key
                const key = v.variable_key || v.custom_variable_name || String(index + 1);
                // Backend uses sample_value
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
        trigger,
        formState: { errors, isSubmitting }
    } = useForm<FormValues>({
        resolver: zodResolver(templateSchema) as any,
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
            interactiveActions: initialData?.interactiveActions || 'None',
            ctaButtons: (initialData?.ctaButtons || []).map(b => ({ ...b, value: b.value || '' })),
            quickReplies: initialData?.quickReplies || [],
            carouselMediaType: (initialData?.carouselMediaType as any) || 'IMAGE',
            carouselCards: initialData?.carouselCards || [
                { id: 'card-1', mediaType: 'IMAGE' as const, mediaUrl: '', bodyText: '', buttons: [] },
                { id: 'card-2', mediaType: 'IMAGE' as const, mediaUrl: '', bodyText: '', buttons: [] },
            ]
        }
    });
    console.log("initialData", initialData)    // Update form when initialData changes (seed the form for editing)
    useEffect(() => {
        if (initialData) {
            // Only reset if this is the first load of this specific template name
            // (prevents re-resetting during active editing if initialData reference changes)
            if (lastInitialDataNameRef.current !== initialData.name) {
                reset({
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
                    interactiveActions: initialData.interactiveActions || 'None',
                    ctaButtons: (initialData.ctaButtons || []).map(b => ({ ...b, value: b.value || '' })),
                    quickReplies: initialData.quickReplies || [],
                    carouselMediaType: (initialData.carouselMediaType as any) || 'IMAGE',
                    carouselCards: initialData.carouselCards || [
                        { id: 'card-1', mediaType: 'IMAGE' as const, mediaUrl: '', bodyText: '', buttons: [] },
                        { id: 'card-2', mediaType: 'IMAGE' as const, mediaUrl: '', bodyText: '', buttons: [] },
                    ]
                });

                if (initialData.headerValue && ['IMAGE', 'VIDEO', 'DOCUMENT'].includes(initialData.headerType || '')) {
                    dispatch(setUploadedMedia({
                        url: initialData.headerValue,
                        type: (initialData.headerType as string).toLowerCase() as any
                    }));
                }

                lastInitialDataNameRef.current = initialData.name;
            }
        } else if (uploadedMediaUrl) {
            // New template creation: Pull from Redux if form field is empty
            const currentHeaderValue = getValues('headerValue');
            if (!currentHeaderValue) {
                setValue('headerValue', uploadedMediaUrl);
                if (uploadedMediaType) {
                    setValue('headerType', uploadedMediaType.toUpperCase() as any);
                    setValue('templateType', uploadedMediaType.toUpperCase() as any);
                }
            }
        }
    }, [initialData, reset, getValues, dispatch, uploadedMediaUrl, uploadedMediaType, setValue]);

    // Cleanup uploaded media when unmounting or changing template type
    useEffect(() => {
        return () => {
            dispatch(clearUploadedMedia());
        };
    }, [dispatch]);

    // Auto-scroll to first validation error
    useEffect(() => {
        const errorKeys = Object.keys(errors);
        if (errorKeys.length > 0) {
            const firstErrorKey = errorKeys[0];

            // Try to find the element by name or ID
            // React Hook Form fields use 'name'. Containers use custom ID.
            const element = document.getElementsByName(firstErrorKey)[0] ||
                document.getElementById(firstErrorKey) ||
                document.getElementById(`field-section-${firstErrorKey}`);

            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else if (firstErrorKey === 'ctaButtons' || firstErrorKey === 'quickReplies') {
                const section = document.getElementById('interactive-actions-section');
                if (section) section.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [errors]);

    // Watch form values for preview
    const category = watch('category');
    const templateName = watch('templateName');
    const templateType = watch('templateType');
    const headerType = watch('headerType');
    const headerValue = watch('headerValue');
    const content = watch('content');
    const previous_content = watch('previous_content');
    const footer = watch('footer');
    const variables = watch('variables');
    const interactiveActions = watch('interactiveActions');
    const ctaButtons = watch('ctaButtons');
    const quickReplies = watch('quickReplies');
    const carouselCards = watch('carouselCards') || [];
    const carouselMediaType = watch('carouselMediaType');

    // Authentication mode — lock the form when AUTHENTICATION category is chosen
    const isAuthMode = category === 'AUTHENTICATION';
    const AUTH_BODY_TEXT = '{{1}} is your verification code. For your security, do not share this code.';
    const AUTH_FOOTER_TEXT = 'This code expires in 10 minutes.';

    // Auto-configure form when switching to AUTHENTICATION category
    useEffect(() => {
        if (isAuthMode) {
            setValue('templateType', 'TEXT');
            setValue('headerType', 'NONE');
            setValue('interactiveActions', 'Authentication');
            if (!content || content === AUTH_BODY_TEXT.slice(0, 5)) {
                setValue('content', AUTH_BODY_TEXT);
            }
            setValue('footer', AUTH_FOOTER_TEXT);
            setValue('variables', { '1': '123456' });
            dispatch(clearUploadedMedia());
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthMode]);

    // Handle Category -> TemplateType compatibility
    useEffect(() => {
        const cat = String(category).toUpperCase();
        const currentType = getValues('templateType');

        // Carousel is ONLY for marketing
        if (currentType === 'CAROUSEL' && cat !== 'MARKETING') {
            setValue('templateType', 'TEXT');
            setValue('headerType', 'NONE');
            toast.info(`Carousel templates are only supported in MARKETING category. Switched to TEXT.`);
        }

        // Authentication only allows TEXT
        if (cat === 'AUTHENTICATION' && currentType !== 'TEXT') {
            setValue('templateType', 'TEXT');
            setValue('headerType', 'NONE');
        }
    }, [category, setValue, getValues]);

    const categories: TemplateCategory[] = ['UTILITY', 'MARKETING', 'AUTHENTICATION'];
    const templateTypes: TemplateType[] = ['TEXT', 'IMAGE', 'VIDEO', 'DOCUMENT', 'LOCATION', 'CAROUSEL'];
    const languages = ['English', 'Hindi', 'Spanish', 'French', 'German'];

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
        // ─────────────────────────────────────────
        // AUTHENTICATION templates: fixed Meta-required structure
        // ─────────────────────────────────────────
        if (data.category === 'AUTHENTICATION') {
            const authPayload: any = {
                template_name: data.templateName,
                template_type: 'text',
                category: 'authentication',
                language: getLanguageCode(data.language),
                components: {
                    body: { text: data.content || AUTH_BODY_TEXT },
                    footer: { text: AUTH_FOOTER_TEXT },
                },
                variables: [{ key: '1', sample: '123456' }],
            };
            onSave(authPayload);
            return;
        }

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
            variables: Object.entries(data?.variables || {})?.map(([key, value]) => ({ key: key, sample: value }))
        };

        // Carousel - build Meta-format carousel payload
        if (data.templateType === 'CAROUSEL') {
            const cardsPayload = data.carouselCards?.map(card => {
                const headerComp = {
                    type: 'HEADER',
                    format: data.carouselMediaType || 'IMAGE',
                    media_url: card.mediaUrl,
                    example: { header_handle: [card.mediaUrl || ''] }
                };

                const bodyComp = { type: 'BODY', text: card.bodyText };

                const cardComponents: any[] = [headerComp, bodyComp];

                // Add shared/common buttons to every card
                if (data.ctaButtons && data.ctaButtons.length > 0) {
                    cardComponents.push({
                        type: 'BUTTONS',
                        buttons: data.ctaButtons.map(b => ({
                            type: b.type === 'PHONE' ? 'PHONE_NUMBER' : b.type as any,
                            text: b.label,
                            url: b.type === 'URL' ? b.value : undefined,
                            phone_number: b.type === 'PHONE' ? b.value : undefined,
                            example: b.type === 'COPY_CODE' ? [b.value] : undefined
                        }))
                    });
                }

                return { components: cardComponents };
            });

            payload.components.carousel = { cards: cardsPayload };
            // Carousel is always MARKETING
            payload.category = 'marketing';

            onSave(payload);
            dispatch(clearUploadedMedia());
            return;
        }

        // Add header if provided or if the selected template type inherently requires a header
        // Since we force headerType to equal templateType (or NONE), we can just use templateType directly
        // Use data.headerValue as the single source for the header content (text or media URL)
        const finalHeaderValue = data.headerValue || '';

        if (data.headerType !== 'NONE' && (finalHeaderValue || data.templateType !== 'TEXT')) {
            const headerTypeMap: Record<string, string> = {
                'TEXT': 'text',
                'IMAGE': 'image',
                'VIDEO': 'video',
                'DOCUMENT': 'document',
                'LOCATION': 'location'
            };

            const typeToUse = (data.headerType as string) === 'NONE' ? data.templateType : (data.headerType as string);
            const normalizedHeaderType = typeToUse.toUpperCase();

            // Set text if TEXT or LOCATION, else media_url for media links
            const valueKey = (normalizedHeaderType === 'TEXT' || normalizedHeaderType === 'LOCATION') ? 'text' : 'media_url';

            payload.components.header = {
                type: 'HEADER',
                format: normalizedHeaderType,
                // Meta requires text for LOCATION title, using default 'Location' to satisfy API
                ...(normalizedHeaderType === 'LOCATION' ? { text: 'Location' } : { [valueKey]: finalHeaderValue })
            };

            // Meta usually expects header variables if it's dynamic.
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

        // Add buttons
        if (data.interactiveActions !== 'None') {
            const buttons: any[] = [];

            if (data.interactiveActions === 'CTA' || data.interactiveActions === 'All') {
                data.ctaButtons.forEach(btn => {
                    buttons.push({
                        type: btn.type === 'PHONE' ? 'PHONE_NUMBER' : btn.type,
                        text: btn.label,
                        value: btn.value
                    });
                });
            }

            if (data.interactiveActions === 'QuickReplies' || data.interactiveActions === 'All') {
                data.quickReplies.filter(r => r.trim() !== '').forEach(reply => {
                    buttons.push({
                        type: 'QUICK_REPLY',
                        text: reply
                    });
                });
            }

            if (buttons.length > 0) {
                payload.components.buttons = buttons;
            }
        }

        // Call onSave with transformed payload
        onSave(payload);

        // Clean up redux state after successful creation/update
        dispatch(clearUploadedMedia());
    };

    const handleFileUpload = async (file: File, type: 'image' | 'video' | 'document', onChange: (...event: any[]) => void) => {
        try {
            dispatch(setUploading(true));
            setUploadedFileName(file.name); // Store local filename for display
            const response = await uploadMedia({ file, type });
            if (response?.url) {
                dispatch(setUploadedMedia({ url: response.url, type }));
                onChange(response.url); // update form state
                toast.success(`${type} uploaded successfully`);
            }
        } catch (error) {
            console.error('Upload failed:', error);
            dispatch(setUploading(false));
        }
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
                            onClick={handleSubmit(onSubmit as any)}
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
                                                disabled={isViewMode || isExistingTemplate} // Category cannot be changed after creation
                                            />
                                        )}
                                    />
                                    {isExistingTemplate ? (
                                        <p className={cn("text-[10px] mt-1 ml-1 font-semibold", isDarkMode ? 'text-amber-400/80' : 'text-amber-600')}>
                                            ⚠️ Category cannot be changed once a template is submitted to Meta
                                        </p>
                                    ) : (
                                        <p className={cn("text-[10px] mt-1 ml-1", isDarkMode ? 'text-white/40' : 'text-slate-500')}>
                                            {isDraft ? 'You can update the category since this is still a draft' : 'Your template should fall under one of these categories'}
                                        </p>
                                    )}
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
                                                    disabled={isViewMode || isExistingTemplate} // Language cannot be changed for submitted templates
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
                        {!isViewMode && category !== 'AUTHENTICATION' && (
                            <AIGeneratorSection
                                isDarkMode={isDarkMode}
                                onGenerate={handleAIGenerate}
                                onGenerateTitle={handleAIGenerateTitle}
                                generationsLeft={3}
                                currentCategory={category}
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
                                        disabled={isViewMode || (isExistingTemplate && !isDraft) || (!!templateId && !isDraft)} // Name cannot be changed for submitted templates
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
                                        onChange={(val) => {
                                            field.onChange(val);
                                            setValue('headerValue', '');
                                            dispatch(clearUploadedMedia());
                                            if (val === 'TEXT') {
                                                setValue('headerType', 'NONE');
                                            } else if (val === 'CAROUSEL') {
                                                setValue('headerType', 'NONE'); // Carousel doesn't use standard template header component
                                            } else {
                                                setValue('headerType', val as HeaderType);
                                            }
                                        }}
                                        options={[
                                            { value: 'TEXT', label: 'Text' },
                                            { value: 'IMAGE', label: 'Image' },
                                            { value: 'VIDEO', label: 'Video' },
                                            { value: 'DOCUMENT', label: 'Document' },
                                            { value: 'LOCATION', label: 'Location' },
                                            { value: 'CAROUSEL', label: 'Carousel' }
                                        ].filter(opt => {
                                            const cat = String(category).toUpperCase();
                                            const currentType = getValues('templateType');
                                            // Always show current type to avoid disappearing selection
                                            if (opt.value === currentType) return true;
                                            if (cat === 'AUTHENTICATION') return opt.value === 'TEXT';
                                            if (cat === 'UTILITY') return opt.value !== 'CAROUSEL';
                                            return true; // MARKETING shows all
                                        })}
                                        error={errors.templateType?.message}
                                        disabled={isViewMode || isExistingTemplate || isAuthMode}
                                    />
                                )}
                            />
                            {category === 'UTILITY' && (
                                <p className={cn("text-[10px] mt-1 ml-1 text-amber-500 font-medium")}>
                                    Note: Carousel templates are only supported in the MARKETING category.
                                </p>
                            )}
                            <p className={cn("text-[10px] mt-1 ml-1", isDarkMode ? 'text-white/40' : 'text-slate-500')}>
                                Your template type should fall under one of these categories.
                                {templateType === 'CAROUSEL' && (
                                    <span className="ml-1 text-amber-500 font-semibold">Carousel templates must use MARKETING category.</span>
                                )}
                            </p>
                        </div>

                        {/* Authentication Mode Banner */}
                        {isAuthMode && (
                            <div className={cn(
                                "rounded-2xl p-5 border flex gap-4 items-start",
                                isDarkMode
                                    ? 'bg-violet-500/10 border-violet-500/30'
                                    : 'bg-violet-50 border-violet-200'
                            )}>
                                <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center shrink-0 text-xl">
                                    🔐
                                </div>
                                <div className="space-y-1.5">
                                    <p className={cn("text-sm font-bold", isDarkMode ? 'text-violet-300' : 'text-violet-800')}>
                                        Authentication Template — Managed by Meta
                                    </p>
                                    <p className={cn("text-xs leading-relaxed", isDarkMode ? 'text-violet-300/70' : 'text-violet-700')}>
                                        This template will be used to send OTP verification codes.<br />
                                        Meta enforces a fixed structure: a body with <code className="bg-violet-200/40 px-1 rounded">{`{{1}}`}</code> = the OTP code,
                                        a security footer, and a <strong>Copy Code</strong> button.
                                    </p>
                                    <ul className={cn("text-xs mt-1 space-y-0.5", isDarkMode ? 'text-violet-300/60' : 'text-violet-600')}>
                                        <li>✓ Body is auto-filled with Meta's required OTP text</li>
                                        <li>✓ Footer: "This code expires in 10 minutes." (fixed)</li>
                                        <li>✓ Button: Copy Code (OTP) — auto-added by Meta</li>
                                        <li>✓ OTP is generated automatically per recipient when sending</li>
                                    </ul>
                                </div>
                            </div>
                        )}

                        {/* CAROUSEL Card Editor */}
                        {templateType === 'CAROUSEL' && (
                            <div className={cn(
                                "rounded-2xl p-5 border space-y-4",
                                isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'
                            )}>
                                <div className="flex items-center gap-2">
                                    <h2 className={cn("text-sm font-bold", isDarkMode ? 'text-white' : 'text-slate-900')}>
                                        Carousel Cards
                                    </h2>
                                    <span className={cn(
                                        "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                                        isDarkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                                    )}>Min 2 · Max 10</span>
                                </div>
                                <p className={cn("text-xs mb-2", isDarkMode ? 'text-white/50' : 'text-slate-500')}>
                                    Carousel templates consist of 2 to 10 cards. All cards must share the same media format (Image or Video).
                                </p>

                                <CarouselCardEditor
                                    isDarkMode={isDarkMode}
                                    cards={carouselCards}
                                    setCards={(cards) => setValue('carouselCards', cards)}
                                    isViewMode={isViewMode}
                                />
                                {errors.carouselCards && (
                                    <p className="text-xs text-red-500 mt-2 font-medium">
                                        {errors.carouselCards.message}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Template Header Section */}
                        <div id="field-section-headerType" className="space-y-4">
                            {templateType === 'TEXT' && (
                                <div>
                                    <h2 className={cn("text-xs font-bold tracking-wide mb-4", isDarkMode ? 'text-white/60' : 'text-slate-600')}>
                                        Template Header (Optional)
                                    </h2>
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
                                                onChange={(e) => {
                                                    field.onChange(e.target.value.slice(0, 60));
                                                    setValue('headerType', e.target.value ? 'TEXT' : 'NONE');
                                                }}
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

                            {templateType === 'IMAGE' && (
                                <div className="w-full">
                                    <h2 className={cn("text-xs font-bold tracking-wide mb-4", isDarkMode ? 'text-white/60' : 'text-slate-600')}>
                                        Image Upload
                                    </h2>
                                    <div className="w-2/5">
                                        <Controller
                                            name="headerValue"
                                            control={control}
                                            render={({ field }) => (
                                                <FileUpload
                                                    isDarkMode={isDarkMode}
                                                    label="Image File"
                                                    accept="image/*"
                                                    uploadedUrl={field.value || ''}
                                                    isUploading={isMediaUploading}
                                                    onFileSelected={(file) => {
                                                        setValue('headerType', 'IMAGE');
                                                        handleFileUpload(file, 'image', field.onChange);
                                                    }}
                                                    onRemove={() => {
                                                        field.onChange('');
                                                        dispatch(clearUploadedMedia());
                                                    }}
                                                    placeholder="Click to upload or drag and drop"
                                                    uploadType="image"
                                                    disabled={isViewMode}
                                                    fileName={uploadedFileName}
                                                    compact
                                                />
                                            )}
                                        />
                                        <p className={cn("text-[10px] mt-1 ml-1", isDarkMode ? 'text-white/40' : 'text-slate-500')}>
                                            Upload an image for the header
                                        </p>
                                        {errors.headerValue && (
                                            <p className="text-red-500 text-[10px] mt-1 ml-1 font-semibold">{errors.headerValue.message}</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {templateType === 'VIDEO' && (
                                <div className="w-full">
                                    <h2 className={cn("text-xs font-bold tracking-wide mb-4", isDarkMode ? 'text-white/60' : 'text-slate-600')}>
                                        Video Upload
                                    </h2>
                                    <div className="w-2/5">
                                        <Controller
                                            name="headerValue"
                                            control={control}
                                            render={({ field }) => (
                                                <FileUpload
                                                    isDarkMode={isDarkMode}
                                                    label="Video File"
                                                    accept="video/*"
                                                    uploadedUrl={field.value || ''}
                                                    isUploading={isMediaUploading}
                                                    onFileSelected={(file) => {
                                                        setValue('headerType', 'VIDEO');
                                                        handleFileUpload(file, 'video', field.onChange);
                                                    }}
                                                    onRemove={() => {
                                                        field.onChange('');
                                                        dispatch(clearUploadedMedia());
                                                    }}
                                                    placeholder="Click to upload or drag and drop"
                                                    uploadType="video"
                                                    disabled={isViewMode}
                                                    fileName={uploadedFileName}
                                                    compact
                                                />
                                            )}
                                        />
                                        <p className={cn("text-[10px] mt-1 ml-1", isDarkMode ? 'text-white/40' : 'text-slate-500')}>
                                            Upload a video for the header
                                        </p>
                                        {errors.headerValue && (
                                            <p className="text-red-500 text-[10px] mt-1 ml-1 font-semibold">{errors.headerValue.message}</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {templateType === 'DOCUMENT' && (
                                <div className="w-full">
                                    <h2 className={cn("text-xs font-bold tracking-wide mb-4", isDarkMode ? 'text-white/60' : 'text-slate-600')}>
                                        Document Upload
                                    </h2>
                                    <div className="w-2/5">
                                        <Controller
                                            name="headerValue"
                                            control={control}
                                            render={({ field }) => (
                                                <FileUpload
                                                    isDarkMode={isDarkMode}
                                                    label="Document File"
                                                    accept=".pdf,.doc,.docx"
                                                    uploadedUrl={field.value || ''}
                                                    isUploading={isMediaUploading}
                                                    onFileSelected={(file) => {
                                                        setValue('headerType', 'DOCUMENT');
                                                        handleFileUpload(file, 'document', field.onChange);
                                                    }}
                                                    onRemove={() => {
                                                        field.onChange('');
                                                        dispatch(clearUploadedMedia());
                                                    }}
                                                    placeholder="Click to upload or drag and drop"
                                                    uploadType="document"
                                                    disabled={isViewMode}
                                                    fileName={uploadedFileName}
                                                    compact
                                                />
                                            )}
                                        />
                                        <p className={cn("text-[10px] mt-1 ml-1", isDarkMode ? 'text-white/40' : 'text-slate-500')}>
                                            Upload a document for the header
                                        </p>
                                        {errors.headerValue && (
                                            <p className="text-red-500 text-[10px] mt-1 ml-1 font-semibold">{errors.headerValue.message}</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {templateType === 'LOCATION' && (
                                <div className="w-full">
                                    <h2 className={cn("text-xs font-bold tracking-wide mb-4", isDarkMode ? 'text-white/60' : 'text-slate-600')}>
                                        Location Header
                                    </h2>
                                    <div className={cn(
                                        "p-4 rounded-xl border border-dashed flex flex-col items-center justify-center gap-3",
                                        isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
                                    )}>
                                        <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                                        </div>
                                        <div className="text-center">
                                            <p className={cn("text-sm font-semibold", isDarkMode ? "text-white" : "text-slate-900")}>
                                                Dynamic Location Header Enabled
                                            </p>
                                            <p className={cn("text-xs mt-1", isDarkMode ? "text-white/40" : "text-slate-500")}>
                                                Coordinates and address will be provided when starting a campaign.
                                            </p>
                                        </div>
                                    </div>
                                    <input type="hidden" value="LOCATION" {...register('headerValue')} />
                                </div>
                            )}


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
                                        disabled={isViewMode || isAuthMode}
                                    />
                                )}
                            />
                            {isAuthMode ? (
                                <p className={cn("text-[10px] mt-1 ml-1", isDarkMode ? 'text-violet-400/70' : 'text-violet-600')}>
                                    🔐 Body text is pre-filled with Meta's required OTP format. The <strong>{`{{1}}`}</strong> placeholder will be replaced with the generated OTP code at send time.
                                </p>
                            ) : (
                                <p className={cn("text-[10px] mt-1 ml-1", isDarkMode ? 'text-white/40' : 'text-slate-500')}>
                                    Use text formatting: *bold*, _italic_, ~strikethrough~<br />
                                    Your message content. Upto 1024 characters are allowed.<br />
                                    e.g. Hello {`{{1}}`}, your code will expire in {`{{2}}`} mins.
                                </p>
                            )}
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
                        <div id="interactive-actions-section">
                            <InteractiveActionsSection
                                isDarkMode={isDarkMode}
                                actionType={interactiveActions}
                                onActionTypeChange={(type) => setValue('interactiveActions', type)}
                                ctaButtons={ctaButtons}
                                onCTAButtonsChange={(buttons) => {
                                    setValue('ctaButtons', buttons, { shouldValidate: true });
                                    trigger('ctaButtons');
                                }}
                                quickReplies={quickReplies}
                                onQuickRepliesChange={(replies) => {
                                    setValue('quickReplies', replies, { shouldValidate: true });
                                    trigger('quickReplies');
                                }}
                                ctaErrors={errors.ctaButtons as any}
                                disabled={isViewMode}
                                isCarousel={templateType === 'CAROUSEL'}
                            />
                        </div>
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
                            carouselCards={templateType === 'CAROUSEL' ? carouselCards : []}
                            onCarouselCardsChange={(newCards) => setValue('carouselCards', newCards)}
                            fileName={uploadedFileName}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
