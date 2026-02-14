// ====================
// GAME DATA TYPES
// ====================

// ----- Player Stats -----
export type Stats = {
    intelligence: number;
    charm: number;
    fitness: number;
    money: number;
};

// ----- Time System -----
export type Time = {
    day: number;      // Game day count starting from 1
    hour: number;     // 0-23
    weekday: number;  // 0-6 (Monday-Sunday)
};

// ----- Character System -----
export type CharacterId = 'su_qingqian' | 'chen_siyao' | 'ling_ruoyu' | 'lu_jiaxin';

export type RelationshipStatus = 'stranger' | 'acquaintance' | 'friend' | 'crush' | 'lover' | 'enemy';

export type Relationship = {
    affection: number;      // 0-100 scale
    status: RelationshipStatus;
    eventsSeen: string[];   // Track which story events have been seen
};

export type Mood = 'happy' | 'neutral' | 'sad' | 'angry' | 'anxious' | 'flustered' | 'excited';

export type AgentState = {
    mood: Mood;
    currentGoal: string;
    memory: string[];       // Short summary of recent interactions
};

export type Character = {
    id: CharacterId;
    name: LocalizedText;
    description: LocalizedText;
    age: number;
    grade?: string;         // For students: 'freshman' | 'sophomore' | 'junior' | 'senior'
    major?: string;         // For professors/students
    avatar: string;         // Path to image
    sprites: {
        default: string;
        happy: string;
        angry: string;
        sad: string;
        blush: string;
        flustered: string;
        excited: string;
    };
    systemPrompt: string;
    personality: {
        traits: string[];
        likes: string[];
        dislikes: string[];
        loveLanguages: string[];
    };
    initialAffection: number;
    initialStage: RelationshipStatus;
    defaultMood: Mood;
    goals: string[];
    background: LocalizedText;
};

// ----- Location System -----
export type LocationId = string;

export type LocationType = 'indoor' | 'outdoor' | 'public' | 'private';

export type Location = {
    id: LocationId;
    name: LocalizedText;
    description: LocalizedText;
    background: string;         // Path to image
    type: LocationType;
    timeEffects?: {
        morning?: string;
        afternoon?: string;
        evening?: string;
        night?: string;
    };
    interactables: Interactable[];
    accessibility?: {
        timeRestrictions?: {
            openHour: number;
            closeHour: number;
        };
        requiredAffection?: Partial<Record<CharacterId, number>>;
        requiredStats?: Partial<Stats>;
    };
};

export type Interactable = {
    id: string;
    label: LocalizedText;
    action: 'move' | 'talk' | 'examine' | 'use';
    target?: string;            // Location ID or Character ID or Item ID
    requirement?: {
        affection?: number;
        stats?: Partial<Stats>;
        flags?: string[];
    };
    result?: {
        affectionChange?: number;
        statChanges?: Partial<Stats>;
        flagSet?: string;
        dialogueTrigger?: string;
    };
};

// ----- Player -----
export type Player = {
    name: string;
    stats: Stats;
    location: LocationId;
    inventory: string[];        // Item IDs
    achievements: string[];     // Achievement IDs
};

// ----- Dialogue System -----
export type DialogueMessage = {
    id: string;
    characterId?: CharacterId;
    speaker: 'player' | CharacterId;
    text: LocalizedText;
    emotion?: Mood;
    portrait?: string;
};

export type DialogueOption = {
    id: string;
    text: LocalizedText;
    nextMessageId: string;
    effect?: {
        affectionChange?: number;
        statChange?: Partial<Stats>;
        flagSet?: string;
        relationshipStage?: RelationshipStatus;
    };
    requirement?: {
        affection?: number;
        stats?: Partial<Stats>;
        flags?: string[];
    };
};

export type DialogueScene = {
    id: string;
    characterId: CharacterId;
    locationId: LocationId;
    stage?: RelationshipStatus;   // If specified, only shows when at this relationship stage
    messages: DialogueMessage[];
    options?: DialogueOption[];
    trigger?: {
        time?: {
            weekday?: number;     // 0-6
            hour?: number;        // 0-23
        };
        flags?: string[];
    };
};

// ----- Achievement System -----
export type Achievement = {
    id: string;
    title: LocalizedText;
    description: LocalizedText;
    icon: string;
    points: number;
    trigger: {
        type: 'affection' | 'stat' | 'flag' | 'event';
        condition: {
            characterId?: CharacterId;
            value: number | string;
        };
    };
};

// ----- Save Data -----
export type SaveData = {
    version: string;
    timestamp: number;
    gameState: GameState;
};

export type GameState = {
    player: Player;
    time: Time;
    relationships: Record<CharacterId, Relationship>;
    agentStates: Record<CharacterId, AgentState>;
    flags: Record<string, boolean>;
    currentScriptId: string | null;
    gamePhase: 'menu' | 'playing';
    currentDialogue: DialogueScene | null;
    language: 'en' | 'zh';
    savedAtLocation: LocationId;
};

// ----- Localization -----
export type LocalizedText = string | { en: string; zh: string };

// ----- Scripts/Scenarios -----
export type ScriptType = 'default' | 'stage' | 'location' | 'achievement' | 'event';

export type DialogueScript = {
    id: string;
    type: ScriptType;
    category: string;           // e.g., 'intro', 'daily', 'date', 'conflict'
    priority: number;           // Lower number = higher priority
    scene: DialogueScene;
    unlockCondition?: {
        dayMin?: number;
        affectionMin?: number;
        flags?: string[];
    };
};

// ----- Utility Types -----
export type ResultType = {
    success: boolean;
    message: LocalizedText;
    data?: unknown;
};
