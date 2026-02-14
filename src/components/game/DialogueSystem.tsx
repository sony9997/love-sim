'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/lib/store';
import { Script, ChoiceOption, getScriptById, DialogueScene } from '@/lib/game-data/scripts';
import { CHARACTERS } from '@/lib/game-data/characters';
import { AIService } from '@/lib/ai-service';
import { CharacterId, LocationId, LocalizedText } from '@/lib/game-data/types';
import { updateRelationshipAndCheckProgression } from '@/lib/relationship-utils';

interface DialogueSystemProps {
    scriptId: string;
    onComplete: () => void;
}

// Action-based script structure for dynamic AI dialogues
type ScriptAction =
    | { type: 'dialogue'; speaker: string; text: LocalizedText; emotion?: string }
    | { type: 'choice'; options: ChoiceOption[] }
    | { type: 'input'; prompt?: LocalizedText }
    | { type: 'effect'; effect: { type: string } }
    | { type: 'background'; image?: string }
    | { type: 'jump'; nextId: string }
    | { type: 'end' };

interface DynamicScript {
    id: string;
    actions: ScriptAction[];
    locationId?: LocationId;
}

export default function DialogueSystem({ scriptId, onComplete }: DialogueSystemProps) {
    const [currentScript, setCurrentScript] = useState<Script | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [playerInput, setPlayerInput] = useState('');
    const [hasSentInput, setHasSentInput] = useState(false);
    const { language } = useGameStore();

    // Helper to convert DynamicScript to Script
    const convertDynamicScript = (dynamicScript: DynamicScript, charId?: CharacterId): Script => {
        // Extract first dialogue as the main message
        const dialogueAction = dynamicScript.actions.find(a => a.type === 'dialogue');
        const choiceAction = dynamicScript.actions.find(a => a.type === 'choice');

        const messages: DialogueScene['messages'] = [];
        const options: DialogueScene['options'] = [];

        if (dialogueAction) {
            messages.push({
                id: '0',
                speaker: dialogueAction.speaker as CharacterId,
                text: dialogueAction.text
            });
        }

        if (choiceAction) {
            options.push(...choiceAction.options);
        }

        return {
            id: dynamicScript.id,
            type: 'default' as const,
            category: 'dynamic',
            priority: 0,
            scene: {
                id: dynamicScript.id,
                characterId: charId || 'su_qingqian',
                locationId: dynamicScript.locationId || 'campus_map',
                messages,
                options
            }
        };
    };

    // Initialize Script
    useEffect(() => {
        console.log('[DialogueSystem] useEffect triggered with scriptId:', scriptId);
        console.log('[DialogueSystem] Current state flags:', useGameStore.getState().flags);

        // If scriptId is null, clear the current script and return early
        if (!scriptId) {
            console.log('[DialogueSystem] scriptId is null, clearing currentScript');
            setCurrentScript(null);
            return;
        }

        // Read the flag here (outside async function) to ensure we have the latest state
        const charId = scriptId as CharacterId;
        const isCharacterInteraction = CHARACTERS[charId];
        const metFlag = isCharacterInteraction ? `met_${charId}` : undefined;
        const hasMet = isCharacterInteraction ? useGameStore.getState().flags[metFlag!] : false;

        console.log('[DialogueSystem] Character check:', charId, 'IsCharacter:', isCharacterInteraction, 'HasMet:', hasMet, 'MetFlag:', metFlag);

        const initScript = async () => {
            // 1. Check if it's a pre-defined script
            const script = getScriptById(scriptId);
            console.log('[DialogueSystem] getScriptById returned:', script ? script.id : 'undefined');

            if (script) {
                console.log('[DialogueSystem] Setting currentScript to:', script.id);
                // Update player location if script specifies a different location
                if (script.scene.locationId && script.scene.locationId !== useGameStore.getState().player.location) {
                    console.log(`[DialogueSystem] Changing location from ${useGameStore.getState().player.location} to ${script.scene.locationId}`);
                    useGameStore.getState().setPlayerLocation(script.scene.locationId);
                }
                setCurrentScript(script);
                setCurrentIndex(0);
                return;
            }

            // 2. Check if it's a character interaction (Dynamic AI)
            if (CHARACTERS[charId]) {
                // Check for "First Meeting" script
                const meetScriptId = `meet_${charId}`;
                const hasMet = metFlag ? useGameStore.getState().flags[metFlag] : false;

                const meetScript = getScriptById(meetScriptId);
                console.log(`[DialogueSystem] Check: hasMet=${hasMet}, meetScript=${!!meetScript}`);
                if (!hasMet && meetScript) {
                    console.log('[DialogueSystem] Showing meeting script because flag not set');
                    setCurrentScript(meetScript);
                    setCurrentIndex(0);
                    return;
                }
                console.log('[DialogueSystem] Flag is set or meetScript not found, generating dynamic AI dialogue');

                setIsLoading(true);
                try {
                    const response = await AIService.getAgentResponse(charId, 'Hello', useGameStore.getState());

                    // Create a dynamic script with actions structure
                    const dynamicScript: DynamicScript = {
                        id: `dynamic_${charId}_${Date.now()}`,
                        locationId: 'campus_map',
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
                                        id: 'chat_more',
                                        label: { en: 'Chat more', zh: '再聊聊' },
                                        nextMessageId: charId
                                    },
                                    {
                                        id: 'leave',
                                        label: { en: 'Leave', zh: '离开' },
                                        nextMessageId: 'end_conversation'
                                    }
                                ]
                            }
                        ]
                    };

                    const convertedScript = convertDynamicScript(dynamicScript, charId);
                    // Debug: add a flag to identify dynamic scripts
                    (convertedScript as any).isDynamic = true;
                    (convertedScript as any).scriptId = scriptId;
                    setCurrentScript(convertedScript);
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
            console.log('[DialogueSystem] Unknown scriptId, calling onComplete');
            onComplete();
        };

        initScript();

        return () => {
            // Cleanup: set isLoading to false to prevent state update on unmount
            console.log('[DialogueSystem] Cleanup: unmounting');
            setIsLoading(false);
        };
    }, [scriptId, onComplete]);

    const currentAction = currentScript?.scene.messages[currentIndex];

    // Helper to get text based on language
    const getText = (text: string | { en: string; zh: string }) => {
        if (typeof text === 'string') return text;
        return text[language] || text.en;
    };

    // Render Logic
    const currentMessage = currentScript?.scene.messages[currentIndex];
    const isDialogue = !!currentMessage;
    // Check if player input is expected
    const hasPlayerInputOption = currentScript?.scene.options.some(o => o.id === 'player_input') || false;
    const isLastMessage = currentScript && currentIndex === currentScript.scene.messages.length - 1;
    const isPlayerMessage = currentMessage?.speaker === 'player';
    const needsPlayerInput = isLastMessage && (isPlayerMessage || hasPlayerInputOption) && !hasSentInput;
    // Options are available when there are options in the script
    const hasOptions = (currentScript?.scene.options?.length || 0) > 0 && !needsPlayerInput;
    // Show "Click to continue" only when there's a dialogue message but no options
    const showClickToContinue = isDialogue && !hasOptions && !needsPlayerInput;

    // Debug logging
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
        console.log('[DialogueSystem] Render debug:', {
            isDialogue,
            hasPlayerInputOption,
            hasOptions,
            isLastMessage,
            needsPlayerInput,
            showClickToContinue,
            hasSentInput,
            messageCount: currentScript?.scene.messages.length,
            optionCount: currentScript?.scene.options?.length
        });
        // Log Continue button condition
        const continueButtonShows = hasSentInput && hasPlayerInputOption;
        console.log('[DialogueSystem] Continue button shows:', continueButtonShows, {
            hasSentInput,
            hasPlayerInputOption,
            needsPlayerInput
        });
    }

    const handleNext = () => {
        if (!currentAction) {
            onComplete();
            return;
        }

        // If at end of messages, show options if available
        if (currentIndex >= currentScript.scene.messages.length) {
            if (currentScript.scene.options.length > 0) {
                return; // Wait for choice
            }
            onComplete();
            return;
        }

        // Auto-advance for non-interactive actions
        // In dialogue script structure, we always need user interaction to advance
    };

    // Auto-advance for non-interactive actions
    useEffect(() => {
        if (!currentScript) return;

        // Show first message or options
        if (currentIndex === 0 && currentScript.scene.messages.length > 0) {
            console.log('[DialogueSystem] Showing dialogue:', currentScript.scene.messages[0].speaker);
        }
    }, [currentIndex, currentScript]);

    // Reset state when script changes
    useEffect(() => {
        setHasSentInput(false);
        setPlayerInput('');
    }, [scriptId]);

    // Debug: log state on render
    useEffect(() => {
        if (typeof window !== 'undefined' && currentScript) {
            console.log('[DialogueState]', {
                hasOptions,
                hasPlayerInputOption,
                hasSentInput,
                needsPlayerInput,
                isDialogue,
                isLastMessage,
                optionCount: currentScript.scene.options?.length,
                messageCount: currentScript.scene.messages.length,
                currentIndex,
                playerInput: playerInput ? `"${playerInput}"` : 'empty'
            });
        }
    }, [currentScript, hasOptions, hasPlayerInputOption, hasSentInput, needsPlayerInput, isDialogue, isLastMessage, currentIndex, playerInput]);

    const handleChoice = (option: ChoiceOption) => {
        const nextMessageId = option.nextMessageId;
        console.log('[DialogueSystem] handleChoice called:', option.label, '-> nextMessageId:', nextMessageId);
        console.log('[DialogueSystem] Current scriptId prop:', scriptId);
        console.log('[DialogueSystem] Current store currentScriptId:', useGameStore.getState().currentScriptId);

        // player_input option means the conversation is done
        if (nextMessageId === 'player_input' || nextMessageId === 'end_conversation') {
            onComplete();
            return;
        }

        // If nextMessageId is a character, it means we want to loop AI chat
        const charId = nextMessageId as CharacterId;
        if (CHARACTERS[charId]) {
            console.log('[DialogueSystem] Triggering AI chat for character:', charId);

            // Set the "met" flag if this is the first interaction
            // This ensures the meeting script doesn't show again
            const metFlag = `met_${charId}`;
            useGameStore.setState((state) => {
                const hasMet = state.flags[metFlag];
                console.log(`[DialogueSystem] handleChoice: metFlag=${metFlag}, hasMet=${hasMet}, currentScriptId=${state.currentScriptId}`);
                if (!hasMet) {
                    console.log(`[DialogueSystem] Setting ${metFlag} flag and currentScriptId to ${charId}`);
                    return {
                        flags: { ...state.flags, [metFlag]: true },
                        currentScriptId: charId
                    };
                }
                console.log(`[DialogueSystem] Flag already set, only setting currentScriptId to ${charId}`);
                return { currentScriptId: charId };
            });

            // Update relationship and check for stage progression
            const gameState = useGameStore.getState();
            const { newStage, stageChanged } = updateRelationshipAndCheckProgression(
                gameState,
                charId,
                5 // Default affection gain for interaction
            );

            console.log(`[DialogueSystem] Relationship update: ${gameState.relationships[charId].status} -> ${newStage}`);

            if (stageChanged) {
                console.log(`[DialogueSystem] Stage upgraded! New stage: ${newStage}`);
                // Here you could trigger a stage progression event or notification
            }

            // Note: We don't call onComplete() here because we want to continue
            // the conversation with the new character's dialogue
            return;
        }

        const nextScript = getScriptById(nextMessageId);
        console.log('[DialogueSystem] Looking for script:', nextMessageId, 'Found:', !!nextScript);

        if (nextScript) {
            console.log('[DialogueSystem] Loading script:', nextMessageId);
            useGameStore.setState({ currentScriptId: nextMessageId });
        } else {
            // Unknown script, end conversation
            console.warn(`[DialogueSystem] Script not found: ${nextMessageId}`);
            onComplete();
        }
    };

    const handlePlayerInput = async () => {
        console.log('[DialogueSystem] handlePlayerInput called, playerInput:', playerInput);
        if (!playerInput.trim()) return;

        const input = playerInput.trim();
        setPlayerInput(''); // Clear input
        setHasSentInput(true); // Mark that player has sent input
        setIsLoading(true);

        try {
            // Determine which character is speaking (from previous dialogue or context)
            let characterId: CharacterId | null = null;

            // Search backwards for the last character dialogue (start from currentIndex, not currentIndex-1)
            if (currentScript) {
                for (let i = currentIndex; i >= 0; i--) {
                    const msg = currentScript.scene.messages[i];
                    if (msg && msg.speaker !== 'player' && msg.speaker !== 'narrator') {
                        characterId = msg.speaker as CharacterId;
                        break;
                    }
                }
            }

            if (!characterId) {
                console.error('[DialogueSystem] No character found for AI response');
                setIsLoading(false);
                handleNext();
                return;
            }

            // Set the "met" flag for this character
            const metFlag = `met_${characterId}`;
            useGameStore.setState((state) => {
                if (!state.flags[metFlag]) {
                    console.log(`[DialogueSystem] Setting ${metFlag} flag`);
                    return { flags: { ...state.flags, [metFlag]: true } };
                }
                return {};
            });

            // Get AI response
            const response = await AIService.getAgentResponse(characterId, input, useGameStore.getState());

            // Create a new dialogue message for the AI response
            const aiMessage = {
                id: `ai_${Date.now()}`,
                speaker: characterId,
                text: response
            };

            // Insert the AI response into the script's messages
            const newMessages = [
                ...currentScript!.scene.messages.slice(0, currentIndex + 1),
                aiMessage,
                ...currentScript!.scene.messages.slice(currentIndex + 1)
            ];

            // Create a new option to continue the conversation
            const continueOption: ChoiceOption = {
                id: `continue_${Date.now()}`,
                label: { en: 'Continue', zh: '继续' },
                nextMessageId: 'end_conversation'
            };

            const newOptions = [...currentScript!.scene.options, continueOption];

            // Update the script with new messages
            const updatedScript: Script = {
                ...currentScript!,
                scene: {
                    ...currentScript!.scene,
                    messages: newMessages,
                    options: newOptions
                }
            };

            setCurrentScript(updatedScript);
            setCurrentIndex(currentIndex + 1); // Move to AI response
        } catch (error) {
            console.error('[DialogueSystem] Failed to get AI response:', error);
            // If AI fails, just complete the dialogue with the player's message
            onComplete();
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm pointer-events-none" data-testid="dialogue-overlay">
                <div className="text-white animate-pulse">Thinking...</div>
            </div>
        );
    }

    // If scriptId is null or currentScript is null, return null to unmount
    if (!scriptId || !currentScript) {
        console.log('[DialogueSystem] Returning null - unmounting');
        return null;
    }
    console.log('[DialogueSystem] Rendering dialogue box');

    return (
        <div className="absolute inset-0 z-50 flex flex-col justify-end pointer-events-none" data-testid="dialogue-box">
            {/* Character Sprites Layer */}
            <div className="absolute inset-0 flex items-end justify-center pb-32 pointer-events-none">
                <AnimatePresence mode="wait">
                    {isDialogue && currentMessage?.speaker !== 'player' && currentMessage?.speaker !== 'narrator' && (
                        <motion.img
                            key={currentMessage!.speaker}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            src={CHARACTERS[currentMessage!.speaker]?.sprites['default']}
                            alt={currentMessage!.speaker}
                            className="h-[80%] object-contain drop-shadow-2xl"
                        />
                    )}
                </AnimatePresence>
            </div>

            {/* Dialogue Box */}
            {(isDialogue || hasOptions) && (
                <div className="pointer-events-auto relative mx-auto mb-32 w-full max-w-4xl rounded-xl border border-white/20 bg-black/80 p-6 shadow-2xl backdrop-blur-md">
                    {/* Debug: show state in DOM */}
                    {typeof window !== 'undefined' && (
                        <div className="fixed top-4 right-4 z-[100] bg-black/80 text-[10px] text-yellow-400 p-2 font-mono rounded">
                            <div>scriptId: {String(currentScript?.id || 'N/A')}</div>
                            <div>hasOptions: {String(hasOptions)}</div>
                            <div>hasPlayerInputOption: {String(hasPlayerInputOption)}</div>
                            <div>hasSentInput: {String(hasSentInput)}</div>
                            <div>optionCount: {String(currentScript?.scene.options?.length)}</div>
                            <div>messageCount: {String(currentScript?.scene.messages.length)}</div>
                            <div>playerInput: {playerInput}</div>
                        </div>
                    )}
                    {showClickToContinue && (
                        <div onClick={handleNext} className="cursor-pointer">
                            <h3 className="mb-2 text-xl font-bold text-blue-400">
                                {currentMessage!.speaker === 'player' ? (language === 'zh' ? '你' : 'You') :
                                    currentMessage!.speaker === 'narrator' ? '' :
                                        getText(CHARACTERS[currentMessage!.speaker]?.name)}
                            </h3>
                            <p className="text-lg text-white leading-relaxed">{getText(currentMessage!.text)}</p>
                            <div className="mt-4 flex justify-end">
                                <span className="animate-pulse text-xs text-gray-400">
                                    {language === 'zh' ? '点击继续 ▼' : 'Click to continue ▼'}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Player input section - shown when player_input option exists and not yet sent */}
                    {/* DEBUG: hasPlayerInputOption={String(hasPlayerInputOption)} hasSentInput={String(hasSentInput)} hasOptions={String(hasOptions)} isLastMessage={String(isLastMessage)} isDialogue={String(isDialogue)} */}
                    {hasPlayerInputOption && !hasSentInput && (isLastMessage || !isDialogue) && (
                        <div className="space-y-3">
                            <input
                                type="text"
                                data-testid="player-input"
                                value={playerInput}
                                onInput={(e) => {
                                    console.log('[DialogueSystem] onInput triggered, value:', (e.target as HTMLInputElement).value);
                                    setPlayerInput((e.target as HTMLInputElement).value);
                                }}
                                onChange={(e) => {
                                    console.log('[DialogueSystem] onChange triggered, value:', (e.target as HTMLInputElement).value);
                                }}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' && playerInput.trim()) {
                                        handlePlayerInput();
                                    }
                                }}
                                placeholder={language === 'zh' ? '输入你想说的话...' : 'Type your message...'}
                                className="w-full rounded-lg border border-white/20 bg-white/10 p-4 text-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                                autoFocus
                            />
                            <button
                                data-testid="send-button"
                                onClick={(e) => {
                                    console.log('[DialogueSystem] Send button clicked, calling handlePlayerInput');
                                    console.log('[DialogueSystem] Player input:', playerInput);
                                    (e.currentTarget as HTMLElement).style.backgroundColor = 'red';
                                    handlePlayerInput();
                                }}
                                onMouseDown={(e) => {
                                    console.log('[DialogueSystem] Send button onMouseDown triggered');
                                }}
                                onTouchStart={(e) => {
                                    console.log('[DialogueSystem] Send button onTouchStart triggered');
                                }}
                                disabled={!playerInput.trim()}
                                className="w-full rounded-lg bg-blue-600 p-4 text-lg font-medium text-white transition-all hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {language === 'zh' ? '发送' : 'Send'}
                            </button>
                        </div>
                    )}

                    {/* Continue button after sending input to end conversation */}
                    {hasSentInput && hasPlayerInputOption && (
                        <div className="space-y-3" data-testid="continue-section">
                            <button
                                data-testid="continue-button"
                                onClick={(e) => {
                                    console.log('[DialogueSystem] Continue button onClick triggered');
                                    e.stopPropagation();
                                    setHasSentInput(false);
                                    console.log('[DialogueSystem] Calling onComplete...');
                                    onComplete();
                                    console.log('[DialogueSystem] onComplete called');
                                }}
                                className="w-full rounded-lg border border-blue-500/30 bg-blue-500/10 p-4 text-lg font-medium text-blue-300 transition-all hover:bg-blue-600 hover:text-white"
                            >
                                {language === 'zh' ? '继续' : 'Continue'}
                            </button>
                        </div>
                    )}
                    {/* Regular options - shown when hasOptions (and not player input scenario) */}
                    {hasOptions && !hasSentInput && !hasPlayerInputOption && (
                        <div className="flex flex-col space-y-3">
                            {currentScript.scene.options
                                .filter(option => option.id !== 'player_input')
                                .map((option, idx) => (
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

                    {/* Fallback: player input when at last message without explicit player_input option */}
                    {!hasOptions && !hasPlayerInputOption && !hasSentInput && isDialogue && currentIndex === currentScript.scene.messages.length - 1 && (
                        <div className="flex flex-col space-y-3">
                            <input
                                type="text"
                                value={playerInput}
                                onChange={(e) => {
                                    console.log('[DialogueSystem] onChange triggered, value:', e.target.value);
                                    setPlayerInput(e.target.value);
                                }}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' && playerInput.trim()) {
                                        handlePlayerInput();
                                    }
                                }}
                                placeholder={language === 'zh' ? '输入你想说的话...' : 'Type your message...'}
                                className="w-full rounded-lg border border-white/20 bg-white/10 p-4 text-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                                autoFocus
                            />
                            <button
                                onClick={handlePlayerInput}
                                disabled={!playerInput.trim()}
                                className="w-full rounded-lg bg-blue-600 p-4 text-lg font-medium text-white transition-all hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {language === 'zh' ? '发送' : 'Send'}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
