import { CharacterId, GameState, LocalizedText } from './game-data/types';
import { AIError } from './errors';
import { generateCacheKey as cacheGenerateCacheKey, aiResponseCache, setCachedResponse as setCacheResponse, getCachedResponse as getCachedCacheEntry } from './ai-cache';
import { CHARACTERS } from './game-data/characters';

// ====================
// CONFIGURATION
// ====================

export class AIConfig {
    private static apiKey: string | undefined;
    private static apiUrl: string | undefined;

    static getApiKey(): string {
        if (!this.apiKey) {
            this.apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
            if (!this.apiKey) {
                throw new AIError(
                    'Gemini API Key is not configured. Please set NEXT_PUBLIC_GEMINI_API_KEY or GEMINI_API_KEY environment variable.',
                    { code: 'API_KEY_MISSING' }
                );
            }
        }
        return this.apiKey;
    }

    static getApiUrl(): string {
        if (!this.apiUrl) {
            const apiKey = this.getApiKey();
            this.apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        }
        return this.apiUrl;
    }

    static reset(): void {
        this.apiKey = undefined;
        this.apiUrl = undefined;
    }
}

// ====================
// TYPES
// ====================

export interface AIGenerationOptions {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    topK?: number;
}

export interface AIRequestContext {
    characterId: CharacterId;
    playerInput: string;
    gameState: GameState;
    options?: AIGenerationOptions;
}

export interface AIResponse {
    text: string;
    cached: boolean;
    latency: number;
}

// ====================
// LOGGER
// ====================

// Simple logger that can be extended later
const logger = {
    debug: (message: string, ...args: unknown[]) => {
        if (process.env.NODE_ENV === 'development') {
            console.log(`[AI Service] ${message}`, ...args);
        }
    },
    info: (message: string, ...args: unknown[]) => {
        console.info(`[AI Service] ${message}`, ...args);
    },
    error: (message: string, error?: unknown) => {
        console.error(`[AI Service] ${message}`, error);
    },
};

// ====================
// PROMPT TEMPLATES
// ====================

function generateSystemPrompt(characterId: CharacterId): string {
    const character = CHARACTERS[characterId];
    return character.systemPrompt;
}

function generateConversationPrompt(
    characterId: CharacterId,
    playerInput: string,
    gameState: GameState,
    lang: 'en' | 'zh'
): string {
    const character = CHARACTERS[characterId];
    const rel = gameState.relationships[characterId];
    const agentState = gameState.agentStates[characterId];

    return `
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
}

function generateActionPrompt(characterId: CharacterId, gameState: GameState): string {
    const character = CHARACTERS[characterId];
    const agentState = gameState.agentStates[characterId];

    return `
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
}

function generateDirectorPrompt(gameState: GameState): string {
    return `
You are the game director for a恋爱 simulation game.

Current Game State:
- Time: Day ${gameState.time.day}, ${gameState.time.hour}:00
- Player Location: ${gameState.player.location}

Task: Analyze the current situation and decide if a special event should trigger.
Return ONLY a JSON object with:
- triggerEvent: boolean (true if an event should trigger)
- eventType: string | null (type of event if triggering)
- characterId: string | null (relevant character if applicable)
- reason: string (brief explanation)

Available Event Types: 'chance_encounter', 'gift_giving', 'confession', 'argument', 'date_invitation', 'none';
`;
}

// ====================
// CONTEXT BUILDERS
// ====================

/**
 * Context object type for caching
 */
interface CacheContextObject {
    time: {
        day: number;
        hour: number;
        weekday: number;
    };
    location: string;
    relationships: Record<string, unknown>;
    agentStates: Record<string, unknown>;
}

export function buildContextForCache(gameState: GameState, characterId: CharacterId): CacheContextObject {
    return {
        time: {
            day: gameState.time.day,
            hour: gameState.time.hour,
            weekday: gameState.time.weekday,
        },
        location: gameState.player.location,
        relationships: {
            [characterId]: gameState.relationships[characterId],
        },
        agentStates: {
            [characterId]: gameState.agentStates[characterId],
        },
    };
}

export function buildSystemPromptContext(characterId: CharacterId, gameState: GameState): object {
    const character = CHARACTERS[characterId];
    const rel = gameState.relationships[characterId];
    const agentState = gameState.agentStates[characterId];

    return {
        character: {
            id: character.id,
            name: character.name,
            personality: character.personality,
            systemPrompt: character.systemPrompt,
        },
        context: {
            time: gameState.time,
            location: gameState.player.location,
            relationship: rel,
            mood: agentState.mood,
            goal: agentState.currentGoal,
        },
    };
}

// ====================
// TIMEOUT WRAPPER
// ====================

async function fetchWithTimeout(
    url: string,
    options: RequestInit,
    timeout: number = 5000
): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
        });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof Error && error.name === 'AbortError') {
            throw new AIError(`Request timed out after ${timeout}ms`, { url });
        }
        throw error;
    }
}

// ====================
// MAIN API CALL
// ====================

