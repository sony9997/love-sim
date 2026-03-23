import { AgentMemory, CharacterId, Time } from '../game-data/types';

export type ContextMessage = {
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
    metadata?: Record<string, any>;
};

export class ConversationContext {
    private history: ContextMessage[] = [];
    private maxTurns: number;

    constructor(maxTurns = 10) {
        this.maxTurns = maxTurns;
    }

    addMessage(role: 'user' | 'assistant', content: string, metadata?: Record<string, any>) {
        this.history.push({ role, content, timestamp: Date.now(), metadata });
        if (this.history.length > this.maxTurns) {
            this.history.shift(); // Remove oldest
        }
    }

    getContext(): ContextMessage[] {
        return [...this.history];
    }

    clear() {
        this.history = [];
    }

    getLength(): number {
        return this.history.length;
    }
}

/**
 * Add a new memory to agent's memory
 */
export function addAgentMemory(
    agentState: any,
    content: string,
    type: AgentMemory['type'] = 'event',
    emotionalValence: number = 0,
): any {
    const newMemory: AgentMemory = {
        id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        content,
        timestamp: { day: agentState.currentTime?.day || 1, hour: agentState.currentTime?.hour || 12, weekday: agentState.currentTime?.weekday || 0 },
        emotionalValence,
        strength: Math.abs(emotionalValence),
        associatedCharacters: [],
    };

    return {
        ...agentState,
        memory: [...agentState.memory, newMemory].slice(-10), // Keep last 10 memories
    };
}

/**
 * Check if agent remembers a specific topic
 */
export function hasAgentMemory(agentState: any, keyword: string): boolean {
    return agentState.memory.some((mem: AgentMemory) =>
        mem.content.toLowerCase().includes(keyword.toLowerCase()),
    );
}

/**
 * Get recent memories for context
 */
export function getRecentMemories(agentState: any, count: number = 3): AgentMemory[] {
    return agentState.memory.slice(-count);
}
