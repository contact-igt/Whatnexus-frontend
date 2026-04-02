"use client";
import { useEffect, useRef, useState, useMemo } from 'react';
import { MessageCircle, MessageSquareOff, MessageSquareText, Sparkles, Wand2, Lock } from 'lucide-react';
import { GlassCard } from "@/components/ui/glassCard";
import { cn } from "@/lib/utils";
import { useAddMessageMutation, useChatSuggestMutation, useGetAllLiveChatsQuery, useMessagesByPhoneQuery, useUpdateSeenMutation, useClaimChatMutation, useAssignAgentMutation, useGetAgentsQuery, useToggleSilenceAIMutation } from '@/hooks/useMessagesQuery';
import { useGetTenantSettingsQuery } from '@/hooks/useTenantSettingsQuery';
import { callOpenAI } from '@/lib/openai';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/redux/selectors/auth/authSelector';
import { socket } from "@/utils/socket";
import { useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { WeeklyChatSummaryModal } from '../weeklyChatSummaryModal';
import { WhatsAppConnectionPlaceholder } from '../whatsappConfiguration/whatsappConnectionPlaceholder';
import { toast } from 'sonner';
// Extracted Components

// Extracted Components
import { getDateLabel } from './ChatUtils';
import { ChatSidebar } from './ChatSidebar';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { ChatDetails } from './ChatDetails';
import { ChatSummaryOverlay } from './ChatSummaryOverlay';
import { ThemedLoader } from '@/components/ui/themedLoader';

const arePhonesEqual = (p1: any, p2: any) => {
    const s1 = String(p1 || "").replace(/\D/g, "");
    const s2 = String(p2 || "").replace(/\D/g, "");
    if (!s1 || !s2) return false;
    // Compare last 10 digits as standardized form
    return s1 === s2 || (s1.length >= 10 && s2.length >= 10 && s1.slice(-10) === s2.slice(-10));
};

export const ChatView = () => {
    const queryClient = useQueryClient();
    const { user, whatsappApiDetails } = useAuth();
    const { isDarkMode } = useTheme();
    const bottomRef = useRef<HTMLDivElement>(null);
    const [newMessage, setNewMessage] = useState<any[]>([]);
    const [isAiTyping, setIsAiTyping] = useState<boolean>(false);
    const {
        data: chatList,
        isLoading: isChatsLoading,
    } = useGetAllLiveChatsQuery();

    const [filteredChats, setFilteredChats] = useState<any[]>([]);

    useEffect(() => {
        if (chatList?.data) {
            setFilteredChats(chatList.data);
        }
    }, [chatList?.data]);
    const { mutate: sendMessageMutate, isPending } = useAddMessageMutation();
    const [messageSearchText, setMessageSearchText] = useState("");
    const [filteredMessage, setFilteredMessage] = useState<any[]>([]);
    const [chatSearchText, setChatSearchText] = useState("");
    const [selectedChat, setSelectedChat] = useState<any>(null);
    const {
        data: messagesData,
        isLoading: isMessagesLoading,
    } = useMessagesByPhoneQuery(selectedChat?.phone);
    const { mutateAsync: chatSuggestMutate, isPending: isSuggesting } = useChatSuggestMutation();
    const [chatSummary, setChatSummary] = useState<string | null>(null);
    const [isSummarizing, setIsSummarizing] = useState(false);
    const { mutate: updateSeenMutate } = useUpdateSeenMutation();
    const [message, setMessage] = useState<string>("");
    const [isWeeklySummaryOpen, setIsWeeklySummaryOpen] = useState(false);
    const router = useRouter();
    const selectedChatRef = useRef<any>(null);
    const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const searchParams = useSearchParams();
    const phoneParam = searchParams.get('phone');
    const navigatingPhoneRef = useRef<string | null>(null);

    const isAdmin = user?.role === 'tenant_admin';
    const { data: tenantSettingsData } = useGetTenantSettingsQuery();
    const rawAiSettings = tenantSettingsData?.data?.ai_settings || {};
    const aiSettings = {
        auto_responder: rawAiSettings.auto_responder ?? true,
        smart_reply: rawAiSettings.smart_reply ?? true,
        neural_summary: rawAiSettings.neural_summary ?? true,
        content_generation: rawAiSettings.content_generation ?? true,
    };
    const { mutate: claimChatMutate, isPending: isClaiming } = useClaimChatMutation();
    const { mutate: assignAgentMutate, isPending: isAssigning } = useAssignAgentMutation();
    const { mutate: toggleSilenceAiMutate, isPending: isTogglingSilence } = useToggleSilenceAIMutation();
    const { data: agentsList } = useGetAgentsQuery();

    const [agentSearch, setAgentSearch] = useState("");
    const filteredAgents = useMemo(() => {
        const agents = agentsList?.data || [];
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

    const handleSelectChat = (chat: any) => {
        if (arePhonesEqual(selectedChat?.phone, chat.phone)) return;
        navigatingPhoneRef.current = String(chat.phone);
        setSelectedChat({
            phone: chat?.phone,
            contact_id: chat?.contact_id,
            name: chat?.name ?? chat.phone,
            assigned_admin_id: chat?.assigned_admin_id,
            assigned_agent_name: chat?.assigned_agent_name,
            is_ai_silenced: chat?.is_ai_silenced,
        });
        setMessage("");
        setChatSummary(null);
        router.replace(`?phone=${chat.phone}`, { scroll: false });
    };

    useEffect(() => {
        if (!selectedChat?.phone) return;
        if (!chatList?.data?.length) return;

        const currentChat = chatList.data.find((c: any) => arePhonesEqual(c.phone, selectedChat.phone));
        const hasUnreadUserMessages = currentChat && (currentChat.unread_count > 0 || currentChat.seen === "false");

        if (hasUnreadUserMessages) {
            updateSeenMutate(selectedChat?.phone);
            // Optimistic: clear unread count immediately in local state
            setFilteredChats((prev: any) => {
                if (!prev) return prev;
                return prev.map((c: any) =>
                    arePhonesEqual(c.phone, selectedChat?.phone) ? { ...c, unread_count: 0, seen: "true" } : c
                );
            });
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
                filtered = filtered?.filter((chat: any) => Number(chat?.unread_count) === 0);
            } else if (chatFilter === 'unread') {
                filtered = filtered?.filter((chat: any) => Number(chat?.unread_count) > 0);
            } else if (chatFilter === 'assigned') {
                filtered = filtered?.filter((chat: any) => chat?.assigned_admin_id === user?.tenant_user_id);
            } else if (chatFilter === 'unassigned') {
                filtered = filtered?.filter((chat: any) => !chat?.assigned_admin_id);
            }
            setFilteredChats((prev: any[] | undefined) => {
                if (!filtered) return filtered;
                if (!prev) return filtered;

                // Create a map of existing chats for easy lookup
                const prevMap = new Map();
                prev.forEach(c => {
                    const clean = String(c.phone).replace(/\D/g, "").slice(-10);
                    prevMap.set(clean, c);
                });

                // Merge: if local data is newer, keep it
                return filtered.map((newChat: any) => {
                    const clean = String(newChat.phone).replace(/\D/g, "").slice(-10);
                    const localChat = prevMap.get(clean);
                    if (localChat && localChat.last_message_time && newChat.last_message_time) {
                        const localTime = new Date(localChat.last_message_time).getTime();
                        const newTime = new Date(newChat.last_message_time).getTime();
                        if (localTime > newTime) {
                            return {
                                ...newChat,
                                message: localChat.message,
                                last_message_time: localChat.last_message_time,
                                unread_count: localChat.unread_count,
                                seen: localChat.seen
                            };
                        }
                    }
                    return newChat;
                });
            });
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
            // If the URL finally matched the explicit selection, clear the ref
            if (navigatingPhoneRef.current && (navigatingPhoneRef.current === phoneParam || navigatingPhoneRef.current.replace(/\D/g, "") === cleanParam)) {
                navigatingPhoneRef.current = null;
            }

            // If we are currently waiting for the router to catch up to our UI click, ignore the old URL param
            if (navigatingPhoneRef.current) return;

            const chatFromUrl = chatList.data.find(
                (c: any) => arePhonesEqual(c.phone, phoneParam)
            );

            if (chatFromUrl) {
                if (
                    selectedChat?.phone !== chatFromUrl.phone ||
                    selectedChat?.assigned_admin_id !== chatFromUrl.assigned_admin_id ||
                    selectedChat?.assigned_agent_name !== chatFromUrl.assigned_agent_name ||
                    selectedChat?.name !== (chatFromUrl.name ?? chatFromUrl.phone)
                ) {
                    setSelectedChat({
                        phone: chatFromUrl.phone,
                        contact_id: chatFromUrl.contact_id,
                        name: chatFromUrl.name ?? chatFromUrl.phone,
                        assigned_admin_id: chatFromUrl.assigned_admin_id,
                        assigned_agent_name: chatFromUrl.assigned_agent_name,
                        is_ai_silenced: chatFromUrl.is_ai_silenced,
                    });
                }
                return;
            }

            const chatFromFiltered = filteredChats?.find(
                (c: any) => arePhonesEqual(c.phone, phoneParam)
            );

            if (chatFromFiltered) {
                if (
                    !arePhonesEqual(selectedChat?.phone, chatFromFiltered.phone) ||
                    selectedChat?.assigned_admin_id !== chatFromFiltered.assigned_admin_id ||
                    selectedChat?.assigned_agent_name !== chatFromFiltered.assigned_agent_name ||
                    selectedChat?.name !== (chatFromFiltered.name ?? chatFromFiltered.phone)
                ) {
                    setSelectedChat({
                        phone: chatFromFiltered.phone,
                        contact_id: chatFromFiltered.contact_id,
                        name: chatFromFiltered.name ?? chatFromFiltered.phone,
                        assigned_admin_id: chatFromFiltered.assigned_admin_id,
                        assigned_agent_name: chatFromFiltered.assigned_agent_name,
                        is_ai_silenced: chatFromFiltered.is_ai_silenced,
                    });
                }
                return;
            }
        }

    }, [chatList?.data, phoneParam, filteredChats, selectedChat]);

    const isSearching = messageSearchText.trim().length > 0;
    const updatedMessageData = useMemo(() => {
        const dbMessages = messagesData?.data ?? [];
        const socketMessages = newMessage;

        // Primary dedup by message ID (most reliable)
        const dbIds = new Set(dbMessages.map((m: any) => m.id).filter(Boolean));
        const dbContentIndex = dbMessages.map((m: any) => ({
            key: `${(m.message || "").trim()}:${m.sender}`,
            ts: new Date(m.created_at || m.timestamp).getTime(),
        }));

        // Secondary dedup using precise second-level timestamp + sender
        // This handles cases where message ID hasn't been assigned yet
        const getCompositeKey = (msg: any) => {
            // If we have wamid (Meta's unique ID), use that for guaranteed uniqueness
            if (msg.wamid) return `wamid:${msg.wamid}`;

            const date = new Date(msg.created_at || msg.timestamp);
            // Use second-level precision instead of minute to reduce false duplicates
            const secondTime = !isNaN(date.getTime())
                ? date.toISOString().slice(0, 19) // "2024-01-01T12:30:45"
                : 'nodate';

            // Include message ID if available for extra uniqueness
            const idPart = msg.id ? `:id${msg.id}` : '';
            const content = (msg.message?.trim() || '').slice(0, 50); // First 50 chars
            return `${content}:${msg.sender}:${secondTime}${idPart}`;
        };

        const dbCompositeKeys = new Set(dbMessages.map(getCompositeKey));

        const filteredSocketMessages = socketMessages.filter((msg: any) => {
            // Check by ID first (most reliable)
            if (msg.id && dbIds.has(msg.id)) return false;
            // Then check by composite key
            const key = getCompositeKey(msg);
            if (dbCompositeKeys.has(key)) return false;
            return true;
        });

        const unique: any[] = [];
        const seen = new Set<string>();
        for (const msg of filteredSocketMessages) {
            // Use a 5-second window for deduplication to handle slightly different timestamp formats
            const ts = new Date(msg.created_at || msg.timestamp).getTime();
            const roundedTs = Math.floor(ts / 5000) * 5000;
            const dedupKey = msg.id ? `id:${msg.id}` : `${(msg.message || "").trim().toLowerCase()}:${msg.sender}:${roundedTs}`;
            if (!seen.has(dedupKey)) {
                unique.push(msg);
                seen.add(dedupKey);
            }
        }

        return [...dbMessages, ...unique];
    }, [messagesData?.data, newMessage]);

    const displayMessages = updatedMessageData ?? [];
    const groupedMessages = groupMessagesByDate(displayMessages);
    const groupedEntries = Object.entries(groupedMessages);

    const suggestReply = async () => {
        if (!selectedChat?.phone) return;
        try {
            const response = await chatSuggestMutate({
                phone: selectedChat?.phone,
            });
            if (response?.data) {
                setMessage(response.data);
            } else {
                setMessage("I couldn't generate a suggestion right now. Please try again.");
            }
        } catch (err: any) {
            console.error("Smart reply error:", err);
            const errorMsg = err?.response?.data?.message || "Failed to generate smart reply";
            setMessage(`[Error: ${errorMsg}]`);
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

    const handleIncomingMessage = (data: any) => {
        if (arePhonesEqual(selectedChatRef.current?.phone, data.phone)) {
            setNewMessage(prev => {
                // Prevent duplicate messages from entering local state (handles socket edge cases)
                const isDuplicate = prev.some(m =>
                    (m.id && data.id && m.id === data.id) ||
                    (m.message === data.message && m.sender === data.sender && Math.abs(new Date(m.created_at || m.timestamp).getTime() - new Date(data.created_at || data.timestamp).getTime()) < 2000)
                );
                if (isDuplicate) return prev;
                return [...prev, data];
            });
            // Invalidate both possible phone formats to ensure cache sync
            if (selectedChatRef.current?.phone) {
                queryClient.invalidateQueries({ queryKey: ["messages", selectedChatRef.current.phone] });
            }
            if (data.phone && data.phone !== selectedChatRef.current?.phone) {
                queryClient.invalidateQueries({ queryKey: ["messages", data.phone] });
            }
            // Debounced DB sync — prevents race condition that causes duplicate display
            if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
            syncTimerRef.current = setTimeout(() => {
                if (data.phone) queryClient.invalidateQueries({ queryKey: ["messages", data.phone] });
            }, 2000);
        }

        const isUser = data.sender === 'user';

        setFilteredChats((prev: any) => {
            const safePrev = prev || [];
            const index = safePrev.findIndex((c: any) => arePhonesEqual(c.phone, data.phone));
            const isUser = data.sender === 'user';

            if (index !== -1) {
                const updated = [...safePrev];
                const existing = updated[index];
                updated[index] = {
                    ...existing,
                    name: data.name || existing.name,
                    contact_id: data.contact_id || existing.contact_id,
                    message: data.message,
                    message_type: data.message_type || existing.message_type,
                    last_message_time: data.created_at || data.timestamp,
                    seen: isUser ? "false" : existing.seen,
                    unread_count: isUser ? (Number(existing.unread_count) || 0) + 1 : existing.unread_count
                };
                return [updated[index], ...updated.filter((_, i) => i !== index)];
            }
            return [
                {
                    phone: data.phone,
                    contact_id: data.contact_id,
                    name: data.name,
                    message: data.message,
                    message_type: data.message_type || null,
                    last_message_time: data.created_at || data.timestamp,
                    seen: isUser ? "false" : "true",
                    unread_count: isUser ? 1 : 0
                },
                ...safePrev,
            ];
        });
        queryClient.invalidateQueries({ queryKey: ["livechats"] });
    };

    useEffect(() => {
        if (!user?.tenant_id) return;

        // Register event listeners BEFORE connecting to ensure we don't miss events
        const handleConnect = () => {
            console.log("[Socket] Connected, joining tenant room:", user.tenant_id);
            socket.emit("join-tenant", user.tenant_id);
        };

        const handleAiTyping = (data: any) => {
            console.log("[Socket] ai-typing event received:", data);
            if (arePhonesEqual(selectedChatRef.current?.phone, data.phone)) {
                setIsAiTyping(data.status);
            }
        };

        const handleMessageStatusUpdate = (data: any) => {
            queryClient.invalidateQueries({ queryKey: ["messages", data.phone] });
        };

        const handleChatAssignment = () => {
            queryClient.invalidateQueries({ queryKey: ["livechats"] });
        };

        const handleWalletSuspended = (data: any) => {
            toast.error(data?.message || 'Insufficient balance. AI auto-reply is paused. Please recharge your wallet.', {
                duration: 8000,
                id: 'wallet-suspended',
            });
        };

        const handleInsufficientBalance = (data: any) => {
            toast.warning(`Low balance: ₹${data?.balance?.toFixed?.(2) || '0'}. Required: ₹${data?.required?.toFixed?.(2) || '0'}. Please recharge.`, {
                duration: 6000,
                id: 'insufficient-balance',
            });
        };

        // Register listeners first
        socket.on("connect", handleConnect);
        socket.on("new-message", handleIncomingMessage);
        socket.on("ai-typing", handleAiTyping);
        socket.on("message-status-update", handleMessageStatusUpdate);
        socket.on("chat-assignment-updated", handleChatAssignment);
        socket.on("wallet-suspended", handleWalletSuspended);
        socket.on("insufficient-balance", handleInsufficientBalance);

        // Then connect (or emit join if already connected)
        if (socket.connected) {
            socket.emit("join-tenant", user.tenant_id);
        } else {
            socket.connect();
        }

        return () => {
            socket.off("connect", handleConnect);
            socket.off("new-message", handleIncomingMessage);
            socket.off("ai-typing", handleAiTyping);
            socket.off("message-status-update", handleMessageStatusUpdate);
            socket.off("chat-assignment-updated", handleChatAssignment);
            socket.off("wallet-suspended", handleWalletSuspended);
            socket.off("insufficient-balance", handleInsufficientBalance);
        };
    }, [user?.tenant_id]);

    useEffect(() => {
        if (displayMessages.length > 0) {
            setTimeout(() => {
                bottomRef?.current?.scrollIntoView({
                    behavior: "auto",
                    block: "end"
                });
            }, 50);
        }
    }, [displayMessages.length, selectedChat?.phone]);

    useEffect(() => {
        if (newMessage.length > 0) {
            setTimeout(() => {
                bottomRef?.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "end"
                });
            }, 100);
        }
    }, [newMessage.length]);

    useEffect(() => {
        selectedChatRef.current = selectedChat;
    }, [selectedChat]);

    // Safety timeout: auto-clear typing indicator after 30 seconds
    useEffect(() => {
        if (!isAiTyping) return;
        const timeoutId = setTimeout(() => {
            console.log("[Typing] Safety timeout reached, clearing typing indicator");
            setIsAiTyping(false);
        }, 30000);
        return () => clearTimeout(timeoutId);
    }, [isAiTyping]);

    useEffect(() => {
        setNewMessage([]);
        setIsAiTyping(false);
        if (syncTimerRef.current) {
            clearTimeout(syncTimerRef.current);
            syncTimerRef.current = null;
        }
    }, [selectedChat?.phone]);

    // Reconcile: prune socket messages once DB data includes them
    useEffect(() => {
        if (!messagesData?.data?.length || newMessage.length === 0) return;
        const dbIds = new Set(messagesData.data.map((m: any) => m.id).filter(Boolean));
        const dbContentIndex = messagesData.data.map((m: any) => ({
            key: `${(m.message || "").trim()}:${m.sender}`,
            ts: new Date(m.created_at).getTime(),
        }));
        setNewMessage(prev => {
            const pruned = prev.filter((msg: any) => {
                if (msg.id && dbIds.has(msg.id)) return false;
                const key = `${(msg.message || "").trim()}:${msg.sender}`;
                const ts = new Date(msg.created_at || msg.timestamp).getTime();
                for (const db of dbContentIndex) {
                    if (db.key === key && Math.abs(db.ts - ts) < 120000) return false;
                }
                return true;
            });
            return pruned.length !== prev.length ? pruned : prev;
        });
    }, [messagesData?.data]);

    if (whatsappApiDetails?.status !== 'active') {
        return <WhatsAppConnectionPlaceholder />;
    }

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
            <ChatSidebar
                isDarkMode={isDarkMode}
                chatSearchText={chatSearchText}
                handleChatSearch={handleChatSearch}
                chatFilter={chatFilter}
                setChatFilter={setChatFilter}
                isAdmin={isAdmin}
                isChatsLoading={isChatsLoading}
                filteredChats={filteredChats}
                selectedChat={selectedChat}
                handleSelectChat={handleSelectChat}
                user={user}
            />
            <div className="flex-1 flex flex-col min-w-0 relative">
                <ChatSummaryOverlay
                    isDarkMode={isDarkMode}
                    chatSummary={chatSummary}
                    setChatSummary={setChatSummary}
                />

                <GlassCard isDarkMode={isDarkMode} className="flex-1 flex flex-col min-h-0 relative p-0 overflow-hidden rounded-2xl">
                    {selectedChat ? (
                        <>
                            <ChatHeader
                                isDarkMode={isDarkMode}
                                selectedChat={selectedChat}
                                messageSearchText={messageSearchText}
                                setMessageSearchText={setMessageSearchText}
                            />

                            <div className="flex-1 min-h-0 relative flex flex-col">
                                <MessageList
                                    isDarkMode={isDarkMode}
                                    isMessagesLoading={isMessagesLoading}
                                    isSearching={isSearching}
                                    filteredMessage={filteredMessage}
                                    groupedEntries={groupedEntries}
                                    bottomRef={bottomRef}
                                    selectedChat={selectedChat}
                                    searchText={messageSearchText}
                                    isAiTyping={isAiTyping}
                                />

                                {/* Smart Suggestion Sticky Button */}
                                {groupedEntries?.length > 0 && selectedChat && (
                                    <div className="absolute bottom-4 left-0 right-0 flex justify-center z-20 pointer-events-none">
                                        <div className="pointer-events-auto">
                                            <button
                                                onClick={aiSettings.smart_reply ? suggestReply : undefined}
                                                disabled={isSuggesting || !aiSettings.smart_reply}
                                                title={!aiSettings.smart_reply ? "Smart Reply is disabled in global AI settings" : undefined}
                                                className={cn(
                                                    "flex items-center px-4 py-2.5 rounded-full text-[13px] font-bold transition-all shadow-lg backdrop-blur-md disabled:opacity-70 disabled:cursor-not-allowed",
                                                    !aiSettings.smart_reply
                                                        ? (isDarkMode ? "bg-slate-800/80 text-slate-500 border border-white/5" : "bg-slate-100 text-slate-400 border border-slate-200")
                                                        : cn(
                                                            isSuggesting ? 'opacity-50' : 'hover:scale-105 active:scale-95 hover:shadow-emerald-500/20',
                                                            isDarkMode
                                                                ? 'bg-[#182229]/90 text-emerald-400 border border-[#222d34]'
                                                                : 'bg-white/90 text-emerald-700 border border-emerald-100'
                                                        )
                                                )}
                                            >
                                                {/* Symmetric Spacers for perfect centering */}
                                                {!aiSettings.smart_reply && <div className="w-4 shrink-0" />}
                                                <div className="flex-1 flex items-center justify-center gap-2">
                                                    {isSuggesting ? (
                                                        <span className="animate-pulse flex items-center gap-2">
                                                            <Sparkles size={14} className="text-amber-500" /> Connecting to Neural Engine...
                                                        </span>
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            <Wand2 size={16} className={!aiSettings.smart_reply ? "text-slate-500" : "text-emerald-500"} />
                                                            <span>Suggest Smart Reply</span>
                                                        </div>
                                                    )}
                                                </div>
                                                {!aiSettings.smart_reply && <Lock size={14} className="ml-2 shrink-0 opacity-80" />}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <MessageInput
                                isDarkMode={isDarkMode}
                                message={message}
                                handleInputChange={handleInputChange}
                                handleSendMessage={handleSendMessage}
                                isPending={isPending}
                            />
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-10 opacity-40">
                            <div className="w-24 h-24 rounded-full border-4 border-emerald-500/20 flex items-center justify-center mb-6">
                                <MessageCircle size={64} className="text-emerald-500" />
                            </div>
                            <h3 className="text-xl font-bold">WhatsApp Desktop Style Chat</h3>
                            {isChatsLoading ? (
                                <div className="mt-8">
                                    <ThemedLoader
                                        isDarkMode={isDarkMode}
                                        text="Syncing Conversations"
                                        subtext="Loading secure message history"
                                        showLogo={false}
                                    />
                                </div>
                            ) : (
                                <p className="text-sm mt-2">Select a conversation to start messaging</p>
                            )}
                        </div>
                    )}
                </GlassCard>
            </div>

            {selectedChat && (
                <ChatDetails
                    isDarkMode={isDarkMode}
                    selectedChat={selectedChat}
                    isAdmin={isAdmin}
                    isAssigning={isAssigning}
                    agentSearch={agentSearch}
                    setAgentSearch={setAgentSearch}
                    filteredAgents={filteredAgents}
                    assignAgentMutate={assignAgentMutate}
                    setSelectedChat={setSelectedChat}
                    user={user}
                    claimChatMutate={claimChatMutate}
                    isClaiming={isClaiming}
                    summarizeChat={summarizeChat}
                    isSummarizing={isSummarizing}
                    setIsWeeklySummaryOpen={setIsWeeklySummaryOpen}
                    toggleSilenceAiMutate={toggleSilenceAiMutate}
                    isTogglingSilence={isTogglingSilence}
                    isNeuralSummaryEnabled={aiSettings.neural_summary}
                />
            )}

            <WeeklyChatSummaryModal
                isOpen={isWeeklySummaryOpen}
                onClose={() => setIsWeeklySummaryOpen(false)}
                chatName={selectedChat?.name || selectedChat?.phone}
                chatPhone={selectedChat?.phone}
                isDarkMode={isDarkMode}
                contactId={selectedChat?.contact_id}
            />
        </div>
    );
};