'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/lib/store';
import { Script, ScriptAction, ChoiceOption, SCRIPTS } from '@/lib/game-data/scripts';
import { CHARACTERS } from '@/lib/game-data/characters';
import { cn } from '@/lib/utils';

interface DialogueSystemProps {
    scriptId: string;
    onComplete: () => void;
}

export default function DialogueSystem({ scriptId, onComplete }: DialogueSystemProps) {
    const [currentScript, setCurrentScript] = useState<Script | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const { setFlag, updateStats, updateRelationship, setPlayerLocation, advanceTime } = useGameStore();

    useEffect(() => {
        if (SCRIPTS[scriptId]) {
            setCurrentScript(SCRIPTS[scriptId]);
            setCurrentIndex(0);
        }
    }, [scriptId]);

    const currentAction = currentScript?.actions[currentIndex];

    const handleNext = () => {
        if (!currentAction) return;

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
                case 'mod_stat': updateStats({ [effect.stat]: effect.amount }); break; // Simplified
                case 'mod_affection': updateRelationship(effect.charId, effect.amount); break;
                case 'move': setPlayerLocation(effect.locationId); break;
                case 'advance_time': advanceTime(effect.hours); break;
            }
        }

        if (currentAction.type === 'jump') {
            const nextScript = SCRIPTS[currentAction.nextId];
            if (nextScript) {
                setCurrentScript(nextScript);
                setCurrentIndex(0);
            }
            return;
        }

        // Move to next action
        setCurrentIndex((prev) => prev + 1);
    };

    // Auto-advance for non-interactive actions
    useEffect(() => {
        if (!currentAction) return;
        if (['effect', 'background', 'jump'].includes(currentAction.type)) {
            handleNext();
        }
    }, [currentIndex, currentAction]);

    const handleChoice = (option: ChoiceOption) => {
        const nextScript = SCRIPTS[option.nextId];
        if (nextScript) {
            setCurrentScript(nextScript);
            setCurrentIndex(0);
        }
    };

    if (!currentScript || !currentAction) return null;

    // Render Logic
    const isDialogue = currentAction.type === 'dialogue';
    const isChoice = currentAction.type === 'choice';

    return (
        <div className="absolute inset-0 z-50 flex flex-col justify-end pointer-events-none">
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
                                {currentAction.speaker === 'player' ? 'You' :
                                    currentAction.speaker === 'narrator' ? '' :
                                        CHARACTERS[currentAction.speaker]?.name}
                            </h3>
                            <p className="text-lg text-white leading-relaxed">{currentAction.text}</p>
                            <div className="mt-4 flex justify-end">
                                <span className="animate-pulse text-xs text-gray-400">Click to continue ▼</span>
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
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
