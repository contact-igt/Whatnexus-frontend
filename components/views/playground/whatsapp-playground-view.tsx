"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/redux/selectors/auth/authSelector";
import {
    usePlaygroundChatMutation,
    usePlaygroundKnowledgeSources,
} from "@/hooks/usePlaygroundQuery";
import type { KnowledgeSource } from "@/services/playground";
import {
    Send,
    Smile,
    Paperclip,
    Mic,
    MoreVertical,
    Search,
    CheckCheck,
    Trash2,
    Database,
    BookOpen,
    Zap,
    Info,
    X,
    Brain,
    FileText,
    ChevronRight,
    Sparkles,
    AlertTriangle,
    Cpu,
} from "lucide-react";

interface ChatMessage {
    id: string;
    sender: "user" | "ai";
    message: string;
    timestamp: Date;
    status?: "sent" | "delivered" | "read";
    knowledgeSources?: KnowledgeSource[];
    knowledgeChunksUsed?: string[];
    resolvedLogsUsed?: string;
    responseOrigin?: "knowledge_base" | "ai_generated";
    technicalLogs?: {
        systemPrompt: string;
        userMessage: string;
        rawAIResponse: string;
        knowledgeChunksUsed: string[];
        resolvedLogsUsed: string;
        detectedTags: {
            tag: string;
            payload: string | null;
        } | null;
        tagExecutionHistory: string[];
        classification: {
            category: string;
            reason: string;
        } | null;
    };
    tokenUsage?: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
    classification?: {
        category: string;
        reason: string;
    } | null;
}

