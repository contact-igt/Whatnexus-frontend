import React, { useEffect, useRef, useCallback, useState } from 'react';
import { SearchX, MessageSquareText, FileText, Copy, Download, User, Bot, UserCog, Link, Phone, Reply, Mic, Play, Pause } from 'lucide-react';
import { cn } from "@/lib/utils";
import { MessageStatusTicks, formattedTime } from './ChatUtils';
import { getWebhookBaseURL } from '@/helper/axios';
import { store } from '@/redux/store';

// Sender icon component for message bubbles
const SenderIndicator: React.FC<{ sender: string; senderName?: string; isDarkMode: boolean; isOutgoing: boolean }> = ({ sender, senderName, isDarkMode, isOutgoing }) => {
    if (sender === 'user') {
        return (
            <div className="flex items-center gap-1.5 mb-1">
                <div className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center",
                    isDarkMode ? "bg-blue-500/20" : "bg-blue-100"
                )}>
                    <User size={12} className={cn(isDarkMode ? "text-blue-400" : "text-blue-600")} />
                </div>
                <span className={cn(
                    "text-[10px] font-semibold uppercase tracking-wide",
                    isDarkMode ? "text-blue-400/80" : "text-blue-600/80"
                )}>
                    Customer
                </span>
            </div>
        );
    }

    if (sender === 'bot') {
        return (
            <div className="flex items-center gap-1.5 mb-1">
                <div className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center",
                    isDarkMode ? "bg-emerald-500/20" : "bg-emerald-100"
                )}>
                    <Bot size={12} className={cn(isDarkMode ? "text-emerald-400" : "text-emerald-600")} />
                </div>
                <span className={cn(
                    "text-[10px] font-semibold uppercase tracking-wide",
                    isDarkMode ? "text-emerald-400/80" : "text-emerald-600/80"
                )}>
                    AI Assistant
                </span>
            </div>
        );
    }

    if (sender === 'admin') {
        return (
            <div className="flex items-center gap-1.5 mb-3">
                <div className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center",
                    isDarkMode ? "bg-purple-500/20" : "bg-purple-100"
                )}>
                    <UserCog size={12} className={cn(isDarkMode ? "text-purple-400" : "text-purple-600")} />
                </div>
                <span className={cn(
                    "text-[10px] font-semibold uppercase tracking-wide",
                    isDarkMode ? "text-purple-400/80" : "text-purple-600/80"
                )}>
                    {senderName || 'Admin'}
                </span>
            </div>
        );
    }

    return null;
};

// Extracts media URL from "[VIDEO: url]" / "[IMAGE: url]" / "[DOCUMENT: url]" text patterns
const extractMediaFromText = (message: string) => {
    if (!message) return null;
    const match = message.match(/^\[(VIDEO|IMAGE|DOCUMENT):?\s*([^\]\n]+)?\]/i);
    if (!match) return null;
    const url = match[2]?.trim();
    return { type: match[1].toLowerCase(), url: url && url.length > 0 ? url : null };
};

// Extract buttons from template message format "[Button: Label (value)]" or "[Button: Label | value]"
const extractButtonsFromText = (message: string) => {
    const buttonRegex = /\[Button:\s*([^\]]+)\]/gi;
    const buttons: Array<{ text: string; value?: string; type: 'url' | 'phone' | 'quick_reply' }> = [];
    let match;
    while ((match = buttonRegex.exec(message)) !== null) {
        const fullText = match[1].trim();
        let displayText: string;
        let value: string | undefined;
        let type: 'url' | 'phone' | 'quick_reply' = 'quick_reply';

        // Pipe format: "Label | value" (frontend-generated)
        if (fullText.includes('|')) {
            const parts = fullText.split('|').map(p => p.trim());
            displayText = parts[0];
            value = parts[1];
        }
        // Parens format: "Label (value)" (backend templateRenderer format)
        else {
            const parensMatch = fullText.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
            if (parensMatch) {
                displayText = parensMatch[1].trim();
                value = parensMatch[2].trim();
            } else {
                displayText = fullText;
                value = undefined;
            }
        }

        // Determine type from value, then fall back to keyword matching on label
        if (value) {
            if (value.toLowerCase().startsWith('http') || value.includes('www.')) {
                type = 'url';
            } else if (value.startsWith('+') || /^\d{7,}$/.test(value.replace(/\s/g, ''))) {
                type = 'phone';
            }
        }
        if (type === 'quick_reply') {
            if (/visit|view|website|link|shop|buy|book/i.test(displayText)) type = 'url';
            else if (/call|phone/i.test(displayText)) type = 'phone';
        }

        buttons.push({ text: displayText, value, type });
    }
    return buttons;
};

