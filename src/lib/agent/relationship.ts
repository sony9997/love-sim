import { CharacterId, Relationship, RelationshipStatus, GameState, ExtendedAgentState } from '../game-data/types';

// Status progression thresholds (affection points)
const STATUS_THRESHOLDS: Record<RelationshipStatus, number> = {
    stranger: 0,
    acquaintance: 50,
    friend: 150,
    crush: 300,
    lover: 500,
    enemy: -100, // Special case for negative affection
};

// Personality compatibility: how much affection impact multiplier
// Positive = synergistic, Negative = conflicting
const PERSONALITY_MULTIPLIERS: Record<string, Record<string, number>> = {
    cold: { cold: 1.2, hot: 0.8, shy: 1.1, outgoing: 0.9, rational: 1.2, emotional: 0.8, formal: 1.1, casual: 0.9 },
    hot: { cold: 0.8, hot: 1.2, shy: 0.9, outgoing: 1.2, rational: 0.8, emotional: 1.2, formal: 0.9, casual: 1.1 },
    shy: { cold: 1.1, hot: 0.9, shy: 1.2, outgoing: 0.7, rational: 1.0, emotional: 1.1, formal: 1.0, casual: 0.8 },
    outgoing: { cold: 0.9, hot: 1.2, shy: 0.7, outgoing: 1.2, rational: 0.8, emotional: 1.0, formal: 0.9, casual: 1.2 },
    rational: { cold: 1.2, hot: 0.8, shy: 1.0, outgoing: 0.8, rational: 1.2, emotional: 0.7, formal: 1.2, casual: 0.8 },
    emotional: { cold: 0.8, hot: 1.2, shy: 1.1, outgoing: 1.0, rational: 0.7, emotional: 1.2, formal: 0.8, casual: 1.1 },
    formal: { cold: 1.1, hot: 0.9, shy: 1.0, outgoing: 0.9, rational: 1.2, emotional: 0.8, formal: 1.2, casual: 0.7 },
    casual: { cold: 0.9, hot: 1.1, shy: 0.8, outgoing: 1.2, rational: 0.8, emotional: 1.1, formal: 0.7, casual: 1.2 },
};

// Character-specific personality traits for compatibility calculation
const CHARACTER_PERSONALITIES: Record<CharacterId, string[]> = {
    su_qingqian: ['cold', 'rational', 'formal'],
    chen_siyao: ['hot', 'outgoing', 'casual'],
    ling_ruoyu: ['shy', 'rational', 'emotional'],
    lu_jiaxin: ['hot', 'outgoing', 'casual'],
};

/**
 * Calculate affection change with personality compatibility
 */
export function calculateAffectionChange(
    agentId: CharacterId,
    playerPersonality: string[],
    baseChange: number,
): number {
    const agentTraits = CHARACTER_PERSONALITIES[agentId];
    let multiplier = 1.0;

    // Calculate average multiplier based on personality compatibility
    let sum = 0;
    let count = 0;

    for (const agentTrait of agentTraits) {
        for (const playerTrait of playerPersonality) {
            if (PERSONALITY_MULTIPLIERS[agentTrait]?.[playerTrait] !== undefined) {
                sum += PERSONALITY_MULTIPLIERS[agentTrait][playerTrait];
                count++;
            }
        }
    }

    if (count > 0) {
        multiplier = sum / count;
    }

    return Math.round(baseChange * multiplier);
}

/**
 * Update relationship status based on current affection
 */
export function updateRelationshipStatus(
    currentAffection: number,
    currentStatus: RelationshipStatus,
): RelationshipStatus {
    // Handle enemy status separately
    if (currentAffection < 0) {
        return 'enemy';
    }

    // Progression order: stranger -> acquaintance -> friend -> crush -> lover
    const statuses: RelationshipStatus[] = ['stranger', 'acquaintance', 'friend', 'crush', 'lover'];

    for (let i = 0; i < statuses.length; i++) {
        if (currentStatus === statuses[i]) {
            // Check if can progress to next status
            if (i < statuses.length - 1 && currentAffection >= STATUS_THRESHOLDS[statuses[i + 1]]) {
                return statuses[i + 1];
            }
            return currentStatus;
        }
    }

    return currentStatus;
}

