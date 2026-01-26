import { auth } from '../firebase';

const API_BASE_URL = '/api';

export interface ChatMessage {
    role: string;
    content: string;
}

export interface ChatResponse {
    response: string;
}

export const chatWithGemini = async (messages: ChatMessage[]): Promise<string> => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
        throw new Error("User not authenticated");
    }

    const token = await currentUser.getIdToken();

    const response = await fetch(`${API_BASE_URL}/gemini/chat`, {
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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data: ChatResponse = await response.json();
    return data.response;
};
