const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

export const callGemini = async (prompt: string, systemInstruction = "You are a helpful assistant for a business automation platform.") => {
    if (!apiKey) {
        console.warn("Gemini API Key is missing.");
        return "Simulation Mode: API Key missing.";
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

    const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: { parts: [{ text: systemInstruction }] }
    };

    const delays = [1000, 2000, 4000, 8000, 16000];

    for (let i = 0; i <= delays.length; i++) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error('API Error');

            const result = await response.json();
            return result.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
        } catch (error) {
            if (i === delays.length) throw new Error("Failed after multiple retries. Please check your connection.");
            await new Promise(resolve => setTimeout(resolve, delays[i]));
        }
    }
};
