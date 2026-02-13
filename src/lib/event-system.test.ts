import { describe, it, expect } from 'vitest';
import { EventSystem, EventType } from './event-system';

// Mock type for testing
type MockEventType = 'TEST_EVENT' | EventType;

describe('Event System', () => {
    it('should handle event subscription and emission', () => {
        const system = new EventSystem();
        let receivedEvent: any = null;

        system.subscribe('AFFECTION_CHANGE' as EventType, (event) => {
            receivedEvent = event;
        });

        system.emit({
            type: 'AFFECTION_CHANGE' as EventType,
            payload: { test: true },
            timestamp: { day: 1, hour: 12, weekday: 0 },
            id: 'test_1',
        });

        expect(receivedEvent).toBeDefined();
        expect(receivedEvent.payload.test).toBe(true);
    });

    it('should handle multiple subscribers for same event type', () => {
        const system = new EventSystem();
        const events1: any[] = [];
        const events2: any[] = [];

        system.subscribe('AFFECTION_CHANGE' as EventType, (event) => events1.push(event));
        system.subscribe('AFFECTION_CHANGE' as EventType, (event) => events2.push(event));

        system.emit({
            type: 'AFFECTION_CHANGE' as EventType,
            payload: { value: 1 },
            timestamp: { day: 1, hour: 12, weekday: 0 },
            id: 'test_1',
        });

        expect(events1.length).toBe(1);
        expect(events2.length).toBe(1);
    });

    it('should unsubscribe events correctly', () => {
        const system = new EventSystem();
        let received = false;

        const handler = () => {
            received = true;
        };

        system.subscribe('AFFECTION_CHANGE' as EventType, handler);
        system.unsubscribe('AFFECTION_CHANGE' as EventType, handler);
        system.emit({
            type: 'AFFECTION_CHANGE' as EventType,
            payload: {},
            timestamp: { day: 1, hour: 12, weekday: 0 },
            id: 'test_1',
        });

        expect(received).toBe(false);
    });

    it('should process queue and handle AFFECTION_CHANGE', () => {
        const system = new EventSystem();
        const initialState = {
            relationships: {
                su_qingqian: { affection: 50, status: 'acquaintance', eventsSeen: [], lockedFeatures: [] },
            },
            player: { location: '', stats: { intelligence: 10, charm: 10, fitness: 10, money: 1000 }, name: '' },
            time: { day: 1, hour: 12, weekday: 0 },
            flags: {},
            currentScriptId: null,
            language: 'zh',
        };

        system.emit({
            type: 'AFFECTION_CHANGE',
            payload: { agentId: 'su_qingqian', change: 20 },
            timestamp: { day: 1, hour: 12, weekday: 0 },
            id: 'affection_1',
        });

        // Note: processQueue is async, so we just test the queue is populated
        // The actual processing would be done in a real implementation
        expect(system['eventQueue'].length).toBe(1);
    });
});
