import { Character, CharacterId } from './types';

export const CHARACTERS: Record<CharacterId | string, Character> = {
    su_qingqian: {
        id: 'su_qingqian',
        name: { en: 'Su Qingqian', zh: '苏清浅' },
        description: {
            en: 'High-cold Student Council President from a legal family.',
            zh: '高冷的学生会主席，出身法律世家。'
        },
        avatar: '/assets/characters/su_qingqian/avatar.png',
        sprites: {
            default: '/assets/characters/su_qingqian/default.png',
            happy: '/assets/characters/su_qingqian/happy.png',
            angry: '/assets/characters/su_qingqian/angry.png',
            sad: '/assets/characters/su_qingqian/sad.png',
            blush: '/assets/characters/su_qingqian/blush.png',
        },
    },
    chen_siyao: {
        id: 'chen_siyao',
        name: { en: 'Chen Siyao', zh: '陈思瑶' },
        description: {
            en: 'Energetic idol hiding her identity as a student.',
            zh: '元气满满的偶像，隐藏身份在学校读书。'
        },
        avatar: '/assets/characters/chen_siyao/avatar.png',
        sprites: {
            default: '/assets/characters/chen_siyao/default.png',
            happy: '/assets/characters/chen_siyao/happy.png',
            angry: '/assets/characters/chen_siyao/angry.png',
            sad: '/assets/characters/chen_siyao/sad.png',
            blush: '/assets/characters/chen_siyao/blush.png',
        },
    },
    ling_ruoyu: {
        id: 'ling_ruoyu',
        name: { en: 'Ling Ruoyu', zh: '凌若羽' },
        description: {
            en: 'Genius physics professor who is clumsy in daily life.',
            zh: '天才物理教授，但生活能力极差。'
        },
        avatar: '/assets/characters/ling_ruoyu/avatar.png',
        sprites: {
            default: '/assets/characters/ling_ruoyu/default.png',
            happy: '/assets/characters/ling_ruoyu/happy.png',
            angry: '/assets/characters/ling_ruoyu/angry.png',
            sad: '/assets/characters/ling_ruoyu/sad.png',
            blush: '/assets/characters/ling_ruoyu/blush.png',
        },
    },
    lu_jiaxin: {
        id: 'lu_jiaxin',
        name: { en: 'Lu Jiaxin', zh: '陆嘉欣' },
        description: {
            en: 'Rebellious heiress who loves motorcycles.',
            zh: '叛逆的财阀千金，热爱机车。'
        },
        avatar: '/assets/characters/lu_jiaxin/avatar.png',
        sprites: {
            default: '/assets/characters/lu_jiaxin/default.png',
            happy: '/assets/characters/lu_jiaxin/happy.png',
            angry: '/assets/characters/lu_jiaxin/angry.png',
            sad: '/assets/characters/lu_jiaxin/sad.png',
            blush: '/assets/characters/lu_jiaxin/blush.png',
        },
    },
};
