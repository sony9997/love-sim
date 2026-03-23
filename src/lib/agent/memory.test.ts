import { describe, it, expect } from 'vitest';
import { ConversationContext, addAgentMemory, hasAgentMemory, getRecentMemories } from './memory';
import type { AgentMemory } from '@/lib/game-data/types';

describe('Memory System', () => {
    describe('ConversationContext', () => {
        it('should store messages and maintain context', () => {
            const context = new ConversationContext(5);
            context.addMessage('user', 'Hello');
            context.addMessage('assistant', 'Hi there');
            context.addMessage('user', 'How are you?');

            const messages = context.getContext();
            expect(messages.length).toBe(3);
            expect(messages[0].content).toBe('Hello');
            expect(messages[1].content).toBe('Hi there');
        });

        it('should limit context to max turns', () => {
            const context = new ConversationContext(3);
            context.addMessage('user', 'Message 1');
            context.addMessage('user', 'Message 2');
            context.addMessage('user', 'Message 3');
            context.addMessage('user', 'Message 4');

            const messages = context.getContext();
            expect(messages.length).toBe(3);
            expect(messages[0].content).toBe('Message 2'); // Oldest should be removed
        });

        it('should clear context', () => {
            const context = new ConversationContext();
            context.addMessage('user', 'Hello');
            context.addMessage('assistant', 'Hi');
            context.clear();

            expect(context.getContext().length).toBe(0);
        });

        it('should track message metadata', () => {
            const context = new ConversationContext();
            context.addMessage('user', 'Hello', { type: 'greeting', character: 'su_qingqian' });

            const messages = context.getContext();
            expect(messages[0].metadata).toBeDefined();
            expect(messages[0].metadata?.character).toBe('su_qingqian');
        });
    });

    describe('addAgentMemory', () => {
        it('should add memory to agent state', () => {
            const initialState = {
                memory: [] as AgentMemory[],
                currentTime: { day: 1, hour: 12, weekday: 0 },
            };

            const newState = addAgentMemory(initialState, 'Player complimented me', 'dialogue', 40);

            expect(newState.memory.length).toBe(1);
            expect(newState.memory[0].content).toBe('Player complimented me');
            expect(newState.memory[0].type).toBe('dialogue');
            expect(newState.memory[0].emotionalValence).toBe(40);
        });

        it('should limit memory to last 10 events', () => {
            const initialState = {
                memory: [] as AgentMemory[],
                currentTime: { day: 1, hour: 12, weekday: 0 },
            };

            let currentState = initialState;
            for (let i = 0; i < 15; i++) {
                currentState = addAgentMemory(currentState, `Event ${i}`, 'event', 10);
            }

            expect(currentState.memory.length).toBe(10);
            // After adding 15 memories (capped at 10), the first 5 should be gone
            // The 6th item (index 0) should be 'Event 5'
            expect((currentState.memory[0] as AgentMemory).content).toBe('Event 5');
        });
    });

    describe('hasAgentMemory', () => {
        it('should find memory by keyword', () => {
            const agentState = {
                memory: [
                    { content: 'Player said hello', emotionalValence: 0 } as any,
                    { content: 'Player gave a gift', emotionalValence: 50 } as any,
                ],
            };

            expect(hasAgentMemory(agentState, 'hello')).toBe(true);
            expect(hasAgentMemory(agentState, 'gift')).toBe(true);
            expect(hasAgentMemory(agentState, 'goodbye')).toBe(false);
        });
    });

    describe('getRecentMemories', () => {
        it('should return recent memories', () => {
            const agentState = {
                memory: [
                    { content: 'First' } as any,
                    { content: 'Second' } as any,
                    { content: 'Third' } as any,
                    { content: 'Fourth' } as any,
                ],
            };

            const recent = getRecentMemories(agentState, 2);
            expect(recent.length).toBe(2);
            expect(recent[0].content).toBe('Third');
            expect(recent[1].content).toBe('Fourth');
        });
    });
});
