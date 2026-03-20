import React from 'react';
import { SearchX, MessageSquareText, Sparkles, Wand2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import { MessageStatusTicks, formattedTime } from './ChatUtils';

interface MessageListProps {
    isDarkMode: boolean;
    isMessagesLoading: boolean;
    isSearching: boolean;
    filteredMessage: any[];
    groupedEntries: any[];
    bottomRef: React.RefObject<HTMLDivElement | null>;
    selectedChat: any;
    searchText?: string;
}

export const MessageList: React.FC<MessageListProps> = ({
    isDarkMode,
    isMessagesLoading,
    isSearching,
    filteredMessage,
    groupedEntries,
    bottomRef,
    selectedChat,
    searchText = ""
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
                                        <p className="text-[15px] leading-relaxed whitespace-pre-wrap mb-1 px-1">
                                            {searchText && msg?.message?.toLowerCase().includes(searchText.toLowerCase()) ? (
                                                msg.message.split(new RegExp(`(${searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')).map((part: string, i: number) => (
                                                    part.toLowerCase() === searchText.toLowerCase() ? (
                                                        <mark key={i} className={cn("p-0 px-0.5 rounded-sm inline-block", isDarkMode ? "bg-emerald-500/30 text-emerald-400" : "bg-yellow-200 text-slate-900")}>
                                                            {part}
                                                        </mark>
                                                    ) : part
                                                ))
                                            ) : msg.message}
                                        </p>
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

            <div ref={bottomRef} className="pb-14" />
        </div>
    );
};
