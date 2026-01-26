import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';
import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

// Initialize Firebase Admin
admin.initializeApp();

// Load environment variables
dotenv.config();

const db = admin.firestore();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const app = express();

// Enable CORS for all routes
app.use(cors({ origin: true }));
app.use(express.json());

// Rate limiting middleware
const rateLimit = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(userId: string): boolean {
    const now = Date.now();
    const limit = rateLimit.get(userId);

    if (!limit) {
        rateLimit.set(userId, { count: 1, resetTime: now + 60000 });
        return true;
    }

    if (now > limit.resetTime) {
        rateLimit.set(userId, { count: 1, resetTime: now + 60000 });
        return true;
    }

    if (limit.count >= 60) { // 60 requests per minute
        return false;
    }

    limit.count++;
    return true;
}

// Secure Gemini API endpoint
app.post('/gemini/chat', async (req: express.Request, res: express.Response) => {
    try {
        const { messages, userId } = req.body;

        if (!userId) {
            res.status(400).json({ error: 'User ID is required' });
            return;
        }

        if (!checkRateLimit(userId)) {
            res.status(429).json({ error: 'Rate limit exceeded' });
            return;
        }

        if (!messages || !Array.isArray(messages)) {
            res.status(400).json({ error: 'Invalid messages format' });
            return;
        }

        // Validate and sanitize messages
        const sanitizedMessages = messages.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content.slice(0, 10000) }] // Limit message length
        }));

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const chat = model.startChat({
            history: sanitizedMessages.slice(0, -1),
            generationConfig: {
                maxOutputTokens: 2000,
                temperature: 0.7,
                topP: 0.8,
                topK: 40
            }
        });

        const result = await chat.sendMessageStream(sanitizedMessages[sanitizedMessages.length - 1].parts[0].text);

        let fullResponse = '';
        for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            fullResponse += chunkText;
        }

        // Store conversation in Firestore
        if (userId) {
            const conversationRef = db.collection('users').doc(userId).collection('conversations').doc();
            await conversationRef.set({
                messages: [
                    ...messages,
                    { role: 'assistant', content: fullResponse, timestamp: admin.firestore.FieldValue.serverTimestamp() }
                ],
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
        }

        res.json({ response: fullResponse });
    } catch (error) {
        console.error('Gemini API Error:', error);
        res.status(500).json({ error: 'Failed to process request' });
    }
});

// Get conversation history
app.get('/conversations/:userId', async (req: express.Request, res: express.Response) => {
    try {
        const { userId } = req.params;
        const { limit = 10 } = req.query;

        const conversationsSnapshot = await db.collection('users')
            .doc(userId)
            .collection('conversations')
            .orderBy('createdAt', 'desc')
            .limit(parseInt(limit as string))
            .get();

        const conversations = conversationsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.json({ conversations });
    } catch (error) {
        console.error('Firestore Error:', error);
        res.status(500).json({ error: 'Failed to fetch conversations' });
    }
});

// Delete conversation
app.delete('/conversations/:userId/:conversationId', async (req: express.Request, res: express.Response) => {
    try {
        const { userId, conversationId } = req.params;

        await db.collection('users')
            .doc(userId)
            .collection('conversations')
            .doc(conversationId)
            .delete();

        res.json({ success: true });
    } catch (error) {
        console.error('Firestore Error:', error);
        res.status(500).json({ error: 'Failed to delete conversation' });
    }
});

// Health check endpoint
app.get('/health', (req: express.Request, res: express.Response) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Export the Express app as a Firebase Function
export const api = functions.https.onRequest(app);

// Scheduled cleanup function to remove old conversations (older than 30 days)
export const cleanupOldConversations = functions.pubsub.schedule('0 2 * * *')
    .timeZone('Asia/Dhaka')
    .onRun(async (context: functions.EventContext) => {
        const thirtyDaysAgo = admin.firestore.Timestamp.fromDate(
            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        );

        const usersSnapshot = await db.collection('users').get();

        for (const userDoc of usersSnapshot.docs) {
            const conversationsRef = userDoc.ref.collection('conversations');
            const oldConversationsSnapshot = await conversationsRef
                .where('createdAt', '<', thirtyDaysAgo)
                .get();

            const batch = db.batch();
            oldConversationsSnapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });

            await batch.commit();
        }

        console.log('Cleanup completed');
    });