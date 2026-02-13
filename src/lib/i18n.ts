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
        agentVisualization: {
            title: 'Agent Dashboard',
            location: 'Location',
            mood: 'Mood',
            activity: 'Activity',
            affection: 'Affection',
            status: 'Status',
            memories: 'Recent Memories',
            goals: 'Current Goals',
            hide: 'Hide Dashboard',
            show: 'Show Dashboard',
        },
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
        agentVisualization: {
            title: '角色状态面板',
            location: '当前位置',
            mood: '情绪',
            activity: '活动',
            affection: '好感度',
            status: '关系',
            memories: '近期记忆',
            goals: '当前目标',
            hide: '隐藏面板',
            show: '显示面板',
        },
    },
};

export type Language = 'en' | 'zh';

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
