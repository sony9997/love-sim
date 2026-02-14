import React, { createContext, useContext, useCallback } from 'react';

/**
 * Full UI text dictionary for both languages
 */
export const UI_TEXT = {
    en: {
        // Menu
        newGame: 'New Game',
        continue: 'Continue',
        settings: 'Settings',
        exit: 'Exit',
        // Loading
        loading: 'Loading...',
        // Time
        day: 'Day',
        hour: 'Hour',
        monday: 'Monday',
        tuesday: 'Tuesday',
        wednesday: 'Wednesday',
        thursday: 'Thursday',
        friday: 'Friday',
        saturday: 'Saturday',
        sunday: 'Sunday',
        // Stats
        stats: {
            intelligence: 'INT',
            charm: 'CHM',
            fitness: 'FIT',
            money: 'Money',
        },
        // Actions
        actions: {
            move: 'MOVE',
            talk: 'TALK',
            examine: 'EXAMINE',
            stay: 'STAY',
            inventory: 'INVENTORY',
        },
        // Dialogue
        clickToContinue: 'Click to continue ▼',
        speak: 'Speak',
        think: 'Think',
        // Relationship stages
        stages: {
            stranger: 'Stranger',
            acquaintance: 'Acquaintance',
            friend: 'Friend',
            crush: 'Crush',
            lover: 'Lover',
            enemy: 'Enemy',
        },
        // Messages
        noSaveFound: 'No save found',
        gameSaved: 'Game saved',
        loadGame: 'Load Game',
        saveGame: 'Save Game',
        settingsTitle: 'Settings',
        language: 'Language',
        sound: 'Sound',
        music: 'Music',
        confirmExit: 'Are you sure you want to exit?',
        yes: 'Yes',
        no: 'No',
    },
    zh: {
        // Menu
        newGame: '开始游戏',
        continue: '继续游戏',
        settings: '设置',
        exit: '退出',
        // Loading
        loading: '加载中...',
        // Time
        day: '第',
        hour: '时',
        monday: '星期一',
        tuesday: '星期二',
        wednesday: '星期三',
        thursday: '星期四',
        friday: '星期五',
        saturday: '星期六',
        sunday: '星期日',
        // Stats
        stats: {
            intelligence: '智力',
            charm: '魅力',
            fitness: '体能',
            money: '金钱',
        },
        // Actions
        actions: {
            move: '移动',
            talk: '交谈',
            examine: '调查',
            stay: '停留',
            inventory: '背包',
        },
        // Dialogue
        clickToContinue: '点击继续 ▼',
        speak: '说话',
        think: '思考',
        // Relationship stages
        stages: {
            stranger: '初识',
            acquaintance: '熟悉',
            friend: '朋友',
            crush: '暗恋',
            lover: '恋人',
            enemy: '敌人',
        },
        // Messages
        noSaveFound: '未找到存档',
        gameSaved: '游戏已保存',
        loadGame: '读取存档',
        saveGame: '保存游戏',
        settingsTitle: '设置',
        language: '语言',
        sound: '音效',
        music: '音乐',
        confirmExit: '确定要退出游戏吗？',
        yes: '是',
        no: '否',
    },
};

export type Language = 'en' | 'zh';

export type TranslationKeys =
    | 'newGame'
    | 'continue'
    | 'settings'
    | 'exit'
    | 'loading'
    | 'day'
    | 'hour'
    | 'monday'
    | 'tuesday'
    | 'wednesday'
    | 'thursday'
    | 'friday'
    | 'saturday'
    | 'sunday'
    | 'stats'
    | 'actions'
    | 'clickToContinue'
    | 'speak'
    | 'think'
    | 'stages'
    | 'noSaveFound'
    | 'gameSaved'
    | 'loadGame'
    | 'saveGame'
    | 'settingsTitle'
    | 'language'
    | 'sound'
    | 'music'
    | 'confirmExit'
    | 'yes'
    | 'no'
    | `${string}.${string}`;

/**
 * Get translation for a key in specified language
 * @param lang - Target language ('en' or 'zh')
 * @param key - Translation key (e.g., 'menu.newGame')
 * @returns Translated string or fallback key
 */
export function getTranslation(lang: Language, key: string): string {
    const keys = key.split('.');
    let value: unknown = UI_TEXT[lang];
    for (const k of keys) {
        if (typeof value === 'object' && value !== null && k in (value as Record<string, unknown>)) {
            value = (value as Record<string, unknown>)[k];
        } else {
            return key;
        }
    }
    return typeof value === 'string' ? value : key;
}

/**
 * Context for language management
 */
interface TranslationContextType {
    language: Language;
    t: (key: string) => string;
    setLanguage: (lang: Language) => void;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

/**
 * Provider component for translation context
 */
export function TranslationProvider({
    children,
    initialLanguage = 'zh',
}: {
    children: React.ReactNode;
    initialLanguage?: Language;
}) {
    const [language, setLanguage] = React.useState<Language>(initialLanguage);

    const t = useCallback(
        (key: string): string => {
            return getTranslation(language, key);
        },
        [language]
    );

    const value = React.useMemo(
        () => ({
            language,
            t,
            setLanguage,
        }),
        [language, t]
    );

    return (
        <TranslationContext.Provider value={value}>
            {children}
        </TranslationContext.Provider>
    );
}

/**
 * Hook to access translation context
 * @returns Translation context with language, translator function, and setter
 */
export function useTranslation() {
    const context = useContext(TranslationContext);
    if (context === undefined) {
        // Fallback for when used outside provider
        const t = (key: string): string => getTranslation('zh', key);
        return {
            language: 'zh',
            t,
            setLanguage: () => {
                // Note: This is a development-time warning
                // In production, components should be wrapped in TranslationProvider
            },
        };
    }
    return context;
}

/**
 * Get all translations for a specific language
 * @param lang - Language code
 * @returns Full translation object for that language
 */
export function getLanguagePack(lang: Language): typeof UI_TEXT.en {
    return { ...UI_TEXT[lang] };
}

/**
 * Check if a translation key exists
 * @param lang - Language code
 * @param key - Translation key
 * @returns True if key exists
 */
export function hasTranslation(lang: Language, key: string): boolean {
    const keys = key.split('.');
    let value: unknown = UI_TEXT[lang];
    for (const k of keys) {
        if (typeof value === 'object' && value !== null && k in (value as Record<string, unknown>)) {
            value = (value as Record<string, unknown>)[k];
        } else {
            return false;
        }
    }
    return typeof value === 'string';
}
