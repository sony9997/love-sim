import { CharacterId, GameState, LocalizedText } from './game-data/types';

import { CHARACTERS } from './game-data/characters';

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
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

export const AIService = {
    getAgentResponse: async (
        characterId: CharacterId,
        playerInput: string,
        gameState: GameState
    ): Promise<LocalizedText> => {
        const character = CHARACTERS[characterId];
        const rel = gameState.relationships[characterId];
        const agentState = gameState.agentStates[characterId];
        const lang = gameState.language;

        const prompt = `
${character.systemPrompt}

Current Context:
- Time: Day ${gameState.time.day}, ${gameState.time.hour}:00
- Location: ${gameState.player.location} (Player is here)
- Relationship: Affection ${rel?.affection || 0}, Status: ${rel?.status || 'stranger'}
- Your Mood: ${agentState.mood}
- Your Current Goal: ${agentState.currentGoal}

Player says: "${playerInput}"

Task: Respond to the player in ${lang === 'zh' ? 'Chinese (Simplified)' : 'English'}.
Requirements:
1. Stay in character.
2. Keep it concise (1-2 sentences).
3. Reflect your current mood and relationship status.
4. Return ONLY the dialogue text, no quotes.
`;

        const responseText = await callGemini(prompt);

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
        const agentState = gameState.agentStates[characterId];

        const prompt = `
${character.systemPrompt}

Current Context:
- Time: Day ${gameState.time.day}, ${gameState.time.hour}:00
- Your Current Location: (Unknown, you decide)
- Your Mood: ${agentState.mood}
- Your Current Goal: ${agentState.currentGoal}

Task: Decide where you should be right now based on your personality and schedule.
Available Locations: 'dorm_room', 'campus_map', 'student_council', 'library', 'cafeteria', 'gym', 'city_map', 'bar', 'lab'.

Return ONLY the Location ID from the list above.
`;
        const locationId = await callGemini(prompt);
        return locationId.trim().replace(/['"]/g, '');
    },

    getDirectorEvent: async (gameState: GameState): Promise<string | null> => {
        // Placeholder for Director Agent
        // In a real implementation, this would analyze the whole game state and decide if a special event should trigger.
        return null;
    }
};
