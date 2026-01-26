import { useState, useCallback } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export const useGemini = () => {
    const [loading, setLoading] = useState(false);

    const streamResponse = useCallback(async (
        messages: { role: string; content: string }[],
        onChunk: (chunk: string) => void,
        onFinish: () => void,
        onError: (err: any) => void
    ) => {
        if (!API_KEY || API_KEY.includes('INSERT')) {
            onError(new Error("Gemini API Key is missing in .env.local"));
            return;
        }

        setLoading(true);
        try {
            const genAI = new GoogleGenerativeAI(API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            // Convert history to Gemini format (excluding the last message which is the prompt)
            const history = messages.slice(0, -1).map(msg => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }],
            }));

            const lastMessage = messages[messages.length - 1];

            const chat = model.startChat({
                history: history,
            });

            const result = await chat.sendMessageStream(lastMessage.content);

            for await (const chunk of result.stream) {
                const chunkText = chunk.text();
                onChunk(chunkText);
            }

            onFinish();
        } catch (error) {
            console.error("Gemini Error:", error);
            onError(error);
        } finally {
            setLoading(false);
        }
    }, []);

    return { streamResponse, loading };
};
