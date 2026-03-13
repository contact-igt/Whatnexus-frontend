"use client";
import { useEffect, useRef, useState, useMemo } from 'react';
import { Search, Brain, X, ClipboardList, Info, History as HistoryIcon, Wand2, Plus, Mic, Send, Sparkles, User, Loader2, MessageSquareOff, MessageSquareDashed, SearchX, MessageCircle, MessageSquareText, ShieldCheck, UserPlus, Lock, ChevronDown } from 'lucide-react';
import { GlassCard } from "@/components/ui/glassCard";
import { cn } from "@/lib/utils";
import { useAddMessageMutation, useChatSuggestMutation, useGetAllLiveChatsQuery, useMessagesByPhoneQuery, useUpdateSeenMutation, useClaimChatMutation, useAssignAgentMutation, useGetAgentsQuery } from '@/hooks/useMessagesQuery';
import { callOpenAI } from '@/lib/openai';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/redux/selectors/auth/authSelector';
import { socket } from "@/utils/socket";
import { useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { WeeklyChatSummaryModal } from '../weeklyChatSummaryModal';
import { WhatsAppConnectionPlaceholder } from '../whatsappConfiguration/whatsappConnectionPlaceholder';
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Check } from 'lucide-react';

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


export const ChatView = () => {
    const queryClient = useQueryClient();
    const { user, whatsappApiDetails } = useAuth();
    if (whatsappApiDetails?.status !== 'active') {
        return <WhatsAppConnectionPlaceholder />;
    }
    const { isDarkMode } = useTheme();
    const bottomRef = useRef<HTMLDivElement>(null);
    const [newMessage, setNewMessage] = useState<any[]>([]);
    const {
        data: chatList,
        isLoading: isChatsLoading,
        isError: isChatsError,
    } = useGetAllLiveChatsQuery();
    console.log("chatList", chatList?.data)
    const [filteredChats, setFilteredChats] = useState(chatList?.data);
    const { mutate: sendMessageMutate, isPending } = useAddMessageMutation();
    const [messageSearchText, setMessageSearchText] = useState("");
    const [filteredMessage, setFilteredMessage] = useState<any[]>([]);
    const [chatSearchText, setChatSearchText] = useState("");
    const [selectedChat, setSelectedChat] = useState<any>(null);
    const {
        data: messagesData,
        isLoading: isMessagesLoading,
        isError: isMessagesError,
    } = useMessagesByPhoneQuery(selectedChat?.phone);
    const { mutateAsync: chatSuggestMutate, isPending: isSuggesting } = useChatSuggestMutation();
    const [inputValue, setInputValue] = useState('');
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [chatSummary, setChatSummary] = useState<string | null>(null);
    const { mutate: updateSeenMutate } = useUpdateSeenMutation();
    const [message, setMessage] = useState<string>("");
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [isWeeklySummaryOpen, setIsWeeklySummaryOpen] = useState(false);
    const router = useRouter();
    const selectedChatRef = useRef<any>(null);
    const searchParams = useSearchParams();
    const phoneParam = searchParams.get('phone');

    const isAdmin = user?.role === 'tenant_admin';
    const { mutate: claimChatMutate, isPending: isClaiming } = useClaimChatMutation();
    const { mutate: assignAgentMutate, isPending: isAssigning } = useAssignAgentMutation();
    const { data: agentsList } = useGetAgentsQuery();

    const [agentSearch, setAgentSearch] = useState("");
    const filteredAgents = useMemo(() => {
        const agents = agentsList?.data?.filter((agent: any) => agent.role !== 'tenant_admin') || [];
        if (!agentSearch) return agents;
        return agents.filter((agent: any) => 
            agent.username.toLowerCase().includes(agentSearch.toLowerCase()) ||
            agent.role.toLowerCase().includes(agentSearch.toLowerCase())
        );
    }, [agentSearch, agentsList?.data]);

    const [chatFilter, setChatFilter] = useState<'all' | 'read' | 'unread' | 'assigned' | 'unassigned'>('all');

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
            assigned_admin_id: chat?.assigned_admin_id,
            assigned_agent_name: chat?.assigned_agent_name,
        });
        if (selectedChat?.phone !== chat?.phone) {
            setMessage("");
            setChatSummary(null);
        }
        router.replace(`?phone=${chat.phone}`, { scroll: false });
    };

    useEffect(() => {
        if (!selectedChat?.phone) return;
        if (!chatList?.data?.length) return;

        const hasUnreadUserMessages = chatList?.data?.some(
            (msg: any) => msg.seen === "false"
        );
        if (hasUnreadUserMessages) {
            updateSeenMutate(selectedChat?.phone);
        }
    }, [selectedChat?.phone, chatList?.data]);

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
    const handleSendMessage = () => {
        if (!message.trim() || isPending) return;

        const messageText = message.trim();
        sendMessageMutate({
            phone: selectedChat?.phone,
            name: selectedChat?.name,
            message: messageText,
            contact_id: selectedChat?.contact_id,
            phone_number_id: whatsappApiDetails?.phone_number_id
        });
        setMessage("");
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            const value = chatSearchText.trim().toLowerCase();
            const cleanSearch = value.replace(/\D/g, "");
            let filtered = chatList?.data;
            if (value) {
                filtered = filtered?.filter((chat: any) => {
                    const cleanChatPhone = chat?.phone?.replace(/\D/g, "");
                    return chat?.name?.toLowerCase().includes(value) || 
                           chat?.phone?.includes(value) ||
                           (cleanSearch && cleanChatPhone?.includes(cleanSearch));
                });
            }
            if (chatFilter === 'read') {
                filtered = filtered?.filter((chat: any) => chat?.seen == "true");
            } else if (chatFilter === 'unread') {
                filtered = filtered?.filter((chat: any) => chat?.seen == "false" || chat?.seen == null);
            } else if (chatFilter === 'assigned') {
                filtered = filtered?.filter((chat: any) => chat?.assigned_admin_id === user?.tenant_user_id);
            } else if (chatFilter === 'unassigned') {
                filtered = filtered?.filter((chat: any) => !chat?.assigned_admin_id);
            }
            setFilteredChats(filtered);
        }, 200);

        return () => clearTimeout(timer);
    }, [chatSearchText, chatList, chatFilter])

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
        if (!chatList?.data?.length) return;
        if (phoneParam) {
            const cleanParam = phoneParam.replace(/\D/g, "");
            
            // Skip sync if current selection already matches phoneParam (prevents clobbering optimistic state)
            if (selectedChat?.phone === phoneParam) return;

            const chatFromUrl = chatList.data.find(
                (c: any) => {
                    const cleanPhone = String(c.phone).replace(/\D/g, "");
                    return cleanPhone === cleanParam || String(c.phone) === String(phoneParam);
                }
            );

            if (chatFromUrl) {
                setSelectedChat({
                    phone: chatFromUrl.phone,
                    contact_id: chatFromUrl.contact_id,
                    name: chatFromUrl.name ?? chatFromUrl.phone,
                    assigned_admin_id: chatFromUrl.assigned_admin_id,
                    assigned_agent_name: chatFromUrl.assigned_agent_name,
                });
                return;
            }

            const chatFromFiltered = filteredChats?.find(
                (c: any) => {
                    const cleanPhone = String(c.phone).replace(/\D/g, "");
                    return cleanPhone === cleanParam || String(c.phone) === String(phoneParam);
                }
            );


            if (chatFromFiltered) {
                setSelectedChat({
                    phone: chatFromFiltered.phone,
                    contact_id: chatFromFiltered.contact_id,
                    name: chatFromFiltered.name ?? chatFromFiltered.phone,
                    assigned_admin_id: chatFromFiltered.assigned_admin_id,
                    assigned_agent_name: chatFromFiltered.assigned_agent_name,
                });
                return;
            }
        }

    }, [chatList?.data, phoneParam, filteredChats, selectedChat]);

    const isSearching = messageSearchText.trim().length > 0;
    const updatedMessageData = useMemo(() => {
        const dbMessages = messagesData?.data ?? [];
        const socketMessages = newMessage;

        // Create Sets for O(1) lookups
        const dbIds = new Set(dbMessages.map((m: any) => m.id).filter(Boolean));

        // Improve composite key to be less strict on timestamp milliseconds
        // Use ISO string up to minutes: YYYY-MM-DDTHH:MM
        const getCompositeKey = (msg: any) => {
            const date = new Date(msg.created_at || msg.timestamp);
            if (isNaN(date.getTime())) return `${msg.message?.trim()}:${msg.sender}:nodate`;

            const minuteTime = date.toISOString().slice(0, 16); // "2024-02-04T10:29"
            const content = msg.message?.trim() || "";
            return `${content}:${msg.sender}:${minuteTime}`;
        };

        const dbCompositeKeys = new Set(dbMessages.map(getCompositeKey));

        const filteredSocketMessages = socketMessages.filter((msg: any) => {
            // 1. If socket msg has ID, and it exists in DB -> Duplicate
            if (msg.id && dbIds.has(msg.id)) return false;

            // 2. Fallback: Check content + sender + minute-precision timestamp
            const key = getCompositeKey(msg);
            if (dbCompositeKeys.has(key)) return false;

            return true;
        });

        // Also deduplicate within socket messages themselves
        const uniqueSocketMessages = [];
        const socketKeys = new Set();

        for (const msg of filteredSocketMessages) {
            const key = getCompositeKey(msg);
            const idKey = msg.id ? `id:${msg.id}` : null;

            if (!socketKeys.has(key) && (!idKey || !socketKeys.has(idKey))) {
                uniqueSocketMessages.push(msg);
                socketKeys.add(key);
                if (idKey) socketKeys.add(idKey);
            }
        }

        return [...dbMessages, ...uniqueSocketMessages];
    }, [messagesData?.data, newMessage]);
    const displayMessages = isSearching
        ? filteredMessage ?? []
        : updatedMessageData ?? [];
    const groupedMessages = groupMessagesByDate(displayMessages);
    const groupedEntries = Object.entries(groupedMessages);



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
        
        const cleanIncomingPhone = data.phone?.replace(/\D/g, "");
        const cleanSelectedPhone = selectedChatRef.current?.phone?.replace(/\D/g, "");

        if (cleanSelectedPhone === cleanIncomingPhone || selectedChatRef.current?.phone === data.phone) {
            setNewMessage(prev => [...prev, data]);
            queryClient.invalidateQueries({ queryKey: ["messages", data.phone] });
        }

        setFilteredChats((prev: any) => {
            if (!prev) return prev;

            const index = prev.findIndex((c: any) => c.phone === data.phone);

            if (index !== -1) {
                const updated = [...prev];
                updated[index] = {
                    ...updated[index],
                    name: data.name,
                    contact_id: data.contact_id || updated[index].contact_id,
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
                    contact_id: data.contact_id,
                    name: data.name,
                    message: data.message,
                    last_message_time: data.created_at,
                    seen: "false",
                },
                ...prev,
            ];
        });

        // Trigger refetch so any page refreshes or selections have correct fresh data
        queryClient.invalidateQueries({ queryKey: ["livechats"] });
        queryClient.invalidateQueries({ queryKey: ["chats"] });
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

        return () => {
            socket.off("new-message", handleIncomingMessage);
            socket.off("connect");
        };
    }, []);

    // Optimized scroll effect for new messages
    // We add a separate div at the end to ensure we always have a target
    useEffect(() => {
        if (groupedEntries?.length > 0 || newMessage.length > 0) {
            // Small timeout to allow render
            setTimeout(() => {
                bottomRef?.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "end"
                });
            }, 100);
        }
    }, [groupedEntries?.length, newMessage.length, selectedChat?.phone]);
    console.log("filteredChat1", filteredChats)
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
            <div className={cn("w-full md:w-[320px] lg:w-[380px] flex flex-col border-r shrink-0 transition-all", isDarkMode ? "bg-[#111b21] border-white/5" : "bg-white border-slate-200")}>
                {/* Search & Filters */}
                <div className="p-2 space-y-2">
                    <div className="relative group">
                        <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 transition-colors", isDarkMode ? "text-slate-500 group-focus-within:text-emerald-500" : "text-slate-400 group-focus-within:text-emerald-500")} size={14} />
                        <input
                            onChange={handleChatSearch}
                            type="text"
                            placeholder="Search or start new chat"
                            className={cn(
                                "w-full rounded-2xl py-2 pl-9 pr-3 text-xs font-medium transition-all shadow-sm focus:outline-none border",
                                isDarkMode 
                                    ? "bg-[#202c33] text-white placeholder:text-slate-500 border-transparent focus:bg-[#2a3942] focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10" 
                                    : "bg-slate-50 text-slate-900 placeholder:text-slate-500 border-slate-200 hover:border-slate-300 focus:bg-white focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10"
                            )}
                        />
                    </div>
                    <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 px-1">
                        {[
                            { id: 'all', label: 'All' },
                            { id: 'read', label: 'Read' },
                            { id: 'unread', label: 'Unread' },
                            ...(isAdmin ? [{ id: 'unassigned', label: 'Unassigned' }] : [{ id: 'assigned', label: 'Assigned' }]),
                        ].map(f => {
                            const isActive = chatFilter === f.id;
                            return (
                                <button
                                    key={f.id}
                                    onClick={() => setChatFilter(f.id as any)}
                                    className={cn(
                                        "whitespace-nowrap px-3 py-1.5 rounded-full text-[11px] font-bold tracking-tight transition-all flex-1 text-center border-transparent border hover:border-emerald-500/20",
                                        isActive
                                            ? (isDarkMode ? "bg-[#00a884] text-[#111b21] shadow-lg shadow-emerald-500/10" : "bg-[#00a884] text-white shadow-lg shadow-emerald-500/10")
                                            : isDarkMode
                                                ? "bg-[#202c33] text-[#aebac1] hover:bg-[#2a3942]"
                                                : "bg-slate-100 text-[#54656f] hover:bg-slate-200"
                                    )}
                                >
                                    {f.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Chat List */}
                <div className="flex-1 overflow-y-auto no-scrollbar">
                    {isChatsLoading ? (
                        Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className={cn("w-full px-2 py-2 flex items-center space-x-2 border-b", isDarkMode ? "border-white/5" : "border-gray-50")}>
                                <div className={cn("w-9 h-9 rounded-full shrink-0 animate-pulse", isDarkMode ? "bg-[#202c33]" : "bg-gray-100")} />
                                <div className="flex-1 space-y-1.5 min-w-0">
                                    <div className={cn("h-3 w-24 rounded animate-pulse", isDarkMode ? "bg-[#202c33]" : "bg-gray-100")} />
                                    <div className={cn("h-2 w-32 rounded animate-pulse", isDarkMode ? "bg-[#202c33]" : "bg-gray-100")} />
                                </div>
                            </div>
                        ))
                    ) : filteredChats && filteredChats?.length > 0 ? (
                        filteredChats?.map((chat: any, i: number) => (
                            <button
                                key={i}
                                onClick={() => handleSelectChat(chat)}
                                className={cn(
                                    "w-full px-2.5 py-2 flex items-center space-x-2.5 transition-all border-b",
                                    selectedChat?.phone === chat?.phone
                                        ? (isDarkMode ? 'bg-[#2a3942]' : 'bg-[#f0f2f5]')
                                        : (isDarkMode ? 'hover:bg-[#202c33] border-white/5' : 'hover:bg-gray-50 border-gray-50')
                                )}
                            >
                                <div className="relative shrink-0">
                                    <div className={cn(
                                        "w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all overflow-hidden",
                                        isDarkMode ? 'bg-[#3b4a54] text-slate-300' : 'bg-slate-200 text-slate-500'
                                    )}>
                                        {chat?.name ? chat?.name?.split("")[0].toUpperCase() : <User size={16} />}
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-0.5">
                                        <div className="flex items-center gap-1.5 truncate">
                                            <span className={cn("text-[12px] font-semibold truncate", isDarkMode ? 'text-white' : 'text-slate-900')}>
                                                {chat?.name || chat.phone}
                                            </span>
                                            {chat?.assigned_admin_id && (
                                                <div className={cn(
                                                    "px-1 py-[2px] rounded text-[9px] font-bold flex items-center gap-1 shrink-0",
                                                    chat.assigned_admin_id === user?.tenant_user_id
                                                        ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                                        : (isDarkMode ? "bg-white/5 text-slate-400" : "bg-slate-100 text-slate-500")
                                                )}>
                                                    {chat.assigned_admin_id === user?.tenant_user_id ? "Yours" : chat.assigned_agent_name}
                                                </div>
                                            )}
                                        </div>
                                        <span className={cn("text-[10px] whitespace-nowrap ml-1 shrink-0", 
                                            chat?.seen === "false" 
                                                ? (isDarkMode ? 'text-emerald-400 font-bold' : 'text-emerald-600 font-bold') 
                                                : (isDarkMode ? 'text-slate-500' : 'text-slate-400')
                                        )}>
                                            {chat?.last_message_time ? getDateLabel(chat.last_message_time) : ""}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className={cn("text-[11px] truncate pr-2 font-medium", isDarkMode ? 'text-slate-400' : 'text-slate-500')}>
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
                            <h3 className="text-sm font-bold">No chats found</h3>
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
                                {/* <WeeklyChatSummary /> */}
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
                                {isSearching ? (
                                    <div className="relative animate-in slide-in-from-right-2 fade-in duration-200">
                                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            autoFocus
                                            value={messageSearchText}
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
                                        onClick={() => setMessageSearchText(" ")} // Quick hack to trigger search layout open
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
                                        Messages are end-to-end encrypted. No one outside of this chat, not even WhatsApp, can read or listen to them. Click to learn more.
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
                                <div ref={bottomRef} className="pb-14" /> {/* Extra padding for smart reply floating button */}
                            </div>

                            {/* Floating Smart Suggestion Box pinned above Input */}
                            {groupedEntries?.length > 0 && selectedChat && (
                                <div className="absolute bottom-[60px] left-0 right-0 px-4 py-2 flex justify-center pointer-events-none">
                                    <div className="pointer-events-auto">
                                        <button
                                            onClick={suggestReply}
                                            disabled={isSuggesting}
                                            className={cn(
                                                "flex items-center space-x-2 px-4 py-2 rounded-full text-[13px] font-bold transition-all shadow-lg backdrop-blur-md", 
                                                isSuggesting ? 'opacity-50' : 'hover:scale-105 active:scale-95', 
                                                isDarkMode 
                                                    ? 'bg-[#182229]/90 text-emerald-400 border border-[#222d34]' 
                                                    : 'bg-white/90 text-emerald-700 border border-emerald-100'
                                            )}
                                        >
                                            {isSuggesting ? (
                                                <span className="animate-pulse flex items-center gap-2"><Sparkles size={14} className="text-amber-500" /> Connecting to Neural Engine...</span>
                                            ) : (
                                                <>
                                                    <Wand2 size={16} className="text-emerald-500" />
                                                    <span>Suggest Smart Reply</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Input Bar */}
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
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-10 opacity-40">
                            <div className="w-24 h-24 rounded-full border-4 border-emerald-500/20 flex items-center justify-center mb-6">
                                <MessageCircle size={64} className="text-emerald-500" />
                            </div>
                            <h3 className="text-xl font-bold">WhatsApp Desktop Style Chat</h3>
                        </div>
                    )}
                </GlassCard>
            </div>

            {/* ── RIGHT: Details Panel ────────────────────────────────────────── */}
            {selectedChat && (
                <div className={cn("w-1/4 min-w-[280px] border-l flex flex-col shrink-0", isDarkMode ? "bg-[#111b21] border-white/5" : "bg-white border-slate-200")}>
                    <div className="p-4 flex flex-col items-center border-b space-y-3">
                        <div className={cn("w-20 h-20 rounded-full flex items-center justify-center font-bold text-3xl overflow-hidden shadow-inner", isDarkMode ? 'bg-[#3b4a54] text-slate-300' : 'bg-slate-200 text-slate-500')}>
                            {selectedChat?.name ? selectedChat?.name?.split("")[0].toUpperCase() : <User size={40} />}
                        </div>
                        <div className="text-center">
                            <h3 className={cn("font-bold text-base", isDarkMode ? "text-white" : "text-slate-900")}>
                                {selectedChat?.name || selectedChat?.phone}
                            </h3>
                            <p className={cn("text-[11px] mt-0.5", isDarkMode ? "text-slate-400" : "text-slate-500")}>
                                {selectedChat?.phone}
                            </p>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-8 no-scrollbar">
                        {/* Agent Assignment Section */}
                        <div className="space-y-3">
                            <h4 className={cn("text-[10px] font-bold uppercase tracking-[0.15em] opacity-60", isDarkMode ? "text-slate-300" : "text-slate-600")}>
                                Agent Assignment
                            </h4>
                            
                            <div className="space-y-3">
                                {isAdmin && (
                                    <>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <button 
                                                    disabled={isAssigning}
                                                    className={cn(
                                                        "w-full rounded-xl py-3 px-3 text-xs font-semibold flex items-center justify-between transition-all cursor-pointer shadow-sm border",
                                                        isDarkMode 
                                                            ? "bg-[#202c33] text-slate-200 border-white/5 hover:border-emerald-500/50" 
                                                            : "bg-white text-slate-700 border-slate-200 hover:border-emerald-500/50"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-2 truncate">
                                                        <UserPlus size={14} className={isDarkMode ? "text-slate-500" : "text-slate-400"} />
                                                        <span className="truncate">
                                                            {selectedChat?.assigned_agent_name || "Unassigned"}
                                                        </span>
                                                    </div>
                                                    <ChevronDown className={cn("shrink-0", isDarkMode ? "text-slate-500" : "text-slate-400")} size={14} />
                                                </button>
                                            </PopoverTrigger>
                                            <PopoverContent 
                                                isDarkMode={isDarkMode} 
                                                align="start" 
                                                className="w-[var(--radix-popover-trigger-width)] p-0 overflow-hidden rounded-2xl border shadow-2xl"
                                            >
                                                <div className={cn("p-2 border-b", isDarkMode ? "border-white/5 bg-white/5 text-white" : "border-slate-100 bg-slate-50")}>
                                                    <Input 
                                                        isDarkMode={isDarkMode}
                                                        placeholder="Search agents..."
                                                        value={agentSearch}
                                                        onChange={(e) => setAgentSearch(e.target.value)}
                                                        variant="secondary"
                                                        className="h-8 text-xs py-1"
                                                        icon={Search}
                                                    />
                                                </div>
                                                <div className="max-h-[420px] overflow-y-auto p-2 custom-scrollbar">
                                                    <button
                                                        onClick={() => {
                                                            assignAgentMutate({ contact_id: selectedChat.contact_id, agent_id: "" });
                                                            setSelectedChat((prev: any) => ({ ...prev, assigned_admin_id: "", assigned_agent_name: "Unassigned" }));
                                                        }}
                                                        className={cn(
                                                            "w-full flex items-center justify-between px-3 py-4 rounded-xl text-xs font-medium transition-colors",
                                                            !selectedChat?.assigned_admin_id 
                                                                ? (isDarkMode ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-600")
                                                                : (isDarkMode ? "hover:bg-white/5 text-slate-400" : "hover:bg-slate-50 text-slate-600")
                                                        )}
                                                    >
                                                        <span>Unassigned</span>
                                                        {!selectedChat?.assigned_admin_id && <Check size={14} />}
                                                    </button>
                                                    {filteredAgents.map((agent: any) => (
                                                        <button
                                                            key={agent.tenant_user_id}
                                                            onClick={() => {
                                                                assignAgentMutate({ contact_id: selectedChat.contact_id, agent_id: agent.tenant_user_id });
                                                                setSelectedChat((prev: any) => ({
                                                                    ...prev,
                                                                    assigned_admin_id: agent.tenant_user_id,
                                                                    assigned_agent_name: agent.username
                                                                }));
                                                            }}
                                                            className={cn(
                                                                "w-full flex items-center gap-3 px-3 py-3.5 rounded-xl text-xs font-semibold transition-all group",
                                                                selectedChat?.assigned_admin_id === agent.tenant_user_id
                                                                    ? (isDarkMode ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-600")
                                                                    : (isDarkMode ? "hover:bg-white/5 text-slate-300" : "hover:bg-slate-50 text-slate-700")
                                                            )}
                                                        >
                                                            <div className={cn(
                                                                "w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 border",
                                                                isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-100 border-slate-200"
                                                            )}>
                                                                {agent.username.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div className="flex flex-col items-start min-w-0 flex-1">
                                                                <span className="truncate w-full text-left">{agent.username}</span>
                                                                <Badge isDarkMode={isDarkMode} variant="default" size="sm" className="mt-0.5 text-[8px] py-0 px-1.5 uppercase tracking-tighter opacity-70">
                                                                    {agent.role}
                                                                </Badge>
                                                            </div>
                                                            {selectedChat?.assigned_admin_id === agent.tenant_user_id && <Check size={14} className="shrink-0" />}
                                                        </button>
                                                    ))}
                                                    {filteredAgents.length === 0 && (
                                                        <div className="p-4 text-center text-[10px] opacity-40">No agents found</div>
                                                    )}
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                        <p className={cn("text-[10px] italic opacity-60 px-1", isDarkMode ? "text-slate-400" : "text-slate-500")}>
                                            Admins can reassign leads to any team member.
                                        </p>
                                    </>
                                )}

                                {selectedChat?.assigned_admin_id === user?.tenant_user_id ? (
                                    <div className={cn("flex items-center gap-2 px-4 py-2.5 rounded-xl border", isDarkMode ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-emerald-50 border-emerald-100 text-emerald-700")}>
                                        <ShieldCheck size={16} />
                                        <span className="text-xs font-bold uppercase tracking-wider">Assigned to You</span>
                                    </div>
                                ) : selectedChat?.assigned_admin_id ? (
                                    <div className={cn("flex items-center gap-2 px-4 py-2.5 rounded-xl border", isDarkMode ? "bg-white/5 border-white/10 text-slate-400" : "bg-slate-100 border-slate-200 text-slate-600")}>
                                        <Lock size={16} />
                                        <div className="flex flex-col">
                                            <span className="text-[10px] uppercase tracking-wider opacity-60">Assigned To</span>
                                            <span className="text-xs font-bold">{selectedChat?.assigned_agent_name}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => {
                                            claimChatMutate(selectedChat.contact_id);
                                            // Optimistic update
                                            setSelectedChat((prev: any) => ({
                                                ...prev,
                                                assigned_admin_id: user?.tenant_user_id,
                                                assigned_agent_name: user?.username
                                            }));
                                        }}
                                        disabled={isClaiming}
                                        className="w-full h-10 cursor-pointer flex items-center justify-center space-x-2 bg-emerald-600 text-white px-4 rounded-xl text-xs font-bold uppercase hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/10 disabled:opacity-50"
                                    >
                                        {isClaiming ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
                                        <span className='text-[11px]'>Claim Lead</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        <div>
                            <h4 className={cn("text-[10px] font-bold uppercase tracking-[0.15em] mb-3 opacity-60", isDarkMode ? "text-slate-300" : "text-slate-600")}>
                                Contact Details
                            </h4>
                            <div className="space-y-3">
                                <div className="flex justify-between items-start gap-4">
                                    <span className={cn("text-[11px] shrink-0 font-medium", isDarkMode ? "text-slate-400" : "text-slate-500")}>Phone</span>
                                    <span className={cn("text-[11px] font-semibold text-right", isDarkMode ? "text-slate-200" : "text-slate-800")}>{selectedChat?.phone}</span>
                                </div>
                                <div className="flex justify-between items-start gap-4">
                                    <span className={cn("text-[11px] shrink-0 font-medium", isDarkMode ? "text-slate-400" : "text-slate-500")}>Last Active</span>
                                    <span className={cn("text-[11px] font-semibold text-right", isDarkMode ? "text-slate-200" : "text-slate-800")}>
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
                                    <span>Weekly Summary</span>
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
        </div>
    );
};