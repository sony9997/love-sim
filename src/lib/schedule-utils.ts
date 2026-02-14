import { CharacterId, LocationId, AgentState, GameState } from './game-data/types';

// ====================
// CHARACTER SCHEDULE DATA
// ====================

// Character schedules by weekday and hour
// 0-23 represents hours 00:00-23:00
// Weekday: 0=Monday, 6=Sunday

export interface CharacterSchedule {
    defaultLocation: LocationId;
    schedule: Record<number, Record<number, LocationId>>; // weekday -> hour -> location
}

// Student schedules (Su Qingqian, Chen Siyao, Lu Jiaxin)
// Classes are typically 8:00-17:00 on weekdays
const createStudentSchedule = (majorLocation: LocationId): CharacterSchedule => ({
    defaultLocation: 'dorm_room',
    schedule: {
        // Monday-Friday
        0: { // Monday
            6: 'dorm_room', 7: 'dorm_room', 8: 'campus_map', // Morning commute
            9: majorLocation, 10: majorLocation, 11: majorLocation, 12: majorLocation, // Morning classes
            13: majorLocation, 14: majorLocation, 15: majorLocation, // Afternoon classes
            16: majorLocation, 17: 'campus_map', // End of classes
            18: 'cafeteria', 19: 'cafeteria', // Dinner
            20: 'library', 21: 'library', 22: 'library', // Study time
            23: 'dorm_room', 0: 'dorm_room', 1: 'dorm_room', 2: 'dorm_room', // Sleep
            3: 'dorm_room', 4: 'dorm_room', 5: 'dorm_room',
        },
        1: { // Tuesday - same as Monday
            6: 'dorm_room', 7: 'dorm_room', 8: 'campus_map',
            9: majorLocation, 10: majorLocation, 11: majorLocation, 12: majorLocation,
            13: majorLocation, 14: majorLocation, 15: majorLocation,
            16: majorLocation, 17: 'campus_map',
            18: 'cafeteria', 19: 'cafeteria',
            20: 'library', 21: 'library', 22: 'library',
            23: 'dorm_room', 0: 'dorm_room', 1: 'dorm_room', 2: 'dorm_room',
            3: 'dorm_room', 4: 'dorm_room', 5: 'dorm_room',
        },
        2: { // Wednesday - same as Monday
            6: 'dorm_room', 7: 'dorm_room', 8: 'campus_map',
            9: majorLocation, 10: majorLocation, 11: majorLocation, 12: majorLocation,
            13: majorLocation, 14: majorLocation, 15: majorLocation,
            16: majorLocation, 17: 'campus_map',
            18: 'cafeteria', 19: 'cafeteria',
            20: 'library', 21: 'library', 22: 'library',
            23: 'dorm_room', 0: 'dorm_room', 1: 'dorm_room', 2: 'dorm_room',
            3: 'dorm_room', 4: 'dorm_room', 5: 'dorm_room',
        },
        3: { // Thursday - same as Monday
            6: 'dorm_room', 7: 'dorm_room', 8: 'campus_map',
            9: majorLocation, 10: majorLocation, 11: majorLocation, 12: majorLocation,
            13: majorLocation, 14: majorLocation, 15: majorLocation,
            16: majorLocation, 17: 'campus_map',
            18: 'cafeteria', 19: 'cafeteria',
            20: 'library', 21: 'library', 22: 'library',
            23: 'dorm_room', 0: 'dorm_room', 1: 'dorm_room', 2: 'dorm_room',
            3: 'dorm_room', 4: 'dorm_room', 5: 'dorm_room',
        },
        4: { // Friday
            6: 'dorm_room', 7: 'dorm_room', 8: 'campus_map',
            9: majorLocation, 10: majorLocation, 11: majorLocation, 12: majorLocation,
            13: majorLocation, 14: majorLocation, 15: majorLocation,
            16: majorLocation, 17: 'campus_map',
            18: 'cafeteria', 19: 'cafeteria',
            20: 'bar', 21: 'bar', 22: 'bar', // Friday night entertainment
            23: 'dorm_room', 0: 'dorm_room', 1: 'dorm_room', 2: 'dorm_room',
            3: 'dorm_room', 4: 'dorm_room', 5: 'dorm_room',
        },
        // Saturday
        5: {
            8: 'dorm_room', 9: 'dorm_room', 10: 'campus_map',
            11: 'city_map', 12: 'city_map', 13: 'city_map', // Weekend hangout
            14: 'cafeteria', 15: 'cafeteria', 16: 'cafeteria',
            17: 'city_map', 18: 'city_map', 19: 'city_map',
            20: 'bar', 21: 'bar', 22: 'bar',
            23: 'dorm_room', 0: 'dorm_room', 1: 'dorm_room', 2: 'dorm_room',
            3: 'dorm_room', 4: 'dorm_room', 5: 'dorm_room', 6: 'dorm_room', 7: 'dorm_room',
        },
        // Sunday
        6: {
            9: 'dorm_room', 10: 'dorm_room', 11: 'campus_map',
            12: 'library', 13: 'library', 14: 'library', // Sunday study
            15: 'cafeteria', 16: 'cafeteria',
            17: 'dorm_room', 18: 'dorm_room', 19: 'dorm_room',
            20: 'dorm_room', 21: 'dorm_room', 22: 'dorm_room',
            23: 'dorm_room', 0: 'dorm_room', 1: 'dorm_room', 2: 'dorm_room',
            3: 'dorm_room', 4: 'dorm_room', 5: 'dorm_room', 6: 'dorm_room', 7: 'dorm_room', 8: 'dorm_room',
        },
    },
});

