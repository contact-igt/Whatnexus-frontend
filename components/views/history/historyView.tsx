
"use client";
import { useEffect, useRef, useState } from 'react';
import { Search, Brain, X, ClipboardList, Info, History as HistoryIcon, Wand2, Plus, Mic, Send, Sparkles, User, Loader2, MessageSquareOff, MessageSquareDashed, SearchX, MessageCircle, MessageSquareText } from 'lucide-react';
import { GlassCard } from "@/components/ui/glassCard";
import { cn } from "@/lib/utils";
import { useAddMessageMutation, useChatSuggestMutation, useGetAllChatsQuery, useGetAllHistoryChatsQuery, useMessagesByPhoneQuery, useSendTemplateMessageMutation, useUpdateSeenMutation } from '@/hooks/useMessagesQuery';
import { callOpenAI } from '@/lib/openai';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/redux/selectors/auth/authSelector';
import { socket } from "@/utils/socket";
import { useRouter, useSearchParams } from 'next/navigation';
import { WeeklyChatSummaryModal } from '../weeklyChatSummaryModal';
import { TemplateSelectionModal, ProcessedTemplate } from "@/components/campaign/templateSelectionModal";
import { TemplateVariableModal } from './templateVariableModal';
import { WhatsAppConnectionPlaceholder } from '../whatsappConfiguration/whatsappConnectionPlaceholder';


const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    const diffDays =
        (startOfToday.getTime() - startOfDate.getTime()) / (1000 * 60 * 60 * 24);

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7)
        return date.toLocaleDateString("en-US", { weekday: "long" });

    return date.toLocaleDateString("en-GB");
};


const formattedTime = (dateString: any) => {
    if (!dateString) return "";

    const date = new Date(dateString);

    return date.toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
}


