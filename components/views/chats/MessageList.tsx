import React from 'react';
import { SearchX, MessageSquareText, FileText, Download, ExternalLink, Phone, Copy } from 'lucide-react';
import { cn } from "@/lib/utils";
import { MessageStatusTicks, formattedTime } from './ChatUtils';

// Extracts media URL from "[VIDEO: url]" / "[IMAGE: url]" / "[DOCUMENT: url]" text patterns
const extractMediaFromText = (message: string) => {
    if (!message) return null;
    // Match [TYPE] or [TYPE: url] at the start of message
    // URL can be with or without protocol (http/https)
    const match = message.match(/^\[(VIDEO|IMAGE|DOCUMENT):?\s*([^\]\n]+)?\]/i);
    if (!match) return null;
    const url = match[2]?.trim();
    // Return null URL if it's empty or just whitespace
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

const MessageContent: React.FC<{ msg: any; searchText: string; isDarkMode: boolean }> = ({ msg, searchText, isDarkMode }) => {
    const type = msg.message_type;
    const mediaUrl = msg.media_url;

    // Try to extract embedded media from message text (templates store media as "[VIDEO: url]\nBody text")
    const embeddedMedia = extractMediaFromText(msg.message);

    // Determine effective type: use embedded media type if found, otherwise use message_type
    const effectiveType = embeddedMedia?.type || type;

    // Determine effective URL: prefer embedded URL, then media_url field (filter out meta_media_id placeholders)
    const effectiveUrl = embeddedMedia?.url || (mediaUrl && !mediaUrl.startsWith("meta_media_id:") ? mediaUrl : null);

    // Extract buttons from message text (templates have [Button: text] format)
    const hasButtons = msg.message?.includes("[Button:");
    const templateButtons = hasButtons ? extractButtonsFromText(msg.message) : [];

    // Get body text: strip media prefix and buttons
    let bodyText = msg.message;
    if (embeddedMedia) {
        // Remove the [VIDEO: url] or [IMAGE: url] prefix
        bodyText = msg.message.replace(/^\[(VIDEO|IMAGE|DOCUMENT):?\s*[^\]]*\]\n?/i, "").trim();
    }
    if (hasButtons) {
        bodyText = stripButtonsFromText(bodyText);
    }

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
            {effectiveType === "document" && (
                <div className={cn("flex items-center gap-2 mb-1 px-2 py-2 rounded-lg text-sm", isDarkMode ? "bg-white/10" : "bg-black/5")}>
                    <FileText className="w-4 h-4 shrink-0 opacity-70" />
                    <span className="flex-1 truncate opacity-80">{bodyText || "Document"}</span>
                    {effectiveUrl && (
                        <a href={effectiveUrl} download target="_blank" rel="noreferrer" className="shrink-0 text-emerald-400 hover:text-emerald-300">
                            <Download className="w-4 h-4" />
                        </a>
                    )}
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

            {/* Body text (shown for all types except document which shows it inline) */}
            {effectiveType !== "document" && bodyText ? (
                <p className="text-[15px] leading-relaxed whitespace-pre-wrap mb-1 px-1">
                    {renderText(bodyText)}
                </p>
            ) : effectiveType === "text" || (effectiveType === "template" && !embeddedMedia) ? (
                <p className="text-[15px] leading-relaxed whitespace-pre-wrap mb-1 px-1">
                    {renderText(stripButtonsFromText(msg.message))}
                </p>
            ) : null}

            {/* Template Buttons */}
            {templateButtons.length > 0 && (
                <div className={cn(
                    "flex flex-wrap gap-2 mt-2 pt-2 border-t",
                    isDarkMode ? "border-white/10" : "border-black/10"
                )}>
                    {templateButtons.map((btnText, index) => {
                        // Detect button type based on text patterns
                        const isUrl = btnText.toLowerCase().includes('http') || btnText.includes('(');
                        const isPhone = /call|phone|\+\d/i.test(btnText);

                        return (
                            <div
                                key={index}
                                className={cn(
                                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-default",
                                    isDarkMode
                                        ? "bg-white/10 text-emerald-400 hover:bg-white/15"
                                        : "bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20"
                                )}
                            >
                                {isPhone ? (
                                    <Phone className="w-3 h-3" />
                                ) : isUrl ? (
                                    <ExternalLink className="w-3 h-3" />
                                ) : (
                                    <Copy className="w-3 h-3 opacity-50" />
                                )}
                                <span>{btnText}</span>
                            </div>
                        );
                    })}
                </div>
            )}
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

                            return (
                                <div key={msg.id || msgIndex} className={cn("flex px-4 py-1", isOutgoing ? 'justify-end' : 'justify-start')}>
                                    <div className={cn(
                                        "max-w-[85%] min-w-[60px] p-2 rounded-lg shadow-sm relative group",
                                        isOutgoing
                                            ? (isDarkMode ? 'bg-[#005c4b] text-[#e9edef]' : 'bg-[#d9fdd3] text-[#111b21]')
                                            : (isDarkMode ? 'bg-[#202c33] text-[#e9edef]' : 'bg-white text-[#111b21]')
                                    )}>
                                        <MessageContent msg={msg} searchText={searchText} isDarkMode={isDarkMode} />
                                        <div className="flex items-center justify-end space-x-1 opacity-60">
                                            <span className="text-[10px]">
                                                {formattedTime(msg.created_at || msg.timestamp)}
                                            </span>
                                            {isOutgoing && (
                                                <MessageStatusTicks status={msg.status} />
                                            )}
                                        </div>
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
