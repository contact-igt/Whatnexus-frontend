"use client";
import { useEffect, useRef, useState, useMemo } from 'react';
import { MessageCircle, MessageSquareOff, MessageSquareText, Sparkles, Wand2 } from 'lucide-react';
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
// Extracted Components

// Extracted Components
import { getDateLabel } from './ChatUtils';
import { ChatSidebar } from './ChatSidebar';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { ChatDetails } from './ChatDetails';
import { ChatSummaryOverlay } from './ChatSummaryOverlay';

export const ChatView = () => {
    const queryClient = useQueryClient();
    const { user, whatsappApiDetails } = useAuth();
    const { isDarkMode } = useTheme();
    const bottomRef = useRef<HTMLDivElement>(null);
    const [newMessage, setNewMessage] = useState<any[]>([]);
    const {
        data: chatList,
        isLoading: isChatsLoading,
    } = useGetAllLiveChatsQuery();
    
    const [filteredChats, setFilteredChats] = useState(chatList?.data);
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
    const searchParams = useSearchParams();
    const phoneParam = searchParams.get('phone');
    const navigatingPhoneRef = useRef<string | null>(null);

    const isAdmin = user?.role === 'tenant_admin';
    const { mutate: claimChatMutate, isPending: isClaiming } = useClaimChatMutation();
    const { mutate: assignAgentMutate, isPending: isAssigning } = useAssignAgentMutation();
    const { data: agentsList } = useGetAgentsQuery();

    const [agentSearch, setAgentSearch] = useState("");
    const filteredAgents = useMemo(() => {
        const agents = agentsList?.data || [];
        const nonAdminAgents = agents.filter((agent: any) => agent.role !== 'tenant_admin');
        if (!agentSearch) return nonAdminAgents;
        return nonAdminAgents.filter((agent: any) =>
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
        if (selectedChat?.phone === chat.phone) return;
        navigatingPhoneRef.current = String(chat.phone);
        setSelectedChat({
            phone: chat?.phone,
            contact_id: chat?.contact_id,
            name: chat?.name ?? chat.phone,
            assigned_admin_id: chat?.assigned_admin_id,
            assigned_agent_name: chat?.assigned_agent_name,
        });
        setMessage("");
        setChatSummary(null);
        router.replace(`?phone=${chat.phone}`, { scroll: false });
    };

    useEffect(() => {
        if (!selectedChat?.phone) return;
        if (!chatList?.data?.length) return;

        const chat = chatList?.data?.find((c: any) => c.phone === selectedChat?.phone);
        if (chat && Number(chat.unread_count) > 0) {
            updateSeenMutate(selectedChat?.phone);
            // Optimistic: clear unread count immediately in local state
            setFilteredChats((prev: any) => {
                if (!prev) return prev;
                return prev.map((c: any) =>
                    c.phone === selectedChat?.phone ? { ...c, unread_count: 0 } : c
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
            // If the URL finally matched the explicit selection, clear the ref
            if (navigatingPhoneRef.current && (navigatingPhoneRef.current === phoneParam || navigatingPhoneRef.current.replace(/\D/g, "") === cleanParam)) {
                navigatingPhoneRef.current = null;
            }

            // If we are currently waiting for the router to catch up to our UI click, ignore the old URL param
            if (navigatingPhoneRef.current) return;

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

        const dbIds = new Set(dbMessages.map((m: any) => m.id).filter(Boolean));

        const getCompositeKey = (msg: any) => {
            const date = new Date(msg.created_at || msg.timestamp);
            if (isNaN(date.getTime())) return `${msg.message?.trim()}:${msg.sender}:nodate`;

            const minuteTime = date.toISOString().slice(0, 16);
            const content = msg.message?.trim() || "";
            return `${content}:${msg.sender}:${minuteTime}`;
        };

        const dbCompositeKeys = new Set(dbMessages.map(getCompositeKey));

        const filteredSocketMessages = socketMessages.filter((msg: any) => {
            if (msg.id && dbIds.has(msg.id)) return false;
            const key = getCompositeKey(msg);
            if (dbCompositeKeys.has(key)) return false;
            return true;
        });

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
                    unread_count: (updated[index].unread_count || 0) + (data.sender === 'user' ? 1 : 0),
                };
                return [updated[index], ...updated.filter((_, i) => i !== index)];
            }
            return [
                {
                    phone: data.phone,
                    contact_id: data.contact_id,
                    name: data.name,
                    message: data.message,
                    last_message_time: data.created_at,
                    unread_count: data.sender === 'user' ? 1 : 0,
                },
                ...prev,
            ];
        });
        queryClient.invalidateQueries({ queryKey: ["livechats"] });
    };

    useEffect(() => {
        if (!user?.tenant_id) return;
        if (!socket.connected) socket.connect();
        socket.on("connect", () => {
            socket.emit("join-tenant", user.tenant_id);
        });
        socket.off("new-message");
        socket.on("new-message", handleIncomingMessage);
        socket.off("message-status-update");
        socket.on("message-status-update", (data: any) => {
            // Update message status (ticks) in real-time
            queryClient.invalidateQueries({ queryKey: ["messages", data.phone] });
        });
        return () => {
            socket.off("new-message", handleIncomingMessage);
            socket.off("message-status-update");
            socket.off("connect");
        };
    }, []);

    useEffect(() => {
        if (groupedEntries?.length > 0) {
            setTimeout(() => {
                bottomRef?.current?.scrollIntoView({
                    behavior: "auto",
                    block: "end"
                });
            }, 50);
        }
    }, [groupedEntries?.length, selectedChat?.phone]);

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

    useEffect(() => {
        setNewMessage([]);
    }, [selectedChat?.phone]);

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

                            <MessageList 
                                isDarkMode={isDarkMode}
                                isMessagesLoading={isMessagesLoading}
                                isSearching={isSearching}
                                filteredMessage={filteredMessage}
                                groupedEntries={groupedEntries}
                                bottomRef={bottomRef}
                                selectedChat={selectedChat}
                            />

                            {/* Smart Reply Suggestion */}
                            <div className="px-6 py-2 flex justify-end">
                                <button
                                    onClick={() => suggestReply()}
                                    disabled={isSuggesting}
                                    className={cn(
                                        "flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-bold transition-all shadow-sm",
                                        isDarkMode 
                                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20" 
                                            : "bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100"
                                    )}
                                >
                                    {isSuggesting ? (
                                        <span className="animate-pulse flex items-center gap-2">
                                            <Sparkles size={14} className="text-amber-500" /> Connecting to Neural Engine...
                                        </span>
                                    ) : (
                                        <>
                                            <Wand2 size={16} className="text-emerald-500" />
                                            <span>Suggest Smart Reply</span>
                                        </>
                                    )}
                                </button>
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
                                <div className="mt-6 flex flex-col items-center space-y-3">
                                    <div className="w-6 h-6 border-[3px] border-emerald-500 border-t-transparent flex rounded-full animate-spin" />
                                    <p className="text-sm font-medium text-emerald-600/80">Loading live chats...</p>
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
                />
            )}

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