import React from 'react';
import { Plus, Send, Mic } from 'lucide-react';
import { cn } from "@/lib/utils";

interface MessageInputProps {
    isDarkMode: boolean;
    message: string;
    handleInputChange: (e: any) => void;
    handleSendMessage: () => void;
    isPending: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
    isDarkMode,
    message,
    handleInputChange,
    handleSendMessage,
    isPending
}) => {
    return (
        <div className={cn("px-4 py-2 flex items-center gap-2 relative z-10 shrink-0", isDarkMode ? "bg-[#202c33]" : "bg-[#f0f2f5]")}>
            <button className={cn("p-2 rounded-full transition-colors shrink-0", isDarkMode ? "hover:bg-[#3b4a54] text-[#aebac1]" : "hover:bg-gray-200 text-slate-500")}>
                <Plus size={24} />
            </button>
            <div className="flex-1 shrink-0 relative min-w-0">
                <textarea
                    rows={1}
                    value={message}
                    onChange={handleInputChange}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                        }
                    }}
                    placeholder="Type a message"
                    className={cn(
                        "w-full rounded-lg py-2.5 px-4 text-[13px] font-medium focus:outline-none resize-none no-scrollbar",
                        isDarkMode ? "bg-[#2a3942] text-[#e9edef] placeholder:text-slate-500" : "bg-white text-slate-900 placeholder:text-slate-500 border-none shadow-sm"
                    )}
                    style={{ minHeight: '44px', maxHeight: '120px' }}
                />
            </div>
            {message.trim() ? (
                <button
                    onClick={handleSendMessage}
                    disabled={isPending}
                    className="p-2.5 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 active:scale-95 transition-all shadow-sm shrink-0"
                >
                    <Send size={20} className="translate-x-[1px]" />
                </button>
            ) : (
                <button className={cn("p-2 rounded-full transition-colors shrink-0", isDarkMode ? "hover:bg-[#3b4a54] text-[#aebac1]" : "hover:bg-gray-200 text-slate-500")}>
                    <Mic size={24} />
                </button>
            )}
        </div>
    );
};
