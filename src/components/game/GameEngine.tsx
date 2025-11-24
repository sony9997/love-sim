'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/lib/store';
import { getTranslation } from '@/lib/i18n';
import MainMenu from './MainMenu';
import HUD from './HUD';
import MapNavigation from './MapNavigation';
import DialogueSystem from './DialogueSystem';

export default function GameEngine() {
    const [isLoaded, setIsLoaded] = useState(false);
    const [gamePhase, setGamePhase] = useState<'menu' | 'playing'>('menu');
    const { player, time, currentScriptId, setCurrentScriptId, language } = useGameStore();
    const t = (key: string) => getTranslation(language, key);

    // Load game state from localStorage on mount
    useEffect(() => {
        const savedState = localStorage.getItem('love-sim-save');
        if (savedState) {
            useGameStore.setState(JSON.parse(savedState));
        }
        setIsLoaded(true);
    }, []);

    // Auto-save on state change
    useEffect(() => {
        if (isLoaded && gamePhase === 'playing') {
            const state = useGameStore.getState();
            localStorage.setItem('love-sim-save', JSON.stringify(state));
        }
    }, [player, time, isLoaded, gamePhase]);

    const handleNewGame = () => {
        // Reset store to initial state (need to implement reset in store or just manually set)
        // For now, let's just start prologue
        setCurrentScriptId('prologue');
        setGamePhase('playing');
    };

    const handleLoadGame = () => {
        setGamePhase('playing');
    };

    if (!isLoaded) return <div className="flex h-screen items-center justify-center bg-black text-white">{t('loading')}</div>;
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
                hasSave={!!localStorage.getItem('love-sim-save')}
            />
        );
    }

    return (
        <div className="relative h-screen w-full overflow-hidden bg-black text-white">
            <HUD />

            {/* Map Navigation is always rendered but might be covered by dialogue */}
            <MapNavigation />

            {/* Overlay DialogueSystem if there is an active script running */}
            {currentScriptId && (
                <DialogueSystem
                    scriptId={currentScriptId}
                    onComplete={() => setCurrentScriptId(null)}
                />
            )}
        </div>
    );
}
