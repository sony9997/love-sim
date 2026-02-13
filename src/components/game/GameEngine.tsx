'use client';

import { useEffect, useState, useCallback } from 'react';
import { useGameStore } from '@/lib/store';
import MainMenu from './MainMenu';
import HUD from './HUD';
import MapNavigation from './MapNavigation';
import DialogueSystem from './DialogueSystem';
import AgentManager from './AgentManager';
import { CharacterId } from '@/lib/game-data/types';
import { createAgentState } from '@/lib/agent/core';
import { getScheduledLocation } from '@/lib/agent/scheduler';

export default function GameEngine() {
    const [gamePhase, setGamePhase] = useState<'menu' | 'playing'>('menu');
    // gamePhase remains
    const { player, time, currentScriptId, setCurrentScriptId, agentStates, relationships } = useGameStore();

    const [hasSaveFile, setHasSaveFile] = useState(false);

    // Initialize agent states if not present (for new games)
    useEffect(() => {
        const state = useGameStore.getState();
        const charIds: CharacterId[] = ['su_qingqian', 'chen_siyao', 'ling_ruoyu', 'lu_jiaxin'];

        // Check if agent states need initialization
        const agentStateKeys = Object.keys(state.agentStates);
        if (agentStateKeys.length < charIds.length) {
            const newAgentStates = { ...state.agentStates };
            charIds.forEach((charId) => {
                if (!newAgentStates[charId]) {
                    newAgentStates[charId] = createAgentState(charId);
                }
            });
            useGameStore.setState({ agentStates: newAgentStates });
        }
    }, []);

    // Load game state from localStorage on mount
    useEffect(() => {
        const savedState = localStorage.getItem('love-sim-save');
        setHasSaveFile(!!savedState);
        if (savedState) {
            useGameStore.setState(JSON.parse(savedState));
        }
    }, []);

    // Update agent locations based on schedule
    useEffect(() => {
        if (gamePhase === 'playing') {
            const charIds: CharacterId[] = ['su_qingqian', 'chen_siyao', 'ling_ruoyu', 'lu_jiaxin'];
            const currentState = useGameStore.getState();
            const newAgentStates = { ...currentState.agentStates };

            charIds.forEach((charId) => {
                const agentState = newAgentStates[charId] as any;
                if (agentState && !agentState.currentLocation) {
                    // Set initial location based on schedule
                    const scheduledLocation = getScheduledLocation(charId, currentState.time);
                    newAgentStates[charId] = {
                        ...agentState,
                        currentLocation: scheduledLocation,
                    };
                }
            });

            useGameStore.setState({ agentStates: newAgentStates });
        }
    }, [time, gamePhase]);

    // Auto-save on state change
    useEffect(() => {
        if (gamePhase === 'playing') {
            const state = useGameStore.getState();
            localStorage.setItem('love-sim-save', JSON.stringify(state));
        }
    }, [player, time, gamePhase]);

    const handleNewGame = () => {
        // Reset store to initial state (need to implement reset in store or just manually set)
        // For now, let's just start prologue
        setCurrentScriptId('prologue');
        setGamePhase('playing');
    };

    const handleLoadGame = () => {
        setGamePhase('playing');
    };

    const handleScriptComplete = useCallback(() => {
        setCurrentScriptId(null);
    }, [setCurrentScriptId]);

    //
    // Actually, store is initialized with default, so we can use it.
    // But wait, we are inside the component, so we can use hooks.

    // Let's just fix the return statement.
    // We need to get language from store.

    // Wait, I need to add language to destructuring first.

    if (gamePhase === 'menu') {
        return (
            <MainMenu
                onNewGame={handleNewGame}
                onLoadGame={handleLoadGame}
                hasSave={hasSaveFile}
            />
        );
    }

    return (
        <div className="relative h-screen w-full overflow-hidden bg-black text-white">
            <HUD />

            {/* Map Navigation is always rendered but might be covered by dialogue */}
            <MapNavigation />

            {/* Agent Manager handles autonomous agent behaviors */}
            <AgentManager />

            {/* Overlay DialogueSystem if there is an active script running */}
            {currentScriptId && (
                <DialogueSystem
                    scriptId={currentScriptId}
                    onComplete={handleScriptComplete}
                />
            )}
        </div>
    );
}
