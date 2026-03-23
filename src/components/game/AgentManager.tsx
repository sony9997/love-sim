'use client';

import { useEffect } from 'react';
import { useGameStore } from '@/lib/store';
import { CharacterId } from '@/lib/game-data/types';
import { createAgentState } from '@/lib/agent/core';
import { getScheduledLocation } from '@/lib/agent/scheduler';
import { AIService } from '@/lib/ai-service';

/**
 * AgentManager Component
 *
 * Manages autonomous agent behaviors:
 * - Schedule-based location updates
 * - Proactive dialogue triggering
 * - Agent action decisions
 */
export default function AgentManager() {
    const { time, gamePhase, agentStates, relationships } = useGameStore();

    useEffect(() => {
        if (gamePhase !== 'playing') return;

        const charIds: CharacterId[] = ['su_qingqian', 'chen_siyao', 'ling_ruoyu', 'lu_jiaxin'];
        const currentState = useGameStore.getState();
        const newAgentStates = { ...currentState.agentStates };
        let updatesNeeded = false;

        charIds.forEach((charId) => {
            const agentState = newAgentStates[charId] as any;
            if (!agentState) {
                // Initialize agent state if not present
                newAgentStates[charId] = createAgentState(charId);
                updatesNeeded = true;
                return;
            }

            // Update location based on schedule if not player-controlled
            const scheduledLocation = getScheduledLocation(charId, time);
            if (agentState.currentLocation !== scheduledLocation) {
                newAgentStates[charId] = {
                    ...agentState,
                    currentLocation: scheduledLocation,
                };
                updatesNeeded = true;
            }

            // Check for proactive dialogue opportunities
            // This would be triggered by event system in a full implementation
        });

        if (updatesNeeded) {
            useGameStore.setState({ agentStates: newAgentStates });
        }
    }, [time, gamePhase]);

    return null; // This is a logic-only component
}
