import React from 'react';
import { SearchX, MessageSquareText, Send, FileText, Download } from 'lucide-react';
import { cn } from "@/lib/utils";
import { MessageStatusTicks, formattedTime } from '../chats/ChatUtils';

// Extract media from template message format "[TYPE: url]"
const extractMediaFromText = (message: string) => {
    if (!message) return null;
    const match = message.match(/^\[(VIDEO|IMAGE|DOCUMENT):?\s*([^\]\n]+)?\]/i);
    if (!match) return null;
    const url = match[2]?.trim();
    return { type: match[1].toLowerCase(), url: url && url.length > 0 ? url : null };
};

// Strip media prefix, buttons, and variable placeholders from message
const cleanMessageText = (message: string) => {
    if (!message) return '';
    let text = message
        .replace(/^\[(VIDEO|IMAGE|DOCUMENT):?\s*[^\]]*\]\n?/i, '') // Remove media prefix
        .replace(/\n?\[Button:\s*[^\]]+\]/gi, '') // Remove button markers
        .replace(/\{\{\d+\}\}/g, '') // Remove variable placeholders like {{1}}
        .trim();
    return text;
};

interface HistoryMessageListProps {
    isDarkMode: boolean;
    isMessagesLoading: boolean;
    isSearching: boolean;
    filteredMessage: any[];
    groupedEntries: any[];
    bottomRef: React.RefObject<HTMLDivElement | null>;
    selectedChat: any;
    setIsTemplateModalOpen: (isOpen: boolean) => void;
}

export const HistoryMessageList: React.FC<HistoryMessageListProps> = ({
    isDarkMode,
    isMessagesLoading,
    isSearching,
    filteredMessage,
    groupedEntries,
    bottomRef,
    selectedChat,
    setIsTemplateModalOpen
}) => {
    return (
        <div className="flex-1 flex flex-col min-h-0 relative">
            {/* Messages Area with WhatsApp Background */}
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
                            Messages are end-to-end encrypted. History conversations are read-only until re-initiated.
                        </span>
                    </div>
                </div>

                {isMessagesLoading ? (
                    <div className="space-y-6">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="space-y-4">
                                <div className="flex justify-start">
                                    <div className={cn("w-[60%] h-16 rounded-[1.2rem] animate-pulse", isDarkMode ? "bg-white/5" : "bg-slate-100")} />
                                </div>
                                <div className="flex justify-end">
                                    <div className={cn("w-[60%] h-12 rounded-[1.2rem] animate-pulse", isDarkMode ? "bg-white/10" : "bg-slate-200")} />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : isSearching && filteredMessage?.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center h-full pb-20">
                        <SearchX size={40} className="text-slate-400 mb-2 opacity-50" />
                        <p className="text-sm text-slate-500">No matches found</p>
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
                                const embeddedMedia = extractMediaFromText(msg.message);
                                const effectiveType = embeddedMedia?.type || msg.message_type;
                                const effectiveUrl = embeddedMedia?.url || (msg.media_url && !msg.media_url.startsWith("meta_media_id:") ? msg.media_url : null);
                                const bodyText = cleanMessageText(msg.message);

                                return (
                                    <div key={msg.id || msgIndex} className={cn("flex px-4 py-1", isOutgoing ? 'justify-end' : 'justify-start')}>
                                        <div className={cn(
                                            "max-w-[85%] min-w-[60px] p-2 rounded-lg shadow-sm relative group",
                                            isOutgoing
                                                ? (isDarkMode ? 'bg-[#005c4b] text-[#e9edef]' : 'bg-[#d9fdd3] text-[#111b21]')
                                                : (isDarkMode ? 'bg-[#202c33] text-[#e9edef]' : 'bg-white text-[#111b21]')
                                        )}>
                                            {/* Video */}
                                            {effectiveType === "video" && effectiveUrl && (
                                                <video src={effectiveUrl} controls className="rounded-lg max-w-full max-h-64 mb-1 w-full" preload="metadata" />
                                            )}
                                            {effectiveType === "video" && !effectiveUrl && (
                                                <div className={cn("flex items-center gap-2 mb-1 px-2 py-2 rounded-lg text-sm", isDarkMode ? "bg-white/10" : "bg-black/5")}>
                                                    <span>🎬</span><span className="opacity-70">Video</span>
                                                </div>
                                            )}
                                            {/* Image */}
                                            {effectiveType === "image" && effectiveUrl && (
                                                <img src={effectiveUrl} alt="media" className="rounded-lg max-w-full max-h-64 mb-1 object-cover" />
                                            )}
                                            {effectiveType === "image" && !effectiveUrl && (
                                                <div className={cn("flex items-center gap-2 mb-1 px-2 py-2 rounded-lg text-sm", isDarkMode ? "bg-white/10" : "bg-black/5")}>
                                                    <span>🖼️</span><span className="opacity-70">Image</span>
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
                                            {/* Text body */}
                                            {effectiveType !== "document" && bodyText && (
                                                <p className="text-[15px] leading-relaxed whitespace-pre-wrap mb-1 px-1">
                                                    {bodyText}
                                                </p>
                                            )}
                                            <div className="flex items-center justify-end space-x-1 opacity-60">
                                                <span className="text-[10px]">
                                                    {formattedTime(msg.created_at)}
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
                    <div className="flex flex-col items-center justify-center h-full text-center px-8">
                        <div className={cn("p-4 rounded-2xl mb-4", isDarkMode ? 'bg-white/5 text-white/50' : 'bg-slate-100 text-slate-400')}>
                            <MessageSquareText size={40} />
                        </div>
                        <h3 className={cn("text-lg font-bold mb-2", isDarkMode ? 'text-white' : 'text-slate-900')}>
                            No messages yet
                        </h3>
                        <p className={cn("text-sm mb-6 max-w-md", isDarkMode ? 'text-white/60' : 'text-slate-600')}>
                            This history thread is currently empty.
                        </p>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>
        </div>
    );
};
