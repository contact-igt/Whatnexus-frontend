import React from 'react';
import { SearchX, MessageSquareText, FileText, Copy, Download, User, Bot, UserCog, Link, Phone, Reply } from 'lucide-react';
import { cn } from "@/lib/utils";
import { MessageStatusTicks, formattedTime } from './ChatUtils';

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
            <div className="flex items-center gap-1.5 mb-1">
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

// Extract buttons from template message format "[Button: text]"
const extractButtonsFromText = (message: string) => {
    const buttonRegex = /\[Button:\s*([^\]]+)\]/gi;
    const buttons: string[] = [];
    let match;
    while ((match = buttonRegex.exec(message)) !== null) {
        buttons.push(match[1].trim());
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

const MessageContent: React.FC<{ msg: any; searchText: string; isDarkMode: boolean }> = ({ msg, searchText, isDarkMode }) => {
    const type = msg.message_type;
    const mediaUrl = msg.media_url;

    // Try to extract embedded media from message text (templates store media as "[VIDEO: url]\nBody text")
    const embeddedMedia = extractMediaFromText(msg.message);
    const effectiveType = embeddedMedia?.type || type;
    const effectiveUrl = embeddedMedia?.url || (mediaUrl && !mediaUrl.startsWith("meta_media_id:") ? mediaUrl : null);

    // Extract buttons from message text
    const hasButtons = msg.message?.includes("[Button:");
    const templateButtons = hasButtons ? extractButtonsFromText(msg.message) : [];

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
                        "text-[13.5px] whitespace-pre-wrap break-words",
                        (effectiveType === "image" || effectiveType === "video" || effectiveType === "document") ? "px-1 pt-2 pb-0.5" : "px-1 py-0.5"
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
                />
            )}
            {effectiveType === "video" && !effectiveUrl && (
                <div className={cn("flex items-center gap-2 mb-1 px-2 py-2 rounded-lg text-sm", isDarkMode ? "bg-white/10" : "bg-black/5")}>
                    <span>🎬</span>
                    <span className="opacity-70">Video</span>
                </div>
            )}

            {/* Image */}
            {effectiveType === "image" && effectiveUrl && (
                <img src={effectiveUrl} alt="media" className="rounded-lg max-w-full max-h-64 mb-1 object-cover" />
            )}
            {effectiveType === "image" && !effectiveUrl && (
                <div className={cn("flex items-center gap-2 mb-1 px-2 py-2 rounded-lg text-sm", isDarkMode ? "bg-white/10" : "bg-black/5")}>
                    <span>🖼️</span>
                    <span className="opacity-70">Image</span>
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

            {/* Audio */}
            {effectiveType === "audio" && effectiveUrl && (
                <audio src={effectiveUrl} controls className="w-full max-w-xs mb-1" />
            )}
            {effectiveType === "audio" && !effectiveUrl && (
                <div className={cn("flex items-center gap-2 mb-1 px-2 py-2 rounded-lg text-sm", isDarkMode ? "bg-white/10" : "bg-black/5")}>
                    <span>🎵</span>
                    <span className="opacity-70">Audio message</span>
                </div>
            )}

            {/* Body text */}
            {bodyText ? (
                <div className="text-[15px] whitespace-pre-wrap mb-1 px-1">
                    {renderFormattedBody(bodyText)}
                </div>
            ) : effectiveType === "text" || (effectiveType === "template" && !embeddedMedia) ? (
                <div className="text-[15px] whitespace-pre-wrap mb-1 px-1">
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
    isAiTyping = false
}) => {
    return (
        <div className={cn(
            "flex-1 overflow-y-auto px-10 py-4 space-y-2 relative no-scrollbar",
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

                            // Extract template buttons for rendering outside bubble
                            const msgTemplateButtons = isTemplate ? extractButtonsFromText(msg.message || '') : [];

                            return (
                                <div key={msg.id || msgIndex} className={cn("flex px-4 py-1", isOutgoing ? 'justify-end' : 'justify-start')}>
                                    <div className={isTemplate ? "max-w-[340px] w-[340px]" : "max-w-[85%]"}>
                                        {/* Message Bubble */}
                                        <div className={cn(
                                            "min-w-[60px] rounded-lg shadow-sm relative group overflow-hidden p-2",
                                            isOutgoing
                                                ? (isDarkMode ? 'bg-[#005c4b] text-[#e9edef]' : 'bg-[#d9fdd3] text-[#111b21]')
                                                : (isDarkMode ? 'bg-[#202c33] text-[#e9edef]' : 'bg-white text-[#111b21]')
                                        )}>
                                            <SenderIndicator
                                                sender={msg.sender}
                                                senderName={msg.sender_id}
                                                isDarkMode={isDarkMode}
                                                isOutgoing={isOutgoing}
                                            />
                                            {isTemplate && msg.sender !== 'user' && <div className="mb-3" />}
                                            <MessageContent msg={msg} searchText={searchText} isDarkMode={isDarkMode} />
                                            <div className={cn(
                                                "flex items-center justify-end space-x-1 opacity-60",
                                                isTemplate ? "px-1 pb-0.5 pt-1" : ""
                                            )}>
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
                                                {msgTemplateButtons.map((btnText, btnIndex) => {
                                                    const isUrl = btnText.toLowerCase().includes('http') || btnText.includes('(') || /visit|view|website|link|shop|buy|book/i.test(btnText);
                                                    const isPhone = /call|phone|\+\d/i.test(btnText);

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
                                                                {isPhone ? (
                                                                    <Phone size={14} />
                                                                ) : isUrl ? (
                                                                    <Link size={14} />
                                                                ) : (
                                                                    <Reply size={14} />
                                                                )}
                                                                <span>{btnText}</span>
                                                            </div>
                                                        </div>
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
