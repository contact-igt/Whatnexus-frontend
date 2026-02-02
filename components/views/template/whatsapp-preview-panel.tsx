"use client";

import { MessageCircle, Image as ImageIcon, Video, FileText, Check, Type } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TemplateType, CTAButton, HeaderType } from './template-types';
import { replaceVariables, formatWhatsAppText } from './template-utils';

interface WhatsAppPreviewPanelProps {
    isDarkMode: boolean;
    templateType: TemplateType;
    headerType?: HeaderType;
    headerValue?: string;
    content: string;
    footer?: string;
    variables: Record<string, string>;
    ctaButtons?: CTAButton[];
    quickReplies?: string[];
}

export const WhatsAppPreviewPanel = ({
    isDarkMode,
    templateType,
    headerType = 'NONE',
    headerValue = '',
    content,
    footer,
    variables,
    ctaButtons = [],
    quickReplies = []
}: WhatsAppPreviewPanelProps) => {

    // Replace variables and format text
    const processedContent = replaceVariables(content, variables);
    const formattedContent = formatWhatsAppText(processedContent);

    const renderHeaderPlaceholder = () => {
        if (!headerType || headerType === 'NONE') return null;

        if (headerType === 'TEXT' && headerValue) {
            return (
                <div className={cn(
                    "w-full px-4 pt-3 pb-2"
                )}>
                    <p className={cn(
                        "text-base font-semibold leading-tight",
                        isDarkMode ? 'text-white' : 'text-slate-900'
                    )}>
                        {headerValue}
                    </p>
                </div>
            );
        }

        if (headerType === 'MEDIA') {
            if (headerValue) {
                // Check if it's a video (base64 starts with data:video or has video extension)
                const isVideo = headerValue.startsWith('data:video') ||
                    headerValue.match(/\.(mp4|webm|ogg)$/i);

                return (
                    <div className="w-full">
                        {isVideo ? (
                            <video
                                src={headerValue}
                                className="w-full max-h-64 object-cover rounded-t-xl"
                                controls
                            />
                        ) : (
                            <img
                                src={headerValue}
                                alt="Header media"
                                className="w-full max-h-64 object-cover rounded-t-xl"
                            />
                        )}
                    </div>
                );
            }
            return (
                <div className={cn("w-full h-40 rounded-t-xl flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-blue-500/10 to-purple-500/10")}>
                    <ImageIcon size={48} className="text-blue-400" />
                    <span className="text-xs font-semibold text-blue-400">Media Header</span>
                </div>
            );
        }

        if (headerType === 'DOCUMENT') {
            if (headerValue) {
                return (
                    <div className={cn(
                        "w-full px-4 py-3 border-b",
                        isDarkMode ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'
                    )}>
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "p-2.5 rounded-lg",
                                isDarkMode ? "bg-purple-500/20" : "bg-purple-100"
                            )}>
                                <FileText size={20} className="text-purple-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={cn(
                                    "text-sm font-medium",
                                    isDarkMode ? "text-white" : "text-slate-900"
                                )}>
                                    Document.pdf
                                </p>
                                <p className={cn(
                                    "text-xs",
                                    isDarkMode ? "text-white/50" : "text-slate-500"
                                )}>
                                    PDF Document
                                </p>
                            </div>
                        </div>
                    </div>
                );
            }
            return (
                <div className={cn("w-full h-32 rounded-t-xl flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-purple-500/10 to-pink-500/10")}>
                    <FileText size={48} className="text-purple-400" />
                    <span className="text-xs font-semibold text-purple-400">Document Header</span>
                </div>
            );
        }

        return null;
    };

    const renderMediaPlaceholder = () => {
        if (templateType === 'TEXT') return null;

        const icons = {
            IMAGE: { Icon: ImageIcon, color: 'text-orange-400', bg: 'bg-orange-500/10', label: 'Image' },
            VIDEO: { Icon: Video, color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Video' },
            DOCUMENT: { Icon: FileText, color: 'text-purple-400', bg: 'bg-purple-500/10', label: 'Document' },
        };

        const config = icons[templateType];
        if (!config) return null;

        const { Icon, color, bg, label } = config;

        return (
            <div className={cn("w-full h-48 rounded-t-xl flex flex-col items-center justify-center gap-2", bg)}>
                <Icon size={56} className={color} />
                <span className={cn("text-xs font-semibold", color)}>{label} Preview</span>
            </div>
        );
    };

    return (
        <div className="sticky top-6 space-y-4">
            {/* Header */}
            <div className="flex items-center gap-2">
                <MessageCircle size={18} className="text-emerald-500" />
                <h3 className={cn("text-sm font-bold", isDarkMode ? 'text-white' : 'text-slate-900')}>
                    Template Preview
                </h3>
            </div>

            <p className={cn("text-xs", isDarkMode ? 'text-white/50' : 'text-slate-500')}>
                Your template message preview. It will update as you fill in the values in the form.
            </p>

            {/* WhatsApp Phone Mockup */}
            <div className={cn(
                "rounded-3xl p-3 border-2 shadow-2xl",
                isDarkMode
                    ? 'bg-gradient-to-b from-slate-900 to-slate-800 border-slate-700'
                    : 'bg-gradient-to-b from-slate-100 to-white border-slate-300'
            )}>
                {/* Phone Header - WhatsApp Style */}
                <div className={cn(
                    "rounded-t-2xl px-4 py-3 flex items-center gap-3",
                    isDarkMode ? 'bg-[#1f2c33]' : 'bg-[#075e54]'
                )}>
                    {/* Business Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
                        <MessageCircle size={20} className="text-white" />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-sm font-semibold text-white">Your Business</h4>
                        <p className="text-[10px] text-white/70 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            Online
                        </p>
                    </div>
                </div>

                {/* Chat Background */}
                <div className={cn(
                    "rounded-b-2xl p-4 min-h-[400px] max-h-[600px] overflow-y-auto",
                    "bg-cover bg-center",
                    isDarkMode
                        ? 'bg-[#0b141a]'
                        : 'bg-[#e5ddd5]'
                )}
                    style={{
                        backgroundImage: isDarkMode
                            ? 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h100v100H0z\' fill=\'%230b141a\'/%3E%3Cpath d=\'M20 20l5 5-5 5m15-10l5 5-5 5\' stroke=\'%23ffffff\' stroke-width=\'0.5\' opacity=\'0.03\' fill=\'none\'/%3E%3C/svg%3E")'
                            : 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h100v100H0z\' fill=\'%23e5ddd5\'/%3E%3Cpath d=\'M20 20l5 5-5 5m15-10l5 5-5 5\' stroke=\'%23000000\' stroke-width=\'0.5\' opacity=\'0.05\' fill=\'none\'/%3E%3C/svg%3E")'
                    }}
                >
                    {/* Date Badge */}
                    <div className="flex justify-center mb-4">
                        <div className={cn(
                            "px-3 py-1 rounded-lg text-[10px] font-medium shadow-sm",
                            isDarkMode
                                ? 'bg-[#1c2c33] text-white/70'
                                : 'bg-white/80 text-slate-600'
                        )}>
                            Today
                        </div>
                    </div>

                    {/* Message Bubble */}
                    <div className="flex justify-end mb-2">
                        <div className="max-w-[85%]">
                            <div className={cn(
                                "rounded-2xl rounded-tr-sm overflow-hidden shadow-lg relative",
                                isDarkMode ? 'bg-[#005c4b]' : 'bg-[#dcf8c6]'
                            )}>
                                {/* Header Placeholder */}
                                {renderHeaderPlaceholder()}

                                {/* Media Placeholder */}
                                {renderMediaPlaceholder()}

                                {/* Content */}
                                <div className="p-3 space-y-2">
                                    {content ? (
                                        <div
                                            className={cn(
                                                "text-[13px] leading-relaxed whitespace-pre-wrap break-words",
                                                isDarkMode ? 'text-white' : 'text-slate-900'
                                            )}
                                            dangerouslySetInnerHTML={{ __html: formattedContent }}
                                        />
                                    ) : (
                                        <p className={cn(
                                            "text-[13px] italic",
                                            isDarkMode ? 'text-white/40' : 'text-slate-500'
                                        )}>
                                            Your message will appear here...
                                        </p>
                                    )}

                                    {/* Footer */}
                                    {footer && (
                                        <div className={cn(
                                            "text-[11px] pt-2 border-t",
                                            isDarkMode
                                                ? 'text-white/60 border-white/10'
                                                : 'text-slate-600 border-slate-900/10'
                                        )}>
                                            {footer}
                                        </div>
                                    )}

                                    {/* Message Time & Status */}
                                    <div className="flex items-center justify-end gap-1 pt-1">
                                        <span className={cn(
                                            "text-[10px]",
                                            isDarkMode ? 'text-white/50' : 'text-slate-600/70'
                                        )}>
                                            {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                        </span>
                                        <div className="flex">
                                            <Check size={14} className={cn(isDarkMode ? 'text-blue-400' : 'text-blue-600')} />
                                            <Check size={14} className={cn("ml-[-8px]", isDarkMode ? 'text-blue-400' : 'text-blue-600')} />
                                        </div>
                                    </div>
                                </div>

                                {/* Message Tail */}
                                <div className={cn(
                                    "absolute -right-2 bottom-0 w-0 h-0",
                                    "border-l-[12px] border-b-[12px] border-b-transparent",
                                    isDarkMode ? 'border-l-[#005c4b]' : 'border-l-[#dcf8c6]'
                                )} />
                            </div>

                            {/* CTA Buttons */}
                            {ctaButtons.length > 0 && (
                                <div className="mt-2 space-y-1">
                                    {ctaButtons.map((button) => (
                                        <button
                                            key={button.id}
                                            className={cn(
                                                "w-full py-2.5 px-4 rounded-lg text-[13px] font-medium text-center border transition-all hover:scale-[1.02] active:scale-95",
                                                isDarkMode
                                                    ? 'bg-[#1c2c33] text-emerald-400 border-emerald-500/20 hover:bg-[#233239]'
                                                    : 'bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50 shadow-sm'
                                            )}
                                        >
                                            {button.type === 'URL' && '🔗 '}
                                            {button.type === 'PHONE' && '📞 '}
                                            {button.type === 'COPY_CODE' && '📋 '}
                                            {button.label || 'Button'}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Quick Replies */}
                            {quickReplies.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {quickReplies.map((reply, index) => (
                                        <button
                                            key={index}
                                            className={cn(
                                                "py-1.5 px-3 rounded-full text-[12px] font-medium border transition-all hover:scale-105 active:scale-95",
                                                isDarkMode
                                                    ? 'bg-[#1c2c33] text-emerald-400 border-emerald-500/20 hover:bg-[#233239]'
                                                    : 'bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50 shadow-sm'
                                            )}
                                        >
                                            {reply}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Disclaimer */}
            <div className={cn(
                "text-[10px] text-center leading-relaxed px-2",
                isDarkMode ? 'text-white/30' : 'text-slate-400'
            )}>
                📱 This is a graphical representation. Actual message may appear different on WhatsApp.
            </div>
        </div>
    );
};
