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

export type CharacterId = 'heroine1' | 'heroine2' | 'heroine3' | 'heroine4' | 'heroine5';

export type RelationshipStatus = 'stranger' | 'acquaintance' | 'friend' | 'crush' | 'lover' | 'enemy';

export type Relationship = {
    affection: number;
    status: RelationshipStatus;
    eventsSeen: string[];
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
    flags: Record<string, boolean>;
    currentScriptId: string | null;
};

export type Character = {
    id: CharacterId;
    name: string;
    description: string;
    avatar: string; // Path to image
    sprites: {
        default: string;
        happy: string;
        angry: string;
        sad: string;
        blush: string;
    };
};

export type LocationId = string;

export type Location = {
    id: LocationId;
    name: string;
    description: string;
    background: string; // Path to image
    interactables: Interactable[];
};

export type Interactable = {
    id: string;
    label: string;
    action: 'move' | 'talk' | 'examine';
    target?: string; // Location ID or Character ID or Item ID
};