export const HistoryView = () => {
    const { user, whatsappApiDetails } = useAuth();
    if (whatsappApiDetails?.status !== 'active') {
        return <WhatsAppConnectionPlaceholder />;
    }
    const { isDarkMode } = useTheme();
    const bottomRef = useRef<HTMLDivElement>(null);
    const [newMessage, setNewMessage] = useState<any[]>([]);
    const {
        data: chatHistoryList,
        isLoading: isChatsLoading,
        isError: isChatsError,
    } = useGetAllHistoryChatsQuery();
    const [filteredChats, setFilteredChats] = useState(chatHistoryList?.data?.chats);
    const { mutate: sendMessageMutate, isPending } = useAddMessageMutation();
    const [messageSearchText, setMessageSearchText] = useState("");
    const [filteredMessage, setFilteredMessage] = useState<any[]>([]);
    const { mutate: sendTemplateMutate, isPending: isSendingTemplate } = useSendTemplateMessageMutation();
    const [chatSearchText, setChatSearchText] = useState("");
    const [selectedChat, setSelectedChat] = useState<any>(null);
    const {
        data: messagesData,
        isLoading: isMessagesLoading,
        isError: isMessagesError,
    } = useMessagesByPhoneQuery(selectedChat?.phone);
    const { mutateAsync: chatSuggestMutate, isPending: isSuggesting } = useChatSuggestMutation();
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [chatSummary, setChatSummary] = useState<string | null>(null);
    const { mutate: updateSeenMutate } = useUpdateSeenMutation();
    const [message, setMessage] = useState<string>("");
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [isWeeklySummaryOpen, setIsWeeklySummaryOpen] = useState(false);
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const [isVariableModalOpen, setIsVariableModalOpen] = useState(false);
    const [selectedTemplateForVariables, setSelectedTemplateForVariables] = useState<ProcessedTemplate | null>(null);
    const [isChatClosed, setIsChatClosed] = useState(true); // Simulating closed chat state
    const router = useRouter();
    const selectedChatRef = useRef<any>(null);
    const searchParams = useSearchParams();
    const phoneParam = searchParams.get('phone');

    const [chatFilter, setChatFilter] = useState<'all' | 'read' | 'unread'>('all');

    const handleInputChange = (e: any) => {
        setMessage(e.target.value);
    }

    const handleChatSearch = (e: any) => {
        setChatSearchText(e.target.value);
    }

    const handleMessageSearch = (e: any) => {
        setMessageSearchText(e.target.value);
    }

    const handleSelectChat = (chat: any) => {
        if (selectedChat?.phone === chat.phone) return;
        setSelectedChat({
            phone: chat?.phone,
            contact_id: chat?.contact_id,
            name: chat?.name ?? chat.phone,
        });
        setMessage("");
        setChatSummary(null);
        router.replace(`?phone=${chat.phone}`, { scroll: false });
    };

    useEffect(() => {
        if (!selectedChat?.phone) return;
        if (!chatHistoryList?.data?.chats?.length) return;

        const hasUnreadUserMessages = chatHistoryList.data.chats.some(
            (msg: any) => msg.seen === "false"
        );
        if (hasUnreadUserMessages) {
            updateSeenMutate(selectedChat?.phone);
        }
    }, [selectedChat?.phone, chatHistoryList?.data?.chats]);

    const groupMessagesByDate = (messages: any[] = []) => {
        return messages?.reduce((groups: any, msg: any) => {
            const label = getDateLabel(msg.created_at || msg.timestamp);

            if (!groups[label]) {
                groups[label] = [];
            }

            groups[label].push(msg);
            return groups;
        }, {});
    };
    console.log("selectedChat", selectedChat)

    const handleTemplateSelect = (template: ProcessedTemplate) => {
        // Check for variables in header or body
        const hasHeaderVars = template.headerText && /\{\{\d+\}\}/.test(template.headerText);
        const hasBodyVars = template.variables > 0 || (template.description && /\{\{\d+\}\}/.test(template.description));

        if (hasHeaderVars || hasBodyVars) {
            // Open variable modal
            setSelectedTemplateForVariables(template);
            setIsVariableModalOpen(true);
        } else {
            // No variables, send immediately
            sendTemplateMutate({
                phone: selectedChat?.phone,
                contact_id: selectedChat?.contact_id,
                template_id: template.id,
                components: []
            });
            setIsChatClosed(false);
            setSelectedChat(null);
            setMessage("");
        }
    };

    const handleSendWithVariables = (components: any[]) => {
        if (!selectedTemplateForVariables) return;

        sendTemplateMutate({
            phone: selectedChat?.phone,
            contact_id: selectedChat?.contact_id,
            template_id: selectedTemplateForVariables.id,
            components: components
        });
        setIsChatClosed(false);
        setSelectedChat(null);
        setMessage("");
        setSelectedTemplateForVariables(null);
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            const value = chatSearchText.trim().toLowerCase();
            let filtered = chatHistoryList?.data?.chats;
            if (value) {
                filtered = filtered?.filter((chat: any) => chat?.name?.toLowerCase().includes(value) || chat?.phone?.includes(value));
            }
            if (chatFilter === 'read') {
                filtered = filtered?.filter((chat: any) => chat?.seen == "true");
            } else if (chatFilter === 'unread') {
                filtered = filtered?.filter((chat: any) => chat?.seen == "false" || chat?.seen == null);
            }
            setFilteredChats(filtered);
        }, 200);

        return () => clearTimeout(timer);
    }, [chatSearchText, chatHistoryList, chatFilter])

    useEffect(() => {
        const value = messageSearchText?.trim().toLowerCase();
        let messagesToFilter = messagesData?.data;

        if (!value) {
            setFilteredMessage(messagesToFilter ?? []);
            return;
        }
        const filtered = messagesToFilter?.filter((msg: any) =>
            msg?.message?.toLowerCase().includes(value)
        );
        setFilteredMessage(filtered);

    }, [messageSearchText, selectedChat, messagesData]);

    useEffect(() => {
        if (!chatHistoryList?.data?.chats?.length) return;
        if (phoneParam) {
            const chatFromUrl = chatHistoryList.data.chats.find(
                (c: any) => String(c.phone) === String(phoneParam)
            );

            if (chatFromUrl) {
                setSelectedChat({
                    phone: chatFromUrl.phone,
                    contact_id: chatFromUrl.contact_id,
                    name: chatFromUrl.name ?? chatFromUrl.phone,
                });
                return;
            }
        }
        // Don't auto-select first chat - let user click to select
        setSelectedChat(null);
    }, [chatHistoryList?.data?.chats, phoneParam]);

    const isSearching = messageSearchText.trim().length > 0;
    const updatedMessageData =
        newMessage.length > 0
            ? [...(messagesData?.data ?? []), ...newMessage]
            : messagesData?.data ?? [];
    const displayMessages = isSearching
        ? filteredMessage ?? []
        : updatedMessageData ?? [];
    const groupedMessages = groupMessagesByDate(displayMessages);
    const groupedEntries = Object.entries(groupedMessages);

    useEffect(() => {
        bottomRef?.current?.scrollIntoView({
            behavior: "smooth",
        })
    }, [groupedMessages])

    const suggestReply = async () => {
        try {
            const response = await chatSuggestMutate({
                phone: selectedChat?.phone,
            });
            setMessage(response?.data);
        } catch (err) {
            console.error(err);
        }
    };

    const summarizeChat = async () => {
        setIsSummarizing(true);
        setChatSummary(null);
        try {
            const history = messagesData?.data?.map((m: any) => `${m.sender}: ${m.message}`).join('\n');
            const prompt = `Summarize this conversation between a business AI receptionist and a lead named ${selectedChat?.name || selectedChat?.phone}. 
      Highlight the key needs of the lead and any pending action items. Keep it under 40 words.
      History:\n${history}`;
            const result = await callOpenAI(prompt, "You are a concise business analyst.");
            setChatSummary(result);
        } catch (err) {
            setChatSummary("Unable to generate neural brief. Retry sync.");
        } finally {
            setIsSummarizing(false);
        }
    };

    useEffect(() => {
        setNewMessage([]);
    }, [selectedChat?.phone]);

    useEffect(() => {
        selectedChatRef.current = selectedChat;
    }, [selectedChat]);

    const handleIncomingMessage = (data: any) => {
        console.log("📩 New message received:", data);

        if (selectedChatRef.current?.phone === data.phone) {
            setNewMessage(prev => [...prev, data]);
        }

        setFilteredChats((prev: any) => {
            if (!prev) return prev;

            const index = prev.findIndex((c: any) => c.phone === data.phone);

            if (index !== -1) {
                const updated = [...prev];
                updated[index] = {
                    ...updated[index],
                    name: data.name,
                    message: data.message,
                    last_message_time: data.created_at,
                    seen: "false",
                };

                return [
                    updated[index],
                    ...updated.filter((_, i) => i !== index),
                ];
            }

            return [
                {
                    phone: data.phone,
                    name: data.name,
                    message: data.message,
                    last_message_time: data.created_at,
                    seen: "false",
                },
                ...prev,
            ];
        });
    };

    useEffect(() => {
        if (!user?.tenant_id) return;

        if (!socket.connected) {
            socket.connect();
        }

        socket.on("connect", () => {
            console.log("✅ Dashboard connected:", socket.id);
            socket.emit("join-tenant", user.tenant_id);
        });

        socket.off("new-message"); // ⬅️ prevent duplicates
        socket.on("new-message", handleIncomingMessage);

        socket.on("session-activated", (data: any) => {
            console.log("✅ Session Activated:", data);
            // Optionally redirect to live chats or refresh list
            // router.push(`/sharedInbox/live-chats?phone=${data.phone}`);
            // For now, we'll just invalidate queries to refresh the list
        });

        return () => {
            socket.off("new-message", handleIncomingMessage);
            socket.off("session-activated");
            socket.off("connect");
        };
    }, []);

    useEffect(() => {
        if (groupedEntries?.length > 0) {
            setTimeout(() => {
                bottomRef?.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "end"
                });
            }, 100);
        }
    }, [selectedChat?.phone, groupedEntries?.length]);
    console.log("filteredChat", filteredChats)
    if (!whatsappApiDetails?.phone_number_id) {
        return (
            <div className="flex h-full flex-col items-center justify-center p-6 space-y-6 animate-in fade-in duration-500">
                <GlassCard isDarkMode={isDarkMode} className="p-10 flex flex-col items-center text-center max-w-sm border-dashed">
                    <div className={cn("w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-xl transform rotate-3 transition-all", isDarkMode ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-emerald-50 border border-emerald-200")}>
                        <MessageCircle size={40} className="text-emerald-500" />
                    </div>
                    <h3 className={cn("text-xl font-bold mb-2", isDarkMode ? "text-white" : "text-slate-900")}>
                        WhatsApp Not Connected
                    </h3>
                    <p className={cn("text-sm leading-relaxed mb-8", isDarkMode ? "text-white/60" : "text-slate-600")}>
                        Connect your WhatsApp Business API account to start messaging and managing your conversations.
                    </p>
                    <button
                        onClick={() => router.push('/settings/whatsapp-settings')}
                        className="flex items-center space-x-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all"
                    >
                        <MessageCircle size={18} />
                        <span>Connect WhatsApp</span>
                    </button>
                </GlassCard>
            </div>
        );
    }

    return (
        <div className={cn("flex h-[calc(100vh-56px)] overflow-hidden", isDarkMode ? "bg-[#0b141a]" : "bg-[#f0f2f5]")}>
            {/* ── LEFT: Chat List Sidebar ────────────────────────────────────────── */}
            <div className={cn("w-1/3 min-w-[320px] max-w-[450px] flex flex-col border-r shrink-0", isDarkMode ? "bg-[#111b21] border-white/5" : "bg-white border-slate-200")}>
                {/* Search & Filters */}
                <div className="p-3 space-y-3">
                    <div className="relative group">
                        <Search className={cn("absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors", isDarkMode ? "text-slate-500" : "text-slate-400")} size={16} />
                        <input
                            onChange={handleChatSearch}
                            type="text"
                            placeholder="Search history threads"
                            className={cn(
                                "w-full rounded-lg py-2 pl-10 pr-4 text-sm transition-all focus:outline-none",
                                isDarkMode ? "bg-[#202c33] text-white placeholder:text-slate-500" : "bg-gray-100 text-slate-900 placeholder:text-slate-500"
                            )}
                        />
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 px-1">
                        {['All', 'Read', 'Unread'].map(f => {
                            const isActive = (f === 'All' && chatFilter === 'all') || (f === 'Read' && chatFilter === 'read') || (f === 'Unread' && chatFilter === 'unread');
                            return (
                                <button
                                    key={f}
                                    onClick={() => {
                                        if (f === 'All') setChatFilter('all');
                                        if (f === 'Read') setChatFilter('read');
                                        if (f === 'Unread') setChatFilter('unread');
                                    }}
                                    className={cn(
                                        "whitespace-nowrap px-3 py-1 rounded-full text-[13px] font-medium transition-all",
                                        isActive
                                            ? (isDarkMode ? "bg-[#00a884] text-[#111b21]" : "bg-[#00a884] text-white")
                                            : isDarkMode
                                                ? "bg-[#202c33] text-[#aebac1] hover:bg-[#2a3942]"
                                                : "bg-[#f0f2f5] text-[#54656f] hover:bg-gray-200"
                                    )}
                                >
                                    {f}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Chat List */}
                <div className="flex-1 overflow-y-auto no-scrollbar">
                    {isChatsLoading ? (
                        Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className={cn("w-full p-4 flex items-center space-x-3 border-b", isDarkMode ? "border-white/5" : "border-gray-50")}>
                                <div className={cn("w-12 h-12 rounded-full animate-pulse", isDarkMode ? "bg-[#202c33]" : "bg-gray-100")} />
                                <div className="flex-1 space-y-2">
                                    <div className={cn("h-3 w-32 rounded animate-pulse", isDarkMode ? "bg-[#202c33]" : "bg-gray-100")} />
                                    <div className={cn("h-2 w-48 rounded animate-pulse", isDarkMode ? "bg-[#202c33]" : "bg-gray-100")} />
                                </div>
                            </div>
                        ))
                    ) : filteredChats && filteredChats?.length > 0 ? (
                        filteredChats?.map((chat: any, i: number) => (
                            <button
                                key={i}
                                onClick={() => handleSelectChat(chat)}
                                className={cn(
                                    "w-full px-4 py-3 flex items-center space-x-3 transition-all border-b",
                                    selectedChat?.phone === chat?.phone
                                        ? (isDarkMode ? 'bg-[#2a3942]' : 'bg-[#f0f2f5]')
                                        : (isDarkMode ? 'hover:bg-[#202c33] border-white/5' : 'hover:bg-gray-50 border-gray-50')
                                )}
                            >
                                <div className="relative shrink-0">
                                    <div className={cn(
                                        "w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all overflow-hidden",
                                        isDarkMode ? 'bg-[#3b4a54] text-slate-300' : 'bg-slate-200 text-slate-500'
                                    )}>
                                        {chat?.name ? chat?.name?.split("")[0].toUpperCase() : <User size={24} />}
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className={cn("text-base font-medium truncate", isDarkMode ? 'text-white' : 'text-slate-900')}>
                                            {chat?.name || chat.phone}
                                        </span>
                                        <span className={cn("text-[11px]", 
                                            chat?.seen === "false" 
                                                ? (isDarkMode ? 'text-emerald-400 font-bold' : 'text-emerald-600 font-bold') 
                                                : (isDarkMode ? 'text-slate-500' : 'text-slate-400')
                                        )}>
                                            {chat?.last_message_time ? getDateLabel(chat.last_message_time) : ""}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className={cn("text-sm truncate pr-2", isDarkMode ? 'text-slate-400' : 'text-slate-500')}>
                                            {chat.message}
                                        </span>
                                        {chat?.seen === "false" && (
                                            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full shrink-0 animate-pulse" />
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))) : (
                        <div className="flex flex-col items-center justify-center p-10 text-center opacity-50">
                            <MessageSquareOff size={48} className="mb-4 text-slate-500" />
                            <h3 className="text-sm font-bold">No history found</h3>
                        </div>
                    )}
                </div>
            </div>

            {/* ── CENTER: Messaging Area ────────────────────────────────────────── */}
            <div className="flex-1 flex flex-col min-w-0 relative">
                {/* Chat Summary Overlay */}
                {chatSummary && (
                    <div className="absolute inset-x-8 top-20 z-50 animate-in slide-in-from-top-4 fade-in duration-300">
                        <GlassCard isDarkMode={isDarkMode} className="p-5 border-emerald-500/40 bg-emerald-500/10 shadow-2xl relative rounded-xl">
                            <button onClick={() => setChatSummary(null)} className="absolute top-3 right-3 p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white">
                                <X size={14} />
                            </button>
                            <div className="flex items-center space-x-2 mb-2 text-emerald-500">
                                <Brain size={14} className="animate-pulse" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Neural Chat Brief</span>
                            </div>
                            <p className={cn("text-xs leading-relaxed font-medium", isDarkMode ? 'text-white/90' : 'text-slate-800')}>
                                {chatSummary}
                            </p>
                        </GlassCard>
                    </div>
                )}

                <GlassCard isDarkMode={isDarkMode} className="flex-1 flex flex-col min-h-0 relative p-0 overflow-hidden rounded-2xl">
                {selectedChat ? (
                    <>
                        {/* Chat Header */}
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
                                            "w-full rounded-lg py-2 pl-9 pr-4 text-xs transition-all focus:outline-none",
                                            isDarkMode ? "bg-[#2a3942] text-white" : "bg-gray-100 text-slate-900"
                                        )}
                                    />
                                </div>
                            </div>
                        )}

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
                                            const isOutgoing = msg.sender === 'bot' || msg.sender === 'agent' || msg.sender === 'system';
                                            
                                            return (
                                                <div key={msg.id || msgIndex} className={cn("flex px-4 py-1", isOutgoing ? 'justify-end' : 'justify-start')}>
                                                    <div className={cn(
                                                        "max-w-[85%] min-w-[60px] p-2 rounded-lg shadow-sm relative group",
                                                        isOutgoing
                                                            ? (isDarkMode ? 'bg-[#005c4b] text-[#e9edef]' : 'bg-[#d9fdd3] text-[#111b21]')
                                                            : (isDarkMode ? 'bg-[#202c33] text-[#e9edef]' : 'bg-white text-[#111b21]')
                                                    )}>
                                                        <p className="text-[14px] leading-relaxed whitespace-pre-wrap mb-1 px-1">
                                                            {msg.message}
                                                        </p>
                                                        <div className="flex items-center justify-end space-x-1 opacity-60">
                                                            <span className="text-[10px]">
                                                                {formattedTime(msg.created_at)}
                                                            </span>
                                                            {isOutgoing && (
                                                                <svg viewBox="0 0 16 11" width="16" height="11" className="text-emerald-500"><path fill="currentColor" d="M11.053 1.514L5.373 7.194 2.433 4.254a.553.553 0 00-.783.783l3.333 3.333a.553.553 0 00.783 0l6.07-6.07a.553.553 0 00-.783-.783zM15.053 1.514L9.373 7.194l-1.636-1.636a.553.553 0 00-.783.783l2.027 2.027a.553.553 0 00.783 0l6.07-6.07a.553.553 0 00-.783-.783z"></path></svg>
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

                        {/* Bottom Template Area */}
                        {selectedChat && (
                            <div className={cn("px-6 py-4 border-t", isDarkMode ? "bg-[#202c33] border-white/5" : "bg-[#f0f2f5] border-slate-200")}>
                                <div className={cn(
                                    "flex items-center justify-between p-4 rounded-xl border border-dashed transition-all",
                                    isDarkMode ? 'bg-black/20 border-white/10' : 'bg-white/50 border-slate-300'
                                )}>
                                    <div>
                                        <h3 className={cn("text-sm font-bold mb-1", isDarkMode ? 'text-white' : 'text-slate-900')}>
                                            History Thread Closed
                                        </h3>
                                        <p className={cn("text-xs", isDarkMode ? 'text-white/50' : 'text-slate-500')}>
                                            Send a template to re-initiate this conversation.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setIsTemplateModalOpen(true)}
                                        className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all flex items-center space-x-2"
                                    >
                                        <Send size={16} />
                                        <span>Send Template</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-10 opacity-40">
                        <div className="w-24 h-24 rounded-full border-4 border-emerald-500/20 flex items-center justify-center mb-6">
                            <HistoryIcon size={64} className="text-emerald-500" />
                        </div>
                        <h3 className="text-xl font-bold">WhatsApp History Hub</h3>
                        <p className="text-sm mt-2">Select a thread to view archives</p>
                    </div>
                )}
                </GlassCard>
            </div>

            {/* ── RIGHT: Details Panel ────────────────────────────────────────── */}
            {selectedChat && (
                <div className={cn("w-1/4 min-w-[280px] border-l flex flex-col shrink-0", isDarkMode ? "bg-[#111b21] border-white/5" : "bg-white border-slate-200")}>
                    <div className="p-6 flex flex-col items-center border-b space-y-4">
                        <div className={cn("w-24 h-24 rounded-full flex items-center justify-center font-bold text-4xl overflow-hidden", isDarkMode ? 'bg-[#3b4a54] text-slate-300' : 'bg-slate-200 text-slate-500')}>
                            {selectedChat?.name ? selectedChat?.name?.split("")[0].toUpperCase() : <User size={48} />}
                        </div>
                        <div className="text-center">
                            <h3 className={cn("font-bold text-lg", isDarkMode ? "text-white" : "text-slate-900")}>
                                {selectedChat?.name || selectedChat?.phone}
                            </h3>
                            <p className={cn("text-xs mt-1", isDarkMode ? "text-slate-400" : "text-slate-500")}>
                                {selectedChat?.phone}
                            </p>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-8 no-scrollbar">
                        <div>
                            <h4 className={cn("text-[11px] font-bold uppercase tracking-[0.15em] mb-4 opacity-50", isDarkMode ? "text-white" : "text-slate-900")}>
                                Contact Details
                            </h4>
                            <div className="space-y-4">
                                <div className="flex justify-between items-start gap-4">
                                    <span className={cn("text-xs shrink-0", isDarkMode ? "text-slate-400" : "text-slate-500")}>Phone</span>
                                    <span className={cn("text-xs font-semibold text-right", isDarkMode ? "text-slate-200" : "text-slate-800")}>{selectedChat?.phone}</span>
                                </div>
                                <div className="flex justify-between items-start gap-4">
                                    <span className={cn("text-xs shrink-0", isDarkMode ? "text-slate-400" : "text-slate-500")}>Last Active</span>
                                    <span className={cn("text-xs font-semibold text-right", isDarkMode ? "text-slate-200" : "text-slate-800")}>
                                        {selectedChat?.last_message_time ? getDateLabel(selectedChat.last_message_time) : "N/A"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100 dark:border-white/5">
                            <div className="space-y-3">
                                <button 
                                    onClick={summarizeChat}
                                    disabled={isSummarizing}
                                    className="w-full h-10 flex items-center justify-center space-x-2 bg-blue-600/10 text-blue-500 px-4 rounded-xl text-xs font-bold uppercase hover:bg-blue-600/20 transition-colors disabled:opacity-50"
                                >
                                    {isSummarizing ? (
                                        <Loader2 size={14} className="animate-spin" />
                                    ) : (
                                        <Brain size={14} />
                                    )}
                                    <span>Neural Summary</span>
                                </button>
                                <button 
                                    onClick={() => setIsWeeklySummaryOpen(true)}
                                    className="w-full h-10 flex items-center justify-center space-x-2 bg-emerald-600/10 text-emerald-500 px-4 rounded-xl text-xs font-bold uppercase hover:bg-emerald-600/20 transition-colors"
                                >
                                    <HistoryIcon size={14} />
                                    <span>Full History Summary</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Weekly Summary Modal */}
            <WeeklyChatSummaryModal
                isOpen={isWeeklySummaryOpen}
                onClose={() => setIsWeeklySummaryOpen(false)}
                chatName={selectedChat?.name || selectedChat?.phone}
                chatPhone={selectedChat?.phone}
                isDarkMode={isDarkMode}
            />

            {/* Template Selection Modal */}
            <TemplateSelectionModal
                isOpen={isTemplateModalOpen}
                onClose={() => setIsTemplateModalOpen(false)}
                onSelect={handleTemplateSelect}
            />

            {/* Template Variable Input Modal */}
            <TemplateVariableModal
                isOpen={isVariableModalOpen}
                onClose={() => setIsVariableModalOpen(false)}
                template={selectedTemplateForVariables}
                onSend={handleSendWithVariables}
                isDarkMode={isDarkMode}
                isPending={isSendingTemplate}
            />
        </div>
    );
};