// Remove button text from message body
const stripButtonsFromText = (message: string) => {
    return message.replace(/\n?\[Button:\s*[^\]]+\]/gi, '').trim();
};

// Remove any remaining template variable placeholders like {{1}}, {{2}}, etc.
const stripVariablePlaceholders = (message: string) => {
    return message.replace(/\{\{\d+\}\}/g, '').trim();
};

// Parse interactive payload and extract buttons
const extractInteractiveButtons = (interactive_payload: string): Array<{ text: string; value?: string; type: 'quick_reply' }> => {
    if (!interactive_payload) return [];

    try {
        const payload = typeof interactive_payload === 'string' ? JSON.parse(interactive_payload) : interactive_payload;
        const buttons: Array<{ text: string; value?: string; type: 'quick_reply' }> = [];
        // Handle QUICK_REPLY buttons ONLY (action.buttons)
        // Do NOT extract action.sections (list items)
        if (payload?.interactive?.action?.button || (payload?.interactive?.action?.buttons && Array.isArray(payload.interactive.action.buttons))) {
            if (payload.interactive.action.button) {
                buttons.push({
                    text: payload.interactive.action.button,
                    value: payload.interactive.action.button,
                    type: 'quick_reply'
                })
            }
            else if (payload.interactive.action.buttons && Array.isArray(payload.interactive.action.buttons)) {
                payload.interactive.action.buttons.forEach((btn: any) => {
                    if (btn.reply) {
                        buttons.push({
                            text: btn.reply.title || btn.reply.id,
                            value: btn.reply.id,
                            type: 'quick_reply'
                        });
                    }
                });
            }

            
        }
        return buttons;
    } catch (error) {
        
        return [];
    }
};

// Format WhatsApp text: *bold*, _italic_, ~strikethrough~
const formatWhatsAppText = (text: string): string => {
    let formatted = text;
    formatted = formatted.replace(/\*([^*]+)\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/_([^_]+)_/g, '<em>$1</em>');
    formatted = formatted.replace(/~([^~]+)~/g, '<del>$1</del>');
    return formatted;
};

// Check if a message is a template message (has embedded media pattern or buttons or message_type=template)
const isTemplateMessage = (msg: any): boolean => {
    if (msg.message_type === 'template') return true;
    if (!msg.message) return false;
    const hasEmbeddedMedia = /^\[(VIDEO|IMAGE|DOCUMENT):?\s*[^\]]*\]/i.test(msg.message);
    const hasButtons = msg.message.includes('[Button:');
    return hasEmbeddedMedia || hasButtons;
};

// Extract footer from template message (line starting with specific patterns)
const extractFooterFromText = (bodyText: string): { body: string; footer: string | null } => {
    // Footer is typically the last line if it's very short or marked
    // For now, we don't have explicit footer markers in the stored format
    return { body: bodyText, footer: null };
};

// MIME type lookup from filename extension
const getMimeFromFilename = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const mimeMap: Record<string, string> = {
        pdf: 'application/pdf',
        doc: 'application/msword',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        xls: 'application/vnd.ms-excel',
        xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ppt: 'application/vnd.ms-powerpoint',
        pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        csv: 'text/csv',
        txt: 'text/plain',
        zip: 'application/zip',
    };
    return mimeMap[ext || ''] || 'application/octet-stream';
};

// Blob-based download: fetches file, creates typed blob, triggers proper download
const handleDocumentDownload = async (url: string, filename: string) => {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        const mimeType = getMimeFromFilename(filename);
        const typedBlob = new Blob([blob], { type: mimeType });
        const blobUrl = URL.createObjectURL(typedBlob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
    } catch {
        window.open(url, '_blank');
    }
};

/**
 * Resolve a media URL for display.
 * - Real URLs (R2 / CDN) pass through unchanged.
 * - "meta_media_id:{id}" values → full backend proxy URL.
 *
 * WHY token in URL:
 *   <img>, <video>, <audio> are native browser elements — they cannot set custom
 *   HTTP headers. Passing the JWT as ?token= is the only way to authenticate these
 *   direct browser fetches. The backend reads it from the query param before the
 *   authenticate middleware runs, identical to how presigned S3/R2 URLs work.
 */
