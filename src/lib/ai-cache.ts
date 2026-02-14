import { generateCacheKey as utilsGenerateCacheKey } from './utils';

// ====================
// TYPES
// ====================

export interface CacheEntry<T = unknown> {
    value: T;
    timestamp: number;
    hitCount: number;
}

export interface LRUCacheOptions {
    maxSize?: number;
    defaultTTL?: number; // Time to live in milliseconds
}

export interface CacheStats {
    hits: number;
    misses: number;
    size: number;
    maxSize: number;
}

// ====================
// LRU Cache Implementation
// ====================

export class LRUCache<T = unknown> {
    private map: Map<string, CacheEntry<T>>;
    private maxSize: number;
    private defaultTTL: number;

    constructor(options: LRUCacheOptions = {}) {
        this.map = new Map();
        this.maxSize = options.maxSize ?? 100;
        this.defaultTTL = options.defaultTTL ?? 15 * 60 * 1000; // 15 minutes
    }

    /**
     * Get value from cache
     * @param key - Cache key
     * @returns Cached value or undefined
     */
    get(key: string): T | undefined {
        const entry = this.map.get(key);

        if (!entry) {
            return undefined;
        }

        // Check TTL
        if (Date.now() - entry.timestamp > this.defaultTTL) {
            this.map.delete(key);
            return undefined;
        }

        // Move to end (most recently used)
        this.map.delete(key);
        this.map.set(key, {
            ...entry,
            hitCount: entry.hitCount + 1,
        });

        return entry.value;
    }

    /**
     * Set value in cache
     * @param key - Cache key
     * @param value - Value to cache
     * @param ttl - Optional TTL override
     */
    set(key: string, value: T): void {
        // If key exists, update it
        if (this.map.has(key)) {
            this.map.delete(key);
        }

        // Evict oldest entry if at capacity
        if (this.map.size >= this.maxSize) {
            const oldestKey = this.map.keys().next().value;
            if (oldestKey) {
                this.map.delete(oldestKey);
            }
        }

        this.map.set(key, {
            value,
            timestamp: Date.now(),
            hitCount: 0,
        });
    }

    /**
     * Delete entry from cache
     * @param key - Cache key
     */
    delete(key: string): boolean {
        return this.map.delete(key);
    }

    /**
     * Clear all cache entries
     */
    clear(): void {
        this.map.clear();
    }

    /**
     * Get cache statistics
     */
    getStats(): CacheStats {
        return {
            hits: 0, // Note: We don't track hits/misses at cache level
            misses: 0,
            size: this.map.size,
            maxSize: this.maxSize,
        };
    }

    /**
     * Get current size
     */
    size(): number {
        return this.map.size;
    }

    /**
     * Check if key exists and is not expired
     * @param key - Cache key
     */
    has(key: string): boolean {
        return this.get(key) !== undefined;
    }
}

// ====================
// AI Response Cache
// ====================

export interface AIResponseCacheEntry {
    response: string;
    characterId: string;
    lang: 'en' | 'zh';
    timestamp: number;
    hitCount: number;
}

// Global cache instance
export const aiResponseCache = new LRUCache<AIResponseCacheEntry>({
    maxSize: 100,
    defaultTTL: 15 * 60 * 1000, // 15 minutes
});

// ====================
// UTILITIES
// ====================

/**
 * Type for cache context (matches CacheContextObject from ai-service)
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

interface CacheContext {
    characterId: string;
    lang: 'en' | 'zh';
    gameStateHash: string;
}

/**
 * Generate cache key from AI request context
 * @param context - Object containing request parameters
 * @returns Cache key string
 */
export function generateCacheKey(context: {
    characterId: string;
    playerInput: string;
    gameStateSnapshot: unknown;
    lang: 'en' | 'zh';
}): string {
    const { characterId, gameStateSnapshot, lang } = context;

    // Create a simplified context for caching
    // Exclude volatile state that changes frequently
    const gameStateContext = gameStateSnapshot as CacheContextObject | undefined;

    const cacheContext: CacheContext = {
        characterId,
        lang,
        // Hash the gameState to keep key size reasonable
        // Only include relevant state for AI response
        gameStateHash: JSON.stringify({
            time: gameStateContext?.time,
            location: gameStateContext?.location,
            relationship: gameStateContext?.relationships?.[characterId],
            agentState: gameStateContext?.agentStates?.[characterId],
        }),
    };

    return utilsGenerateCacheKey(cacheContext);
}

/**
 * Check if response is cached
 * @param key - Cache key
 */
export function isCached(key: string): boolean {
    return aiResponseCache.has(key);
}

/**
 * Get cached response
 * @param key - Cache key
 * @returns Cached entry or undefined
 */
export function getCachedResponse(key: string): AIResponseCacheEntry | undefined {
    return aiResponseCache.get(key);
}

/**
 * Store response in cache
 * @param key - Cache key
 * @param response - Response to cache
 * @param characterId - Character ID
 * @param lang - Language code
 */
export function setCachedResponse(
    key: string,
    response: string,
    characterId: string,
    lang: 'en' | 'zh'
): void {
    aiResponseCache.set(key, {
        response,
        characterId,
        lang,
        timestamp: Date.now(),
        hitCount: 0,
    });
}

/**
 * Delete cached response
 * @param key - Cache key
 */
export function deleteCachedResponse(key: string): boolean {
    return aiResponseCache.delete(key);
}

/**
 * Clear all cached responses
 */
export function clearCache(): void {
    aiResponseCache.clear();
}

/**
 * Get cache statistics
 */
export function getCacheStats(): CacheStats {
    return aiResponseCache.getStats();
}
