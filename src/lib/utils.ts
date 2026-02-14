import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge class names with Tailwind CSS
 * @param inputs - Class values to merge
 * @returns Merged class name string
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formats time into a readable string
 * @param day - Day number (1-based)
 * @param hour - Hour (0-23)
 * @returns Formatted time string (e.g., "Day 1, 08:00")
 */
export function formatTime(day: number, hour: number): string {
    const paddedHour = hour.toString().padStart(2, '0');
    return `Day ${day}, ${paddedHour}:00`;
}

/**
 * Formats affection level into a display string
 * @param level - Affection level (0-100+)
 * @returns Formatted string (e.g., "85/100")
 */
export function formatAffection(level: number): string {
    return `${level}/100`;
}

/**
 * Determines relationship stage based on affection level
 * @param level - Affection level (0-100+)
 * @returns Relationship stage
 */
export function getStageFromAffection(level: number): '初识' | '熟悉' | '亲密' | '深度' {
    if (level < 20) {
        return '初识';
    } else if (level < 50) {
        return '熟悉';
    } else if (level < 80) {
        return '亲密';
    } else {
        return '深度';
    }
}

/**
 * Generates a cache key from a context object
 * Uses JSON serialization and hash for consistent keys
 * @param context - Object to generate cache key from
 * @returns Cache key string
 */
export function generateCacheKey(context: object): string {
    const json = JSON.stringify(context);
    // Simple hash function for cache key
    let hash = 0;
    for (let i = 0; i < json.length; i++) {
        const char = json.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    const hexHash = Math.abs(hash).toString(16);
    return `cache_${hexHash}`;
}

/**
 * Creates a debounced version of a function
 * @param func - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
    func: T,
    delay: number
): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout | null = null;

    return (...args: Parameters<T>) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            func(...args);
        }, delay);
    };
}

/**
 * Local storage helper functions with type safety
 */
export const localStorage = {
    /**
     * Get value from local storage
     * @param key - Storage key
     * @param defaultValue - Default value if key doesn't exist
     * @returns Stored value or default
     */
    get<T>(key: string, defaultValue: T): T {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) as T : defaultValue;
        } catch {
            return defaultValue;
        }
    },

    /**
     * Set value in local storage
     * @param key - Storage key
     * @param value - Value to store
     */
    set<T>(key: string, value: T): void {
        try {
            window.localStorage.setItem(key, JSON.stringify(value));
        } catch {
            // Silent fail for storage errors
        }
    },

    /**
     * Remove value from local storage
     * @param key - Storage key
     */
    remove(key: string): void {
        try {
            window.localStorage.removeItem(key);
        } catch {
            // Silent fail for storage errors
        }
    },

    /**
     * Clear all items matching prefix
     * @param prefix - Key prefix to match
     */
    clearPrefix(prefix: string): void {
        try {
            const keysToRemove: string[] = [];
            for (let i = 0; i < window.localStorage.length; i++) {
                const key = window.localStorage.key(i);
                if (key && key.startsWith(prefix)) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach((key) => {
                window.localStorage.removeItem(key);
            });
        } catch {
            // Silent fail for storage errors
        }
    },
};
