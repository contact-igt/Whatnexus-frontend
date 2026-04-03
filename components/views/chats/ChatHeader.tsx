import React from 'react';
import { Search, User, Plus, X, RefreshCw } from 'lucide-react';
import { cn } from "@/lib/utils";

interface ChatHeaderProps {
    isDarkMode: boolean;
    selectedChat: any;
    messageSearchText: string;
    setMessageSearchText: (text: string) => void;
    onRefresh?: () => Promise<void>;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
    isDarkMode,
    selectedChat,
    messageSearchText,
    setMessageSearchText,
    onRefresh,
}) => {
    const [isSearchOpen, setIsSearchOpen] = React.useState(false);
    const [isRefreshing, setIsRefreshing] = React.useState(false);

    const handleRefresh = async () => {
        if (!onRefresh || isRefreshing) return;
        setIsRefreshing(true);
        try {
            await onRefresh();
        } finally {
            setIsRefreshing(false);
        }
    };

    // Close search if text is cleared and it loses focus? 
    // Actually just keep it simple: toggle with icon and X button.

    const handleOpenSearch = () => {
        setIsSearchOpen(true);
    };

    const handleCloseSearch = () => {
        setIsSearchOpen(false);
        setMessageSearchText("");
    };

    return (
        <div className={cn("px-4 py-2 border-b flex items-center justify-between shrink-0 h-[60px]", isDarkMode ? "bg-[#202c33] border-white/5" : "bg-[#f0f2f5] border-slate-200")}>
            <div className="flex items-center space-x-3 cursor-pointer min-w-0">
                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm overflow-hidden shrink-0", isDarkMode ? 'bg-[#3b4a54] text-slate-300' : 'bg-slate-200 text-slate-500')}>
                    {selectedChat?.name ? selectedChat?.name?.split("")[0].toUpperCase() : <User size={20} />}
                </div>
                {!isSearchOpen && (
                    <div className="min-w-0 animate-in fade-in slide-in-from-left-2 duration-300">
                        <h3 className={cn("font-medium text-sm truncate", isDarkMode ? 'text-[#e9edef]' : 'text-slate-900')}>
                            {selectedChat?.name || selectedChat?.phone}
                        </h3>
                        <p className={cn("text-[11px] truncate", isDarkMode ? "text-slate-400" : "text-slate-500")}>
                            {selectedChat?.phone}
                        </p>
                    </div>
                )}
            </div>
            
            <div className="flex items-center space-x-2">
                <div className={cn(
                    "relative flex items-center transition-all duration-300 ease-in-out",
                    isSearchOpen ? "w-64" : "w-10"
                )}>
                    {isSearchOpen ? (
                        <div className="w-full relative animate-in zoom-in-95 duration-200">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                autoFocus
                                value={messageSearchText}
                                onChange={(e) => setMessageSearchText(e.target.value)}
                                onBlur={() => {
                                    if (!messageSearchText) setIsSearchOpen(false);
                                }}
                                placeholder="Search messages..."
                                className={cn(
                                    "w-full rounded-full py-1.5 pl-9 pr-8 text-xs focus:outline-none border shadow-sm transition-all animate-in slide-in-from-right-4",
                                    isDarkMode
                                        ? "bg-[#2a3942] text-white border-transparent focus:border-emerald-500/50"
                                        : "bg-white text-slate-900 border-slate-200 focus:border-emerald-500/50"
                                )}
                            />
                            <button
                                onClick={handleCloseSearch}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-200/50 text-slate-400"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handleOpenSearch}
                            className={cn(
                                "p-2 rounded-full transition-all hover:scale-110 active:scale-90",
                                isDarkMode ? "hover:bg-[#3b4a54] text-slate-400" : "hover:bg-gray-200 text-slate-500"
                            )}
                        >
                            <Search size={20} />
                        </button>
                    )}
                </div>

                {!isSearchOpen && (
                    <>
                        <button
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className={cn(
                                "p-2 rounded-full transition-all hover:scale-110 active:scale-90 disabled:opacity-50",
                                isDarkMode ? "hover:bg-[#3b4a54] text-slate-400" : "hover:bg-gray-200 text-slate-500"
                            )}
                            title="Refresh messages"
                        >
                            <RefreshCw size={18} className={cn(isRefreshing && "animate-spin")} />
                        </button>
                        <button className={cn("p-2 rounded-full transition-all hover:scale-110 active:scale-90", isDarkMode ? "hover:bg-[#3b4a54] text-slate-400" : "hover:bg-gray-200 text-slate-500")}>
                            <Plus size={20} />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};
