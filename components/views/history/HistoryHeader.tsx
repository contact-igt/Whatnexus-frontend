import React from 'react';
import { Search, User, Info, X } from 'lucide-react';
import { cn } from "@/lib/utils";

interface HistoryHeaderProps {
    isDarkMode: boolean;
    selectedChat: any;
    isSearchVisible: boolean;
    setIsSearchVisible: (visible: boolean) => void;
    messageSearchText: string;
    setMessageSearchText: (text: string) => void;
    handleMessageSearch: (e: any) => void;
}

export const HistoryHeader: React.FC<HistoryHeaderProps> = ({
    isDarkMode,
    selectedChat,
    isSearchVisible,
    setIsSearchVisible,
    messageSearchText,
    setMessageSearchText,
    handleMessageSearch
}) => {
    return (
        <>
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
                    <button
                        onClick={() => {
                            setIsSearchVisible(!isSearchVisible);
                            if (!isSearchVisible) setMessageSearchText('');
                        }}
                        className={cn("p-2 rounded-full", isDarkMode ? "hover:bg-[#3b4a54] text-slate-400" : "hover:bg-gray-200 text-slate-500", isSearchVisible && "text-emerald-500 bg-emerald-500/10")}
                    >
                        <Search size={20} />
                    </button>
                    <button className={cn("p-2 rounded-full", isDarkMode ? "hover:bg-[#3b4a54] text-slate-400" : "hover:bg-gray-200 text-slate-500")}>
                        <Info size={20} />
                    </button>
                </div>
            </div>

            {/* Search Bar Detail */}
            {isSearchVisible && (
                <div className={cn("px-4 py-2 border-b animate-in slide-in-from-top-2", isDarkMode ? "bg-[#202c33] border-white/5" : "bg-white border-slate-200")}>
                    <div className="relative group">
                        <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 text-slate-400")} size={14} />
                        <input
                            onChange={handleMessageSearch}
                            value={messageSearchText}
                            type="text"
                            placeholder="Search in conversation..."
                            className={cn(
                                "w-full rounded-2xl py-1.5 pl-9 pr-4 text-xs transition-all focus:outline-none border",
                                isDarkMode ? "bg-[#2a3942] text-white border-transparent" : "bg-gray-100 text-slate-900 border-slate-200"
                            )}
                        />
                    </div>
                </div>
            )}
        </>
    );
};
