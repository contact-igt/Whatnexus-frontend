"use client";

import { useState } from 'react';
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
    OptimizationGoal
} from './template-types';
import { validateTemplateName, generateId } from './template-utils';
import { WhatsAppPreviewPanel } from './whatsapp-preview-panel';
import { VariableInputSection } from './variable-input-section';
import { InteractiveActionsSection } from './interactive-actions-section';
import { AIGeneratorSection } from './ai-generator-section';
import { toast } from 'sonner';
import { callOpenAI } from '@/lib/openai';

interface TemplateFormPageProps {
    templateId?: string;
    initialData?: Partial<TemplateFormData>;
    onBack: () => void;
    onSave: (data: TemplateFormData) => void;
}

export const TemplateFormPage = ({
    templateId,
    initialData,
    onBack,
    onSave
}: TemplateFormPageProps) => {
    const { isDarkMode } = useTheme();
    const [isSaving, setIsSaving] = useState(false);

    const [category, setCategory] = useState<TemplateCategory>(initialData?.category || 'UTILITY');
    const [language, setLanguage] = useState(initialData?.language || 'English');
    const [templateName, setTemplateName] = useState(initialData?.name || '');
    const [templateType, setTemplateType] = useState<TemplateType>(initialData?.type || 'TEXT');
    const [content, setContent] = useState(initialData?.content || '');
    const [footer, setFooter] = useState(initialData?.footer || '');
    const [variables, setVariables] = useState<Record<string, string>>(initialData?.variables || {});
    const [interactiveActions, setInteractiveActions] = useState<InteractiveActionType>(initialData?.interactiveActions || 'None');
    const [ctaButtons, setCTAButtons] = useState<CTAButton[]>(initialData?.ctaButtons || []);
    const [quickReplies, setQuickReplies] = useState<string[]>(initialData?.quickReplies || []);

    const categories: TemplateCategory[] = ['UTILITY', 'MARKETING', 'AUTHENTICATION'];
    const templateTypes: TemplateType[] = ['TEXT', 'IMAGE', 'VIDEO', 'DOCUMENT'];
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
        const content = await callOpenAI(finalPrompt, SYSTEM_TEMPLATE_PROMPT);
        setContent(content);
        toast.success('Template generated successfully!');
    };

    const handleSubmit = () => {
        const nameValidation = validateTemplateName(templateName);
        if (!nameValidation.valid) {
            toast.error(nameValidation.error || 'Invalid template name');
            return;
        }

        if (!content.trim()) {
            toast.error('Template content is required');
            return;
        }

        setIsSaving(true);

        const formData: TemplateFormData = {
            category,
            language,
            name: templateName,
            type: templateType,
            content,
            footer,
            variables,
            interactiveActions,
            ctaButtons,
            quickReplies: quickReplies.filter(r => r.trim() !== '')
        };

        setTimeout(() => {
            onSave(formData);
            setIsSaving(false);
            toast.success(templateId ? 'Template updated successfully!' : 'Template created successfully!');
        }, 1000);
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
                        onClick={handleSubmit}
                        disabled={isSaving}
                        className="h-11 px-6 rounded-xl font-bold text-sm bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                <span>Saving...</span>
                            </>
                        ) : (
                            <>
                                <Save size={16} />
                                <span>Submit</span>
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
                                        onChange={(value) => setCategory(value as TemplateCategory)}
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
                                        onChange={setLanguage}
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
                                onChange={(e) => setTemplateName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'))}
                                placeholder="e.g. app_verification_code"
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
                                onChange={(value) => setTemplateType(value as TemplateType)}
                                options={templateTypes.map(type => ({ value: type, label: type }))}
                            />
                            <p className={cn("text-[10px] mt-1 ml-1", isDarkMode ? 'text-white/40' : 'text-slate-500')}>
                                Your template type should fall under one of these categories
                            </p>
                        </div>

                        {/* Template Content */}
                        <div>
                            <Textarea
                                isDarkMode={isDarkMode}
                                label="Template Format"
                                required
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Enter your message in here..."
                                rows={6}
                                maxLength={1024}
                                showCharCount
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
                            onVariablesChange={setVariables}
                        />

                        {/* Footer */}
                        <div>
                            <Input
                                isDarkMode={isDarkMode}
                                label="Template Footer (Optional)"
                                type="text"
                                value={footer}
                                onChange={(e) => setFooter(e.target.value.slice(0, 60))}
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
                            onActionTypeChange={setInteractiveActions}
                            ctaButtons={ctaButtons}
                            onCTAButtonsChange={setCTAButtons}
                            quickReplies={quickReplies}
                            onQuickRepliesChange={setQuickReplies}
                        />
                    </div>

                    {/* Right Column - Preview */}
                    <div className="lg:col-span-1">
                        <WhatsAppPreviewPanel
                            isDarkMode={isDarkMode}
                            templateType={templateType}
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
