"use client";

import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Template } from './template-types';
import { WhatsAppPreviewPanel } from './whatsapp-preview-panel';

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
    console.log("template", template)
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
                        templateType={template?.template_type}
                        headerType={template?.components?.find((component: any) => component.component_type == "header")?.header_format || 'NONE'}
                        headerValue={template?.components?.find((component: any) => component.component_type == "header")?.text_content || ''}
                        content={template?.components?.find((component: any) => component.component_type == "body") || ''}
                        footer={template?.footer || ''}
                        variables={template?.variables}
                        ctaButtons={template?.ctaButtons || []}
                        quickReplies={template?.quickReplies || []}
                    />
                </div>
            </div>
        </div>
    );
};
