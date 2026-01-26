import { useState, useCallback } from 'react';
import { auth } from '../firebase';
import { chatWithGemini } from '../services/api';

export const useGemini = () => {
    const [loading, setLoading] = useState(false);

    const streamResponse = useCallback(async (
        messages: { role: string; content: string }[],
        onChunk: (chunk: string) => void,
        onFinish: () => void,
        onError: (err: any) => void
    ) => {
        setLoading(true);
        try {
            const fullResponse = await chatWithGemini(messages);
            onChunk(fullResponse);
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
