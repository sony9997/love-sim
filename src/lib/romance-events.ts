import { CharacterId, GameState, RelationshipStatus } from './game-data/types';
import { getRelationshipStage } from './relationship-utils';

// ====================
// ROMANCE EVENT DEFINITIONS
// ====================

export interface RomanceEvent {
    id: string;
    characterId: CharacterId;
    triggerCondition: (gameState: GameState) => boolean;
    eventTriggered: (gameState: GameState) => boolean;
    triggerMessage: { en: string; zh: string };
    successMessage: { en: string; zh: string };
    failMessage: { en: string; zh: string };
    affectionGain: number;
    stageUnlock?: RelationshipStatus;
    flagsToSet?: string[];
}

// Event affection thresholds
const EVENT_THRESHOLDS: Record<RelationshipStatus, number> = {
    enemy: 0,
    stranger: 0,
    acquaintance: 20,
    friend: 50,
    crush: 70,
    lover: 85,
};

// First date event
const FIRST_DATE_EVENT: RomanceEvent = {
    id: 'first_date',
    characterId: 'su_qingqian' as CharacterId, // Placeholder - would be dynamic
    triggerCondition: (gameState) => {
        const charId = 'su_qingqian' as CharacterId;
        const rel = gameState.relationships[charId];
        return getRelationshipStage(rel.affection) === 'crush' && !gameState.flags['first_date_su_qingqian'];
    },
    eventTriggered: (gameState) => {
        return !!gameState.flags['first_date_su_qingqian'];
    },
    triggerMessage: { en: 'Would you like to go on a date?', zh: '你想约对方出去约会吗？' },
    successMessage: { en: 'Date successful! +15 affection', zh: '约会成功！+15 好感度' },
    failMessage: { en: 'Date cancelled...', zh: '约会取消...' },
    affectionGain: 15,
    stageUnlock: 'lover',
    flagsToSet: ['first_date_su_qingqian'],
};

// First kiss event
const FIRST_KISS_EVENT: RomanceEvent = {
    id: 'first_kiss',
    characterId: 'su_qingqian' as CharacterId,
    triggerCondition: (gameState) => {
        const charId = 'su_qingqian' as CharacterId;
        return getRelationshipStage(gameState.relationships[charId].affection) === 'lover' && !gameState.flags['first_kiss_su_qingqian'];
    },
    eventTriggered: (gameState) => {
        return !!gameState.flags['first_kiss_su_qingqian'];
    },
    triggerMessage: { en: 'Can I kiss you?', zh: '我可以吻你吗？' },
    successMessage: { en: 'First kiss! +20 affection', zh: '初吻！+20 好感度' },
    failMessage: { en: 'Too soon...', zh: '还是太早了...' },
    affectionGain: 20,
    stageUnlock: 'lover',
    flagsToSet: ['first_kiss_su_qingqian'],
};

// Conflict/argument event
const CONFLICT_EVENT: RomanceEvent = {
    id: 'conflict',
    characterId: 'lu_jiaxin' as CharacterId,
    triggerCondition: (gameState) => {
        const charId = 'lu_jiaxin' as CharacterId;
        const rel = gameState.relationships[charId];
        return rel.affection < 30 && !gameState.flags['conflict_lu_jiaxin'];
    },
    eventTriggered: (gameState) => {
        return !!gameState.flags['conflict_lu_jiaxin'];
    },
    triggerMessage: { en: 'You have a disagreement...', zh: '你们发生了争执...' },
    successMessage: { en: 'Conflict resolved. Trust rebuilt.', zh: '矛盾化解，信任重建。' },
    failMessage: { en: 'Things got worse...', zh: '情况变得更糟...' },
    affectionGain: -10,
    stageUnlock: undefined,
    flagsToSet: ['conflict_lu_jiaxin'],
};

// Birthday event
const BIRTHDAY_EVENT: RomanceEvent = {
    id: 'birthday',
    characterId: 'su_qingqian' as CharacterId,
    triggerCondition: (gameState) => {
        // Simple trigger: check if it's character's birthday (placeholder logic)
        // In a real game, character birthdays would be stored in character data
        return !gameState.flags['birthday_su_qingqian'];
    },
    eventTriggered: (gameState) => {
        return !!gameState.flags['birthday_su_qingqian'];
    },
    triggerMessage: { en: 'Happy Birthday! It\'s [Character]\'s birthday today.', zh: '生日快乐！今天是[角色]的生日。' },
    successMessage: { en: 'Great gift! +25 affection', zh: '很棒的礼物！+25 好感度' },
    failMessage: { en: 'A bit disappointing...', zh: '有点失望...' },
    affectionGain: 25,
    stageUnlock: undefined,
    flagsToSet: ['birthday_su_qingqian'],
};