async function callGeminiAPI(prompt: string, options?: AIGenerationOptions): Promise<string> {
    const apiUrl = AIConfig.getApiUrl();

    logger.debug('Calling Gemini API', { promptLength: prompt.length });

    // Build generation config with only defined values
    const generationConfig: Record<string, number> = {};
    if (options?.temperature !== undefined) generationConfig.temperature = options.temperature;
    if (options?.maxTokens !== undefined) generationConfig.maxOutputTokens = options.maxTokens;
    if (options?.topP !== undefined) generationConfig.topP = options.topP;
    if (options?.topK !== undefined) generationConfig.topK = options.topK;

    const requestBody: Record<string, unknown> = {
        contents: [{
            parts: [{ text: prompt }],
        }],
        generationConfig,
    };

    const response = await fetchWithTimeout(
        apiUrl,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        },
        5000 // 5 second timeout
    );

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new AIError(
            `Gemini API Error: ${response.status} - ${response.statusText}`,
            { status: response.status, data: errorData }
        );
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
        throw new AIError('Empty response from Gemini API', { data });
    }

    return text.trim();
}

// ====================
// RESPONSE GENERATION
// ====================

export async function generateResponse(
    characterId: CharacterId,
    playerInput: string,
    gameState: GameState,
    lang: 'en' | 'zh' = 'zh',
    options?: AIGenerationOptions
): Promise<AIResponse> {
    const startTime = Date.now();

    // Build cache key
    const cacheKey = cacheGenerateCacheKey({
        characterId,
        playerInput,
        gameStateSnapshot: buildContextForCache(gameState, characterId),
        lang,
    });

    // Check cache first
    const cachedEntry = getCachedCacheEntry(cacheKey);
    if (cachedEntry) {
        logger.debug('Cache hit', { key: cacheKey });
        return {
            text: cachedEntry.response,
            cached: true,
            latency: Date.now() - startTime,
        };
    }

    logger.debug('Cache miss, calling API', { key: cacheKey });

    // Generate prompt
    const prompt = generateConversationPrompt(characterId, playerInput, gameState, lang);

    // Call API with retry
    let responseText: string;
    try {
        responseText = await callGeminiAPI(prompt, options);
    } catch (error) {
        logger.error('API call failed', error);
        // Return fallback response
        return {
            text: '抱歉，AI服务暂时不可用。',
            cached: false,
            latency: Date.now() - startTime,
            error: error instanceof Error ? error.message : 'Unknown error',
        } as unknown as AIResponse;
    }

    // Cache the response
    setCacheResponse(cacheKey, responseText, characterId, lang);

    return {
        text: responseText,
        cached: false,
        latency: Date.now() - startTime,
    };
}

/**
 * Get cached response directly (alias for cache getCachedResponse)
 * @param key - Cache key
 * @returns Cached response or undefined
 */
export async function getCachedResponse(
    key: string
): Promise<string | undefined> {
    const cachedEntry = getCachedCacheEntry(key);
    return cachedEntry?.response;
}

// ====================
// CHARACTER ACTION SELECTION
// ====================

export async function getCharacterAction(
    characterId: CharacterId,
    gameState: GameState,
    options?: AIGenerationOptions
): Promise<string> {
    const prompt = generateActionPrompt(characterId, gameState);

    logger.debug('Calling API for character action', { characterId });

    try {
        const responseText = await callGeminiAPI(prompt, options);
        const locationId = responseText.trim().replace(/['"]/g, '');

        // Validate location ID
        const validLocations = [
            'dorm_room',
            'campus_map',
            'student_council',
            'library',
            'cafeteria',
            'gym',
            'city_map',
            'bar',
            'lab',
        ];

        if (validLocations.includes(locationId)) {
            return locationId;
        }

        logger.debug('Invalid location returned, defaulting to campus_map', { locationId });
        return 'campus_map';
    } catch (error) {
        logger.error('Failed to get character action', error);
        return 'campus_map'; // Default fallback
    }
}

// ====================
// DIRECTOR EVENT GENERATION
// ====================

export async function getDirectorEvent(gameState: GameState): Promise<string | null> {
    const prompt = generateDirectorPrompt(gameState);

    try {
        const responseText = await callGeminiAPI(prompt);
        return responseText.trim();
    } catch (error) {
        logger.error('Failed to get director event', error);
        return null;
    }
}

// ====================
// EXPORT MAIN SERVICE
// ====================

export const AIService = {
    // Core functions
    generateResponse,
    getCachedResponse,
    getCharacterAction,
    getDirectorEvent,

    // Configuration
    config: AIConfig,

    // Utilities
    buildContextForCache,
    buildSystemPromptContext,
    generateSystemPrompt,
    generateConversationPrompt,

    // Cache helpers
    getCacheStats: () => aiResponseCache.getStats(),
    clearCache: () => aiResponseCache.clear(),

    // Legacy compatibility
    getAgentResponse: async (
        characterId: CharacterId,
        playerInput: string,
        gameState: GameState
    ): Promise<LocalizedText> => {
        const response = await generateResponse(
            characterId,
            playerInput,
            gameState,
            gameState.language
        );
        return response.text;
    },
};
