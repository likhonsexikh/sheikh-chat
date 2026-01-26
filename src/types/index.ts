export interface Message {
    id: string;
    content: string;
    role: 'user' | 'ai';
    timestamp?: any;
}

export interface Conversation {
    id: string;
    messages: Message[];
    createdAt: any;
    updatedAt: any;
}

export interface AgentTask {
    id: string;
    type: 'research' | 'analysis' | 'generation' | 'summarization' | 'code' | 'general';
    prompt: string;
    context: Message[];
    priority: 'high' | 'medium' | 'low';
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    result?: string;
    error?: string;
}

export interface Agent {
    id: string;
    name: string;
    capabilities: string[];
    execute(task: AgentTask): Promise<string>;
}