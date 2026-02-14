'use client';

import { useEffect, useState, useCallback } from 'react';
import { useGameStore } from '@/lib/store';
import MainMenu from './MainMenu';
import HUD from './HUD';
import MapNavigation from './MapNavigation';
import DialogueSystem from './DialogueSystem';

export default function GameEngine() {
    const gameState = useGameStore();
    const { setGamePhase, setCurrentScriptId } = useGameStore();

    // Force re-render tracking - use a custom hook to subscribe to changes
    const [, setTick] = useState(0);
    useEffect(() => {
        console.log('[GameEngine] Re-rendering:', {
            gamePhase: gameState.gamePhase,
            currentScriptId: gameState.currentScriptId
        });
        setTick(t => t + 1);
    }, [gameState.gamePhase, gameState.currentScriptId]);

    // Check for save file - use lazy init which only runs on client
    // The typeof window check prevents this from running during SSR
    const [hasSaveFile] = useState(() => {
        if (typeof window === 'undefined') {
            return false;
        }
        const savedState = localStorage.getItem('love-sim-save');
        if (savedState) {
            try {
                const parsedState = JSON.parse(savedState);
                useGameStore.setState(parsedState);
                return true;
            } catch (error) {
                console.error('Failed to load save state:', error);
                localStorage.removeItem('love-sim-save');
            }
        }
        return false;
    });

    // Auto-save on state change
    useEffect(() => {
        if (gameState.gamePhase === 'playing') {
            const state = useGameStore.getState();
            localStorage.setItem('love-sim-save', JSON.stringify(state));
        }
    }, [gameState.player, gameState.time, gameState.gamePhase]);

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
        console.log('[GameEngine] handleScriptComplete called');
        console.log('[GameEngine] Current scriptId before:', useGameStore.getState().currentScriptId);
        setCurrentScriptId(null);
        console.log('[GameEngine] Current scriptId after:', useGameStore.getState().currentScriptId);
    }, [setCurrentScriptId]);

    //
    // Actually, store is initialized with default, so we can use it.
    // But wait, we are inside the component, so we can use hooks.

    // Let's just fix the return statement.
    // We need to get language from store.

    // Wait, I need to add language to destructuring first.

    if (gameState.gamePhase === 'menu') {
        return (
            <MainMenu
                onNewGame={handleNewGame}
                onLoadGame={handleLoadGame}
                hasSave={hasSaveFile}
            />
        );
    }

    // Debug logging
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
        console.log('[GameEngine] Render debug:', {
            gamePhase: gameState.gamePhase,
            currentScriptId: gameState.currentScriptId,
            mapNavVisible: gameState.gamePhase === 'playing',
            dialogueVisible: !!gameState.currentScriptId
        });
        // Add a DOM marker to verify rendering
        (window as any).__gameEngineRenderCount = ((window as any).__gameEngineRenderCount || 0) + 1;
        document.body.setAttribute('data-game-phase', gameState.gamePhase);
        document.body.setAttribute('data-current-script-id', String(gameState.currentScriptId));
    }

    // Simple debug: always render a marker element to verify the return path
    const debugMarker = typeof window !== 'undefined' && process.env.NODE_ENV === 'development' ? (
        <div data-testid="game-engine-debug" style={{ display: 'block' }} className="fixed bottom-4 right-4 bg-red-500 text-black text-xs p-2 z-[1000]">
            Phase: {gameState.gamePhase} | Script: {String(gameState.currentScriptId)}
        </div>
    ) : null;

    return (
        <div className="relative h-screen w-full overflow-hidden bg-black text-white" data-testid="game-engine">
            {debugMarker}
            <HUD />

            {/* Map Navigation is always rendered but might be covered by dialogue */}
            {gameState.gamePhase === 'playing' && <MapNavigation data-testid="map-navigation" />}

            {/* Overlay DialogueSystem if there is an active script running */}
            {/* Overlay DialogueSystem if there is an active script running */}
            {gameState.currentScriptId ? (
                <DialogueSystem
                    scriptId={gameState.currentScriptId}
                    onComplete={handleScriptComplete}
                />
            ) : (
                <div style={{ display: 'none' }} data-testid="no-dialogue-indicator"></div>
            )}
        </div>
    );
}