// Professor schedule (Ling Ruoyu)
// Professor has office hours and research time
const professorSchedule: CharacterSchedule = {
    defaultLocation: 'lab',
    schedule: {
        // Monday-Friday
        0: { 8: 'lab', 9: 'lab', 10: 'campus_map', // Morning office hours
            11: 'campus_map', 12: 'cafeteria', 13: 'campus_map', 14: 'lab', 15: 'lab',
            16: 'lab', 17: 'lab', 18: 'cafeteria', 19: 'cafeteria',
            20: 'lab', 21: 'lab', 22: 'lab', 23: 'lab', 0: 'lab', 1: 'lab',
            2: 'lab', 3: 'lab', 4: 'lab', 5: 'lab', 6: 'lab', 7: 'lab',
        },
        1: { 8: 'lab', 9: 'lab', 10: 'campus_map',
            11: 'campus_map', 12: 'cafeteria', 13: 'campus_map', 14: 'lab', 15: 'lab',
            16: 'lab', 17: 'lab', 18: 'cafeteria', 19: 'cafeteria',
            20: 'lab', 21: 'lab', 22: 'lab', 23: 'lab', 0: 'lab', 1: 'lab',
            2: 'lab', 3: 'lab', 4: 'lab', 5: 'lab', 6: 'lab', 7: 'lab',
        },
        2: { 8: 'lab', 9: 'lab', 10: 'campus_map',
            11: 'campus_map', 12: 'cafeteria', 13: 'campus_map', 14: 'lab', 15: 'lab',
            16: 'lab', 17: 'lab', 18: 'cafeteria', 19: 'cafeteria',
            20: 'lab', 21: 'lab', 22: 'lab', 23: 'lab', 0: 'lab', 1: 'lab',
            2: 'lab', 3: 'lab', 4: 'lab', 5: 'lab', 6: 'lab', 7: 'lab',
        },
        3: { 8: 'lab', 9: 'lab', 10: 'campus_map',
            11: 'campus_map', 12: 'cafeteria', 13: 'campus_map', 14: 'lab', 15: 'lab',
            16: 'lab', 17: 'lab', 18: 'cafeteria', 19: 'cafeteria',
            20: 'lab', 21: 'lab', 22: 'lab', 23: 'lab', 0: 'lab', 1: 'lab',
            2: 'lab', 3: 'lab', 4: 'lab', 5: 'lab', 6: 'lab', 7: 'lab',
        },
        4: { 8: 'lab', 9: 'lab', 10: 'campus_map',
            11: 'campus_map', 12: 'cafeteria', 13: 'campus_map', 14: 'lab', 15: 'lab',
            16: 'lab', 17: 'lab', 18: 'cafeteria', 19: 'cafeteria',
            20: 'lab', 21: 'lab', 22: 'lab', 23: 'lab', 0: 'lab', 1: 'lab',
            2: 'lab', 3: 'lab', 4: 'lab', 5: 'lab', 6: 'lab', 7: 'lab',
        },
        5: { 10: 'lab', 11: 'lab', 12: 'cafeteria',
            13: 'city_map', 14: 'city_map', 15: 'city_map', 16: 'city_map',
            17: 'cafeteria', 18: 'cafeteria', 19: 'city_map',
            20: 'bar', 21: 'bar', 22: 'lab', 23: 'lab', 0: 'lab', 1: 'lab',
            2: 'lab', 3: 'lab', 4: 'lab', 5: 'lab', 6: 'lab', 7: 'lab', 8: 'lab', 9: 'lab',
        },
        6: { 10: 'lab', 11: 'lab', 12: 'cafeteria',
            13: 'library', 14: 'library', 15: 'library', 16: 'library',
            17: 'cafeteria', 18: 'cafeteria', 19: 'lab',
            20: 'lab', 21: 'lab', 22: 'lab', 23: 'lab', 0: 'lab', 1: 'lab',
            2: 'lab', 3: 'lab', 4: 'lab', 5: 'lab', 6: 'lab', 7: 'lab', 8: 'lab', 9: 'lab',
        },
    },
};