/**
 * Check if relationship unlock condition is met
 */
export function checkRelationshipUnlock(
    gameState: GameState,
    agentId: CharacterId,
    unlockCondition: {
        minAffection?: number;
        minStatus?: RelationshipStatus;
        flag?: string;
        hasInteracted?: boolean;
    },
): boolean {
    const relationship = gameState.relationships[agentId];
    const agentState = gameState.agentStates[agentId] as ExtendedAgentState;

    // Check affection threshold
    if (unlockCondition.minAffection !== undefined) {
        if (relationship.affection < unlockCondition.minAffection) {
            return false;
        }
    }

    // Check status threshold
    if (unlockCondition.minStatus !== undefined) {
        const statusThresholds: Record<RelationshipStatus, number> = {
            stranger: 0,
            acquaintance: 1,
            friend: 2,
            crush: 3,
            lover: 4,
            enemy: -1,
        };
        if (statusThresholds[relationship.status] < statusThresholds[unlockCondition.minStatus]) {
            return false;
        }
    }

    // Check flag
    if (unlockCondition.flag !== undefined) {
        if (!gameState.flags[unlockCondition.flag]) {
            return false;
        }
    }

    // Check if player has interacted with agent
    if (unlockCondition.hasInteracted) {
        if (agentState.recentInteractions.length === 0) {
            return false;
        }
    }

    return true;
}

/**
 * Update agent's perceived affection for another character
 */
export function updatePerceivedAffection(
    agentState: ExtendedAgentState,
    targetCharId: CharacterId,
    newAffection: number,
): ExtendedAgentState {
    return {
        ...agentState,
        perceivedAffection: {
            ...agentState.perceivedAffection,
            [targetCharId]: Math.max(0, Math.min(1000, newAffection)),
        },
    };
}

/**
 * Add character to agent's social circle
 */
export function addToSocialCircle(
    agentState: ExtendedAgentState,
    charId: CharacterId,
): ExtendedAgentState {
    if (agentState.socialCircle.includes(charId)) {
        return agentState;
    }

    return {
        ...agentState,
        socialCircle: [...agentState.socialCircle, charId],
    };
}

/**
 * Remove character from agent's social circle
 */
export function removeFromSocialCircle(
    agentState: ExtendedAgentState,
    charId: CharacterId,
): ExtendedAgentState {
    return {
        ...agentState,
        socialCircle: agentState.socialCircle.filter((id) => id !== charId),
    };
}

/**
 * Calculate social connection strength between two agents
 */
export function calculateConnectionStrength(
    agentState1: ExtendedAgentState,
    agentState2: ExtendedAgentState,
): number {
    const charId1 = Object.keys(agentState1.perceivedAffection).find(
        (k) => agentState1.perceivedAffection[k as CharacterId] > 0,
    );
    const charId2 = Object.keys(agentState2.perceivedAffection).find(
        (k) => agentState2.perceivedAffection[k as CharacterId] > 0,
    );

    if (!charId1 || !charId2) return 0;

    const affection1 = agentState1.perceivedAffection[charId1 as CharacterId];
    const affection2 = agentState2.perceivedAffection[charId2 as CharacterId];

    // Check if they know each other
    const knowsEachOther =
        agentState1.socialCircle.includes(charId2 as CharacterId) &&
        agentState2.socialCircle.includes(charId1 as CharacterId);

    const baseStrength = (affection1 + affection2) / 2;
    const connectionBonus = knowsEachOther ? 20 : 0;

    return Math.min(100, baseStrength + connectionBonus);
}
