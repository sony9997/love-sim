import { describe, it, expect } from 'vitest';
import {
    calculateAffectionChange,
    updateRelationshipStatus,
    checkRelationshipUnlock,
    updatePerceivedAffection,
    addToSocialCircle,
    removeFromSocialCircle,
    calculateConnectionStrength,
} from './relationship';
import { GameState, RelationshipStatus, Time, CharacterId } from '../game-data/types';

// Helper to create complete agent state
function createCompleteAgentState(charId: CharacterId): any {
    return {
        personality: ['cold'],
        coreValues: ['Rules'],
        memory: [],
        recentInteractions: [],
        mood: { base: 'neutral', intensity: 50, triggers: [] },
        currentGoal: null,
        goalsQueue: [],
        currentLocation: '',
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

describe('Relationship System', () => {
    describe('calculateAffectionChange', () => {
        it('should calculate affection change with personality multiplier', () => {
            // Rational agent + Rational player = 1.2x multiplier
            const change = calculateAffectionChange('su_qingqian', ['rational'], 10);
            expect(change).toBe(12);
        });

        it('should reduce affection change for incompatible personalities', () => {
            // Cold agent + Hot player = 0.8x multiplier
            const change = calculateAffectionChange('su_qingqian', ['hot'], 10);
            expect(change).toBe(8);
        });

        it('should handle multiple personality traits', () => {
            // su_qingqian (cold, rational, formal) + player (cold, rational)
            // Multipliers: cold-cold=1.2, cold-rational=1.2, rational-cold=1.2, rational-rational=1.2, formal-cold=1.1, formal-rational=1.2
            // Average of (1.2 + 1.2 + 1.2 + 1.2 + 1.1 + 1.2) / 6 = 1.183
            const change = calculateAffectionChange('su_qingqian', ['cold', 'rational'], 10);
            expect(change).toBeCloseTo(12, 0);
        });

        it('should handle neutral personality combinations', () => {
            // Mixed compatibility should average to around 1.0
            const change = calculateAffectionChange('chen_siyao', ['shy', 'rational'], 10);
            expect(change).toBeGreaterThan(5);
            expect(change).toBeLessThan(15);
        });
    });

    describe('updateRelationshipStatus', () => {
        it('should stay at stranger below threshold', () => {
            const status = updateRelationshipStatus(49, 'stranger');
            expect(status).toBe('stranger');
        });

        it('should progress to acquaintance at 50 affection', () => {
            const status = updateRelationshipStatus(50, 'stranger');
            expect(status).toBe('acquaintance');
        });

        it('should progress to friend at 150 affection', () => {
            const status = updateRelationshipStatus(150, 'acquaintance');
            expect(status).toBe('friend');
        });

        it('should progress to crush at 300 affection', () => {
            const status = updateRelationshipStatus(300, 'friend');
            expect(status).toBe('crush');
        });

        it('should progress to lover at 500 affection', () => {
            const status = updateRelationshipStatus(500, 'crush');
            expect(status).toBe('lover');
        });

        it('should become enemy at negative affection', () => {
            const status = updateRelationshipStatus(-50, 'stranger');
            expect(status).toBe('enemy');
        });

        it('should stay at highest status', () => {
            const status = updateRelationshipStatus(1000, 'lover');
            expect(status).toBe('lover');
        });
    });

    describe('checkRelationshipUnlock', () => {
        const createGameState = (overrides: Partial<GameState>): GameState => ({
            player: { name: '', stats: { intelligence: 10, charm: 10, fitness: 10, money: 1000 }, location: '' },
            time: { day: 1, hour: 12, weekday: 0 },
            relationships: {
                su_qingqian: { affection: 100, status: 'acquaintance', eventsSeen: [] },
                chen_siyao: { affection: 50, status: 'stranger', eventsSeen: [] },
                ling_ruoyu: { affection: 0, status: 'stranger', eventsSeen: [] },
                lu_jiaxin: { affection: 0, status: 'stranger', eventsSeen: [] },
            },
            agentStates: {
                su_qingqian: createCompleteAgentState('su_qingqian'),
                chen_siyao: createCompleteAgentState('chen_siyao'),
                ling_ruoyu: createCompleteAgentState('ling_ruoyu'),
                lu_jiaxin: createCompleteAgentState('lu_jiaxin'),
            },
            flags: {},
            currentScriptId: null,
            language: 'zh',
            ...overrides,
        });

        it('should check minAffection condition', () => {
            const state = createGameState({});

            expect(checkRelationshipUnlock(state, 'su_qingqian', { minAffection: 50 })).toBe(true);
            expect(checkRelationshipUnlock(state, 'su_qingqian', { minAffection: 150 })).toBe(false);
        });

        it('should check minStatus condition', () => {
            const state = createGameState({
                relationships: {
                    su_qingqian: { affection: 100, status: 'friend', eventsSeen: [] },
                    chen_siyao: { affection: 50, status: 'stranger', eventsSeen: [] },
                    ling_ruoyu: { affection: 0, status: 'stranger', eventsSeen: [] },
                    lu_jiaxin: { affection: 0, status: 'stranger', eventsSeen: [] },
                },
            });

            expect(checkRelationshipUnlock(state, 'su_qingqian', { minStatus: 'friend' })).toBe(true);
            expect(checkRelationshipUnlock(state, 'su_qingqian', { minStatus: 'lover' })).toBe(false);
        });

        it('should check flag condition', () => {
            const state = createGameState({
                flags: { met_su_qingqian: true },
            });

            expect(checkRelationshipUnlock(state, 'su_qingqian', { flag: 'met_su_qingqian' })).toBe(true);
            expect(checkRelationshipUnlock(state, 'su_qingqian', { flag: 'met_unknown' })).toBe(false);
        });

        it('should check hasInteracted condition', () => {
            const state = createGameState({
                agentStates: {
                    su_qingqian: {
                        ...createCompleteAgentState('su_qingqian'),
                        recentInteractions: [{ charId: 'player' as CharacterId, content: 'Hello', timestamp: { day: 1, hour: 10, weekday: 0 } }],
                    },
                    chen_siyao: createCompleteAgentState('chen_siyao'),
                    ling_ruoyu: createCompleteAgentState('ling_ruoyu'),
                    lu_jiaxin: createCompleteAgentState('lu_jiaxin'),
                },
            });

            expect(checkRelationshipUnlock(state, 'su_qingqian', { hasInteracted: true })).toBe(true);
            expect(checkRelationshipUnlock(state, 'chen_siyao', { hasInteracted: true })).toBe(false);
        });
    });

    describe('updatePerceivedAffection', () => {
        it('should update affection value', () => {
            const agentState = {
                perceivedAffection: { su_qingqian: 50 },
            } as any;

            const newState = updatePerceivedAffection(agentState, 'su_qingqian', 75);
            expect(newState.perceivedAffection.su_qingqian).toBe(75);
        });

        it('should clamp affection between 0 and 1000', () => {
            const agentState = {
                perceivedAffection: {},
            } as any;

            const newState1 = updatePerceivedAffection(agentState, 'su_qingqian', -10);
            expect(newState1.perceivedAffection.su_qingqian).toBe(0);

            const newState2 = updatePerceivedAffection(agentState, 'su_qingqian', 2000);
            expect(newState2.perceivedAffection.su_qingqian).toBe(1000);
        });
    });

    describe('addToSocialCircle', () => {
        it('should add character to social circle', () => {
            const agentState = {
                socialCircle: [],
            } as any;

            const newState = addToSocialCircle(agentState, 'su_qingqian');
            expect(newState.socialCircle).toContain('su_qingqian');
        });

        it('should not add duplicate characters', () => {
            const agentState = {
                socialCircle: ['su_qingqian'],
            } as any;

            const newState = addToSocialCircle(agentState, 'su_qingqian');
            expect(newState.socialCircle.length).toBe(1);
        });
    });

    describe('removeFromSocialCircle', () => {
        it('should remove character from social circle', () => {
            const agentState = {
                socialCircle: ['su_qingqian', 'chen_siyao'],
            } as any;

            const newState = removeFromSocialCircle(agentState, 'su_qingqian');
            expect(newState.socialCircle).not.toContain('su_qingqian');
            expect(newState.socialCircle).toContain('chen_siyao');
        });
    });

    describe('calculateConnectionStrength', () => {
        it('should calculate strength based on mutual affection', () => {
            const agent1 = {
                perceivedAffection: { chen_siyao: 100 },
                socialCircle: [],
            } as any;
            const agent2 = {
                perceivedAffection: { su_qingqian: 80 },
                socialCircle: [],
            } as any;

            const strength = calculateConnectionStrength(agent1, agent2);
            expect(strength).toBeCloseTo(90, 0);
        });

        it('should bonus for mutual acquaintance', () => {
            const agent1 = {
                perceivedAffection: { chen_siyao: 60 },
                socialCircle: ['chen_siyao'],
            } as any;
            const agent2 = {
                perceivedAffection: { su_qingqian: 60 },
                socialCircle: ['su_qingqian'],
            } as any;

            const strength = calculateConnectionStrength(agent1, agent2);
            expect(strength).toBeGreaterThan(50);
            expect(strength).toBeLessThanOrEqual(100);
        });
    });
});
