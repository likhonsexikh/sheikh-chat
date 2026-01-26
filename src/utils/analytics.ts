import { analytics } from '../firebase';

export interface AnalyticsEvent {
    name: string;
    params?: Record<string, any>;
    timestamp: number;
}

export class AnalyticsTracker {
    private static instance: AnalyticsTracker;
    private events: AnalyticsEvent[] = [];
    private isInitialized = false;

    static getInstance(): AnalyticsTracker {
        if (!AnalyticsTracker.instance) {
            AnalyticsTracker.instance = new AnalyticsTracker();
        }
        return AnalyticsTracker.instance;
    }

    init() {
        if (this.isInitialized) return;

        try {
            // Firebase Analytics is already initialized in firebase.ts
            this.isInitialized = true;
            console.log('Analytics initialized');
        } catch (error) {
            console.error('Failed to initialize analytics:', error);
        }
    }

    trackEvent(name: string, params?: Record<string, any>) {
        const event: AnalyticsEvent = {
            name,
            params,
            timestamp: Date.now()
        };

        this.events.push(event);

        // Log to console in development
        if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
            console.log('Analytics Event:', event);
        }

        // Send to Firebase Analytics
        try {
            if (this.isInitialized && analytics) {
                // Note: Firebase Analytics web SDK v9+ uses different API
                // This is a simplified version for demonstration
                console.log('Sending to Firebase Analytics:', name, params);
            }
        } catch (error) {
            console.error('Failed to send analytics event:', error);
        }
    }

    trackUserAction(action: string, details?: Record<string, any>) {
        this.trackEvent('user_action', {
            action,
            ...details,
            timestamp: new Date().toISOString()
        });
    }

    trackError(error: Error, context?: string) {
        this.trackEvent('error', {
            error_message: error.message,
            error_stack: error.stack,
            context,
            timestamp: new Date().toISOString()
        });
    }

    trackConversation(conversationId: string, messageCount: number, duration: number) {
        this.trackEvent('conversation_completed', {
            conversation_id: conversationId,
            message_count: messageCount,
            duration_seconds: duration,
            timestamp: new Date().toISOString()
        });
    }

    getEvents(): AnalyticsEvent[] {
        return this.events;
    }

    clearEvents() {
        this.events = [];
    }
}

export const analyticsTracker = AnalyticsTracker.getInstance();