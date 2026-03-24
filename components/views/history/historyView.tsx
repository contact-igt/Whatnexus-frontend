"use client";
import { useEffect, useRef, useState } from 'react';
import { History as HistoryIcon, MessageCircle, Send } from 'lucide-react';
import { GlassCard } from "@/components/ui/glassCard";
import { cn } from "@/lib/utils";
import { useChatSuggestMutation, useGetAllHistoryChatsQuery, useMessagesByPhoneQuery, useSendTemplateMessageMutation, useUpdateSeenMutation } from '@/hooks/useMessagesQuery';
import { callOpenAI } from '@/lib/openai';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/redux/selectors/auth/authSelector';
import { socket } from "@/utils/socket";
import { useRouter, useSearchParams } from 'next/navigation';
import { WeeklyChatSummaryModal } from '../weeklyChatSummaryModal';
import { TemplateSelectionModal, ProcessedTemplate } from "@/components/campaign/templateSelectionModal";
import { TemplateVariableModal } from './templateVariableModal';
import { WhatsAppConnectionPlaceholder } from '../whatsappConfiguration/whatsappConnectionPlaceholder';
import { useQueryClient } from '@tanstack/react-query';
import { useGetTenantSettingsQuery } from '@/hooks/useTenantSettingsQuery';
// Extracted Components

// Extracted Components
import { getDateLabel } from '../chats/ChatUtils';
import { HistorySidebar } from './HistorySidebar';
import { HistoryHeader } from './HistoryHeader';
import { HistoryMessageList } from './HistoryMessageList';
import { HistoryDetails } from './HistoryDetails';
import { ChatSummaryOverlay } from '../chats/ChatSummaryOverlay';
import { ThemedLoader } from '@/components/ui/themedLoader';