const resolveMediaUrl = (url: string | null | undefined): string | null => {
    if (!url) return null;
    if (url.startsWith("meta_media_id:")) {
        const mediaId = url.replace("meta_media_id:", "");
        const base = getWebhookBaseURL().replace(/\/$/, "");
        const token = (store.getState() as any)?.auth?.token || "";
        return `${base}/api/whatsapp/attachments/proxy?mediaId=${encodeURIComponent(mediaId)}&token=${encodeURIComponent(token)}`;
    }
    return url;
};

// 33-bar waveform pattern — mimics a real voice recording amplitude envelope
const WAVE_H = [3, 5, 9, 6, 12, 7, 4, 10, 6, 8, 4, 13, 7, 5, 10, 6, 11, 4, 8, 5, 10, 6, 3, 9, 5, 8, 4, 11, 6, 8, 3, 5, 7];

const CustomAudioPlayer: React.FC<{ src: string; isDarkMode: boolean; isOutgoing: boolean }> = ({
    src, isDarkMode, isOutgoing,
}) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [playing, setPlaying] = useState(false);
    const [current, setCurrent] = useState(0);
    const [dur, setDur] = useState(0);
    const [err, setErr] = useState(false);

    // Reset all state when src changes (e.g. meta_media_id → R2 URL after async download)
    useEffect(() => {
        setErr(false);
        setPlaying(false);
        setCurrent(0);
        setDur(0);
    }, [src]);

    const fmt = (s: number) => {
        if (!s || !isFinite(s)) return '0:00';
        return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
    };

    const toggle = () => {
        const a = audioRef.current;
        if (!a) return;
        playing ? a.pause() : a.play().catch(() => setErr(true));
    };

    const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const t = +e.target.value;
        if (audioRef.current) audioRef.current.currentTime = t;
        setCurrent(t);
    };

    const pct = dur > 0 ? (current / dur) * 100 : 0;
    const displayTime = playing || current > 0 ? current : dur;

    // Colours derived once for clarity
    const playBtn = isOutgoing ? 'bg-white/25 hover:bg-white/40' : isDarkMode ? 'bg-[#00a884] hover:bg-[#06cf9c]' : 'bg-[#00a884] hover:bg-[#009073]';
    const barFill = isOutgoing ? 'bg-white' : 'bg-[#00a884]';
    const barEmpty = isOutgoing ? 'bg-white/30' : isDarkMode ? 'bg-white/20' : 'bg-black/15';
    const timeCol = isOutgoing ? 'text-white/65' : isDarkMode ? 'text-white/45' : 'text-black/40';
    const micBg = isOutgoing ? 'bg-white/20' : isDarkMode ? 'bg-[#00a884]/25' : 'bg-[#00a884]/15';
    const micCol = isOutgoing ? 'text-white/90' : 'text-[#00a884]';

    if (err) return (
        <div className={cn('flex items-center gap-2 text-xs opacity-50', timeCol)}>
            <Mic size={13} /><span>Audio unavailable</span>
        </div>
    );

    return (
        <div className="flex items-center gap-2 min-w-[220px] max-w-[260px] py-0.5">
            <audio
                ref={audioRef} src={src} preload="metadata"
                onTimeUpdate={() => setCurrent(audioRef.current?.currentTime ?? 0)}
                onLoadedMetadata={() => setDur(audioRef.current?.duration ?? 0)}
                onEnded={() => { setPlaying(false); setCurrent(0); }}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onError={() => setErr(true)}
            />

            {/* Mic avatar circle */}
            <div className={cn('w-[38px] h-[38px] rounded-full flex items-center justify-center shrink-0', micBg)}>
                <Mic size={16} className={micCol} />
            </div>

            {/* Waveform column — bars + time label */}
            <div className="flex-1 flex flex-col gap-[5px]">
                {/* Bars with invisible seek overlay */}
                <div className="relative h-[22px]">
                    <div className="flex items-center gap-[2.5px] h-full">
                        {WAVE_H.map((h, i) => (
                            <div
                                key={i}
                                style={{ height: `${h}px` }}
                                className={cn(
                                    'flex-1 rounded-full transition-colors duration-100',
                                    (i / WAVE_H.length) * 100 < pct ? barFill : barEmpty,
                                )}
                            />
                        ))}
                    </div>
                    {/* Invisible range — captures seek clicks/drags over waveform */}
                    <input
                        type="range" min={0} max={dur || 100} step={0.01} value={current}
                        onChange={seek}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                </div>
                {/* Time */}
                <span className={cn('text-[11px] tabular-nums leading-none', timeCol)}>
                    {fmt(displayTime)}
                </span>
            </div>

            {/* Play / Pause button */}
            <button
                onClick={toggle}
                className={cn(
                    'w-[38px] h-[38px] rounded-full flex items-center justify-center shrink-0 transition-all active:scale-95',
                    playBtn,
                )}
            >
                {playing
                    ? <Pause size={16} fill="white" stroke="none" className="text-white" />
                    : <Play size={16} fill="white" stroke="none" className="text-white ml-0.5" />
                }
            </button>
        </div>
    );
};

