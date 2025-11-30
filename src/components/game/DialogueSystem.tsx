'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/lib/store';
import { Script, ChoiceOption, SCRIPTS } from '@/lib/game-data/scripts';
import { CHARACTERS } from '@/lib/game-data/characters';
import { AIService } from '@/lib/ai-service';
import { CharacterId } from '@/lib/game-data/types';

interface DialogueSystemProps {
    scriptId: string;
    onComplete: () => void;
}

export default function DialogueSystem({ scriptId, onComplete }: DialogueSystemProps) {
    const [currentScript, setCurrentScript] = useState<Script | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const { setFlag, modStats, updateRelationship, setPlayerLocation, advanceTime, language } = useGameStore();

    // Initialize Script
    useEffect(() => {
        const initScript = async () => {
            // 1. Check if it's a pre-defined script
            if (SCRIPTS[scriptId]) {
                setCurrentScript(SCRIPTS[scriptId]);
                setCurrentIndex(0);
                return;
            }

            // 2. Check if it's a character interaction (Dynamic AI)
            if (CHARACTERS[scriptId]) {
                // Check for "First Meeting" script
                const metFlag = `met_${scriptId}`;
                const meetScriptId = `meet_${scriptId}`;
                const hasMet = useGameStore.getState().flags[metFlag];

                if (!hasMet && SCRIPTS[meetScriptId]) {
                    setCurrentScript(SCRIPTS[meetScriptId]);
                    setCurrentIndex(0);
                    return;
                }

                setIsLoading(true);
                try {
                    const charId = scriptId as CharacterId;
                    const response = await AIService.getAgentResponse(charId, 'Hello', useGameStore.getState());

                    // Create a dynamic script
                    const dynamicScript: Script = {
                        id: `dynamic_${Date.now()}`,
                        actions: [
                            {
                                type: 'dialogue',
                                speaker: charId,
                                text: response,
                                emotion: 'default'
                            },
                            {
                                type: 'choice',
                                options: [
                                    {
                                        label: { en: 'Chat more', zh: '再聊聊' },
                                        nextId: charId // Loop back to character ID to trigger new AI response
                                    },
                                    {
                                        label: { en: 'Leave', zh: '离开' },
                                        nextId: 'end_conversation'
                                    }
                                ]
                            }
                        ]
                    };
                    setCurrentScript(dynamicScript);
                    setCurrentIndex(0);
                } catch (error) {
                    console.error("AI Service Error:", error);
                    onComplete();
                } finally {
                    setIsLoading(false);
                }
                return;
            }

            // 3. Fallback: End if unknown
            onComplete();
        };

        initScript();
    }, [scriptId, onComplete]);

    const currentAction = currentScript?.actions[currentIndex];

    const handleNext = () => {
        if (!currentAction) {
            onComplete();
            return;
        }

        if (currentAction.type === 'end') {
            onComplete();
            return;
        }

        if (currentAction.type === 'choice') return; // Wait for choice

        // Process effects before moving to next
        if (currentAction.type === 'effect') {
            const { effect } = currentAction;
            switch (effect.type) {
                case 'set_flag': setFlag(effect.flag, effect.value); break;
                case 'mod_stat': modStats({ [effect.stat]: effect.amount }); break;
                case 'mod_affection': updateRelationship(effect.charId, effect.amount); break;
                case 'move': setPlayerLocation(effect.locationId); break;
                case 'advance_time': advanceTime(effect.hours); break;
            }
        }

        if (currentAction.type === 'jump') {
            const nextId = currentAction.nextId;
            // Handle jump to character ID (AI loop)
            if (CHARACTERS[nextId]) {
                // We need to trigger the useEffect again. 
                // Since we can't easily force re-mount, we might need to call a prop or reset state.
                // Actually, changing scriptId in store would trigger re-mount of this component if the parent handles it.
                // But here we are inside the component.
                // Let's use a hack: set scriptId in store? No, that causes loop.
                // Better: call initScript logic again?
                // Simplest: useGameStore.setState({ currentScriptId: nextId }) will cause this component to unmount and remount with new prop if Parent uses key={scriptId}.
                useGameStore.setState({ currentScriptId: nextId });
                return;
            }

            const nextScript = SCRIPTS[nextId];
            if (nextScript) {
                setCurrentScript(nextScript);
                setCurrentIndex(0);
            } else if (nextId === 'end_conversation') {
                onComplete();
            } else {
                // Unknown script, end conversation
                onComplete();
            }
            return;
        }

        // Move to next action
        const nextIndex = currentIndex + 1;
        if (currentScript && nextIndex >= currentScript.actions.length) {
            // Reached end of script
            onComplete();
        } else {
            setCurrentIndex(nextIndex);
        }
    };

    // Auto-advance for non-interactive actions
    useEffect(() => {
        console.log('[DialogueSystem] Auto-advance check:', {
            hasAction: !!currentAction,
            actionType: currentAction?.type,
            currentIndex,
            scriptId: currentScript?.id
        });

        if (!currentAction) return;
        if (['effect', 'background', 'jump'].includes(currentAction.type)) {
            console.log('[DialogueSystem] Auto-advancing for action type:', currentAction.type);
            handleNext();
        }
    }, [currentIndex, currentAction]);

    const handleChoice = (option: ChoiceOption) => {
        const nextId = option.nextId;
        console.log('[DialogueSystem] Choice selected:', option.label, '-> nextId:', nextId);

        if (nextId === 'end_conversation') {
            onComplete();
            return;
        }

        // If nextId is a character, it means we want to loop AI chat
        if (CHARACTERS[nextId]) {
            console.log('[DialogueSystem] Triggering AI chat for character:', nextId);
            useGameStore.setState({ currentScriptId: nextId });
            return;
        }

        const nextScript = SCRIPTS[nextId];
        console.log('[DialogueSystem] Looking for script:', nextId, 'Found:', !!nextScript);

        if (nextScript) {
            console.log('[DialogueSystem] Loading script:', nextId, 'with', nextScript.actions.length, 'actions');
            setCurrentScript(nextScript);
            setCurrentIndex(0);
        } else {
            // Unknown script, end conversation
            console.warn(`[DialogueSystem] Script not found: ${nextId}`);
            onComplete();
        }
    };

    if (isLoading) {
        return (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm pointer-events-none" data-testid="dialogue-overlay">
                <div className="text-white animate-pulse">Thinking...</div>
            </div>
        );
    }

    if (!currentScript || !currentAction) return null;

    // Helper to get text based on language
    const getText = (text: string | { en: string; zh: string }) => {
        if (typeof text === 'string') return text;
        return text[language] || text.en;
    };

    // Render Logic
    const isDialogue = currentAction.type === 'dialogue';
    const isChoice = currentAction.type === 'choice';

    return (
        <div className="absolute inset-0 z-50 flex flex-col justify-end pointer-events-none" data-testid="dialogue-overlay">
            {/* Character Sprites Layer */}
            <div className="absolute inset-0 flex items-end justify-center pb-32 pointer-events-none">
                <AnimatePresence mode="wait">
                    {isDialogue && currentAction.speaker !== 'player' && currentAction.speaker !== 'narrator' && (
                        <motion.img
                            key={currentAction.speaker}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            src={CHARACTERS[currentAction.speaker]?.sprites[currentAction.emotion || 'default']}
                            alt={currentAction.speaker}
                            className="h-[80%] object-contain drop-shadow-2xl"
                        />
                    )}
                </AnimatePresence>
            </div>

            {/* Dialogue Box */}
            {(isDialogue || isChoice) && (
                <div className="pointer-events-auto relative mx-auto mb-8 w-full max-w-4xl rounded-xl border border-white/20 bg-black/80 p-6 shadow-2xl backdrop-blur-md">
                    {isDialogue && (
                        <div onClick={handleNext} className="cursor-pointer">
                            <h3 className="mb-2 text-xl font-bold text-blue-400">
                                {currentAction.speaker === 'player' ? (language === 'zh' ? '你' : 'You') :
                                    currentAction.speaker === 'narrator' ? '' :
                                        getText(CHARACTERS[currentAction.speaker]?.name)}
                            </h3>
                            <p className="text-lg text-white leading-relaxed">{getText(currentAction.text)}</p>
                            <div className="mt-4 flex justify-end">
                                <span className="animate-pulse text-xs text-gray-400">
                                    {language === 'zh' ? '点击继续 ▼' : 'Click to continue ▼'}
                                </span>
                            </div>
                        </div>
                    )}

                    {isChoice && (
                        <div className="flex flex-col space-y-3">
                            {currentAction.options.map((option, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleChoice(option)}
                                    className="w-full rounded-lg border border-white/10 bg-white/5 p-4 text-left text-lg font-medium text-white transition-all hover:bg-blue-600 hover:scale-[1.02]"
                                >
                                    {getText(option.label)}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
