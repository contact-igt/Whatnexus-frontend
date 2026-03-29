
import { _axios } from "@/helper/axios";

/**
 * Call AI completion via backend endpoint
 * Uses tenant's selected AI model configured in settings
 */
export const callOpenAI = async (
    prompt: string,
    systemInstruction = "You are a helpful assistant for a business automation platform."
) => {
    try {
        const response = await _axios("POST", "/whatsapp/ai/completion", {
            prompt,
            systemInstruction,
        });

        return response?.data?.content || "No response generated.";
    } catch (error: unknown) {
        console.error("AI Completion Error:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        return `Failed to generate response: ${errorMessage}`;
    }
};
