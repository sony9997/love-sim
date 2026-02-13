import { CharacterId, GameState, Time, AgentState as BaseAgentState, ExtendedAgentState, PersonalityTrait, AgentMood, AgentGoal, AgentMemory } from '../game-data/types';

// Export types from this module for convenience
export type { ExtendedAgentState as AgentState };
export type ProactiveResult = 'DIALOGUE' | 'IDLE' | 'WAIT';

/**
 * Create initial extended agent state for a character
 */
export function createAgentState(charId: CharacterId): ExtendedAgentState {
    const baseState: ExtendedAgentState = {
        personality: getPersonalityTraits(charId),
        coreValues: getCoreValues(charId),
        mood: { base: 'neutral', intensity: 50, triggers: [] },
        currentGoal: null,
        goalsQueue: [],
        memory: [],
        recentInteractions: [],
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

    // Set initial goal based on character
    if (charId === 'su_qingqian') {
        baseState.currentGoal = {
            id: 'manage_council',
            description: 'Manage Student Council',
            priority: 10,
            completed: false,
            targetType: 'activity' as const,
            targetId: 'student_council',
        };
    } else if (charId === 'chen_siyao') {
        baseState.currentGoal = {
            id: 'practice_dance',
            description: 'Practice Dancing',
            priority: 10,
            completed: false,
            targetType: 'activity' as const,
            targetId: 'campus_map',
        };
    } else if (charId === 'ling_ruoyu') {
        baseState.currentGoal = {
            id: 'solve_physics',
            description: 'Solve Physics Problem',
            priority: 10,
            completed: false,
            targetType: 'activity' as const,
            targetId: 'lab',
        };
    } else if (charId === 'lu_jiaxin') {
        baseState.currentGoal = {
            id: 'ride_motorcycle',
            description: 'Ride Motorcycle',
            priority: 10,
            completed: false,
            targetType: 'activity' as const,
            targetId: 'city_map',
        };
    }

    return baseState;
}

/**
 * Get personality traits for a character
 */
function getPersonalityTraits(charId: CharacterId): PersonalityTrait[] {
    const traits: Record<CharacterId, PersonalityTrait[]> = {
        su_qingqian: ['cold', 'rational', 'formal', 'outgoing'],
        chen_siyao: ['hot', 'emotional', 'casual', 'outgoing'],
        ling_ruoyu: ['cold', 'rational', 'formal', 'shy'],
        lu_jiaxin: ['hot', 'emotional', 'casual', 'outgoing'],
    };
    return traits[charId] || ['neutral'];
}

/**
 * Get core values for a character
 */
function getCoreValues(charId: CharacterId): string[] {
    const values: Record<CharacterId, string[]> = {
        su_qingqian: ['Rules', 'Efficiency', 'Responsibility'],
        chen_siyao: ['Dream', 'Hardwork', 'Passion'],
        ling_ruoyu: ['Knowledge', 'Truth', 'Logic'],
        lu_jiaxin: ['Freedom', 'Independence', 'Passion'],
    };
    return values[charId] || [];
}

/**
 * Check if agent should proactively initiate dialogue with player
 */
export async function checkProactiveDialogue(
    agentId: CharacterId,
    gameState: GameState,
): Promise<ProactiveResult> {
    const agentState = gameState.agentStates[agentId] as ExtendedAgentState;
    const relationship = gameState.relationships[agentId];

    // Skip if player is far away
    if (agentState.currentLocation !== gameState.player.location) {
        return 'IDLE';
    }

    // Skip if relationship is too low
    if (relationship.affection < 15) {
        return 'IDLE';
    }

    // Skip if in middle of important activity
    const importantActivities = ['studying', 'performing', 'research'];
    if (importantActivities.includes(agentState.currentActivity)) {
        if (Math.random() < 0.2) {
            return 'WAIT';
        }
        return 'IDLE';
    }

    // Check mood - happy/excited agents more likely to initiate
    if (['happy', 'excited'].includes(agentState.mood.base)) {
        if (Math.random() * 100 < agentState.mood.intensity * 0.6) {
            return 'DIALOGUE';
        }
    }

    // Neutral mood based on affection
    if (agentState.mood.base === 'neutral') {
        const chance = 0.1 + (relationship.affection / 500);
        if (Math.random() < chance) {
            return 'DIALOGUE';
        }
    }

    return 'IDLE';
}

/**
 * Decide what action an agent should take
 */
export function decideAgentAction(
    agentId: CharacterId,
    gameState: GameState,
    playerLocation: string,
): { type: 'INTERACT' | 'MOVE' | 'IDLE'; target?: string } {
    const agentState = gameState.agentStates[agentId] as ExtendedAgentState;
    const relationship = gameState.relationships[agentId];

    // If same location and affection is high, interact
    if (agentState.currentLocation === playerLocation && relationship.affection > 50) {
        const moodFactor = getMoodModifier(agentState.mood);
        if (moodFactor > 0.8 && Math.random() < 0.7) {
            return { type: 'INTERACT' };
        }
    }

    // Otherwise follow schedule
    return { type: 'IDLE' };
}

/**
 * Get mood modifier for interaction calculations
 */
function getMoodModifier(mood: AgentMood): number {
    const modifiers: Record<string, number> = {
        'happy': 1.5,
        'excited': 1.3,
        'neutral': 1.0,
        'sad': 0.7,
        'angry': 0.5,
        'anxious': 0.8,
        'bored': 0.6,
    };
    return modifiers[mood.base] || 1.0;
}

/**
 * Update agent's mood based on event
 */
export function updateAgentMood(
    agentState: ExtendedAgentState,
    event: { type: string; valence: number; intensity: number; description: string }
): ExtendedAgentState {
    const baseMood = agentState.mood.base;
    const baseIntensity = agentState.mood.intensity;

    // Calculate new intensity
    let newIntensity = Math.max(0, Math.min(100, baseIntensity + event.intensity));

    // Determine new base mood based on valence and intensity
    // Check more specific conditions first (higher intensity thresholds)
    let newBase: AgentMood['base'] = baseMood;
    if (event.valence > 50 && newIntensity > 60) {
        newBase = 'excited';
    } else if (event.valence < -50 && newIntensity > 60) {
        newBase = 'angry';
    } else if (event.valence > 30 && newIntensity > 40) {
        newBase = 'happy';
    } else if (event.valence < -30 && newIntensity > 40) {
        newBase = 'sad';
    } else if (event.valence < -20) {
        newBase = 'anxious';
    } else if (event.valence > 0) {
        newBase = 'happy';
    } else if (event.valence < 0) {
        newBase = 'neutral';
    }

    // Update memory with this event
    const newMemory: AgentMemory = {
        id: `evt_${Date.now()}`,
        type: 'event',
        content: event.description,
        timestamp: gameStateTime(agentState),
        emotionalValence: event.valence,
        strength: newIntensity,
        associatedCharacters: [],
    };

    return {
        ...agentState,
        mood: { base: newBase, intensity: newIntensity, triggers: [...agentState.mood.triggers, event.type] },
        memory: [...agentState.memory, newMemory].slice(-10), // Keep last 10 memories
    };
}

/**
 * Get current time from agent state for memory timestamp
 */
function gameStateTime(agentState: ExtendedAgentState): Time {
    // This is a placeholder - in real implementation, agent state would have access to game time
    return { day: 1, hour: 12, weekday: 0 };
}
