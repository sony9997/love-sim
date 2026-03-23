import type { GameState, Time, CharacterId, Relationship } from '@/lib/game-data/types';

export type EventType =
    | 'TIME_ADVANCE'
    | 'LOCATION_CHANGE'
    | 'DIALOGUE_COMPLETE'
    | 'AFFECTION_CHANGE'
    | 'STATUS_UPGRADE'
    | 'RANDOM_EVENT'
    | 'AGENT_ACTION'
    | 'PLAYER_ACTION';

export interface AffectionChangePayload {
    agentId: CharacterId;
    change: number;
}

export interface StatusUpgradePayload {
    agentId: CharacterId;
    newStatus: string;
    reward: string;
}

export interface LocationChangePayload {
    agentId: CharacterId;
    location: string;
}

export interface TimeAdvancePayload {
    hours: number;
}

export interface AgentActionPayload {
    agentId: CharacterId;
    action: 'proactive_dialogue' | 'move' | 'idle';
}

export interface PlayerActionPayload {
    action: string;
    data?: Record<string, unknown>;
}

export type EventPayload =
    | AffectionChangePayload
    | StatusUpgradePayload
    | LocationChangePayload
    | TimeAdvancePayload
    | AgentActionPayload
    | PlayerActionPayload
    | Record<string, unknown>;

export interface GameEvent {
    type: EventType;
    payload: EventPayload;
    timestamp: Time;
    id: string;
}

export class EventSystem {
    private subscribers: Map<EventType, Set<(event: GameEvent) => void>> = new Map();
    private eventQueue: GameEvent[] = [];

    subscribe(eventType: EventType, handler: (event: GameEvent) => void) {
        if (!this.subscribers.has(eventType)) {
            this.subscribers.set(eventType, new Set());
        }
        this.subscribers.get(eventType)?.add(handler);
    }

    unsubscribe(eventType: EventType, handler: (event: GameEvent) => void) {
        const handlers = this.subscribers.get(eventType);
        if (handlers) {
            handlers.delete(handler);
        }
    }

    emit(event: GameEvent) {
        this.eventQueue.push(event);

        const handlers = this.subscribers.get(event.type);
        if (handlers) {
            for (const handler of [...handlers]) {
                handler(event);
            }
        }
    }

    async processQueue(gameState: GameState): Promise<GameState> {
        let state = gameState;

        while (this.eventQueue.length > 0) {
            const event = this.eventQueue.shift()!;

            switch (event.type) {
                case 'AFFECTION_CHANGE':
                    state = this.handleAffectionChange(state, event);
                    break;
                case 'STATUS_UPGRADE':
                    state = this.handleStatusUpgrade(state, event);
                    break;
                case 'LOCATION_CHANGE':
                    state = this.handleLocationChange(state, event);
                    break;
                case 'TIME_ADVANCE':
                    state = this.handleTimeAdvance(state, event);
                    break;
            }
        }

        return state;
    }

    private handleAffectionChange(state: GameState, event: GameEvent): GameState {
        const payload = event.payload as AffectionChangePayload;
        const { agentId, change } = payload;
        const relationship = state.relationships[agentId];
        const newAffection = Math.max(0, relationship.affection + change);

        return {
            ...state,
            relationships: {
                ...state.relationships,
                [agentId]: {
                    ...relationship,
                    affection: newAffection,
                    lastInteraction: state.time,
                },
            },
        };
    }

    private handleStatusUpgrade(state: GameState, event: GameEvent): GameState {
        const payload = event.payload as StatusUpgradePayload;
        const { agentId, newStatus, reward } = payload;

        const relationship = state.relationships[agentId];
        const updatedRelationship: Relationship = {
            ...relationship,
            status: newStatus,
            lockedFeatures: [...(relationship.lockedFeatures || []), reward],
        };

        return {
            ...state,
            relationships: {
                ...state.relationships,
                [agentId]: updatedRelationship,
            },
        };
    }

    private handleLocationChange(state: GameState, event: GameEvent): GameState {
        const payload = event.payload as LocationChangePayload;
        const { agentId, location } = payload;
        const agentState = state.agentStates[agentId];

        // Check for chance encounters
        if (agentId !== 'player' && location === state.player.location) {
            const chance = 0.3 + (state.relationships[agentId].affection / 500);

            if (Math.random() < chance) {
                this.emit({
                    type: 'AGENT_ACTION',
                    payload: { agentId, action: 'proactive_dialogue' },
                    timestamp: state.time,
                    id: `encounter_${Date.now()}`,
                });
            }
        }

        return {
            ...state,
            agentStates: {
                ...state.agentStates,
                [agentId]: {
                    ...(agentState || {}),
                    currentLocation: location,
                },
            },
        };
    }

    private handleTimeAdvance(state: GameState, event: GameEvent): GameState {
        // This would be implemented when scheduler is integrated
        return state;
    }
}
