export const UI_TEXT = {
    en: {
        newGame: 'New Game',
        continue: 'Continue',
        settings: 'Settings',
        loading: 'Loading...',
        day: 'Day',
        money: '¥',
        stats: {
            intelligence: 'INT',
            charm: 'CHM',
            fitness: 'FIT',
        },
        actions: {
            move: 'MOVE',
            talk: 'TALK',
            examine: 'EXAMINE',
        },
        clickToContinue: 'Click to continue ▼',
    },
    zh: {
        newGame: '开始游戏',
        continue: '继续游戏',
        settings: '设置',
        loading: '加载中...',
        day: '第', // Usually "第 X 天"
        money: '¥',
        stats: {
            intelligence: '智力',
            charm: '魅力',
            fitness: '体能',
        },
        actions: {
            move: '移动',
            talk: '交谈',
            examine: '调查',
        },
        clickToContinue: '点击继续 ▼',
    },
};

export type Language = 'en' | 'zh';

export function getTranslation(lang: Language, key: string): string {
    const keys = key.split('.');
    let value: any = UI_TEXT[lang];
    for (const k of keys) {
        if (value && value[k]) {
            value = value[k];
        } else {
            return key; // Fallback to key if not found
        }
    }
    return value as string;
}
