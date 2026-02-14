import { Achievement, CharacterId, GameState } from './game-data/types';

// ====================
// ACHIEVEMENT DEFINITIONS
// ====================

export const ACHIEVEMENTS: Achievement[] = [
    {
        id: 'first_meeting',
        title: { en: 'First Meeting', zh: '初次相遇' },
        description: { en: 'Meet any character for the first time.', zh: '第一次见到任何角色。' },
        icon: '👋',
        points: 10,
        trigger: { type: 'flag', condition: { value: 'met_any_character' } },
    },
    {
        id: 'campus_explorer',
        title: { en: 'Campus Explorer', zh: '校园探索者' },
        description: { en: 'Visit all campus locations.', zh: '访问所有校园地点。' },
        icon: '🗺️',
        points: 25,
        trigger: { type: 'flag', condition: { value: 'visited_all_campus' } },
    },
    {
        id: 'city_wanderer',
        title: { en: 'City Wanderer', zh: '城市漫游者' },
        description: { en: 'Explore the city center locations.', zh: '探索市中心地点。' },
        icon: '🏙️',
        points: 30,
        trigger: { type: 'flag', condition: { value: 'visited_all_city' } },
    },
    {
        id: 'library_rat',
        title: { en: 'Library Rat', zh: '书虫' },
        description: { en: 'Spend 5 hours studying in the library.', zh: '在图书馆学习5小时。' },
        icon: '📚',
        points: 20,
        trigger: { type: 'stat', condition: { value: 5, characterId: undefined } },
    },
    {
        id: 'physics_fan',
        title: { en: 'Physics Fan', zh: '物理爱好者' },
        description: { en: 'Learn about physics from Professor Ling.', zh: '向凌教授学习物理。' },
        icon: '⚛️',
        points: 15,
        trigger: { type: 'flag', condition: { value: 'learned_physics' } },
    },
    {
        id: 'art_appreciator',
        title: { en: 'Art Appreciator', zh: '艺术鉴赏家' },
        description: { en: 'View Siyao\'s artwork.', zh: '观看思瑶的艺术作品。' },
        icon: '🎨',
        points: 20,
        trigger: { type: 'flag', condition: { value: 'seen_siyao_drawing' } },
    },
    {
        id: 'sweet_things',
        title: { en: 'Sweet Things', zh: '甜蜜的事' },
        description: { en: 'Reach 50 affection with a character.', zh: '与角色达到50好感度。' },
        icon: '💖',
        points: 35,
        trigger: { type: 'affection', condition: { value: 50 } },
    },
    {
        id: 'true_love',
        title: { en: 'True Love', zh: '真爱' },
        description: { en: 'Reach 80+ affection with a character.', zh: '与角色达到80+好感度。' },
        icon: '💞',
        points: 50,
        trigger: { type: 'affection', condition: { value: 80 } },
    },
    {
        id: 'balanced_life',
        title: { en: 'Balanced Life', zh: '平衡生活' },
        description: { en: 'Achieve 50+ in all stats.', zh: '所有属性达到50+。' },
        icon: '🌟',
        points: 60,
        trigger: { type: 'stat', condition: { value: 50 } },
    },
    {
        id: 'week_one',
        title: { en: 'Week One', zh: '第一周' },
        description: { en: 'Survive your first week at university.', zh: '在大学度过第一周。' },
        icon: '📅',
        points: 25,
        trigger: { type: 'flag', condition: { value: 'week_one_complete' } },
    },
];

// ====================
// HELPER FUNCTIONS
// ====================

/**
 * Checks if an achievement is unlocked based on current game state
 * @param achievement - Achievement to check
 * @param gameState - Current game state
 * @returns true if achievement is unlocked
 */
