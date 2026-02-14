import { CharacterId, RelationshipStatus, GameState } from './game-data/types';

// Affection thresholds for relationship stages
export const AFFECTION_THRESHOLDS: Record<RelationshipStatus, number> = {
    enemy: -100,
    stranger: 0,
    acquaintance: 20,
    friend: 50,
    crush: 70,
    lover: 85,
};

/**
 * Determines relationship stage based on affection level
 * @param affection - Affection level (can be negative or above 100)
 * @returns Relationship stage
 */
export function getRelationshipStage(affection: number): RelationshipStatus {
    if (affection < 0) return 'enemy';
    if (affection < 20) return 'stranger';
    if (affection < 50) return 'acquaintance';
    if (affection < 70) return 'friend';
    if (affection < 85) return 'crush';
    return 'lover';
}

/**
 * Checks if a relationship stage change occurred
 * @param prevAffection - Previous affection level
 * @param newAffection - New affection level
 * @returns true if stage changed, false otherwise
 */
export function didStageChange(prevAffection: number, newAffection: number): boolean {
    const prevStage = getRelationshipStage(prevAffection);
    const newStage = getRelationshipStage(newAffection);
    return prevStage !== newStage;
}

/**
 * Gets the next relationship stage
 * @param currentStage - Current relationship stage
 * @returns Next stage or null if max level
 */
export function getNextStage(currentStage: RelationshipStatus): RelationshipStatus | null {
    const stages: RelationshipStatus[] = ['enemy', 'stranger', 'acquaintance', 'friend', 'crush', 'lover'];
    const index = stages.indexOf(currentStage);
    return index < stages.length - 1 ? stages[index + 1] : null;
}

/**
 * Gets required affection for next stage
 * @param currentStage - Current relationship stage
 * @returns Affection needed for next stage, or null if max level
 */
export function getNextStageThreshold(currentStage: RelationshipStatus): number | null {
    const nextStage = getNextStage(currentStage);
    if (!nextStage) return null;
    return AFFECTION_THRESHOLDS[nextStage];
}

/**
 * Calculates affection progress toward next stage
 * @param currentAffection - Current affection level
 * @param currentStage - Current relationship stage
 * @returns Object with progress percentage and remaining affection needed
 */
export function getProgressToNextStage(currentAffection: number, currentStage: RelationshipStatus): {
    progress: number; // 0-100 percentage
    remaining: number; // Affection needed to reach next stage
    totalToNext: number; // Total affection needed from current stage start
} {
    const threshold = AFFECTION_THRESHOLDS[currentStage];
    const nextThreshold = getNextStageThreshold(currentStage) ?? 100;
    const stageStart = threshold;
    const stageEnd = nextThreshold;
    const totalRange = stageEnd - stageStart;
    const currentInRange = currentAffection - stageStart;

    const progress = Math.max(0, Math.min(100, Math.round((currentInRange / totalRange) * 100)));
    const remaining = Math.max(0, stageEnd - currentAffection);

    return {
        progress: Math.min(100, progress),
        remaining,
        totalToNext: totalRange,
    };
}

/**
 * Updates relationship based on affection change and handles stage progression
 * @param gameState - Current game state
 * @param charId - Character ID
 * @param affectionChange - Amount to change affection (positive or negative)
 * @returns Object with new relationship and stage change info
 */
export function updateRelationshipAndCheckProgression(
    gameState: GameState,
    charId: CharacterId,
    affectionChange: number
): {
    newAffection: number;
    newStage: RelationshipStatus;
    stageChanged: boolean;
    prevStage: RelationshipStatus;
} {
    const prevRelationship = gameState.relationships[charId];
    const prevAffection = prevRelationship.affection;
    const prevStage = prevRelationship.status;

    const newAffection = Math.max(-100, Math.min(200, prevAffection + affectionChange));
    const newStage = getRelationshipStage(newAffection);
    const stageChanged = prevStage !== newStage;

    return {
        newAffection,
        newStage,
        stageChanged,
        prevStage,
    };
}

/**
 * Gets a message for relationship stage progression
 * @param charName - Character name
 * @param prevStage - Previous relationship stage
 * @param newStage - New relationship stage
 * @param language - Language ('en' or 'zh')
 * @returns Progression message
 */
export function getStageProgressionMessage(
    charName: string,
    prevStage: RelationshipStatus,
    newStage: RelationshipStatus,
    language: 'en' | 'zh'
): string {
    const stages: Record<RelationshipStatus, { en: string; zh: string }> = {
        enemy: { en: 'Enemy', zh: '敌人' },
        stranger: { en: 'Stranger', zh: '陌生人' },
        acquaintance: { en: 'Acquaintance', zh: '熟人' },
        friend: { en: 'Friend', zh: '朋友' },
        crush: { en: 'Crush', zh: '暗恋' },
        lover: { en: 'Lover', zh: '恋人' },
    };

    if (language === 'zh') {
        return `你和${charName}的关系从"${stages[prevStage].zh}"提升到了"${stages[newStage].zh}"！`;
    } else {
        return `Your relationship with ${charName} has progressed from "${stages[prevStage].en}" to "${stages[newStage].en}"!`;
    }
}
