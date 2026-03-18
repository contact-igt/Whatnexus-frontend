import React from 'react';
import { Search, User, Plus, X } from 'lucide-react';
import { cn } from "@/lib/utils";

interface ChatHeaderProps {
    isDarkMode: boolean;
    selectedChat: any;
    messageSearchText: string;
    setMessageSearchText: (text: string) => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
    isDarkMode,
    selectedChat,
    messageSearchText,
    setMessageSearchText,
}) => {
    const isSearching = messageSearchText !== "";

    return (
        <div className={cn("px-4 py-2 border-b flex items-center justify-between shrink-0", isDarkMode ? "bg-[#202c33] border-white/5" : "bg-[#f0f2f5] border-slate-200")}>
            <div className="flex items-center space-x-3 cursor-pointer">
                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm overflow-hidden", isDarkMode ? 'bg-[#3b4a54] text-slate-300' : 'bg-slate-200 text-slate-500')}>
                    {selectedChat?.name ? selectedChat?.name?.split("")[0].toUpperCase() : <User size={20} />}
                </div>
                <div className="min-w-0">
                    <h3 className={cn("font-medium text-sm truncate", isDarkMode ? 'text-[#e9edef]' : 'text-slate-900')}>
                        {selectedChat?.name || selectedChat?.phone}
                    </h3>
                    <p className={cn("text-[11px] truncate", isDarkMode ? "text-slate-400" : "text-slate-500")}>
                        {selectedChat?.phone}
                    </p>
                </div>
            </div>
            <div className="flex items-center space-x-2">
                {isSearching || messageSearchText === "" ? (
                    <div className="relative animate-in slide-in-from-right-2 fade-in duration-200">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            autoFocus
                            value={messageSearchText === " " ? "" : messageSearchText}
                            onChange={(e) => setMessageSearchText(e.target.value)}
                            placeholder="Search messages..."
                            className={cn(
                                "w-48 rounded-full py-1.5 pl-9 pr-8 text-xs focus:outline-none border shadow-sm",
                                isDarkMode
                                    ? "bg-[#2a3942] text-white border-transparent focus:border-emerald-500/50"
                                    : "bg-white text-slate-900 border-slate-200 focus:border-emerald-500/50"
                            )}
                        />
                        <button
                            onClick={() => setMessageSearchText("")}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-200/50 text-slate-400"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setMessageSearchText(" ")}
                        className={cn("p-2 rounded-full", isDarkMode ? "hover:bg-[#3b4a54] text-slate-400" : "hover:bg-gray-200 text-slate-500")}
                    >
                        <Search size={20} />
                    </button>
                )}

                <button className={cn("p-2 rounded-full", isDarkMode ? "hover:bg-[#3b4a54] text-slate-400" : "hover:bg-gray-200 text-slate-500")}>
                    <Plus size={20} />
                </button>
            </div>
        </div>
    );
};
