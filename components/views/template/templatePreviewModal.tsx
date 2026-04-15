"use client";

import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Template } from './templateTypes';
import { WhatsAppPreviewPanel } from './whatsappPreviewPanel';

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
    const headerComponent = template?.components?.find((component: any) => component.component_type === "header");
    const bodyComponent = template?.components?.find((component: any) => component.component_type === "body");
    const footerComponent = template?.components?.find((component: any) => component.component_type === "footer");

    const normalizedTemplateType = (template?.template_type || template?.type || 'TEXT').toUpperCase() as any;
    const normalizedHeaderType = (headerComponent?.header_format || 'NONE').toUpperCase();
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
                        variables={template?.variables}
                        ctaButtons={template?.ctaButtons || []}
                        quickReplies={template?.quickReplies || []}
                    />
                </div>
            </div>
        </div>
    );
};
