import { CharacterId, GameState, LocalizedText, ExtendedAgentState } from './game-data/types';

import { CHARACTERS } from './game-data/characters';
import { getRecentMemories, ConversationContext } from './agent/memory';
import { calculateConnectionStrength } from './agent/relationship';

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

// Check if we're in test mode (set via localStorage or URL param)
const isTestMode = (): boolean => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('love-sim-test-mode') === 'true' ||
           new URLSearchParams(window.location.search).has('test-mode');
};
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

// Helper to call Gemini API
async function callGemini(prompt: string): Promise<string> {
    if (!GEMINI_API_KEY) {
        console.error("Gemini API Key is missing!");
        return "Error: API Key missing.";
    }

    try {
        const response = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Gemini API Error: ${response.status} - ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error("Failed to call Gemini:", error);
        return "Error: AI service unavailable.";
    }
}

// Conversation contexts for each character (in-memory, reset on game load)
const conversationContexts: Record<CharacterId, ConversationContext> = {
    su_qingqian: new ConversationContext(10),
    chen_siyao: new ConversationContext(10),
    ling_ruoyu: new ConversationContext(10),
    lu_jiaxin: new ConversationContext(10),
};

export const AIService = {
    getAgentResponse: async (
        characterId: CharacterId,
        playerInput: string,
        gameState: GameState
    ): Promise<LocalizedText> => {
        // In test mode, return mock response immediately
        if (isTestMode()) {
            console.log('[AIService] Test mode - returning mock response');
            const lang = gameState.language;
            return lang === 'zh'
                ? `（测试响应）你说的是："${playerInput}"，很有意思。`
                : `(Test response) You said: "${playerInput}". Interesting.`;
        }

        const character = CHARACTERS[characterId];
        const rel = gameState.relationships[characterId];
        const agentState = gameState.agentStates[characterId] as ExtendedAgentState;
        const lang = gameState.language;

        // Get recent memories for context
        const recentMemories = getRecentMemories(agentState, 3);
        const memoriesContext = recentMemories.length
            ? `\nRelevant Memories:\n${recentMemories.map((m) => `- ${m.content} (valence: ${m.emotionalValence})`).join('\n')}`
            : '';

        // Get conversation history
        const context = conversationContexts[characterId];
        const historyMessages = context.getContext().slice(-6); // Last 6 turns (3 exchanges)
        const characterName = typeof character.name === 'string' ? character.name : character.name.zh || character.name.en;
        const historyContext = historyMessages.length
            ? `\nConversation History:\n${historyMessages.map((m) => `${m.role === 'user' ? 'Player' : characterName}`).map((m) => `- ${m}`).join('\n')}`
            : '';

        // Calculate connection strength with player (using any since we're creating a partial state)
        const connectionStrength = calculateConnectionStrength(
            agentState,
            {
                perceivedAffection: { chen_siyao: rel.affection },
                socialCircle: [characterId],
            } as ExtendedAgentState
        );

        const prompt = `
${character.systemPrompt}

Current Context:
- Time: Day ${gameState.time.day}, ${gameState.time.hour}:00
- Location: ${gameState.player.location} (Player is here)
- Relationship: Affection ${rel.affection}, Status: ${rel.status}
- Connection Strength: ${connectionStrength}
- Your Mood: ${agentState.mood.base} (intensity: ${agentState.mood.intensity})
- Your Current Goal: ${agentState.currentGoal?.description || 'None'}

${memoriesContext}
${historyContext}

Player says: "${playerInput}"

Task: Respond to the player in ${lang === 'zh' ? 'Chinese (Simplified)' : 'English'}.
Requirements:
1. Stay in character based on your personality: ${agentState.personality.join(', ')}.
2. Keep it concise (1-2 sentences).
3. Reflect your current mood, relationship status, and connection with player.
4. Reference past interactions if relevant.
5. Return ONLY the dialogue text, no quotes.
`;

        const responseText = await callGemini(prompt);

        // Update conversation context
        context.addMessage('user', playerInput);
        context.addMessage('assistant', responseText.trim());

        // Since we need LocalizedText, and we asked for specific language, we can just return string if the type allows,
        // or we construct an object. The type definition says: string | { en: string; zh: string }
        // To be safe and support switching, we might ideally ask for JSON, but for now let's just return the requested language.
        // Actually, the UI handles string.
        return responseText.trim();
    },

    getCharacterAction: async (
        characterId: CharacterId,
        gameState: GameState
    ): Promise<string> => {
        const character = CHARACTERS[characterId];
        const agentState = gameState.agentStates[characterId] as ExtendedAgentState;

        // Check for proactive dialogue opportunities
        const hasRecentInteraction = agentState.recentInteractions.length > 0;
        const context = conversationContexts[characterId];
        const recentChat = context.getContext().length > 0;

        const prompt = `
${character.systemPrompt}

Current Context:
- Time: Day ${gameState.time.day}, ${gameState.time.hour}:00
- Your Current Location: ${agentState.currentLocation}
- Your Mood: ${agentState.mood.base} (intensity: ${agentState.mood.intensity})
- Your Current Goal: ${agentState.currentGoal?.description || 'None'}
- Connected with Player: ${hasRecentInteraction || recentChat}

Task: Decide your next action based on your personality, goals, and social connections.
Available Locations: 'dorm_room', 'campus_map', 'student_council', 'library', 'cafeteria', 'gym', 'city_map', 'bar', 'lab'.
Available Actions: 'move', 'idle', 'proactive_dialogue' (if player is nearby and connection > 30).

Return ONLY the action: Location ID for move, or action name.
`;
        const action = await callGemini(prompt);
        return action.trim().replace(/['"]/g, '');
    },

    // Reset conversation context for a character (e.g., on game load)
    resetConversationContext: (characterId: CharacterId) => {
        conversationContexts[characterId].clear();
    },

    getDirectorEvent: async (gameState: GameState): Promise<string | null> => {
        // Placeholder for Director Agent
        // In a real implementation, this would analyze the whole game state and decide if a special event should trigger.
        return null;
    }
};
