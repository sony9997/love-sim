import { Character, CharacterId } from './types';

export const CHARACTERS: Record<CharacterId | string, Character> = {
    heroine1: {
        id: 'heroine1',
        name: { en: 'Lin Yue', zh: '林月' },
        description: { en: 'A quiet literature student who loves books.', zh: '安静的文学系学生，喜爱读书。' },
        avatar: '/assets/characters/heroine1/avatar.png',
        sprites: {
            default: '/assets/characters/heroine1/default.png',
            happy: '/assets/characters/heroine1/happy.png',
            angry: '/assets/characters/heroine1/angry.png',
            sad: '/assets/characters/heroine1/sad.png',
            blush: '/assets/characters/heroine1/blush.png',
        },
    },
    heroine2: {
        id: 'heroine2',
        name: { en: 'Su Qing', zh: '苏晴' },
        description: { en: 'Energetic president of the Anime Club.', zh: '充满活力的动漫社社长。' },
        avatar: '/assets/characters/heroine2/avatar.png',
        sprites: {
            default: '/assets/characters/heroine2/default.png',
            happy: '/assets/characters/heroine2/default.png',
            angry: '/assets/characters/heroine2/default.png',
            sad: '/assets/characters/heroine2/default.png',
            blush: '/assets/characters/heroine2/default.png',
        },
    },
    heroine3: {
        id: 'heroine3',
        name: { en: 'Chen Xi', zh: '陈曦' },
        description: { en: 'Rich and arrogant heiress.', zh: '富有的傲娇千金。' },
        avatar: '/assets/characters/heroine3/avatar.png',
        sprites: {
            default: '/assets/characters/heroine3/default.png',
            happy: '/assets/characters/heroine3/default.png',
            angry: '/assets/characters/heroine3/default.png',
            sad: '/assets/characters/heroine3/default.png',
            blush: '/assets/characters/heroine3/default.png',
        },
    },
    heroine4: {
        id: 'heroine4',
        name: { en: 'Jiang Yu', zh: '江雨' },
        description: { en: 'Childhood friend and idol trainee.', zh: '青梅竹马，偶像练习生。' },
        avatar: '/assets/characters/heroine4/avatar.png',
        sprites: {
            default: '/assets/characters/heroine4/default.png',
            happy: '/assets/characters/heroine4/default.png',
            angry: '/assets/characters/heroine4/default.png',
            sad: '/assets/characters/heroine4/default.png',
            blush: '/assets/characters/heroine4/default.png',
        },
    },
    heroine5: {
        id: 'heroine5',
        name: { en: 'Prof. Li', zh: '李教授' },
        description: { en: 'Strict Computer Science professor.', zh: '严厉的计算机系教授。' },
        avatar: '/assets/characters/heroine5/avatar.png',
        sprites: {
            default: '/assets/characters/heroine5/default.png',
            happy: '/assets/characters/heroine5/default.png',
            angry: '/assets/characters/heroine5/default.png',
            sad: '/assets/characters/heroine5/default.png',
            blush: '/assets/characters/heroine5/default.png',
        },
    },
};