// ====================
// EXPORTED SCHEDULES
// ====================

export const CHARACTER_SCHEDULES: Record<CharacterId, CharacterSchedule> = {
    su_qingqian: createStudentSchedule('student_council'),
    chen_siyao: createStudentSchedule('cafeteria'), // Art students have flexible schedule
    ling_ruoyu: professorSchedule,
    lu_jiaxin: createStudentSchedule('bar'), // Business students with band schedule
};

// ====================
// HELPER FUNCTIONS
// ====================

/**
 * Gets character's expected location at a given time
 * @param characterId - Character ID
 * @param gameState - Current game state
 * @returns Expected location ID
 */
export function getCharacterLocationAtTime(
    characterId: CharacterId,
    gameState: GameState
): LocationId {
    const schedule = CHARACTER_SCHEDULES[characterId];
    const { hour, weekday } = gameState.time;

    // Check if character has a schedule for this time
    const daySchedule = schedule.schedule[weekday];
    if (daySchedule && daySchedule[hour] !== undefined) {
        return daySchedule[hour];
    }

    return schedule.defaultLocation;
}

/**
 * Checks if two characters are at the same location
 * @param charId1 - First character ID
 * @param charId2 - Second character ID
 * @param gameState - Current game state
 * @returns true if at same location
 */
export function areCharactersAtSameLocation(
    charId1: CharacterId,
    charId2: CharacterId,
    gameState: GameState
): boolean {
    const loc1 = getCharacterLocationAtTime(charId1, gameState);
    const loc2 = getCharacterLocationAtTime(charId2, gameState);
    return loc1 === loc2;
}

/**
 * Gets characters available for interaction at current time/location
 * @param locationId - Current location
 * @param gameState - Current game state
 * @returns Array of character IDs at this location
 */
export function getAvailableCharacters(
    locationId: LocationId,
    gameState: GameState
): CharacterId[] {
    return (Object.keys(CHARACTER_SCHEDULES) as CharacterId[]).filter(charId => {
        return getCharacterLocationAtTime(charId, gameState) === locationId;
    });
}

/**
 * Updates agent state based on current time and schedule
 * @param characterId - Character ID
 * @param gameState - Current game state
 * @returns Updated agent state
 */
export function updateAgentStateBySchedule(
    characterId: CharacterId,
    gameState: GameState
): Partial<AgentState> {
    const currentLocation = getCharacterLocationAtTime(characterId, gameState);
    const schedule = CHARACTER_SCHEDULES[characterId];

    // Determine mood based on time and location
    let mood: AgentState['mood'] = 'neutral';
    if (currentLocation === 'dorm_room' && (gameState.time.hour >= 23 || gameState.time.hour < 6)) {
        mood = 'happy'; // Sleeping comfortably
    } else if (currentLocation === 'bar' && gameState.time.hour >= 18) {
        mood = 'excited'; // Night time at bar
    } else if (currentLocation === 'library' && gameState.time.hour >= 20) {
        mood = 'neutral'; // Studying late
    }

    // Determine current goal based on location
    let currentGoal = schedule.defaultLocation;
    switch (currentLocation) {
        case 'student_council':
            currentGoal = 'Manage Student Council';
            break;
        case 'lab':
            currentGoal = 'Conduct Physics Research';
            break;
        case 'cafeteria':
            currentGoal = 'Have Lunch / Relax';
            break;
        case 'bar':
            currentGoal = 'Practice Band / Perform';
            break;
        case 'city_map':
            currentGoal = 'Explore City / Hang Out';
            break;
        default:
            currentGoal = 'Attend Classes / Study';
    }

    return { mood, currentGoal };
}
