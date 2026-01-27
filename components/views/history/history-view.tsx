
"use client";
import { useEffect, useRef, useState } from 'react';
import { Search, Brain, X, ClipboardList, Info, History as HistoryIcon, Wand2, Plus, Mic, Send, Sparkles, User, Loader2, MessageSquareOff, MessageSquareDashed, SearchX, MessageCircle } from 'lucide-react';
import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";
import { useAddMessageMutation, useChatSuggestMutation, useGetAllChatsQuery, useMessagesByPhoneQuery, useUpdateSeenMutation } from '@/hooks/useMessagesQuery';
import { callOpenAI } from '@/lib/openai';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/redux/selectors/auth/authSelector';
// import { socket } from "@/utils/socket";
import { useRouter, useSearchParams } from 'next/navigation';
import { WeeklyChatSummaryModal } from '../weekly-chat-summary-modal';


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
    const { isDarkMode } = useTheme();
    const bottomRef = useRef<HTMLDivElement>(null);
    const [newMessage, setNewMessage] = useState<any[]>([]);
    const {
        data: chatList,
        isLoading: isChatsLoading,
        isError: isChatsError,
    } = useGetAllChatsQuery();
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
        if (selectedChat?.phone !== chat?.phone) {
            setMessage("");
            setChatSummary(null);
        }
        router.replace(`?phone=${chat.phone}`, { scroll: false });
    };

    useEffect(() => {
        if (!selectedChat?.phone) return;
        if (!chatList?.data?.length) return;

        const hasUnreadUserMessages = chatList.data.some(
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
            let filtered = chatList?.data;
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
            const chatFromUrl = chatList.data.find(
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
        const firstChat = chatList.data[0];

        setSelectedChat({
            phone: firstChat.phone,
            contact_id: firstChat.contact_id,
            name: firstChat.name ?? firstChat.phone,
        });

        router.replace(`?phone=${firstChat.phone}`, { scroll: false });

    }, [chatList?.data, phoneParam]);

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

    // useEffect(() => {
    //     if (!user?.tenant_id) return;

    //     if (!socket.connected) {
    //         socket.connect();
    //     }

    //     socket.on("connect", () => {
    //         console.log("✅ Dashboard connected:", socket.id);
    //         socket.emit("join-tenant", user.tenant_id);
    //     });

    //     socket.off("new-message"); // ⬅️ prevent duplicates
    //     socket.on("new-message", handleIncomingMessage);

    //     return () => {
    //         socket.off("new-message", handleIncomingMessage);
    //         socket.off("connect");
    //     };
    // }, []);

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
        <div className="flex h-full p-6 space-x-6 animate-in slide-in-from-right-8 duration-500">
            <GlassCard isDarkMode={isDarkMode} className="w-80 flex flex-col shrink-0 rounded-2xl p-0">
                <div className="p-5 space-y-5 border-b border-white/5">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wide text-emerald-500">Shared Hub</span>
                        <div className="flex items-center space-x-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-[10px] font-bold text-slate-400">4 ONLINE</span>
                        </div>
                    </div>
                    <div className="relative group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-emerald-500 transition-colors" size={14} />
                        <input onChange={handleChatSearch} type="text" placeholder="Search Threads..." className={cn("w-full border rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/20", isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900')} />
                    </div>
                    <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-1">
                        {['All', 'Assigned', 'Unassigned'].map(f => (
                            <button key={f} className={cn("whitespace-nowrap px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border transition-all", f === 'All' ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-500/20' : (isDarkMode ? 'border-white/10 text-slate-400 hover:text-white' : 'border-slate-200 text-slate-500 hover:bg-slate-50'))}>{f}</button>
                        ))}
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto px-2 space-y-1 no-scrollbar py-4">
                    {isChatsLoading ? (
                        Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className={cn("w-full p-3 rounded-xl flex items-center space-x-3 mb-1", isDarkMode ? "bg-white/5" : "bg-slate-50")}>
                                <div className={cn("w-10 h-10 rounded-xl animate-pulse", isDarkMode ? "bg-white/10" : "bg-slate-200")} />
                                <div className="flex-1 space-y-2">
                                    <div className={cn("h-3 w-24 rounded animate-pulse", isDarkMode ? "bg-white/10" : "bg-slate-200")} />
                                    <div className={cn("h-2 w-32 rounded animate-pulse", isDarkMode ? "bg-white/10" : "bg-slate-200")} />
                                </div>
                            </div>
                        ))
                    ) : filteredChats && filteredChats?.length > 0 ? (
                        filteredChats?.map((chat: any, i: number) => (
                            <button key={i} onClick={() => handleSelectChat(chat)} className={cn("w-full p-3 rounded-xl flex items-center space-x-3 transition-all duration-200", selectedChat?.phone === chat?.phone ? (isDarkMode ? 'bg-white/10 shadow-lg' : 'bg-white shadow-md border border-emerald-500') : (isDarkMode ? 'hover:bg-white/5 opacity-60' : 'hover:bg-slate-50 opacity-80'))}>
                                <div className="relative">
                                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs border transition-all", selectedChat?.phone === chat?.phone ? 'scale-105' : '', isDarkMode ? 'bg-white/10 text-white border-white/10' : 'bg-slate-100 text-slate-600 border-slate-200')}>{chat?.name ? chat?.name?.split("")[0].toUpperCase() : <User size={16} />}</div>
                                    {/* {chat.seen && <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 bg-emerald-500 border-[#151518] shadow-sm shadow-emerald-500/50 animate-pulse" />} */}
                                </div>
                                <div className="flex-1 text-left truncate">
                                    <div className="flex justify-between items-center mb-0.5">
                                        <span className={cn("text-xs font-bold block", isDarkMode ? 'text-white' : 'text-slate-900')}>{chat?.name || chat.phone}</span>
                                        {/* <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded border", chat.seen ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20')}>{chat.seen ? 'AGENT' : 'AI'}</span> */}
                                    </div>
                                    <span className={cn("text-[10px] font-medium truncate block", isDarkMode ? 'text-white/40' : 'text-slate-500')}>{chat.message}</span>
                                </div>
                            </button>
                        ))) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in-95 duration-300">
                            <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg transform rotate-3 transition-all", isDarkMode ? "bg-white/5 border border-white/10" : "bg-slate-100 border border-slate-200")}>
                                <MessageSquareOff size={32} className={cn("opacity-50", isDarkMode ? "text-white" : "text-slate-500")} />
                            </div>
                            <h3 className={cn("text-sm font-bold mb-1", isDarkMode ? "text-white" : "text-slate-900")}>
                                No conversations found
                            </h3>
                            <p className={cn("text-xs max-w-[180px] leading-relaxed", isDarkMode ? "text-white/40" : "text-slate-500")}>
                                {chatSearchText ? "Try adjusting your search filters" : "New messages will appear here"}
                            </p>
                        </div>
                    )}
                </div>
            </GlassCard>

            <div className="flex-1 flex flex-col space-y-4 min-w-0 relative">
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

                <GlassCard isDarkMode={isDarkMode} className="p-3 px-6 border-emerald-500/20 bg-emerald-500/5 flex items-center justify-between shrink-0 rounded-xl">
                    <div className="flex items-center space-x-6">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-500 mb-0.5">Controller</span>
                            <div className="flex items-center space-x-2">
                                <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center text-[9px] font-bold text-white shadow-sm shadow-blue-500/30">JD</div>
                                {/* <span className={cn("text-xs font-bold uppercase tracking-wide", isDarkMode ? 'text-white' : 'text-slate-700')}>{selectedContact?.assignedTo ? AGENTS.find(a => a.id === selectedContact?.assignedTo)?.name : 'Unassigned'}</span> */}
                            </div>
                        </div>
                        <div className="h-6 w-px bg-white/10" />
                        <div className="flex flex-col">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-blue-400 mb-0.5">State</span>
                            <div className="flex items-center space-x-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wide">Active Monitor</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button className={cn("px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all border", isDarkMode ? 'bg-black/40 text-white/70 border-white/5 hover:bg-black/60' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50')}>Silence AI</button>
                        <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wide hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-500/20">Claim Lead</button>
                    </div>
                </GlassCard>

                <GlassCard isDarkMode={isDarkMode} className="flex-1 flex flex-col min-h-0 relative p-0 overflow-hidden rounded-2xl">
                    <div className="px-6 py-4 border-b border-white/5 shrink-0">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border", isDarkMode ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-100')}>{selectedChat?.name ? selectedChat?.name?.split("")[0].toUpperCase() : <User size={16} />}</div>
                                <div>
                                    <h3 className={cn("font-bold text-sm tracking-tight", isDarkMode ? 'text-white' : 'text-slate-900')}>{selectedChat?.name ? selectedChat?.name : selectedChat?.phone}</h3>
                                    <p className="text-[10px] font-bold uppercase text-slate-500 tracking-wide mt-0.5">Qualified Lead • Meta Ads</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-1">
                                <button
                                    onClick={() => {
                                        setIsSearchVisible(!isSearchVisible);
                                        if (!isSearchVisible) {
                                            setMessageSearchText('');
                                        }
                                    }}
                                    className={cn(
                                        "p-2 rounded-lg transition-all",
                                        isSearchVisible
                                            ? 'bg-emerald-500/10 text-emerald-500'
                                            : 'hover:bg-white/5 text-slate-400 hover:text-emerald-500'
                                    )}
                                    title="Search Messages"
                                >
                                    <Search size={18} />
                                </button>
                                <button
                                    onClick={summarizeChat}
                                    disabled={isSummarizing}
                                    className={cn("p-2 rounded-lg transition-all", isSummarizing ? 'animate-pulse text-emerald-500 bg-emerald-500/10' : 'hover:bg-white/5 text-slate-400 hover:text-emerald-500')}
                                    title="Neural Chat Summary"
                                >
                                    <ClipboardList size={18} />
                                </button>
                                <button className="p-2 hover:bg-white/5 rounded-lg text-slate-400"><Info size={18} /></button>
                                <button
                                    onClick={() => setIsWeeklySummaryOpen(true)}
                                    className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-emerald-500 transition-colors"
                                    title="Weekly Summary"
                                >
                                    <HistoryIcon size={18} />
                                </button>
                            </div>
                        </div>
                        {/* Message Search Bar - Conditionally Visible */}
                        {isSearchVisible && (
                            <div className="relative group animate-in slide-in-from-top-2 fade-in duration-200">
                                <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 transition-colors", messageSearchText ? 'text-emerald-500' : (isDarkMode ? 'text-white/20' : 'text-slate-400'), 'group-focus-within:text-emerald-500')} size={14} />
                                <input
                                    onChange={handleMessageSearch}
                                    value={messageSearchText}
                                    type="text"
                                    placeholder="Search in conversation..."
                                    autoFocus
                                    className={cn(
                                        "w-full border rounded-xl py-2 pl-10 pr-20 text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/20",
                                        isDarkMode ? 'bg-white/5 border-white/10 text-white placeholder:text-white/30' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                                    )}
                                />
                                {messageSearchText && (
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                                        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-md", isDarkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600')}>
                                            {filteredMessage?.length || 0} {filteredMessage?.length === 1 ? 'match' : 'matches'}
                                        </span>
                                        <button
                                            onClick={() => setMessageSearchText('')}
                                            className={cn("p-1 rounded-lg transition-all", isDarkMode ? 'hover:bg-white/10 text-white/40 hover:text-white' : 'hover:bg-slate-200 text-slate-400 hover:text-slate-600')}
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
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
                                        const highlightText = (text: string, search: string) => {
                                            if (!search.trim()) return text;
                                            const parts = text.split(new RegExp(`(${search})`, 'gi'));
                                            return parts.map((part, i) =>
                                                part.toLowerCase() === search.toLowerCase()
                                                    ? <mark key={i} className="bg-yellow-400 text-slate-900 px-0.5 rounded font-semibold">{part}</mark>
                                                    : part
                                            );
                                        };

                                        return (
                                            <div key={msg.id || msgIndex} className={cn("flex animate-in slide-in-from-bottom-2 fade-in duration-300", msg.sender === 'user' ? 'justify-start' : 'justify-end')} style={{ animationDelay: `${msgIndex * 10}ms`, animationFillMode: 'both' }}>
                                                <div className="max-w-[70%] group">
                                                    <div className={cn("p-3.5 rounded-[1.2rem] text-[13px] leading-relaxed transition-all shadow-sm",
                                                        msg.sender === 'bot'
                                                            ? (isDarkMode ? 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-medium' : 'bg-gradient-to-br from-emerald-600 to-teal-600 text-white font-medium shadow-emerald-100')
                                                            : msg.sender === 'user'
                                                                ? (isDarkMode ? 'bg-white/5 text-white border border-white/10' : 'bg-white text-slate-800 border border-slate-200')
                                                                : (isDarkMode ? 'bg-blue-600 text-white font-medium' : 'bg-slate-900 text-white font-medium')
                                                    )}>
                                                        {msg.sender === 'bot' && (
                                                            <div className="flex items-center space-x-1.5 mb-2 text-[9px] font-bold uppercase tracking-wide opacity-80 border-b border-white/20 pb-1.5">
                                                                <Sparkles size={10} className="animate-pulse" />
                                                                <span>AI Receptionist Layer</span>
                                                            </div>
                                                        )}
                                                        {messageSearchText ? highlightText(msg.message, messageSearchText) : msg.message}
                                                    </div>
                                                    <p className={cn("text-[9px] font-bold uppercase tracking-wide my-2 opacity-40", msg.sender === 'user' ? 'text-left' : 'text-right', isDarkMode ? 'text-white' : 'text-slate-900')}>{formattedTime(msg.created_at)}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={bottomRef} />
                                </div>
                            ))
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center h-full pb-20 animate-in fade-in zoom-in-95 duration-500">
                                <div className={cn("w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-xl transform -rotate-6 transition-all", isDarkMode ? "bg-white/5 border border-white/10" : "bg-slate-50 border border-slate-200")}>
                                    <MessageSquareDashed size={40} className={cn("opacity-50", isDarkMode ? "text-white" : "text-slate-400")} />
                                </div>
                                <div className="text-center space-y-2">
                                    <h3 className={cn("text-lg font-bold tracking-tight", isDarkMode ? "text-white" : "text-slate-900")}>
                                        No messages yet
                                    </h3>
                                    <p className={cn("text-xs font-medium uppercase tracking-wider", isDarkMode ? "text-white/40" : "text-slate-400")}>
                                        Start the conversation
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-6 shrink-0 relative">
                        <div className="flex justify-start mb-2 space-x-2">
                            <button
                                onClick={suggestReply}
                                disabled={isSuggesting}
                                className={cn("flex items-center space-x-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all", isSuggesting ? 'opacity-50' : 'hover:scale-105 active:scale-95', isDarkMode ? 'bg-white/5 text-emerald-400 border border-white/10' : 'bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-sm')}
                            >
                                {isSuggesting ? (
                                    <span className="animate-pulse">✨ Thinking...</span>
                                ) : (
                                    <>
                                        <Wand2 size={12} />
                                        <span>✨ Suggest Smart Reply</span>
                                    </>
                                )}
                            </button>
                        </div>
                        <div className="relative group">
                            <div className="absolute -inset-1 rounded-[1.5rem] blur opacity-10 transition-opacity duration-500 bg-gradient-to-r from-emerald-600 to-emerald-400 group-focus-within:opacity-40" />
                            <div className={cn("relative border rounded-[1.3rem] p-2 flex items-end space-x-2 transition-all duration-300", isDarkMode ? 'bg-[#1A1A1B] border-white/5 group-focus-within:border-white/20' : 'bg-white border-slate-200 group-focus-within:border-emerald-300 shadow-xl')}>
                                <button className="p-3 transition-all hover:scale-110 text-emerald-500 hover:bg-emerald-500/10 rounded-xl"><Plus size={18} /></button>
                                <textarea
                                    rows={1}
                                    value={message}
                                    onChange={handleInputChange}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            handleSendMessage();
                                            setMessage("");
                                        }
                                    }}
                                    placeholder="Type a neural response..."
                                    className={cn("flex-1 bg-transparent border-none focus:ring-0 text-[13px] py-3 resize-none max-h-32 focus:outline-none transition-colors", isDarkMode ? 'text-white placeholder:text-white/20' : 'text-slate-900')}
                                />
                                <div className="flex items-center space-x-1 pb-1">
                                    <button className="p-2.5 rounded-xl text-slate-400 hover:text-emerald-500 transition-colors"><Mic size={18} /></button>
                                    <button disabled={message.length === 0 || isPending} onClick={handleSendMessage} className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 active:scale-90 transition-all">{isPending ? <Loader2 className={cn("animate-spin", isDarkMode ? 'text-white/600' : 'text-slate-200')} size={16} /> : <Send size={16} />}</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </GlassCard>
            </div>

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