// Public declaration of feelings
const CONFESSION_EVENT: RomanceEvent = {
    id: 'confession',
    characterId: 'su_qingqian' as CharacterId,
    triggerCondition: (gameState) => {
        const charId = 'su_qingqian' as CharacterId;
        return getRelationshipStage(gameState.relationships[charId].affection) === 'crush' && !gameState.flags['confession_su_qingqian'];
    },
    eventTriggered: (gameState) => {
        return !!gameState.flags['confession_su_qingqian'];
    },
    triggerMessage: { en: 'I have something important to tell you...', zh: '我有很重要的话要告诉你...' },
    successMessage: { en: 'She says yes! You\'re now a couple!', zh: '她答应了！你们在一起了！' },
    failMessage: { en: 'She needs more time...', zh: '她需要更多时间...' },
    affectionGain: 30,
    stageUnlock: 'lover',
    flagsToSet: ['confession_su_qingqian'],
};

// ====================
// EXPORTED EVENTS
// ====================

export const ROMANCE_EVENTS: RomanceEvent[] = [
    FIRST_DATE_EVENT,
    FIRST_KISS_EVENT,
    CONFLICT_EVENT,
    BIRTHDAY_EVENT,
    CONFESSION_EVENT,
];

// ====================
// HELPER FUNCTIONS
// ====================

/**
 * Checks if a romance event should trigger
 * @param characterId - Character ID
 * @param gameState - Current game state
 * @returns Event if should trigger, null otherwise
 */
export function getTriggeredRomanceEvent(
    characterId: CharacterId,
    gameState: GameState
): RomanceEvent | null {
    return ROMANCE_EVENTS.find(event =>
        event.characterId === characterId &&
        event.triggerCondition(gameState)
    ) || null;
}

/**
 * Processes a romance event result
 * @param event - The romance event
 * @param success - Whether the event succeeded
 * @param gameState - Current game state
 * @returns Updated affection and any stage changes
 */
export function processRomanceEvent(
    event: RomanceEvent,
    success: boolean,
    gameState: GameState
): {
    affectionChange: number;
    newStage: RelationshipStatus;
    stageChanged: boolean;
    flagsToSet?: string[];
} {
    const prevAffection = gameState.relationships[event.characterId].affection;
    const affectionChange = success ? event.affectionGain : Math.max(-10, event.affectionGain);

    const newAffection = Math.max(0, Math.min(100, prevAffection + affectionChange));
    const newStage = getRelationshipStage(newAffection);
    const prevStage = getRelationshipStage(prevAffection);
    const stageChanged = prevStage !== newStage;

    return {
        affectionChange,
        newStage,
        stageChanged,
        flagsToSet: success ? event.flagsToSet : undefined,
    };
}

/**
 * Gets the next romance event for a character
 * @param characterId - Character ID
 * @param gameState - Current game state
 * @returns Next event info or null
 */
export function getNextRomanceEvent(
    characterId: CharacterId,
    gameState: GameState
): {
    event: RomanceEvent;
    progress: number;
    nextStage: RelationshipStatus;
} | null {
    const currentStage = getRelationshipStage(gameState.relationships[characterId].affection);
    const stages: RelationshipStatus[] = ['stranger', 'acquaintance', 'friend', 'crush', 'lover'];
    const stageIndex = stages.indexOf(currentStage);

    if (stageIndex < 0) return null;

    // Find next event based on stage
    const nextStage = stages[stageIndex + 1];
    if (!nextStage) return null;

    const nextThreshold = EVENT_THRESHOLDS[nextStage];
    const currentAffection = gameState.relationships[characterId].affection;
    const progress = Math.min(100, Math.round((currentAffection / nextThreshold) * 100));

    // Return a placeholder event for the next stage
    return {
        event: {
            id: `next_event_${nextStage}`,
            characterId,
            triggerCondition: () => true,
            eventTriggered: () => false,
            triggerMessage: { en: 'Next romance event', zh: '下一个浪漫事件' },
            successMessage: { en: 'Event successful!', zh: '事件成功！' },
            failMessage: { en: 'Event failed...', zh: '事件失败...' },
            affectionGain: 10,
            stageUnlock: nextStage,
            flagsToSet: [],
        },
        progress,
        nextStage,
    };
}
