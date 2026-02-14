import { GameState } from '../game-data/types';
import { GameError, NotFoundError } from '../errors';

// ====================
// TYPES
// ====================

export interface SaveMetadata {
    id: string;
    timestamp: number;
    label: string;
    gameState: {
        player: {
            name: string;
            location: string;
        };
        time: {
            day: number;
            hour: number;
        };
        relationships: Record<string, unknown>;
    };
}

export interface SaveOptions {
    label?: string;
    overwrite?: boolean;
}

export interface StorageStats {
    usedBytes: number;
    usedQuotaPercentage: number;
    estimatedQuotaBytes: number;
}

// ====================
// CONSTANTS
// ====================

const DB_NAME = 'love-sim-db';
const DB_VERSION = 1;
const STORE_NAME = 'saves';
const QUOTA_PERCENTAGE_THRESHOLD = 80; // Warn at 80% usage

// Estimate quota (browser storage API doesn't provide exact quota in all browsers)
const ESTIMATED_QUOTA_BYTES = 10 * 1024 * 1024; // 10MB estimated

// ====================
// INDEXEDDB UTILITIES
// ====================

function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;

            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };
    });
}

function generateSaveId(): string {
    return `save_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

// ====================
// STORAGE SERVICE
// ====================

export class StorageService {
    private static instance: StorageService;

    private constructor() {}

    static getInstance(): StorageService {
        if (!StorageService.instance) {
            StorageService.instance = new StorageService();
        }
        return StorageService.instance;
    }

    /**
     * Save game state to IndexedDB
     * @param gameState - Game state to save
     * @param options - Save options (label, overwrite)
     * @returns Save metadata
     */
    async saveGame(gameState: GameState, options: SaveOptions = {}): Promise<SaveMetadata> {
        const { label = `Save ${new Date().toLocaleString()}` } = options;

        try {
            // Check storage quota
            await this.checkQuota();

            const db = await openDB();
            const saveId = generateSaveId();

            const saveData: SaveMetadata = {
                id: saveId,
                timestamp: Date.now(),
                label,
                gameState: {
                    player: {
                        name: gameState.player.name,
                        location: gameState.player.location,
                    },
                    time: {
                        day: gameState.time.day,
                        hour: gameState.time.hour,
                    },
                    relationships: gameState.relationships,
                },
            };

            return new Promise((resolve, reject) => {
                const transaction = db.transaction(STORE_NAME, 'readwrite');
                const store = transaction.objectStore(STORE_NAME);
                const request = store.put(saveData);

                request.onsuccess = () => {
                    logger.info('Game saved successfully', { saveId, label });
                    resolve(saveData);
                };

                request.onerror = () => {
                    const error = request.error || new Error('Failed to save game');
                    logger.error('Failed to save game', error);
                    reject(error);
                };
            });
        } catch (error) {
            logger.error('Failed to save game', error);
            throw new GameError(
                'Failed to save game. Please try again.',
                'SAVE_ERROR',
                error instanceof Error ? error.message : undefined
            );
        }
    }

    /**
     * Load game state from IndexedDB
     * @param id - Save ID
     * @returns Game state
     */
    async loadGame(id: string): Promise<GameState> {
        try {
            const db = await openDB();

            return new Promise((resolve, reject) => {
                const transaction = db.transaction(STORE_NAME, 'readonly');
                const store = transaction.objectStore(STORE_NAME);
                const request = store.get(id);

                request.onsuccess = () => {
                    const result = request.result;

                    if (!result) {
                        reject(new NotFoundError('Save', id));
                        return;
                    }

                    logger.info('Game loaded successfully', { saveId: id });

                    // Construct full game state from save metadata
                    const gameState: GameState = {
                        player: {
                            name: result.gameState.player.name,
                            stats: {
                                intelligence: 10,
                                charm: 10,
                                fitness: 10,
                                money: 1000,
                            },
                            location: result.gameState.player.location,
                            inventory: [],
                            achievements: [],
                        },
                        time: {
                            day: result.gameState.time.day,
                            hour: result.gameState.time.hour,
                            weekday: this.calculateWeekday(result.gameState.time.day, result.gameState.time.hour),
                        },
                        relationships: result.gameState.relationships,
                        agentStates: {
                            su_qingqian: { mood: 'neutral', currentGoal: 'Manage Student Council', memory: [] },
                            chen_siyao: { mood: 'happy', currentGoal: 'Practice Dancing', memory: [] },
                            ling_ruoyu: { mood: 'neutral', currentGoal: 'Solve Physics Problem', memory: [] },
                            lu_jiaxin: { mood: 'neutral', currentGoal: 'Ride Motorcycle', memory: [] },
                        },
                        flags: {},
                        currentScriptId: null,
                        gamePhase: 'menu',
                        currentDialogue: null,
                        language: 'zh',
                        savedAtLocation: result.gameState.player.location,
                    };

                    resolve(gameState);
                };

                request.onerror = () => {
                    const error = request.error || new Error('Failed to load game');
                    logger.error('Failed to load game', error);
                    reject(new GameError('Failed to load game', 'LOAD_ERROR', error));
                };
            });
        } catch (error) {
            logger.error('Failed to load game', error);
            throw new GameError(
                'Failed to load game. Please try again.',
                'LOAD_ERROR',
                error instanceof Error ? error.message : undefined
            );
        }
    }

    /**
     * Delete a save from IndexedDB
     * @param id - Save ID to delete
     */
    async deleteSave(id: string): Promise<void> {
        try {
            const db = await openDB();

            return new Promise((resolve, reject) => {
                const transaction = db.transaction(STORE_NAME, 'readwrite');
                const store = transaction.objectStore(STORE_NAME);
                const request = store.delete(id);

                request.onsuccess = () => {
                    logger.info('Save deleted successfully', { saveId: id });
                    resolve();
                };

                request.onerror = () => {
                    const error = request.error || new Error('Failed to delete save');
                    logger.error('Failed to delete save', error);
                    reject(error);
                };
            });
        } catch (error) {
            logger.error('Failed to delete save', error);
            throw new GameError(
                'Failed to delete save. Please try again.',
                'DELETE_ERROR',
                error instanceof Error ? error.message : undefined
            );
        }
    }

    /**
     * List all saves from IndexedDB
     * @returns Array of save metadata
     */
    async listSaves(): Promise<SaveMetadata[]> {
        try {
            const db = await openDB();

            return new Promise((resolve, reject) => {
                const transaction = db.transaction(STORE_NAME, 'readonly');
                const store = transaction.objectStore(STORE_NAME);
                const request = store.getAll();

                request.onsuccess = () => {
                    const result = request.result as SaveMetadata[];
                    // Sort by timestamp descending (most recent first)
                    result.sort((a, b) => b.timestamp - a.timestamp);
                    resolve(result);
                };

                request.onerror = () => {
                    const error = request.error || new Error('Failed to list saves');
                    logger.error('Failed to list saves', error);
                    reject(error);
                };
            });
        } catch (error) {
            logger.error('Failed to list saves', error);
            throw new GameError(
                'Failed to list saves. Please try again.',
                'LIST_ERROR',
                error instanceof Error ? error.message : undefined
            );
        }
    }

    /**
     * Check storage quota and warn if approaching limit
     */
    async checkQuota(): Promise<void> {
        try {
            // Estimate usage by listing all saves
            const saves = await this.listSaves();
            const estimatedUsage = saves.reduce((acc, save) => {
                // Rough estimation: convert to JSON and get length
                return acc + JSON.stringify(save).length * 2; // UTF-8 roughly 2 bytes per char
            }, 0);

            const percentageUsed = (estimatedUsage / ESTIMATED_QUOTA_BYTES) * 100;

            if (percentageUsed > QUOTA_PERCENTAGE_THRESHOLD) {
                logger.info('Storage quota warning', {
                    usedBytes: estimatedUsage,
                    percentageUsed,
                });
            }
        } catch {
            // Quota check failed, but we shouldn't fail the main operation
        }
    }

    /**
     * Get storage statistics
     */
    async getStorageStats(): Promise<StorageStats> {
        const saves = await this.listSaves();
        const usedBytes = saves.reduce((acc, save) => {
            return acc + JSON.stringify(save).length * 2;
        }, 0);

        return {
            usedBytes,
            usedQuotaPercentage: (usedBytes / ESTIMATED_QUOTA_BYTES) * 100,
            estimatedQuotaBytes: ESTIMATED_QUOTA_BYTES,
        };
    }

    /**
     * Clear all saves from IndexedDB
     */
    async clearAll(): Promise<void> {
        try {
            const db = await openDB();

            return new Promise((resolve, reject) => {
                const transaction = db.transaction(STORE_NAME, 'readwrite');
                const store = transaction.objectStore(STORE_NAME);
                const request = store.clear();

                request.onsuccess = () => {
                    logger.info('All saves cleared');
                    resolve();
                };

                request.onerror = () => {
                    const error = request.error || new Error('Failed to clear saves');
                    logger.error('Failed to clear saves', error);
                    reject(error);
                };
            });
        } catch (error) {
            logger.error('Failed to clear saves', error);
            throw new GameError(
                'Failed to clear saves. Please try again.',
                'CLEAR_ERROR',
                error instanceof Error ? error.message : undefined
            );
        }
    }

    /**
     * Calculate weekday from day and hour
     * Assumes day 1 starts on Monday (weekday 0)
     */
    private calculateWeekday(day: number, hour: number): number {
        // Calculate total hours from start
        const totalHours = (day - 1) * 24 + hour;
        // Calculate weekday (0 = Monday, 6 = Sunday)
        return (Math.floor(totalHours / 24) % 7 + 7) % 7;
    }
}

// ====================
// LOGGER
// ====================

const logger = {
    debug: (message: string, ...args: unknown[]) => {
        if (process.env.NODE_ENV === 'development') {
            console.log(`[Storage Service] ${message}`, ...args);
        }
    },
    info: (message: string, ...args: unknown[]) => {
        console.info(`[Storage Service] ${message}`, ...args);
    },
    error: (message: string, error?: unknown) => {
        console.error(`[Storage Service] ${message}`, error);
    },
};

// ====================
// EXPORT INSTANCE
// ====================

export const storage = StorageService.getInstance();