export const WhatsAppPlaygroundView = () => {
    const { isDarkMode } = useTheme();
    const { user } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const chatMutation = usePlaygroundChatMutation();
    const { data: knowledgeData } = usePlaygroundKnowledgeSources();

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping, scrollToBottom]);

    const tenantName = user?.username || user?.tenant_name || "Your Business";

    const handleSendMessage = async () => {
        if (!inputValue.trim() || chatMutation.isPending) return;

        const userMessage: ChatMessage = {
            id: `msg_${Date.now()}`,
            sender: "user",
            message: inputValue.trim(),
            timestamp: new Date(),
            status: "read",
        };

        setMessages((prev) => [...prev, userMessage]);
        const currentInput = inputValue.trim();
        setInputValue("");
        setIsTyping(true);

        try {
            const conversationHistory = messages.map((m) => ({
                sender: m.sender,
                message: m.message,
            }));

            const result = await chatMutation.mutateAsync({
                message: currentInput,
                conversationHistory,
            });

            const aiMessage: ChatMessage = {
                id: `msg_${Date.now()}_ai`,
                sender: "ai",
                message: result.data.reply,
                timestamp: new Date(),
                knowledgeSources: result.data.knowledgeSources,
                technicalLogs: result.data.technicalLogs,
                responseOrigin: result.data.responseOrigin,
                tokenUsage: result.data.tokenUsage,
                classification: result.data.classification,
                knowledgeChunksUsed: result.data.knowledgeChunksUsed,
                resolvedLogsUsed: result.data.resolvedLogsUsed,
            };

            setMessages((prev) => [...prev, aiMessage]);
            setSelectedMessageId(aiMessage.id);
        } catch {
            const errorMessage: ChatMessage = {
                id: `msg_${Date.now()}_err`,
                sender: "ai",
                message: "Sorry, I encountered an error. Please try again.",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleClearChat = () => {
        setMessages([]);
        setSelectedMessageId(null);
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    };

    const totalTokens = messages.reduce(
        (sum, m) => sum + (m.tokenUsage?.total_tokens || 0),
        0
    );
    const promptTokens = messages.reduce(
        (sum, m) => sum + (m.tokenUsage?.prompt_tokens || 0),
        0
    );
    const completionTokens = messages.reduce(
        (sum, m) => sum + (m.tokenUsage?.completion_tokens || 0),
        0
    );

    return (
        <div className="h-full flex flex-col overflow-hidden p-4 sm:p-6">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div
                        className={cn(
                            "w-10 h-10 rounded-2xl flex items-center justify-center",
                            isDarkMode
                                ? "bg-emerald-500/10 text-emerald-400"
                                : "bg-emerald-50 text-emerald-600"
                        )}
                    >
                        <Zap size={20} />
                    </div>
                    <div>
                        <h1
                            className={cn(
                                "text-xl font-bold tracking-tight",
                                isDarkMode ? "text-white" : "text-slate-900"
                            )}
                        >
                            WhatsApp Playground
                        </h1>
                        <p
                            className={cn(
                                "text-xs",
                                isDarkMode ? "text-white/40" : "text-slate-500"
                            )}
                        >
                            Test your AI assistant with knowledge base
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Token counter */}
                    {totalTokens > 0 && (
                        <div
                            className={cn(
                                "px-3 py-1.5 rounded-xl text-[11px] font-mono",
                                isDarkMode
                                    ? "bg-white/5 text-white/50 border border-white/10"
                                    : "bg-slate-100 text-slate-500 border border-slate-200"
                            )}
                        >
                            {totalTokens} tokens ({promptTokens} prompt + {completionTokens}{" "}
                            completion)
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex gap-4 min-h-0 overflow-hidden">
                {/* Chat Area */}
                <div
                    className={cn(
                        "flex-1 flex flex-col rounded-2xl overflow-hidden border transition-all duration-300",
                        isDarkMode
                            ? "bg-[#0B141A] border-white/10"
                            : "bg-[#efeae2] border-slate-200"
                    )}
                >
                    {/* WhatsApp Header */}
                    <div
                        className={cn(
                            "flex items-center px-4 py-2.5 gap-3",
                            "bg-[#00A884]"
                        )}
                    >
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">
                            {tenantName.charAt(0).toUpperCase()}
                        </div>

                        <div className="flex-1 min-w-0">
                            <h3 className="text-white font-semibold text-sm truncate">
                                {tenantName}
                            </h3>
                            <p className="text-white/70 text-xs">
                                {isTyping ? "typing..." : "online"}
                            </p>
                        </div>

                        <div className="flex items-center gap-1">
                            <button className="p-2 rounded-full hover:bg-white/10 text-white/80 transition-colors">
                                <Search size={18} />
                            </button>
                            <button
                                onClick={handleClearChat}
                                className="p-2 rounded-full hover:bg-white/10 text-white/80 transition-colors"
                                title="Clear Chat"
                            >
                                <Trash2 size={18} />
                            </button>
                            <button className="p-2 rounded-full hover:bg-white/10 text-white/80 transition-colors">
                                <MoreVertical size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Chat Messages */}
                    <div
                        className={cn(
                            "flex-1 overflow-y-auto px-4 sm:px-12 py-4 space-y-1",
                            isDarkMode ? "whatsapp-bg-dark" : "whatsapp-bg-light"
                        )}
                        style={{
                            backgroundImage: isDarkMode
                                ? "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
                                : "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
                        }}
                    >
                        {/* Empty state */}
                        {messages.length === 0 && (
                            <div className="flex items-center justify-center h-full">
                                <div
                                    className={cn(
                                        "text-center px-8 py-6 rounded-2xl max-w-md",
                                        isDarkMode
                                            ? "bg-[#1F2C33] text-white/60"
                                            : "bg-white/80 text-slate-500 shadow-sm"
                                    )}
                                >
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                        <Zap size={28} className="text-emerald-500" />
                                    </div>
                                    <h3
                                        className={cn(
                                            "font-semibold text-base mb-2",
                                            isDarkMode ? "text-white/80" : "text-slate-700"
                                        )}
                                    >
                                        WhatsApp Playground
                                    </h3>
                                    <p className="text-sm leading-relaxed">
                                        Test your AI assistant here. Send a message and see how your
                                        bot responds using your knowledge base.
                                    </p>
                                    <div
                                        className={cn(
                                            "mt-4 flex items-center justify-center gap-2 text-xs",
                                            isDarkMode ? "text-emerald-400/60" : "text-emerald-600/60"
                                        )}
                                    >
                                        <Database size={12} />
                                        <span>
                                            {knowledgeData?.data?.length || 0} knowledge sources
                                            available
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Messages */}
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={cn(
                                    "flex",
                                    msg.sender === "user" ? "justify-end" : "justify-start"
                                )}
                            >
                                <div
                                    className={cn(
                                        "relative max-w-[65%] rounded-lg px-3 py-2 mb-1 group",
                                        msg.sender === "user"
                                            ? isDarkMode
                                                ? "bg-[#005C4B] text-white"
                                                : "bg-[#D9FDD3] text-slate-900"
                                            : isDarkMode
                                                ? "bg-[#1F2C33] text-white/90"
                                                : "bg-white text-slate-800 shadow-sm"
                                    )}
                                >
                                    {/* Message tail */}
                                    <div
                                        className={cn(
                                            "absolute top-0 w-3 h-3",
                                            msg.sender === "user"
                                                ? cn(
                                                    "-right-1.5",
                                                    isDarkMode
                                                        ? "text-[#005C4B]"
                                                        : "text-[#D9FDD3]"
                                                )
                                                : cn(
                                                    "-left-1.5",
                                                    isDarkMode
                                                        ? "text-[#1F2C33]"
                                                        : "text-white"
                                                )
                                        )}
                                    >
                                        <svg
                                            viewBox="0 0 8 13"
                                            width="8"
                                            height="13"
                                            className={cn(
                                                msg.sender === "user"
                                                    ? "scale-x-[-1]"
                                                    : ""
                                            )}
                                        >
                                            <path
                                                opacity=".13"
                                                d="M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z"
                                            />
                                            <path
                                                fill="currentColor"
                                                d="M5.188 0H0v11.193l6.467-8.625C7.526 1.156 6.958 0 5.188 0z"
                                            />
                                        </svg>
                                    </div>

                                    {/* Message text */}
                                    <p className="text-[13px] leading-[19px] whitespace-pre-wrap break-words">
                                        {msg.message}
                                    </p>

                                    {/* Time + status */}
                                    <div className="flex items-center justify-end gap-1 mt-0.5 -mb-0.5">
                                        <span
                                            className={cn(
                                                "text-[11px]",
                                                msg.sender === "user"
                                                    ? isDarkMode
                                                        ? "text-white/50"
                                                        : "text-slate-500"
                                                    : isDarkMode
                                                        ? "text-white/30"
                                                        : "text-slate-400"
                                            )}
                                        >
                                            {formatTime(msg.timestamp)}
                                        </span>
                                        {msg.sender === "user" && (
                                            <CheckCheck size={14} className="text-[#53BDEB]" />
                                        )}
                                    </div>

                                    {/* Knowledge sources indicator */}
                                    {msg.sender === "ai" && (
                                        <button
                                            onClick={() => setSelectedMessageId(
                                                selectedMessageId === msg.id ? null : msg.id
                                            )}
                                            className={cn(
                                                "flex items-center gap-1 mt-1.5 px-2 py-1 rounded-md text-[10px] font-medium transition-colors",
                                                msg.responseOrigin === "knowledge_base"
                                                    ? isDarkMode
                                                        ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                                                        : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                                                    : isDarkMode
                                                        ? "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                                                        : "bg-amber-50 text-amber-600 hover:bg-amber-100",
                                                selectedMessageId === msg.id && (
                                                    msg.responseOrigin === "knowledge_base"
                                                        ? isDarkMode ? "ring-1 ring-emerald-500/30" : "ring-1 ring-emerald-300"
                                                        : isDarkMode ? "ring-1 ring-amber-500/30" : "ring-1 ring-amber-300"
                                                )
                                            )}
                                        >
                                            {msg.responseOrigin === "knowledge_base" ? (
                                                <>
                                                    <BookOpen size={10} />
                                                    {msg.knowledgeSources?.length || 0} KB source{(msg.knowledgeSources?.length || 0) > 1 ? "s" : ""} used
                                                </>
                                            ) : (
                                                <>
                                                    <Brain size={10} />
                                                    AI Generated
                                                </>
                                            )}
                                            <ChevronRight size={10} className={cn(
                                                "transition-transform",
                                                selectedMessageId === msg.id && "rotate-90"
                                            )} />
                                        </button>
                                    )}

                                    {/* Token usage */}
                                    {msg.tokenUsage && msg.tokenUsage.total_tokens > 0 && (
                                        <div
                                            className={cn(
                                                "text-[10px] mt-1 font-mono",
                                                isDarkMode ? "text-white/20" : "text-slate-400"
                                            )}
                                        >
                                            {msg.tokenUsage.total_tokens} tokens
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Typing indicator */}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div
                                    className={cn(
                                        "rounded-lg px-4 py-3",
                                        isDarkMode
                                            ? "bg-[#1F2C33]"
                                            : "bg-white shadow-sm"
                                    )}
                                >
                                    <div className="flex items-center gap-1">
                                        <div
                                            className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce"
                                            style={{ animationDelay: "0ms" }}
                                        />
                                        <div
                                            className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce"
                                            style={{ animationDelay: "150ms" }}
                                        />
                                        <div
                                            className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce"
                                            style={{ animationDelay: "300ms" }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div
                        className={cn(
                            "px-3 py-2.5 flex items-center gap-2",
                            isDarkMode
                                ? "bg-[#1F2C33]"
                                : "bg-[#F0F2F5]"
                        )}
                    >
                        <button
                            className={cn(
                                "p-2 rounded-full transition-colors",
                                isDarkMode
                                    ? "text-white/40 hover:text-white/60"
                                    : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            <Smile size={22} />
                        </button>

                        <button
                            className={cn(
                                "p-2 rounded-full transition-colors",
                                isDarkMode
                                    ? "text-white/40 hover:text-white/60"
                                    : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            <Paperclip size={22} />
                        </button>

                        <div className="flex-1">
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Type a message"
                                disabled={chatMutation.isPending}
                                className={cn(
                                    "w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-colors",
                                    isDarkMode
                                        ? "bg-[#2A3942] text-white placeholder:text-white/30 focus:bg-[#2A3942]"
                                        : "bg-white text-slate-900 placeholder:text-slate-400 focus:bg-white"
                                )}
                            />
                        </div>

                        {inputValue.trim() ? (
                            <button
                                onClick={handleSendMessage}
                                disabled={chatMutation.isPending}
                                className={cn(
                                    "p-2.5 rounded-full transition-all duration-200",
                                    "bg-[#00A884] text-white hover:bg-[#008F72]",
                                    chatMutation.isPending && "opacity-50 cursor-not-allowed"
                                )}
                            >
                                <Send size={20} />
                            </button>
                        ) : (
                            <button
                                className={cn(
                                    "p-2.5 rounded-full transition-colors",
                                    isDarkMode
                                        ? "text-white/40 hover:text-white/60"
                                        : "text-slate-500 hover:text-slate-700"
                                )}
                            >
                                <Mic size={22} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Right Panel - AI Response Analysis */}
                <div
                    className={cn(
                        "w-96 rounded-2xl border flex flex-col overflow-hidden",
                        isDarkMode
                            ? "bg-[#151518]/90 border-white/10"
                            : "bg-white border-slate-200 shadow-lg"
                    )}
                >
                    {(() => {
                        const selectedMsg = messages.find((m) => m.id === selectedMessageId);

                        if (!selectedMsg || selectedMsg.sender !== "ai") {
                            // Default: show all knowledge sources
                            return (
                                <>
                                    <div
                                        className={cn(
                                            "px-4 py-3.5 flex items-center gap-2.5 border-b shrink-0",
                                            isDarkMode ? "border-white/10" : "border-slate-200"
                                        )}
                                    >
                                        <Database
                                            size={16}
                                            className={isDarkMode ? "text-emerald-400" : "text-emerald-600"}
                                        />
                                        <h3
                                            className={cn(
                                                "font-semibold text-sm",
                                                isDarkMode ? "text-white" : "text-slate-900"
                                            )}
                                        >
                                            Knowledge Sources
                                        </h3>
                                        <span
                                            className={cn(
                                                "ml-auto text-[10px] font-medium px-2 py-0.5 rounded-full",
                                                isDarkMode
                                                    ? "bg-white/5 text-white/40"
                                                    : "bg-slate-100 text-slate-500"
                                            )}
                                        >
                                            {knowledgeData?.data?.length || 0} available
                                        </span>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
                                        {knowledgeData?.data && knowledgeData.data.length > 0 ? (
                                            knowledgeData.data.map((source: KnowledgeSource) => (
                                                <div
                                                    key={source.id}
                                                    className={cn(
                                                        "p-3 rounded-xl border transition-all",
                                                        isDarkMode
                                                            ? "bg-white/[0.02] border-white/5"
                                                            : "bg-slate-50 border-slate-200"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <FileText
                                                            size={14}
                                                            className={isDarkMode ? "text-white/30" : "text-slate-400"}
                                                        />
                                                        <p
                                                            className={cn(
                                                                "text-sm font-medium",
                                                                isDarkMode ? "text-white/80" : "text-slate-900"
                                                            )}
                                                        >
                                                            {source.title}
                                                        </p>
                                                    </div>
                                                    <span
                                                        className={cn(
                                                            "inline-block mt-1.5 ml-6 px-2 py-0.5 rounded text-[10px] font-medium uppercase",
                                                            isDarkMode
                                                                ? "bg-white/5 text-white/40"
                                                                : "bg-slate-100 text-slate-500"
                                                        )}
                                                    >
                                                        {source.type}
                                                    </span>
                                                </div>
                                            ))
                                        ) : (
                                            <div
                                                className={cn(
                                                    "text-center py-12",
                                                    isDarkMode ? "text-white/30" : "text-slate-400"
                                                )}
                                            >
                                                <Database size={28} className="mx-auto mb-3 opacity-40" />
                                                <p className="text-sm font-medium">No knowledge sources</p>
                                                <p className="text-xs mt-1 opacity-70">
                                                    Upload documents in the Knowledge section
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div
                                        className={cn(
                                            "px-4 py-3 border-t shrink-0",
                                            isDarkMode ? "border-white/5" : "border-slate-100"
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                "flex items-start gap-2 text-[11px]",
                                                isDarkMode ? "text-white/25" : "text-slate-400"
                                            )}
                                        >
                                            <Info size={12} className="mt-0.5 shrink-0" />
                                            <p>Click on any AI response to see which knowledge sources and transcripts were used.</p>
                                        </div>
                                    </div>
                                </>
                            );
                        }

                        // Selected message: show detailed analysis
                        const isKB = selectedMsg.responseOrigin === "knowledge_base";
                        const sources = selectedMsg.knowledgeSources || [];
                        const chunks = selectedMsg.knowledgeChunksUsed || [];
                        const resolvedLogs = selectedMsg.resolvedLogsUsed || "";
                        const classification = selectedMsg.classification;

                        return (
                            <>
                                {/* Panel Header */}
                                <div
                                    className={cn(
                                        "px-4 py-3 flex items-center justify-between border-b shrink-0",
                                        isDarkMode ? "border-white/10" : "border-slate-200"
                                    )}
                                >
                                    <div className="flex items-center gap-2">
                                        {isKB ? (
                                            <BookOpen size={16} className={isDarkMode ? "text-emerald-400" : "text-emerald-600"} />
                                        ) : (
                                            <Brain size={16} className={isDarkMode ? "text-amber-400" : "text-amber-600"} />
                                        )}
                                        <h3
                                            className={cn(
                                                "font-semibold text-sm",
                                                isDarkMode ? "text-white" : "text-slate-900"
                                            )}
                                        >
                                            Response Analysis & Thought Process
                                        </h3>
                                    </div>
                                    <button
                                        onClick={() => setSelectedMessageId(null)}
                                        className={cn(
                                            "p-1 rounded transition-colors",
                                            isDarkMode
                                                ? "text-white/40 hover:text-white/60 hover:bg-white/5"
                                                : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                                        )}
                                    >
                                        <X size={16} />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto">
                                    {/* Response Origin Badge */}
                                    <div className="px-4 pt-4 pb-2">
                                        <div
                                            className={cn(
                                                "flex items-center gap-2.5 p-3 rounded-xl border",
                                                isKB
                                                    ? isDarkMode
                                                        ? "bg-emerald-500/5 border-emerald-500/20"
                                                        : "bg-emerald-50 border-emerald-200"
                                                    : isDarkMode
                                                        ? "bg-amber-500/5 border-amber-500/20"
                                                        : "bg-amber-50 border-amber-200"
                                            )}
                                        >
                                            <div
                                                className={cn(
                                                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                                                    isKB
                                                        ? isDarkMode
                                                            ? "bg-emerald-500/20"
                                                            : "bg-emerald-100"
                                                        : isDarkMode
                                                            ? "bg-amber-500/20"
                                                            : "bg-amber-100"
                                                )}
                                            >
                                                {isKB ? (
                                                    <Database size={16} className={isDarkMode ? "text-emerald-400" : "text-emerald-600"} />
                                                ) : (
                                                    <Sparkles size={16} className={isDarkMode ? "text-amber-400" : "text-amber-600"} />
                                                )}
                                            </div>
                                            <div>
                                                <p
                                                    className={cn(
                                                        "text-xs font-bold",
                                                        isKB
                                                            ? isDarkMode ? "text-emerald-400" : "text-emerald-700"
                                                            : isDarkMode ? "text-amber-400" : "text-amber-700"
                                                    )}
                                                >
                                                    {isKB ? "Knowledge Base Response" : "AI Generated Response"}
                                                </p>
                                                <p
                                                    className={cn(
                                                        "text-[10px] mt-0.5",
                                                        isDarkMode ? "text-white/40" : "text-slate-500"
                                                    )}
                                                >
                                                    {isKB
                                                        ? `Based on ${sources.length} knowledge source${sources.length > 1 ? "s" : ""}`
                                                        : "No matching knowledge found — AI generated this response"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Technical Logs / Thought Process */}
                                    {selectedMsg.technicalLogs && (
                                        <div className="px-4 pb-2">
                                            <p
                                                className={cn(
                                                    "text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5",
                                                    isDarkMode ? "text-blue-400/60" : "text-blue-600/70"
                                                )}
                                            >
                                                <Cpu size={10} />
                                                AI Thought Process
                                            </p>
                                            <div className="space-y-3">
                                                {/* System Prompt (Collapsible) */}
                                                <div className={cn(
                                                    "rounded-lg border overflow-hidden",
                                                    isDarkMode ? "bg-white/[0.02] border-white/5" : "bg-slate-50 border-slate-200"
                                                )}>
                                                    <details className="group">
                                                        <summary className="flex items-center justify-between p-2 cursor-pointer hover:bg-white/5 transition-colors">
                                                            <span className={cn("text-[10px] font-bold uppercase", isDarkMode ? "text-white/40" : "text-slate-500")}>
                                                                System Prompt
                                                            </span>
                                                            <ChevronRight size={12} className="group-open:rotate-90 transition-transform" />
                                                        </summary>
                                                        <div className="p-3 pt-0">
                                                            <pre className={cn(
                                                                "text-[9px] leading-relaxed whitespace-pre-wrap font-mono max-h-48 overflow-y-auto",
                                                                isDarkMode ? "text-white/50" : "text-slate-600"
                                                            )}>
                                                                {selectedMsg.technicalLogs.systemPrompt}
                                                            </pre>
                                                        </div>
                                                    </details>
                                                </div>

                                                {/* Raw AI Response */}
                                                <div className={cn(
                                                    "rounded-lg border overflow-hidden",
                                                    isDarkMode ? "bg-white/[0.02] border-white/5" : "bg-slate-50 border-slate-200"
                                                )}>
                                                    <details className="group">
                                                        <summary className="flex items-center justify-between p-2 cursor-pointer hover:bg-white/5 transition-colors">
                                                            <span className={cn("text-[10px] font-bold uppercase", isDarkMode ? "text-white/40" : "text-slate-500")}>
                                                                Raw AI Output
                                                            </span>
                                                            <ChevronRight size={12} className="group-open:rotate-90 transition-transform" />
                                                        </summary>
                                                        <div className="p-3 pt-0">
                                                            <pre className={cn(
                                                                "text-[9px] leading-relaxed whitespace-pre-wrap font-mono",
                                                                isDarkMode ? "text-white/50" : "text-slate-600"
                                                            )}>
                                                                {selectedMsg.technicalLogs.rawAIResponse}
                                                            </pre>
                                                        </div>
                                                    </details>
                                                </div>

                                                {/* Detected Action Tag */}
                                                {selectedMsg.technicalLogs.detectedTags && (
                                                    <div className={cn(
                                                        "p-3 rounded-lg border",
                                                        isDarkMode ? "bg-emerald-500/5 border-emerald-500/15" : "bg-emerald-50 border-emerald-200"
                                                    )}>
                                                        <p className={cn("text-[10px] font-bold uppercase mb-2", isDarkMode ? "text-emerald-400" : "text-emerald-600")}>
                                                            Detected Action
                                                        </p>
                                                        <div className="flex items-center gap-2 mb-1.5">
                                                            <Zap size={14} className={isDarkMode ? "text-emerald-400" : "text-emerald-500"} />
                                                            <span className={cn("text-xs font-bold font-mono", isDarkMode ? "text-white" : "text-slate-900")}>
                                                                {selectedMsg.technicalLogs.detectedTags.tag}
                                                            </span>
                                                        </div>
                                                        {selectedMsg.technicalLogs.detectedTags.payload && (
                                                            <div className={cn(
                                                                "p-2 rounded bg-black/20 font-mono text-[9px]",
                                                                isDarkMode ? "text-emerald-300/80" : "text-emerald-700"
                                                            )}>
                                                                Payload: {selectedMsg.technicalLogs.detectedTags.payload}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Execution History */}
                                                {selectedMsg.technicalLogs.tagExecutionHistory?.length > 0 && (
                                                    <div className={cn(
                                                        "p-3 rounded-lg border",
                                                        isDarkMode ? "bg-white/[0.02] border-white/5" : "bg-slate-50 border-slate-200"
                                                    )}>
                                                        <p className={cn("text-[10px] font-bold uppercase mb-2", isDarkMode ? "text-white/40" : "text-slate-500")}>
                                                            Execution Log
                                                        </p>
                                                        <div className="space-y-1.5">
                                                            {selectedMsg.technicalLogs.tagExecutionHistory.map((log, i) => (
                                                                <div key={i} className="flex items-start gap-2">
                                                                    <div className="w-1 h-1 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                                                                    <p className={cn("text-[10px] font-medium leading-tight", isDarkMode ? "text-blue-400" : "text-blue-600")}>
                                                                        {log}
                                                                    </p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    {/* Classification */}
                                    {classification && (
                                        <div className="px-4 pb-2">
                                            <div
                                                className={cn(
                                                    "flex items-center gap-2 p-2.5 rounded-lg",
                                                    classification.category === "MISSING_KNOWLEDGE" || classification.category === "OUT_OF_SCOPE"
                                                        ? isDarkMode
                                                            ? "bg-rose-500/5 border border-rose-500/20"
                                                            : "bg-rose-50 border border-rose-200"
                                                        : isDarkMode
                                                            ? "bg-white/[0.02] border border-white/5"
                                                            : "bg-slate-50 border border-slate-200"
                                                )}
                                            >
                                                {(classification.category === "MISSING_KNOWLEDGE" || classification.category === "OUT_OF_SCOPE") && (
                                                    <AlertTriangle size={14} className={isDarkMode ? "text-rose-400" : "text-rose-500"} />
                                                )}
                                                <div className="min-w-0">
                                                    <p
                                                        className={cn(
                                                            "text-[10px] font-bold uppercase tracking-wider",
                                                            isDarkMode ? "text-white/40" : "text-slate-500"
                                                        )}
                                                    >
                                                        Classification
                                                    </p>
                                                    <p
                                                        className={cn(
                                                            "text-xs font-medium mt-0.5",
                                                            isDarkMode ? "text-white/70" : "text-slate-700"
                                                        )}
                                                    >
                                                        {classification.category.replace(/_/g, " ")}
                                                    </p>
                                                    {classification.reason && (
                                                        <p
                                                            className={cn(
                                                                "text-[11px] mt-0.5",
                                                                isDarkMode ? "text-white/30" : "text-slate-400"
                                                            )}
                                                        >
                                                            {classification.reason}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Referenced Knowledge Sources */}
                                    {sources.length > 0 && (
                                        <div className="px-4 pb-2">
                                            <p
                                                className={cn(
                                                    "text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5",
                                                    isDarkMode ? "text-emerald-400/60" : "text-emerald-600/70"
                                                )}
                                            >
                                                <BookOpen size={10} />
                                                Referenced Sources ({sources.length})
                                            </p>
                                            <div className="space-y-1.5">
                                                {sources.map((source) => (
                                                    <div
                                                        key={source.id}
                                                        className={cn(
                                                            "p-2.5 rounded-lg border",
                                                            isDarkMode
                                                                ? "bg-emerald-500/5 border-emerald-500/15"
                                                                : "bg-emerald-50/70 border-emerald-200"
                                                        )}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <div
                                                                className={cn(
                                                                    "w-1.5 h-1.5 rounded-full shrink-0",
                                                                    isDarkMode ? "bg-emerald-400" : "bg-emerald-500"
                                                                )}
                                                            />
                                                            <p
                                                                className={cn(
                                                                    "text-xs font-semibold",
                                                                    isDarkMode ? "text-white/90" : "text-slate-900"
                                                                )}
                                                            >
                                                                {source.title}
                                                            </p>
                                                            <span
                                                                className={cn(
                                                                    "ml-auto px-1.5 py-0.5 rounded text-[9px] font-medium uppercase",
                                                                    isDarkMode
                                                                        ? "bg-white/5 text-white/30"
                                                                        : "bg-white text-slate-500"
                                                                )}
                                                            >
                                                                {source.type}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Reference Transcripts */}
                                    {chunks.length > 0 && (
                                        <div className="px-4 pb-2">
                                            <p
                                                className={cn(
                                                    "text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5",
                                                    isDarkMode ? "text-blue-400/60" : "text-blue-600/70"
                                                )}
                                            >
                                                <FileText size={10} />
                                                Reference Transcripts ({chunks.length})
                                            </p>
                                            <div className="space-y-2">
                                                {chunks.map((chunk, idx) => (
                                                    <div
                                                        key={idx}
                                                        className={cn(
                                                            "p-3 rounded-lg border relative",
                                                            isDarkMode
                                                                ? "bg-blue-500/5 border-blue-500/15"
                                                                : "bg-blue-50/70 border-blue-200"
                                                        )}
                                                    >
                                                        <div className="flex items-center gap-1.5 mb-1.5">
                                                            <div
                                                                className={cn(
                                                                    "px-1.5 py-0.5 rounded text-[9px] font-bold",
                                                                    isDarkMode
                                                                        ? "bg-blue-500/20 text-blue-400"
                                                                        : "bg-blue-100 text-blue-600"
                                                                )}
                                                            >
                                                                CHUNK {idx + 1}
                                                            </div>
                                                            {/* Find which source this chunk belongs to */}
                                                            {sources.map((src) =>
                                                                src.chunks?.includes(chunk) ? (
                                                                    <span
                                                                        key={src.id}
                                                                        className={cn(
                                                                            "text-[9px] font-medium",
                                                                            isDarkMode ? "text-white/30" : "text-slate-400"
                                                                        )}
                                                                    >
                                                                        from: {src.title}
                                                                    </span>
                                                                ) : null
                                                            )}
                                                        </div>
                                                        <p
                                                            className={cn(
                                                                "text-[11px] leading-[17px] whitespace-pre-wrap break-words font-mono",
                                                                isDarkMode ? "text-white/60" : "text-slate-600"
                                                            )}
                                                        >
                                                            {chunk.length > 300 ? chunk.substring(0, 300) + "..." : chunk}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Resolved Logs Used */}
                                    {resolvedLogs && resolvedLogs.trim() && (
                                        <div className="px-4 pb-2">
                                            <p
                                                className={cn(
                                                    "text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5",
                                                    isDarkMode ? "text-purple-400/60" : "text-purple-600/70"
                                                )}
                                            >
                                                <Sparkles size={10} />
                                                Resolved Log References
                                            </p>
                                            <div
                                                className={cn(
                                                    "p-3 rounded-lg border",
                                                    isDarkMode
                                                        ? "bg-purple-500/5 border-purple-500/15"
                                                        : "bg-purple-50/70 border-purple-200"
                                                )}
                                            >
                                                <p
                                                    className={cn(
                                                        "text-[11px] leading-[17px] whitespace-pre-wrap break-words font-mono",
                                                        isDarkMode ? "text-white/60" : "text-slate-600"
                                                    )}
                                                >
                                                    {resolvedLogs.length > 500 ? resolvedLogs.substring(0, 500) + "..." : resolvedLogs}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* No KB — AI generated info */}
                                    {!isKB && chunks.length === 0 && !resolvedLogs?.trim() && (
                                        <div className="px-4 pb-3">
                                            <div
                                                className={cn(
                                                    "text-center py-6 rounded-xl border",
                                                    isDarkMode
                                                        ? "bg-amber-500/5 border-amber-500/10"
                                                        : "bg-amber-50/50 border-amber-200"
                                                )}
                                            >
                                                <Brain
                                                    size={24}
                                                    className={cn(
                                                        "mx-auto mb-2",
                                                        isDarkMode ? "text-amber-400/50" : "text-amber-500/50"
                                                    )}
                                                />
                                                <p
                                                    className={cn(
                                                        "text-xs font-medium",
                                                        isDarkMode ? "text-amber-400/70" : "text-amber-600"
                                                    )}
                                                >
                                                    No knowledge base match
                                                </p>
                                                <p
                                                    className={cn(
                                                        "text-[10px] mt-1 max-w-[200px] mx-auto",
                                                        isDarkMode ? "text-white/30" : "text-slate-400"
                                                    )}
                                                >
                                                    This response was generated purely by AI without any knowledge base reference
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Token Usage */}
                                    {selectedMsg.tokenUsage && selectedMsg.tokenUsage.total_tokens > 0 && (
                                        <div className="px-4 pb-4">
                                            <p
                                                className={cn(
                                                    "text-[10px] font-bold uppercase tracking-wider mb-2",
                                                    isDarkMode ? "text-white/25" : "text-slate-400"
                                                )}
                                            >
                                                Token Usage
                                            </p>
                                            <div className="grid grid-cols-3 gap-2">
                                                {[
                                                    { label: "Prompt", value: selectedMsg.tokenUsage.prompt_tokens },
                                                    { label: "Completion", value: selectedMsg.tokenUsage.completion_tokens },
                                                    { label: "Total", value: selectedMsg.tokenUsage.total_tokens },
                                                ].map((item) => (
                                                    <div
                                                        key={item.label}
                                                        className={cn(
                                                            "text-center p-2 rounded-lg border",
                                                            isDarkMode
                                                                ? "bg-white/[0.02] border-white/5"
                                                                : "bg-slate-50 border-slate-200"
                                                        )}
                                                    >
                                                        <p
                                                            className={cn(
                                                                "text-sm font-bold font-mono",
                                                                isDarkMode ? "text-white/70" : "text-slate-700"
                                                            )}
                                                        >
                                                            {item.value}
                                                        </p>
                                                        <p
                                                            className={cn(
                                                                "text-[9px] font-medium uppercase",
                                                                isDarkMode ? "text-white/25" : "text-slate-400"
                                                            )}
                                                        >
                                                            {item.label}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        );
                    })()}
                </div>
            </div>
        </div>
    );
};
