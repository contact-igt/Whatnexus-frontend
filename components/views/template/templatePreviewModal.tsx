"use client";

import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Template, CTAButton } from './templateTypes';
import { WhatsAppPreviewPanel } from './whatsappPreviewPanel';
import { generateId } from './templateUtils';

interface TemplatePreviewModalProps {
    template: Template;
    isDarkMode: boolean;
    onClose: () => void;
}

export const TemplatePreviewModal = ({
    template,
    isDarkMode,
    onClose
}: TemplatePreviewModalProps) => {
    const headerComponent = template?.components?.find((component: any) =>
        component.component_type?.toLowerCase() === "header" || component.type?.toLowerCase() === "header"
    );
    const bodyComponent = template?.components?.find((component: any) =>
        component.component_type?.toLowerCase() === "body" || component.type?.toLowerCase() === "body"
    );
    const footerComponent = template?.components?.find((component: any) =>
        component.component_type?.toLowerCase() === "footer" || component.type?.toLowerCase() === "footer"
    );

    const normalizedTemplateType = (template?.template_type || (template as any)?.type || 'TEXT').toUpperCase() as any;
    const normalizedHeaderType = (headerComponent?.header_format || headerComponent?.format || 'NONE').toUpperCase();
    const normalizedHeaderValue =
        headerComponent?.media_url ||
        headerComponent?.text_content ||
        headerComponent?.text ||
        '';
    const normalizedBodyText =
        bodyComponent?.text_content ||
        bodyComponent?.text ||
        '';
    const normalizedFooterText =
        footerComponent?.text_content ||
        footerComponent?.text ||
        '';

    // Extract CTA buttons and quick replies from components (API doesn't return them as top-level fields)
    const { parsedCTAButtons, parsedQuickReplies } = (() => {
        // If already resolved on the template object, use those
        if (template?.ctaButtons && template.ctaButtons.length > 0) {
            return { parsedCTAButtons: template.ctaButtons, parsedQuickReplies: template.quickReplies || [] };
        }

        const buttonsComp = template?.components?.find((c: any) =>
            c.component_type?.toLowerCase() === "buttons" || c.type?.toLowerCase() === "buttons"
        );
        if (!buttonsComp) return { parsedCTAButtons: [] as CTAButton[], parsedQuickReplies: [] as string[] };

        const rawButtons = buttonsComp?.text_content || buttonsComp?.buttons || null;
        if (!rawButtons) return { parsedCTAButtons: [] as CTAButton[], parsedQuickReplies: [] as string[] };

        try {
            const buttons: any[] = typeof rawButtons === 'string' ? JSON.parse(rawButtons) : rawButtons;
            const ctaRaw = buttons.filter((b: any) => ['URL', 'PHONE', 'COPY_CODE', 'PHONE_NUMBER'].includes(b.type?.toUpperCase()));
            const qrRaw  = buttons.filter((b: any) => b.type?.toUpperCase() === 'QUICK_REPLY').map((b: any) => b.text || b.label || '');

            const ctaButtons: CTAButton[] = ctaRaw.map((b: any) => ({
                id: generateId(),
                type: b.type?.toUpperCase() === 'PHONE_NUMBER' ? 'PHONE' : (b.type?.toUpperCase() as CTAButton['type']),
                label: b.text || b.label || (b.type === 'COPY_CODE' ? 'Copy Code' : 'Button'),
                value: (() => {
                    let val = b.url || b.phone_number || b.example || b.value || '';
                    if ((b.type?.toUpperCase() === 'PHONE_NUMBER' || b.type?.toUpperCase() === 'PHONE') && val && !val.startsWith('+')) {
                        val = '+' + val;
                    }
                    return val;
                })()
            }));

            return { parsedCTAButtons: ctaButtons, parsedQuickReplies: qrRaw };
        } catch {
            return { parsedCTAButtons: [] as CTAButton[], parsedQuickReplies: [] as string[] };
        }
    })();

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className={cn(
                "absolute inset-0 backdrop-blur-md",
                isDarkMode ? 'bg-black/60' : 'bg-black/40'
            )} />

            {/* Modal Content */}
            <div
                className={cn(
                    "relative w-full max-w-md rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200",
                    isDarkMode ? 'bg-slate-900' : 'bg-white'
                )}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className={cn(
                        "absolute top-4 right-4 z-10 p-2 rounded-lg transition-colors",
                        isDarkMode
                            ? 'hover:bg-white/10 text-white/70 hover:text-white'
                            : 'hover:bg-slate-100 text-slate-500 hover:text-slate-700'
                    )}
                >
                    <X size={20} />
                </button>

                {/* Preview Content */}
                <div className="p-6">
                    <WhatsAppPreviewPanel
                        isDarkMode={isDarkMode}
                        templateType={normalizedTemplateType}
                        headerType={normalizedHeaderType as any}
                        headerValue={normalizedHeaderValue}
                        content={normalizedBodyText}
                        footer={normalizedFooterText}
                        variables={template?.variables || {}}
                        ctaButtons={parsedCTAButtons}
                        quickReplies={parsedQuickReplies}
                        category={template?.category}
                    />
                </div>
            </div>
        </div>
    );
};
