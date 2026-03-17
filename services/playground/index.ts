import { _axios } from "@/helper/axios";

export interface PlaygroundMessage {
    sender: "user" | "ai";
    message: string;
}

export interface PlaygroundChatPayload {
    message: string;
    conversationHistory: PlaygroundMessage[];
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
        responseOrigin: "knowledge_base" | "ai_generated";
        tokenUsage: {
            prompt_tokens: number;
            completion_tokens: number;
            total_tokens: number;
        };
    };
}

export class PlaygroundApiData {
    sendMessage = async (data: PlaygroundChatPayload): Promise<PlaygroundChatResponse> => {
        return await _axios("post", "/whatsapp/playground/chat", data);
    };

    getKnowledgeSources = async () => {
        return await _axios("get", "/whatsapp/playground/knowledge-sources");
    };
}
