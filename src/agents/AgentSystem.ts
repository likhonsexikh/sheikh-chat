import type { AgentTask, Agent } from '../types';

export class ResearchAgent implements Agent {
    id = 'research';
    name = 'Research Agent';
    capabilities = ['web_search', 'data_analysis', 'fact_checking'];

    async execute(task: AgentTask): Promise<string> {
        // Simulate research task
        return `Research completed for: ${task.prompt}`;
    }
}

export class CodeAgent implements Agent {
    id = 'code';
    name = 'Code Agent';
    capabilities = ['code_generation', 'debugging', 'refactoring'];

    async execute(task: AgentTask): Promise<string> {
        // Simulate code task
        return `Code generated for: ${task.prompt}`;
    }
}

export class AnalysisAgent implements Agent {
    id = 'analysis';
    name = 'Analysis Agent';
    capabilities = ['data_analysis', 'pattern_recognition', 'insight_generation'];

    async execute(task: AgentTask): Promise<string> {
        // Simulate analysis task
        return `Analysis completed for: ${task.prompt}`;
    }
}

export class AgentOrchestrator {
    private agents: Agent[] = [
        new ResearchAgent(),
        new CodeAgent(),
        new AnalysisAgent()
    ];

    private taskQueue: AgentTask[] = [];
    private activeTasks: Map<string, AgentTask> = new Map();

    async addTask(task: AgentTask): Promise<void> {
        this.taskQueue.push(task);
        this.processQueue();
    }

    private async processQueue(): Promise<void> {
        if (this.taskQueue.length === 0) return;

        // Sort by priority
        this.taskQueue.sort((a, b) => {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });

        const task = this.taskQueue.shift();
        if (!task) return;

        task.status = 'in_progress';
        this.activeTasks.set(task.id, task);

        try {
            const agent = this.selectAgent(task);
            const result = await agent.execute(task);
            task.status = 'completed';
            task.result = result;
        } catch (error) {
            task.status = 'failed';
            task.error = error instanceof Error ? error.message : 'Unknown error';
        } finally {
            this.activeTasks.delete(task.id);
            this.processQueue();
        }
    }

    private selectAgent(task: AgentTask): Agent {
        // Simple agent selection logic
        switch (task.type) {
            case 'code':
                return this.agents.find(a => a.id === 'code')!;
            case 'research':
                return this.agents.find(a => a.id === 'research')!;
            case 'analysis':
                return this.agents.find(a => a.id === 'analysis')!;
            default:
                return this.agents[0]; // Default to first agent
        }
    }

    getActiveTasks(): AgentTask[] {
        return Array.from(this.activeTasks.values());
    }

    getTaskStatus(taskId: string): AgentTask | undefined {
        return this.activeTasks.get(taskId);
    }
}

export const agentOrchestrator = new AgentOrchestrator();