export const HistoryView = () => {
    const queryClient = useQueryClient();
    const { data: tenantSettingsData } = useGetTenantSettingsQuery();
    const rawAiSettings = tenantSettingsData?.data?.ai_settings || {};
    const aiSettings = {
        neural_summary: rawAiSettings.neural_summary ?? true,
    };
    const { user, whatsappApiDetails } = useAuth();
    const { isDarkMode } = useTheme();
    const bottomRef = useRef<HTMLDivElement>(null);
    const [newMessage, setNewMessage] = useState<any[]>([]);
    const {
        data: chatHistoryList,
        isLoading: isChatsLoading,
    } = useGetAllHistoryChatsQuery();

    const [filteredChats, setFilteredChats] = useState(chatHistoryList?.data?.chats);
    const [messageSearchText, setMessageSearchText] = useState("");
    const [filteredMessage, setFilteredMessage] = useState<any[]>([]);
    const { mutate: sendTemplateMutate, isPending: isSendingTemplate } = useSendTemplateMessageMutation();
    const [chatSearchText, setChatSearchText] = useState("");
    const [selectedChat, setSelectedChat] = useState<any>(null);
    const {
        data: messagesData,
        isLoading: isMessagesLoading,
    } = useMessagesByPhoneQuery(selectedChat?.phone);
    const { mutateAsync: chatSuggestMutate } = useChatSuggestMutation();
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [chatSummary, setChatSummary] = useState<string | null>(null);
    const { mutate: updateSeenMutate } = useUpdateSeenMutation();
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [isWeeklySummaryOpen, setIsWeeklySummaryOpen] = useState(false);
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const [isVariableModalOpen, setIsVariableModalOpen] = useState(false);
    const [selectedTemplateForVariables, setSelectedTemplateForVariables] = useState<ProcessedTemplate | null>(null);
    const router = useRouter();
    const selectedChatRef = useRef<any>(null);
    const searchParams = useSearchParams();
    const phoneParam = searchParams.get('phone');
    const [chatFilter, setChatFilter] = useState<'all' | 'read' | 'unread'>('all');
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
        setChatSummary(null);
        router.replace(`?phone=${chat.phone}`, { scroll: false });
    };

    useEffect(() => {
        if (!selectedChat?.phone) return;
        if (!chatHistoryList?.data?.chats?.length) return;

        const currentChat = chatHistoryList.data.chats.find((c: any) => c.phone === selectedChat.phone);
        const hasUnreadUserMessages = currentChat && (currentChat.unread_count > 0 || currentChat.seen === "false");

        if (hasUnreadUserMessages) {
            updateSeenMutate(selectedChat?.phone);
            setFilteredChats((prev: any) => {
                if (!prev) return prev;
                return prev.map((c: any) =>
                    c.phone === selectedChat?.phone ? { ...c, unread_count: 0 } : c
                );
            });
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

    const handleTemplateSelect = (template: ProcessedTemplate) => {
        const hasHeaderVars = template.headerText && /\{\{\d+\}\}/.test(template.headerText);
        const hasBodyVars = template.variables > 0 || (template.description && /\{\{\d+\}\}/.test(template.description));

        if (hasHeaderVars || hasBodyVars) {
            setSelectedTemplateForVariables(template);
            setIsVariableModalOpen(true);
        } else {
            sendTemplateMutate({
                phone: selectedChat?.phone,
                contact_id: selectedChat?.contact_id,
                template_id: template.id,
                components: []
            });
            setSelectedChat(null);
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
        setSelectedChat(null);
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
                filtered = filtered?.filter((chat: any) => Number(chat?.unread_count) === 0);
            } else if (chatFilter === 'unread') {
                filtered = filtered?.filter((chat: any) => Number(chat?.unread_count) > 0);
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
        if (selectedChatRef.current?.phone === data.phone) {
            setNewMessage(prev => [...prev, data]);
        }

        const isUser = data.sender === 'user';

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
                    seen: isUser ? "false" : updated[index].seen,
                    unread_count: isUser ? (Number(updated[index].unread_count) || 0) + 1 : updated[index].unread_count
                };
                return [updated[index], ...updated.filter((_, i) => i !== index)];
            }
            return prev;
        });

        queryClient.invalidateQueries({ queryKey: ["historychats"] });
    };

    useEffect(() => {
        if (!user?.tenant_id) return;
        
        if (!socket.connected) {
            socket.connect();
        } else {
            // Already connected, emit join immediately
            socket.emit("join-tenant", user.tenant_id);
        }

        socket.on("connect", () => {
            socket.emit("join-tenant", user.tenant_id);
        });

        socket.off("new-message");
        socket.on("new-message", handleIncomingMessage);
        socket.on("session-activated", (data: any) => {
            queryClient.invalidateQueries({ queryKey: ["history-chats"] });
        });

        return () => {
            socket.off("new-message", handleIncomingMessage);
            socket.off("message-status-update");
            socket.off("session-activated");
            socket.off("connect");
        };
    }, [user?.tenant_id]);

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

    useEffect(() => {
        selectedChatRef.current = selectedChat;
    }, [selectedChat]);

    useEffect(() => {
        setNewMessage([]);
    }, [selectedChat?.phone]);

    if (whatsappApiDetails?.status !== 'active') {
        return <WhatsAppConnectionPlaceholder />;
    }

    return (
        <div className={cn("flex h-[calc(100vh-56px)] overflow-hidden", isDarkMode ? "bg-[#0b141a]" : "bg-[#f0f2f5]")}>
            <HistorySidebar
                isDarkMode={isDarkMode}
                chatSearchText={chatSearchText}
                handleChatSearch={handleChatSearch}
                chatFilter={chatFilter}
                setChatFilter={setChatFilter}
                isChatsLoading={isChatsLoading}
                filteredChats={filteredChats}
                selectedChat={selectedChat}
                handleSelectChat={handleSelectChat}
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
                            <HistoryHeader
                                isDarkMode={isDarkMode}
                                selectedChat={selectedChat}
                                isSearchVisible={isSearchVisible}
                                setIsSearchVisible={setIsSearchVisible}
                                messageSearchText={messageSearchText}
                                setMessageSearchText={setMessageSearchText}
                                handleMessageSearch={handleMessageSearch}
                            />

                            <HistoryMessageList
                                isDarkMode={isDarkMode}
                                isMessagesLoading={isMessagesLoading}
                                isSearching={isSearching}
                                filteredMessage={filteredMessage}
                                groupedEntries={groupedEntries}
                                bottomRef={bottomRef}
                                selectedChat={selectedChat}
                                setIsTemplateModalOpen={setIsTemplateModalOpen}
                            />
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-10 opacity-40">
                            <div className="w-24 h-24 rounded-full border-4 border-emerald-500/20 flex items-center justify-center mb-6">
                                <HistoryIcon size={64} className="text-emerald-500" />
                            </div>
                            <h3 className="text-xl font-bold">WhatsApp History Hub</h3>
                            {isChatsLoading ? (
                                <div className="mt-8">
                                    <ThemedLoader 
                                        isDarkMode={isDarkMode} 
                                        text="Accessing Archives" 
                                        subtext="Retrieving history threads" 
                                        showLogo={false}
                                    />
                                </div>
                            ) : (
                                <p className="text-sm mt-2">Select a thread to view archives</p>
                            )}
                        </div>
                    )}
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
                </GlassCard>
            </div>

            {selectedChat && (
                <HistoryDetails
                    isDarkMode={isDarkMode}
                    selectedChat={selectedChat}
                    summarizeChat={summarizeChat}
                    isSummarizing={isSummarizing}
                    setIsWeeklySummaryOpen={setIsWeeklySummaryOpen}
                    isNeuralSummaryEnabled={aiSettings?.neural_summary !== false}
                />
            )}

            <WeeklyChatSummaryModal
                isOpen={isWeeklySummaryOpen}
                onClose={() => setIsWeeklySummaryOpen(false)}
                chatName={selectedChat?.name || selectedChat?.phone}
                chatPhone={selectedChat?.phone}
                isDarkMode={isDarkMode}
            />

            <TemplateSelectionModal
                isOpen={isTemplateModalOpen}
                onClose={() => setIsTemplateModalOpen(false)}
                onSelect={handleTemplateSelect}
            />

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
