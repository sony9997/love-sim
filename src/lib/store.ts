import { create } from 'zustand';
import { GameState, CharacterId, Time, Stats, AgentState } from './game-data/types';

interface GameStore extends GameState {
    currentScriptId: string | null;
    language: 'en' | 'zh';
    // Actions
    setLanguage: (lang: 'en' | 'zh') => void;
    setCurrentScriptId: (id: string | null) => void;
    setTime: (time: Partial<Time>) => void;
    advanceTime: (hours: number) => void;
    setPlayerLocation: (locationId: string) => void;
    updateStats: (stats: Partial<Stats>) => void;
    modStats: (deltas: Partial<Stats>) => void;
    updateRelationship: (charId: CharacterId, amount: number) => void;
    updateAgentState: (charId: CharacterId, state: Partial<AgentState>) => void;
    setFlag: (flag: string, value: boolean) => void;
}

const INITIAL_STATE: GameState = {
    player: {
        name: 'Lin Xuan',
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
        su_qingqian: { affection: 0, status: 'stranger', eventsSeen: [] },
        chen_siyao: { affection: 0, status: 'stranger', eventsSeen: [] },
        ling_ruoyu: { affection: 0, status: 'stranger', eventsSeen: [] },
        lu_jiaxin: { affection: 0, status: 'stranger', eventsSeen: [] },
    },
    agentStates: {
        su_qingqian: { mood: 'neutral', currentGoal: 'Manage Student Council', memory: [] },
        chen_siyao: { mood: 'happy', currentGoal: 'Practice Dancing', memory: [] },
        ling_ruoyu: { mood: 'neutral', currentGoal: 'Solve Physics Problem', memory: [] },
        lu_jiaxin: { mood: 'neutral', currentGoal: 'Ride Motorcycle', memory: [] },
    },
    flags: {},
    currentScriptId: null,
    language: 'zh',
};

export const useGameStore = create<GameStore>((set) => ({
    ...INITIAL_STATE,

    setLanguage: (lang) => set({ language: lang }),
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

    modStats: (deltas) =>
        set((state) => ({
            player: {
                ...state.player,
                stats: {
                    intelligence: state.player.stats.intelligence + (deltas.intelligence ?? 0),
                    charm: state.player.stats.charm + (deltas.charm ?? 0),
                    fitness: state.player.stats.fitness + (deltas.fitness ?? 0),
                    money: state.player.stats.money + (deltas.money ?? 0),
                },
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

    updateAgentState: (charId, newState) =>
        set((state) => {
            const agent = state.agentStates[charId];
            return {
                agentStates: {
                    ...state.agentStates,
                    [charId]: { ...agent, ...newState },
                },
            };
        }),

    setFlag: (flag, value) =>
        set((state) => ({
            flags: { ...state.flags, [flag]: value },
        })),
}));
