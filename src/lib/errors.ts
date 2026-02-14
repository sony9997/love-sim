/**
 * Base error class for all game-related errors
 * Provides user-friendly error messages and error codes
 */
export class GameError extends Error {
    public readonly code: string;
    public readonly details?: unknown;

    constructor(message: string, code?: string, details?: unknown) {
        super(message);
        Object.defineProperty(this, 'name', {
            value: 'GameError',
            writable: false,
            enumerable: false,
            configurable: false,
        });
        this.code = code || 'GAME_ERROR';
        this.details = details;

        // Preserve stack trace
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, GameError);
        }
    }
}

/**
 * Error class for AI service-related errors
 * Covers API failures, rate limits, and service unavailability
 */
export class AIError extends GameError {
    constructor(message: string, details?: unknown) {
        super(message, 'AI_ERROR', details);
        Object.defineProperty(this, 'name', {
            value: 'AIError',
            writable: false,
            enumerable: false,
            configurable: false,
        });
    }
}

/**
 * Error class for input validation failures
 * Used for invalid player inputs, game state constraints, etc.
 */
export class ValidationError extends GameError {
    public readonly field?: string;

    constructor(message: string, field?: string, details?: unknown) {
        super(message, 'VALIDATION_ERROR', details);
        Object.defineProperty(this, 'name', {
            value: 'ValidationError',
            writable: false,
            enumerable: false,
            configurable: false,
        });
        this.field = field;
    }
}

/**
 * Error class for missing resources
 * Used when requested entities (characters, locations, items) are not found
 */
export class NotFoundError extends GameError {
    public readonly resource: string;
    public readonly id?: string;

    constructor(resource: string, id?: string, details?: unknown) {
        super(
            id ? `${resource} not found: ${id}` : `${resource} not found`,
            'NOT_FOUND_ERROR',
            details
        );
        Object.defineProperty(this, 'name', {
            value: 'NotFoundError',
            writable: false,
            enumerable: false,
            configurable: false,
        });
        this.resource = resource;
        this.id = id;
    }
}

/**
 * Error class for permission/access violations
 * Used when player attempts unauthorized actions
 */
export class PermissionError extends GameError {
    constructor(message: string, details?: unknown) {
        super(message, 'PERMISSION_ERROR', details);
        Object.defineProperty(this, 'name', {
            value: 'PermissionError',
            writable: false,
            enumerable: false,
            configurable: false,
        });
    }
}

/**
 * Error class for game state conflicts
 * Used when an action cannot be performed due to current state
 */
export class ConflictError extends GameError {
    constructor(message: string, details?: unknown) {
        super(message, 'CONFLICT_ERROR', details);
        Object.defineProperty(this, 'name', {
            value: 'ConflictError',
            writable: false,
            enumerable: false,
            configurable: false,
        });
    }
}

/**
 * Creates a user-friendly error message from any error type
 */
export function getUserFriendlyMessage(error: Error): string {
    if (error instanceof GameError) {
        return error.message;
    }

    if (error instanceof TypeError) {
        return 'An unexpected error occurred. Please try again.';
    }

    return 'An unknown error occurred. Please try again.';
}

/**
 * Safely handles errors with a fallback message
 */
export function handleError<T>(error: unknown, fallback: string): T {
    if (error instanceof GameError) {
        throw error;
    }

    throw new GameError(
        error instanceof Error ? error.message : fallback,
        'INTERNAL_ERROR'
    );
}
