import { _axios } from "@/helper/axios";

export interface PlaygroundMessage {
    sender: "user" | "ai";
    message: string;
}

export interface PlaygroundChatPayload {
    message: string;
    conversationHistory: PlaygroundMessage[];
}

export interface PlaygroundInboundPayload {
    message?: string;
    interactiveReplyId?: string | null;
    replyTitle?: string;
    source: "text" | "quick_reply" | "button_reply" | "list_reply";
    playgroundSessionId?: string;
    conversationHistory?: PlaygroundMessage[];
}

export interface KnowledgeSource {
    id: number;
    title: string;
    type: string;
    chunks: string[];
}

export interface PlaygroundChatResponse {
    message: string;
    data: {
        reply: string;
        technicalLogs: {
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
        knowledgeSources: KnowledgeSource[];
        knowledgeChunksUsed: string[];
        resolvedLogsUsed: string;
        responseOrigin: "knowledge_base" | "ai_generated";
        tokenUsage: {
            prompt_tokens: number;
            completion_tokens: number;
            total_tokens: number;
        };
        classification: {
            category: string;
            reason: string;
        } | null;
    };
}

export interface PlaygroundInboundResponse {
    message: string;
    data: {
        mode: "BOOK_APPOINTMENT" | "MANAGE_APPOINTMENT" | "AI" | "GENERAL_QUESTION" | string;
        handled: boolean;
        contact: {
            contact_id: string;
            name: string;
            phone: string;
        };
        responses: Array<{
            type: "text" | "interactive" | string;
            text: string;
            interactive?: any;
            rawPayload?: any;
        }>;
        debug: any;
    };
}

export class PlaygroundApiData {
    sendMessage = async (data: PlaygroundChatPayload): Promise<PlaygroundChatResponse> => {
        return await _axios("post", "/whatsapp/playground/chat", data);
    };

    sendInbound = async (data: PlaygroundInboundPayload): Promise<PlaygroundInboundResponse> => {
        return await _axios("post", "/whatsapp/playground/inbound", data);
    };

    getKnowledgeSources = async () => {
        return await _axios("get", "/whatsapp/playground/knowledge-sources");
    };
}
