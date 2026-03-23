import { describe, it, expect, vi } from 'vitest';
import { createAgentState, checkProactiveDialogue, decideAgentAction, updateAgentMood } from './core';
import { ExtendedAgentState, CharacterId, Relationship } from '../game-data/types';

// Helper to create complete agent state
function createCompleteAgentState(charId: CharacterId): ExtendedAgentState {
    return {
        personality: ['cold'],
        coreValues: ['Rules'],
        memory: [],
        recentInteractions: [],
        mood: { base: 'neutral', intensity: 50, triggers: [] },
        currentGoal: null,
        goalsQueue: [],
        currentLocation: 'dorm_room',
        currentActivity: 'idle',
        perceivedAffection: {
            su_qingqian: 0,
            chen_siyao: 0,
            ling_ruoyu: 0,
            lu_jiaxin: 0,
        },
        socialCircle: [],
    };
}

// Helper to create complete game state
function createCompleteGameState(
    agentStates: Record<CharacterId, ExtendedAgentState>,
    relationships: Record<CharacterId, Relationship>
) {
    return {
        agentStates,
        relationships,
        player: {
            location: 'campus_map',
            stats: { intelligence: 10, charm: 10, fitness: 10, money: 1000 },
            name: 'Lin Xuan',
        },
        time: { day: 1, hour: 14, weekday: 0 },
        flags: {},
        currentScriptId: null,
        language: 'zh' as const,
    };
}

