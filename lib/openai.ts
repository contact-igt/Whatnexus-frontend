
const openaiApiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || "";

export const callOpenAI = async (
    prompt: string,
    systemInstruction = "You are a helpful assistant for a business automation platform."
) => {
    if (!openaiApiKey) {
        console.warn("OpenAI API Key is missing.");
        return "Simulation Mode: API Key missing.";
    }

    const url = "https://api.openai.com/v1/chat/completions";

    const payload = {
        model: "gpt-4o-mini", // Using a valid standard model
        messages: [
            {
                role: "system",
                content: systemInstruction,
            },
            {
                role: "user",
                content: prompt,
            },
        ],
    };

    const delays = [1000, 2000, 4000];

    for (let i = 0; i < delays.length; i++) {
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${openaiApiKey}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error("OpenAI API Error:", response.status, errorData);
                throw new Error(`API Error: ${response.status}`);
            }

            const result = await response.json();
            return result.choices?.[0]?.message?.content || "No response generated.";

        } catch (error) {
            console.error(`Attempt ${i + 1} failed:`, error);
            if (i === delays.length - 1) {
                return "Failed to generate response. Please check your connection or API key.";
            }
            await new Promise((resolve) => setTimeout(resolve, delays[i]));
        }
    }
    return "Unexpected error occurred.";
};
