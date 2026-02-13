export type Stats = {
    intelligence: number;
    charm: number;
    fitness: number;
    money: number;
};

export type Time = {
    day: number;
    hour: number; // 0-23
    weekday: number; // 0-6 (Mon-Sun)
};

export type CharacterId = 'su_qingqian' | 'chen_siyao' | 'ling_ruoyu' | 'lu_jiaxin';

export type RelationshipStatus = 'stranger' | 'acquaintance' | 'friend' | 'crush' | 'lover' | 'enemy';

export type Relationship = {
    affection: number;
    status: RelationshipStatus;
    eventsSeen: string[];
    lockedFeatures?: string[];
};

// Agent mood and goals types
export type AgentMood = {
    base: 'happy' | 'neutral' | 'sad' | 'angry' | 'anxious' | 'excited' | 'bored';
    intensity: number; // 0-100
    lastChangedAt?: Time;
    triggers: string[];
};

export type AgentGoal = {
    id: string;
    description: string;
    priority: number; // 1-10
    completed: boolean;
    targetType?: 'location' | 'character' | 'activity';
    targetId?: string;
};

export type PersonalityTrait =
    | 'cold'
    | 'hot'
    | 'shy'
    | 'outgoing'
    | 'rational'
    | 'emotional'
    | 'formal'
    | 'casual';

export type AgentMemory = {
    id: string;
    type: 'event' | 'dialogue' | 'observation' | 'fact';
    content: string;
    timestamp: Time;
    emotionalValence: number; // -100 to +100
    strength: number; // 0-100
    associatedCharacters: CharacterId[];
};

// Base AgentState for GameState compatibility
export type AgentState = {
    mood: AgentMood;
    currentGoal: AgentGoal | null;
    memory: string[]; // Short summary of recent interactions
};

// Extended AgentState for Agent system (full agent capabilities)
export type ExtendedAgentState = {
    // Core identity
    personality: PersonalityTrait[];
    coreValues: string[];

    // Memory system
    memory: AgentMemory[];
    recentInteractions: { charId: CharacterId; content: string; timestamp: Time }[];

    // Current state
    mood: AgentMood;
    currentGoal: AgentGoal | null;
    goalsQueue: AgentGoal[];

    // Contextual
    currentLocation: string;
    currentActivity: string;

    // Social
    perceivedAffection: Record<CharacterId, number>;
    socialCircle: string[];
};

export type Player = {
    name: string;
    stats: Stats;
    location: string; // Location ID
};

export type GameState = {
    player: Player;
    time: Time;
    relationships: Record<CharacterId, Relationship>;
    agentStates: Record<CharacterId, AgentState | ExtendedAgentState>;
    flags: Record<string, boolean>;
    currentScriptId: string | null;
    language: 'en' | 'zh';
    gamePhase?: 'menu' | 'playing';
};

export type LocalizedText = string | { en: string; zh: string };

export type Character = {
    id: CharacterId;
    name: LocalizedText;
    description: LocalizedText;
    avatar: string; // Path to image
    sprites: {
        default: string;
        happy: string;
        angry: string;
        sad: string;
        blush: string;
    };
    systemPrompt: string;
};

export type LocationId = string;

export type Location = {
    id: LocationId;
    name: LocalizedText;
    description: LocalizedText;
    background: string; // Path to image
    interactables: Interactable[];
};

export type Interactable = {
    id: string;
    label: LocalizedText;
    action: 'move' | 'talk' | 'examine';
    target?: string; // Location ID or Character ID or Item ID
};

