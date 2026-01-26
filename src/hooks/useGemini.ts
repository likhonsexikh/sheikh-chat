import { useState, useCallback } from 'react';
import { auth } from '../firebase';

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
            const currentUser = auth.currentUser;
            if (!currentUser) {
                throw new Error("User not authenticated");
            }

            const token = await currentUser.getIdToken();

            const response = await fetch('/api/gemini/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    messages,
                    userId: currentUser.uid
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Simulate streaming for now (since we're using functions)
            // In a real implementation, you'd use Server-Sent Events or WebSockets
            const fullResponse = data.response;
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