describe('Agent Core', () => {
    describe('createAgentState', () => {
        it('should create initial agent state', () => {
            const state = createAgentState('su_qingqian');

            expect(state.personality).toBeDefined();
            expect(state.personality).toContain('cold');
            expect(state.coreValues).toContain('Rules');
            expect(state.memory).toEqual([]);
            expect(state.mood.base).toBe('neutral');
            expect(state.currentGoal).not.toBeNull();
            expect(state.currentLocation).toBe('dorm_room');
        });

        it('should set different goals for different characters', () => {
            const suState = createAgentState('su_qingqian');
            const chenState = createAgentState('chen_siyao');
            const lingState = createAgentState('ling_ruoyu');
            const luState = createAgentState('lu_jiaxin');

            expect(suState.currentGoal?.description).toBe('Manage Student Council');
            expect(chenState.currentGoal?.description).toBe('Practice Dancing');
            expect(lingState.currentGoal?.description).toBe('Solve Physics Problem');
            expect(luState.currentGoal?.description).toBe('Ride Motorcycle');
        });
    });

    describe('checkProactiveDialogue', () => {
        it('should not trigger dialogue if locations differ', async () => {
            const agentState = createCompleteAgentState('su_qingqian');
            agentState.currentLocation = 'library';

            const gameState = createCompleteGameState(
                {
                    su_qingqian: agentState,
                    chen_siyao: createCompleteAgentState('chen_siyao'),
                    ling_ruoyu: createCompleteAgentState('ling_ruoyu'),
                    lu_jiaxin: createCompleteAgentState('lu_jiaxin'),
                },
                {
                    su_qingqian: { affection: 100, status: 'friend', eventsSeen: [] },
                    chen_siyao: { affection: 0, status: 'stranger', eventsSeen: [] },
                    ling_ruoyu: { affection: 0, status: 'stranger', eventsSeen: [] },
                    lu_jiaxin: { affection: 0, status: 'stranger', eventsSeen: [] },
                }
            );
            gameState.player.location = 'cafeteria';

            const result = await checkProactiveDialogue('su_qingqian', gameState);
            expect(result).toBe('IDLE');
        });

        it('should not trigger dialogue if affection is too low', async () => {
            const agentState = createCompleteAgentState('su_qingqian');
            agentState.currentLocation = 'library';

            const gameState = createCompleteGameState(
                {
                    su_qingqian: agentState,
                    chen_siyao: createCompleteAgentState('chen_siyao'),
                    ling_ruoyu: createCompleteAgentState('ling_ruoyu'),
                    lu_jiaxin: createCompleteAgentState('lu_jiaxin'),
                },
                {
                    su_qingqian: { affection: 10, status: 'stranger', eventsSeen: [] },
                    chen_siyao: { affection: 0, status: 'stranger', eventsSeen: [] },
                    ling_ruoyu: { affection: 0, status: 'stranger', eventsSeen: [] },
                    lu_jiaxin: { affection: 0, status: 'stranger', eventsSeen: [] },
                }
            );
            gameState.player.location = 'library';

            const result = await checkProactiveDialogue('su_qingqian', gameState);
            expect(result).toBe('IDLE');
        });

        it('should trigger dialogue when conditions are met', async () => {
            // Mock Math.random to return predictable values
            const randomSpy = vi.spyOn(Math, 'random');
            randomSpy.mockReturnValue(0.1); // Low value to trigger dialogue

            const agentState = createCompleteAgentState('su_qingqian');
            agentState.currentLocation = 'library';
            agentState.mood.base = 'happy';
            agentState.mood.intensity = 80;

            const gameState = createCompleteGameState(
                {
                    su_qingqian: agentState,
                    chen_siyao: createCompleteAgentState('chen_siyao'),
                    ling_ruoyu: createCompleteAgentState('ling_ruoyu'),
                    lu_jiaxin: createCompleteAgentState('lu_jiaxin'),
                },
                {
                    su_qingqian: { affection: 100, status: 'friend', eventsSeen: [] },
                    chen_siyao: { affection: 0, status: 'stranger', eventsSeen: [] },
                    ling_ruoyu: { affection: 0, status: 'stranger', eventsSeen: [] },
                    lu_jiaxin: { affection: 0, status: 'stranger', eventsSeen: [] },
                }
            );
            gameState.player.location = 'library';

            const result = await checkProactiveDialogue('su_qingqian', gameState);
            expect(result).toBe('DIALOGUE');

            randomSpy.mockRestore();
        });
    });

    describe('decideAgentAction', () => {
        it('should return INTERACT when same location and high affection', () => {
            // Mock Math.random to return a value less than 0.7 to trigger INTERACT
            const randomSpy = vi.spyOn(Math, 'random');
            randomSpy.mockReturnValue(0.1); // Low value to trigger INTERACT

            const agentState = createCompleteAgentState('su_qingqian');
            agentState.currentLocation = 'library';

            const gameState = createCompleteGameState(
                {
                    su_qingqian: agentState,
                    chen_siyao: createCompleteAgentState('chen_siyao'),
                    ling_ruoyu: createCompleteAgentState('ling_ruoyu'),
                    lu_jiaxin: createCompleteAgentState('lu_jiaxin'),
                },
                {
                    su_qingqian: { affection: 100, status: 'friend', eventsSeen: [] },
                    chen_siyao: { affection: 0, status: 'stranger', eventsSeen: [] },
                    ling_ruoyu: { affection: 0, status: 'stranger', eventsSeen: [] },
                    lu_jiaxin: { affection: 0, status: 'stranger', eventsSeen: [] },
                }
            );
            gameState.player.location = 'library';

            const result = decideAgentAction('su_qingqian', gameState, 'library');
            expect(result.type).toBe('INTERACT');

            randomSpy.mockRestore();
        });

        it('should return IDLE when locations differ', () => {
            const agentState = createCompleteAgentState('su_qingqian');
            agentState.currentLocation = 'library';

            const gameState = createCompleteGameState(
                {
                    su_qingqian: agentState,
                    chen_siyao: createCompleteAgentState('chen_siyao'),
                    ling_ruoyu: createCompleteAgentState('ling_ruoyu'),
                    lu_jiaxin: createCompleteAgentState('lu_jiaxin'),
                },
                {
                    su_qingqian: { affection: 100, status: 'friend', eventsSeen: [] },
                    chen_siyao: { affection: 0, status: 'stranger', eventsSeen: [] },
                    ling_ruoyu: { affection: 0, status: 'stranger', eventsSeen: [] },
                    lu_jiaxin: { affection: 0, status: 'stranger', eventsSeen: [] },
                }
            );
            gameState.player.location = 'cafeteria';

            const result = decideAgentAction('su_qingqian', gameState, 'cafeteria');
            expect(result.type).toBe('IDLE');
        });
    });

    describe('updateAgentMood', () => {
        it('should update mood based on positive event', () => {
            const initialState: ExtendedAgentState = {
                personality: ['hot', 'emotional'],
                coreValues: ['Dream'],
                memory: [],
                recentInteractions: [],
                mood: { base: 'neutral', intensity: 50, triggers: [] },
                currentGoal: null,
                goalsQueue: [],
                currentLocation: 'dorm_room',
                currentActivity: 'idle',
                perceivedAffection: {
                    su_qingqian: 0,
                    chen_siyao: 0,
                    ling_ruoyu: 0,
                    lu_jiaxin: 0,
                },
                socialCircle: [],
            };

            const newState = updateAgentMood(initialState, {
                type: 'compliment',
                valence: 40,
                intensity: 30,
                description: 'Received a compliment',
            });

            expect(newState.mood.base).toBe('happy');
            expect(newState.mood.intensity).toBe(80);
            expect(newState.memory.length).toBe(1);
        });

        it('should update mood based on negative event', () => {
            const initialState: ExtendedAgentState = {
                personality: ['hot', 'emotional'],
                coreValues: ['Dream'],
                memory: [],
                recentInteractions: [],
                mood: { base: 'happy', intensity: 60, triggers: [] },
                currentGoal: null,
                goalsQueue: [],
                currentLocation: 'dorm_room',
                currentActivity: 'idle',
                perceivedAffection: {
                    su_qingqian: 0,
                    chen_siyao: 0,
                    ling_ruoyu: 0,
                    lu_jiaxin: 0,
                },
                socialCircle: [],
            };

            const newState = updateAgentMood(initialState, {
                type: 'insult',
                valence: -60,
                intensity: 70,
                description: 'Received an insult',
            });

            expect(newState.mood.base).toBe('angry');
            expect(newState.mood.intensity).toBe(100);
        });

        it('should keep memory bounded to last 10 events', () => {
            const initialState: ExtendedAgentState = {
                personality: ['rational'],
                coreValues: ['Logic'],
                memory: Array(10).fill(0).map((_, i) => ({
                    id: `mem_${i}`,
                    type: 'event' as const,
                    content: `Memory ${i}`,
                    timestamp: { day: 1, hour: 12, weekday: 0 },
                    emotionalValence: 0,
                    strength: 50,
                    associatedCharacters: [],
                })),
                recentInteractions: [],
                mood: { base: 'neutral', intensity: 50, triggers: [] },
                currentGoal: null,
                goalsQueue: [],
                currentLocation: 'dorm_room',
                currentActivity: 'idle',
                perceivedAffection: {
                    su_qingqian: 0,
                    chen_siyao: 0,
                    ling_ruoyu: 0,
                    lu_jiaxin: 0,
                },
                socialCircle: [],
            };

            const newState = updateAgentMood(initialState, {
                type: 'new_event',
                valence: 20,
                intensity: 20,
                description: 'New event',
            });

            expect(newState.memory.length).toBe(10);
        });
    });
});