export function isAchievementUnlocked(achievement: Achievement, gameState: GameState): boolean {
    const { type, condition } = achievement.trigger;

    switch (type) {
        case 'flag':
            return !!gameState.flags[condition.value];

        case 'affection': {
            // Check if any character has reached the required affection
            const targetValue = condition.value as number;
            for (const charId of Object.keys(gameState.relationships) as CharacterId[]) {
                if (gameState.relationships[charId].affection >= targetValue) {
                    return true;
                }
            }
            return false;
        }

        case 'stat': {
            if (condition.characterId) {
                // Check specific character's affection
                const rel = gameState.relationships[condition.characterId];
                return rel.affection >= (condition.value as number);
            } else {
                // Check player stats
                const stats = gameState.player.stats;
                for (const [, value] of Object.entries(stats)) {
                    if (value >= (condition.value as number)) {
                        // For 'balanced_life', all stats must meet threshold
                        if (achievement.id === 'balanced_life') {
                            // Continue checking other stats
                            continue;
                        }
                        return true;
                    }
                }
                // For balanced_life, all stats must meet threshold
                if (achievement.id === 'balanced_life') {
                    return Object.values(stats).every(v => v >= 50);
                }
                return false;
            }
        }

        case 'event':
            // Check if event flag is set
            return !!gameState.flags[`event_${condition.value}`];

        default:
            return false;
    }
}

/**
 * Gets all unlocked achievements
 * @param gameState - Current game state
 * @returns Array of unlocked achievement IDs
 */
export function getUnlockedAchievements(gameState: GameState): string[] {
    return ACHIEVEMENTS.filter(a => isAchievementUnlocked(a, gameState)).map(a => a.id);
}

/**
 * Gets total points from unlocked achievements
 * @param unlockedIds - Array of unlocked achievement IDs
 * @returns Total points
 */
export function getAchievementPoints(unlockedIds: string[]): number {
    return ACHIEVEMENTS.filter(a => unlockedIds.includes(a.id)).reduce((sum, a) => sum + a.points, 0);
}

/**
 * Checks for newly unlocked achievements since last check
 * @param gameState - Current game state
 * @param previouslyUnlocked - Previously unlocked achievement IDs
 * @returns Array of newly unlocked achievement IDs
 */
export function getNewlyUnlockedAchievements(
    gameState: GameState,
    previouslyUnlocked: string[]
): string[] {
    const currentUnlocked = getUnlockedAchievements(gameState);
    return currentUnlocked.filter(id => !previouslyUnlocked.includes(id));
}

/**
 * Gets achievement by ID
 * @param id - Achievement ID
 * @returns Achievement or undefined if not found
 */
export function getAchievementById(id: string): Achievement | undefined {
    return ACHIEVEMENTS.find(a => a.id === id);
}

/**
 * Gets achievement progress for display
 * @param achievement - Achievement to check
 * @param gameState - Current game state
 * @returns Object with progress info
 */
export function getAchievementProgress(
    achievement: Achievement,
    gameState: GameState
): {
    isUnlocked: boolean;
    progress: number; // 0-100
    target: number;
} {
    if (isAchievementUnlocked(achievement, gameState)) {
        const target = achievement.trigger.condition.value as number;
        return { isUnlocked: true, progress: 100, target };
    }

    const { type, condition } = achievement.trigger;

    switch (type) {
        case 'flag':
            return { isUnlocked: false, progress: 0, target: 1 };

        case 'affection': {
            // Find max affection for this threshold
            let maxAffection = 0;
            for (const charId of Object.keys(gameState.relationships) as CharacterId[]) {
                maxAffection = Math.max(maxAffection, gameState.relationships[charId].affection);
            }
            const target = condition.value as number;
            const progress = Math.min(100, Math.round((maxAffection / target) * 100));
            return { isUnlocked: false, progress, target };
        }

        case 'stat': {
            const target = condition.value as number;
            if (condition.characterId) {
                const rel = gameState.relationships[condition.characterId];
                const progress = Math.min(100, Math.round((rel.affection / target) * 100));
                return { isUnlocked: false, progress, target };
            } else {
                // For player stats
                const stats = gameState.player.stats;
                let maxStat = 0;
                for (const value of Object.values(stats)) {
                    maxStat = Math.max(maxStat, value);
                }
                const progress = Math.min(100, Math.round((maxStat / target) * 100));
                return { isUnlocked: false, progress, target };
            }
        }

        case 'event':
            return { isUnlocked: false, progress: 0, target: 1 };

        default:
            return { isUnlocked: false, progress: 0, target: 0 };
    }
}