const MessageContent: React.FC<{ msg: any; searchText: string; isDarkMode: boolean; isOutgoing: boolean }> = ({ msg, searchText, isDarkMode, isOutgoing }) => {
    const type = msg.message_type;
    const mediaUrl = msg.media_url;
    // When the proxy URL fails to load (e.g. expired Meta media ID), fall back to the placeholder
    const [mediaError, setMediaError] = useState(false);
    // Reset error state if the URL changes (e.g. media-url-updated socket swaps meta_media_id → R2 URL)
    const prevMediaUrlRef = useRef(mediaUrl);
    if (prevMediaUrlRef.current !== mediaUrl) {
        prevMediaUrlRef.current = mediaUrl;
        if (mediaError) setMediaError(false);
    }

    // Try to extract embedded media from message text (templates store media as "[VIDEO: url]\nBody text")
    const embeddedMedia = extractMediaFromText(msg.message);
    const effectiveType = embeddedMedia?.type || type;
    const rawUrl = resolveMediaUrl(embeddedMedia?.url || mediaUrl);
    const effectiveUrl = mediaError ? null : rawUrl;

    // Extract buttons from message text (template format)
    const hasButtons = msg.message?.includes("[Button:");
    const templateButtons = hasButtons ? extractButtonsFromText(msg.message) : [];

    // Extract buttons from interactive payload
    const interactiveButtons = msg.interactive_payload ? extractInteractiveButtons(msg.interactive_payload) : [];

    // Get body text: strip media prefix and buttons
    let bodyText = msg.message || '';
    if (embeddedMedia) {
        bodyText = msg.message.replace(/^\[(VIDEO|IMAGE|DOCUMENT):?\s*[^\]]*\]\n?/i, "").trim();
    }
    if (hasButtons) {
        bodyText = stripButtonsFromText(bodyText);
    }
    bodyText = stripVariablePlaceholders(bodyText);

    const isTemplate = isTemplateMessage(msg);
    const isInteractive = msg.message_type === 'interactive';

    // Highlight search text
    const renderText = (text: string) => {
        if (searchText && text?.toLowerCase().includes(searchText.toLowerCase())) {
            return text.split(new RegExp(`(${searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')).map((part: string, i: number) =>
                part.toLowerCase() === searchText.toLowerCase() ? (
                    <mark key={i} className={cn("p-0 px-0.5 rounded-sm inline-block", isDarkMode ? "bg-emerald-500/30 text-emerald-400" : "bg-yellow-200 text-slate-900")}>
                        {part}
                    </mark>
                ) : part
            );
        }
        return text;
    };

    // Render formatted body text with WhatsApp markdown
    const renderFormattedBody = (text: string) => {
        if (!text) return null;
        const lines = text.split('\n');
        return lines.map((line, i) => {
            if (!line.trim()) return <br key={i} />;
            if (searchText && line.toLowerCase().includes(searchText.toLowerCase())) {
                return <p key={i} className="leading-relaxed">{renderText(line)}</p>;
            }
            return (
                <p
                    key={i}
                    className="leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: formatWhatsAppText(line) }}
                />
            );
        });
    };

    // ─── Template Message Layout (WhatsApp-style) ───
    if (isTemplate) {
        return (
            <div className="template-message">
                {/* Media Header — flush to bubble edges */}
                {effectiveType === "image" && effectiveUrl && (
                    <div className="-mx-2 -mt-2 mb-0 overflow-hidden rounded-t-lg">
                        <img
                            src={effectiveUrl}
                            alt="Template media"
                            className="w-full max-h-[220px] object-cover"
                            onError={() => setMediaError(true)}
                        />
                    </div>
                )}
                {effectiveType === "image" && !effectiveUrl && (
                    <div className={cn(
                        "-mx-2 -mt-2 mb-0 overflow-hidden rounded-t-lg flex items-center justify-center h-40",
                        isDarkMode ? "bg-white/5" : "bg-black/5"
                    )}>
                        <span className="text-3xl opacity-40">🖼️</span>
                    </div>
                )}

                {effectiveType === "video" && effectiveUrl && (
                    <div className="-mx-2 -mt-2 mb-0 overflow-hidden rounded-t-lg">
                        <video
                            src={effectiveUrl}
                            controls
                            className="w-full max-h-[220px] object-cover"
                            preload="metadata"
                            onError={() => setMediaError(true)}
                        />
                    </div>
                )}
                {effectiveType === "video" && !effectiveUrl && (
                    <div className={cn(
                        "-mx-2 -mt-2 mb-0 overflow-hidden rounded-t-lg flex items-center justify-center h-40",
                        isDarkMode ? "bg-white/5" : "bg-black/5"
                    )}>
                        <span className="text-3xl opacity-40">🎬</span>
                    </div>
                )}

                {effectiveType === "document" && (
                    <div className={cn(
                        "-mx-2 -mt-2 mb-0 rounded-t-lg overflow-hidden",
                    )}>
                        <div
                            onClick={() => effectiveUrl && handleDocumentDownload(effectiveUrl, msg.media_filename || "Document")}
                            className={cn(
                                "flex items-center gap-3 px-3 py-3 transition-colors",
                                effectiveUrl ? "cursor-pointer" : "cursor-default",
                                isDarkMode ? "bg-white/5 hover:bg-white/10" : "bg-black/[0.03] hover:bg-black/[0.06]"
                            )}
                        >
                            <div className={cn(
                                "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                                isDarkMode ? "bg-purple-500/20" : "bg-purple-100"
                            )}>
                                <FileText size={18} className={cn(isDarkMode ? "text-purple-400" : "text-purple-600")} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{msg.media_filename || "Document"}</p>
                                <p className={cn("text-[10px] uppercase font-bold tracking-wider", isDarkMode ? "opacity-40" : "opacity-50")}>
                                    {(msg.media_filename || "PDF").split('.').pop()?.toUpperCase() || "PDF"}
                                </p>
                            </div>
                            {effectiveUrl && <Download size={16} className="shrink-0 opacity-50" />}
                        </div>
                    </div>
                )}

                {/* Body Text */}
                {bodyText && (
                    <div className={cn(
                        "text-[13.5px] whitespace-pre-wrap break-words overflow-hidden leading-relaxed",
                        (effectiveType === "image" || effectiveType === "video" || effectiveType === "document") ? "px-1 pt-2 pb-0.5" : "px-1 py-0"
                    )}>
                        {renderFormattedBody(bodyText)}
                    </div>
                )}

            </div>
        );
    }

    // ─── Interactive Message Layout ───
    if (isInteractive) {
        return (
            <div className="interactive-message">
                {/* Body Text */}
                {bodyText && (
                    <div className={cn(
                        "text-[15px] whitespace-pre-wrap break-words mb-1 px-1"
                    )}>
                        {renderFormattedBody(bodyText)}
                    </div>
                )}
            </div>
        );
    }

    // ─── Regular Message Layout ───
    return (
        <>
            {/* Video */}
            {effectiveType === "video" && effectiveUrl && (
                <video
                    src={effectiveUrl}
                    controls
                    className="rounded-lg max-w-full max-h-64 mb-1 w-full"
                    preload="metadata"
                    onError={() => setMediaError(true)}
                />
            )}
            {effectiveType === "video" && !effectiveUrl && (
                <div className={cn("flex items-center gap-2 mb-1 px-2 py-2 rounded-lg text-sm", isDarkMode ? "bg-white/10" : "bg-black/5")}>
                    <span>🎬</span>
                    <span className="opacity-70">Video unavailable</span>
                </div>
            )}

            {/* Image */}
            {effectiveType === "image" && effectiveUrl && (
                <img src={effectiveUrl} alt="media" className="rounded-lg max-w-full max-h-64 mb-1 object-cover" onError={() => setMediaError(true)} />
            )}
            {effectiveType === "image" && !effectiveUrl && (
                <div className={cn("flex items-center gap-2 mb-1 px-2 py-2 rounded-lg text-sm", isDarkMode ? "bg-white/10" : "bg-black/5")}>
                    <span>🖼️</span>
                    <span className="opacity-70">Image unavailable</span>
                </div>
            )}

            {/* Document */}
            {effectiveType === "document" && effectiveUrl && (
                <div
                    onClick={() => handleDocumentDownload(effectiveUrl, msg.media_filename || "Document")}
                    className={cn(
                        "flex items-center gap-2 mb-1 px-3 py-2.5 rounded-lg text-sm cursor-pointer transition-colors",
                        isDarkMode ? "bg-white/10 hover:bg-white/15" : "bg-black/5 hover:bg-black/10"
                    )}
                >
                    <FileText className="w-5 h-5 shrink-0 opacity-70" />
                    <span className="flex-1 truncate opacity-90 font-medium">{msg.media_filename || "Document"}</span>
                    <Download className="w-4 h-4 shrink-0 opacity-60" />
                </div>
            )}
            {effectiveType === "document" && !effectiveUrl && (
                <div className={cn("flex items-center gap-2 mb-1 px-3 py-2.5 rounded-lg text-sm", isDarkMode ? "bg-white/10" : "bg-black/5")}>
                    <FileText className="w-5 h-5 shrink-0 opacity-70" />
                    <span className="flex-1 truncate opacity-80">{msg.media_filename || "Document"}</span>
                </div>
            )}

            {/* Audio — WhatsApp-style custom player */}
            {effectiveType === "audio" && effectiveUrl && (
                <CustomAudioPlayer src={effectiveUrl} isDarkMode={isDarkMode} isOutgoing={isOutgoing} />
            )}
            {effectiveType === "audio" && !effectiveUrl && (
                <div className={cn("flex items-center gap-2 mb-1 px-2 py-2 rounded-lg text-sm", isDarkMode ? "bg-white/10" : "bg-black/5")}>
                    <Mic size={14} className="opacity-60 shrink-0" />
                    <span className="opacity-70">Audio unavailable</span>
                </div>
            )}

            {/* Body text */}
            {bodyText ? (
                <div className="text-[15px] whitespace-pre-wrap break-words mb-1 px-1">
                    {renderFormattedBody(bodyText)}
                </div>
            ) : effectiveType === "text" || (effectiveType === "template" && !embeddedMedia) ? (
                <div className="text-[15px] whitespace-pre-wrap break-words mb-1 px-1">
                    {renderFormattedBody(stripButtonsFromText(msg.message))}
                </div>
            ) : null}
        </>
    );
};

interface MessageListProps {
    isDarkMode: boolean;
    isMessagesLoading: boolean;
    isSearching: boolean;
    filteredMessage: any[];
    groupedEntries: any[];
    bottomRef: React.RefObject<HTMLDivElement | null>;
    selectedChat: any;
    searchText?: string;
    isAiTyping?: boolean;
    highlightWamid?: string;
}

export const MessageList: React.FC<MessageListProps> = ({
    isDarkMode,
    isMessagesLoading,
    isSearching,
    filteredMessage,
    groupedEntries,
    bottomRef,
    selectedChat,
    searchText = "",
    isAiTyping = false,
    highlightWamid
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearHighlight = useCallback((el: HTMLElement) => {
        el.style.transition = 'background-color 0.6s ease, box-shadow 0.6s ease';
        el.style.backgroundColor = '';
        el.style.boxShadow = '';
        el.style.borderRadius = '';
    }, []);

    useEffect(() => {
        if (!highlightWamid || !containerRef.current) return;

        // Delay to let React finish painting messages into the DOM
        const timer = setTimeout(() => {
            if (!containerRef.current) return;
            const el = containerRef.current.querySelector<HTMLElement>(
                `[data-wamid="${CSS.escape(highlightWamid)}"]`
            );
            if (!el) return;

            el.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Phase 1: bright yellow flash
            el.style.transition = 'none';
            el.style.backgroundColor = 'rgba(253, 224, 71, 0.6)';
            el.style.boxShadow = '0 0 0 3px rgb(234 179 8), 0 0 28px 6px rgba(253,224,71,0.45)';
            el.style.borderRadius = '10px';

            // Phase 2: soften after 400ms
            const softenTimer = setTimeout(() => {
                el.style.transition = 'background-color 0.5s ease, box-shadow 0.5s ease';
                el.style.backgroundColor = 'rgba(253, 224, 71, 0.22)';
                el.style.boxShadow = '0 0 0 2px rgb(250 204 21)';
            }, 400);

            // Phase 3: fade out fully after 3.5s
            if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
            highlightTimerRef.current = setTimeout(() => {
                clearTimeout(softenTimer);
                clearHighlight(el);
            }, 3500);
        }, 250);

        return () => {
            clearTimeout(timer);
            if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
        };
    }, [highlightWamid, groupedEntries, clearHighlight]);

    return (
        <div ref={containerRef} className={cn(
            "flex-1 overflow-y-auto px-10 py-4 space-y-2 relative",
            isDarkMode ? "bg-[#0b141a]" : "bg-[#efeae2]"
        )}
            style={{
                backgroundImage: `url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')`,
                backgroundBlendMode: isDarkMode ? 'overlay' : 'multiply'
            }}>
            {/* Encryption Notice */}
            <div className="flex justify-center mb-6">
                <div className={cn(
                    "px-4 py-2 rounded-lg text-center flex items-center gap-2 max-w-[85%] shadow-sm",
                    isDarkMode ? "bg-[#182229] border border-[#222d34] text-[#8696a0]" : "bg-[#fff5c4] text-[#54656f]"
                )}>
                    <svg viewBox="0 0 24 24" width="14" height="14" className="shrink-0"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4-11l-1.5 1.5L11 9.5V15h-2V8.5l3.5 3.5L14.5 9.5 16 11z"></path></svg>
                    <span className="text-[11px] leading-tight font-medium">
                        Messages are end-to-end encrypted. No one outside of this chat, not even WhatsApp, can read or listen to them. Click to learn more.
                    </span>
                </div>
            </div>

            {isMessagesLoading && groupedEntries?.length === 0 && !isSearching ? (
                <div className="flex-1 flex flex-col items-center justify-center h-full pb-20">
                    <div className={cn("p-2.5 flex items-center justify-center rounded-full shadow-md", isDarkMode ? "bg-[#202c33]" : "bg-white")}>
                        <div className="w-5 h-5 border-[3px] border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                </div>
            ) : isSearching && filteredMessage?.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center h-full pb-20 animate-in fade-in zoom-in-95 duration-500">
                    <div className={cn("w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-xl transform rotate-12 transition-all", isDarkMode ? "bg-white/5 border border-white/10" : "bg-slate-50 border border-slate-200")}>
                        <SearchX size={40} className={cn("opacity-50", isDarkMode ? "text-white" : "text-slate-400")} />
                    </div>
                    <div className="text-center space-y-2">
                        <h3 className={cn("text-lg font-bold tracking-tight", isDarkMode ? "text-white" : "text-slate-900")}>
                            No matches found
                        </h3>
                        <p className={cn("text-xs font-medium uppercase tracking-wider max-w-[200px]", isDarkMode ? "text-white/40" : "text-slate-400")}>
                            Try different keywords
                        </p>
                    </div>
                </div>
            ) : groupedEntries?.length > 0 ? (
                groupedEntries?.map(([dateLabel, msgs]: any, index: number) => (
                    <div key={index}>
                        <div className="flex justify-center my-6 sticky top-0 z-10">
                            <span className={cn(
                                "px-4 py-1.5 text-[10px] font-bold uppercase tracking-wide rounded-full shadow-sm backdrop-blur-md border transition-all",
                                isDarkMode
                                    ? "bg-[#1A1A1B]/80 text-white/80 border-white/10 shadow-black/20"
                                    : "bg-white/80 text-slate-600 border-slate-200 shadow-slate-200/50"
                            )}>
                                {dateLabel}
                            </span>
                        </div>
                        {msgs.map((msg: any, msgIndex: number) => {
                            const isOutgoing = msg.sender !== 'user';
                            const isTemplate = isTemplateMessage(msg);
                            // Check message_type OR if it has interactive_payload
                            const isInteractive = msg.message_type === 'interactive' || !!msg.interactive_payload;

                            // Extract template buttons for rendering outside bubble
                            const msgTemplateButtons = isTemplate ? extractButtonsFromText(msg.message || '') : [];

                            // Extract interactive buttons for rendering outside bubble
                            const msgInteractiveButtons = isInteractive ? extractInteractiveButtons(msg.interactive_payload) : [];

                            // Debug log for interactive messages
                            if (msg.interactive_payload) {
                                
                            }

                            return (
                                <div key={msg.id || msgIndex} data-wamid={msg.wamid || undefined} className={cn("flex px-4 py-1", isOutgoing ? 'justify-end' : 'justify-start')}>
                                    <div className={isTemplate || isInteractive ? "w-full max-w-[320px]" : "max-w-[85%]"}>
                                        {/* Message Bubble */}
                                        <div className={cn(
                                            "min-w-[60px] w-full rounded-lg shadow-sm relative group overflow-hidden p-2 break-words",
                                            isOutgoing
                                                ? (isDarkMode ? 'bg-[#005c4b] text-[#e9edef]' : 'bg-[#d9fdd3] text-[#111b21]')
                                                : (isDarkMode ? 'bg-[#202c33] text-[#e9edef]' : 'bg-white text-[#111b21]'),
                                            msg.status === 'failed' && isOutgoing && 'border border-red-500/50 opacity-70'
                                        )}>
                                            <SenderIndicator
                                                sender={msg.sender}
                                                senderName={msg.sender_id}
                                                isDarkMode={isDarkMode}
                                                isOutgoing={isOutgoing}
                                            />
                                            <MessageContent msg={msg} searchText={searchText} isDarkMode={isDarkMode} isOutgoing={isOutgoing} />
                                            <div className={cn(
                                                "flex items-center justify-end space-x-1 opacity-60",
                                                isTemplate || isInteractive ? "px-1 pb-0.5 pt-1" : ""
                                            )}>
                                                {/* Show "Not delivered" for failed messages */}
                                                {msg.status === 'failed' && isOutgoing && (
                                                    <span className="text-[10px] text-red-500 mr-1">Not delivered</span>
                                                )}
                                                <span className="text-[10px]">
                                                    {formattedTime(msg.created_at || msg.timestamp)}
                                                </span>
                                                {isOutgoing && (
                                                    <MessageStatusTicks status={msg.status} />
                                                )}
                                            </div>
                                        </div>

                                        {/* Template CTA Buttons — separate cards below bubble (WhatsApp style) */}
                                        {isTemplate && msgTemplateButtons.length > 0 && (
                                            <div className="mt-1 space-y-1">
                                                {msgTemplateButtons.map((btn, btnIndex) => {
                                                    const Icon = btn.type === 'phone' ? Phone : btn.type === 'url' ? Link : Reply;

                                                    return (
                                                        <div
                                                            key={btnIndex}
                                                            className={cn(
                                                                "w-full py-2.5 px-4 rounded-lg text-[13px] font-medium text-center border transition-all cursor-default",
                                                                isDarkMode
                                                                    ? 'bg-[#1c2c33] text-emerald-400 border-emerald-500/20'
                                                                    : 'bg-white text-emerald-700 border-emerald-300 shadow-sm'
                                                            )}
                                                        >
                                                            <div className="flex items-center justify-center gap-2">
                                                                <Icon size={14} />
                                                                <span>{btn.text}</span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {/* Interactive Buttons — flex layout below bubble */}
                                        {isInteractive && msgInteractiveButtons.length > 0 && (
                                            <div className="mt-2 flex gap-2 flex-wrap">
                                                {msgInteractiveButtons.map((btn, btnIndex) => {
                                                    return (
                                                        <button
                                                            key={btnIndex}
                                                            className={cn(
                                                                "flex-1 min-w-[100px] py-2 px-3 rounded-lg text-[12px] font-semibold text-center transition-all cursor-pointer border",
                                                                isDarkMode
                                                                    ? 'bg-[#1c2c33] text-emerald-400 border-emerald-500/30 hover:bg-[#243a40]'
                                                                    : 'bg-white text-emerald-700 border-emerald-300 shadow-sm hover:bg-emerald-50'
                                                            )}
                                                        >
                                                            <span className="truncate">{btn.text}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-center px-8 pb-10">
                    <div className={cn("p-4 rounded-2xl mb-4", isDarkMode ? 'bg-white/5 text-white/50' : 'bg-slate-100 text-slate-400')}>
                        <MessageSquareText size={40} />
                    </div>
                    <h3 className={cn("text-lg font-bold mb-2", isDarkMode ? 'text-white' : 'text-slate-900')}>
                        No messages yet
                    </h3>
                    <p className={cn("text-sm max-w-md", isDarkMode ? 'text-white/60' : 'text-slate-600')}>
                        Start the conversation by sending a message safely through WhatsNexus.
                    </p>
                </div>
            )}

            {isAiTyping && (
                <div className="flex justify-end px-4 py-1 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className={cn(
                        "p-3 rounded-2xl shadow-sm bg-white/10 backdrop-blur-md border border-white/5 flex items-center space-x-2",
                        isDarkMode ? "bg-[#005c4b] text-[#e9edef]" : "bg-[#d9fdd3] text-[#111b21]"
                    )}>
                        <div className="flex space-x-1">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" />
                        </div>
                        <span className={cn("text-[11px] font-bold uppercase tracking-wider", isDarkMode ? "text-emerald-400/80" : "text-emerald-600/80")}>
                            AI is thinking
                        </span>
                    </div>
                </div>
            )}
            <div ref={bottomRef} className="pb-14" />
        </div>
    );
};
