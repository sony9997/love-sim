
import { create } from 'zustand';
import { GameState, CharacterId, Time, Stats } from './game-data/types';

interface GameStore extends GameState {
    currentScriptId: string | null;
    // Actions
    setCurrentScriptId: (id: string | null) => void;
    setTime: (time: Partial<Time>) => void;
    advanceTime: (hours: number) => void;
    setPlayerLocation: (locationId: string) => void;
    updateStats: (stats: Partial<Stats>) => void;
    updateRelationship: (charId: CharacterId, amount: number) => void;
    setFlag: (flag: string, value: boolean) => void;
}

const INITIAL_STATE: GameState = {
    player: {
        name: 'Protagonist',
        stats: {
            intelligence: 10,
            charm: 10,
            fitness: 10,
            money: 1000,
        },
        location: 'dorm_room',
    },
    time: {
        day: 1,
        hour: 8,
        weekday: 0, // Monday
    },
    relationships: {
        heroine1: { affection: 0, status: 'stranger', eventsSeen: [] },
        heroine2: { affection: 0, status: 'stranger', eventsSeen: [] },
        heroine3: { affection: 0, status: 'stranger', eventsSeen: [] },
        heroine4: { affection: 0, status: 'stranger', eventsSeen: [] },
        heroine5: { affection: 0, status: 'stranger', eventsSeen: [] },
    },
    flags: {},
    currentScriptId: null,
};

export const useGameStore = create<GameStore>((set) => ({
    ...INITIAL_STATE,

    setCurrentScriptId: (id) => set({ currentScriptId: id }),

    setTime: (time) =>
        set((state) => ({ time: { ...state.time, ...time } })),

    advanceTime: (hours) =>
        set((state) => {
            let newHour = state.time.hour + hours;
            let newDay = state.time.day;
            let newWeekday = state.time.weekday;

            while (newHour >= 24) {
                newHour -= 24;
                newDay += 1;
                newWeekday = (newWeekday + 1) % 7;
            }

            return {
                time: {
                    day: newDay,
                    hour: newHour,
                    weekday: newWeekday,
                },
            };
        }),

    setPlayerLocation: (locationId) =>
        set((state) => ({
            player: { ...state.player, location: locationId },
        })),

    updateStats: (stats) =>
        set((state) => ({
            player: {
                ...state.player,
                stats: { ...state.player.stats, ...stats },
            },
        })),

    updateRelationship: (charId, amount) =>
        set((state) => {
            const rel = state.relationships[charId];
            return {
                relationships: {
                    ...state.relationships,
                    [charId]: { ...rel, affection: rel.affection + amount },
                },
            };
        }),

    setFlag: (flag, value) =>
        set((state) => ({
            flags: { ...state.flags, [flag]: value },
        })),
}));
