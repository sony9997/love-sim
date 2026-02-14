import { CharacterId, LocationId, Stats, LocalizedText, GameState, RelationshipStatus } from './types';

// ====================
// GAME DATA SCRIPTS
// ====================
// This file contains dialogue scripts and scenarios for the game
// Scripts are organized by type: default, stage, location, achievement, event

// ====================
// DIALOGUE TYPES
// ====================

export type Emotion = 'default' | 'happy' | 'angry' | 'sad' | 'blush' | 'flustered' | 'excited';

export type DialogueMessage = {
    id: string;
    speaker: CharacterId | 'player' | 'narrator';
    text: LocalizedText;
    emotion?: Emotion;
};

// Type alias for backward compatibility
export type ChoiceOption = DialogueOption;

export type DialogueOption = {
    id: string;
    label: LocalizedText;
    nextMessageId: string;
    effect?: DialogueEffect;
    condition?: (state: GameState) => boolean;
};

export type DialogueEffect =
    | { type: 'set_flag'; flag: string; value: boolean }
    | { type: 'mod_stat'; stat: keyof Stats; amount: number }
    | { type: 'mod_affection'; charId: CharacterId; amount: number }
    | { type: 'advance_time'; hours: number }
    | { type: 'move'; locationId: LocationId };

// Type alias for backward compatibility
export type ScriptScene = DialogueScene;

export type DialogueScene = {
    id: string;
    characterId?: CharacterId;
    locationId: LocationId;
    stage?: RelationshipStatus;
    messages: DialogueMessage[];
    options: DialogueOption[];
    trigger?: {
        time?: { weekday?: number; hour?: number };
        flags?: string[];
    };
};

// Type alias for backward compatibility
export type Script = DialogueScript;

export type DialogueScript = {
    id: string;
    type: 'default' | 'stage' | 'location' | 'achievement' | 'event';
    category: string;
    priority: number;
    scene: DialogueScene;
    unlockCondition?: {
        dayMin?: number;
        affectionMin?: number;
        flags?: string[];
    };
};

// ====================
// CHARACTER INTRODUCTIONS
// ====================

export const DIALOGUE_SCRIPTS: DialogueScript[] = [
    // Su Qingqian - Library encounter
    {
        id: 'intro_su_qingqian_1',
        type: 'default',
        category: 'intro',
        priority: 1,
        scene: {
            id: 'intro_su_qingqian_1',
            characterId: 'su_qingqian',
            locationId: 'library',
            messages: [
                {
                    id: 'intro_su_qingqian_1_1',
                    speaker: 'player',
                    text: { en: 'Hello, is this the Student Council office nearby?', zh: '你好，请问学生会办公室在这附近吗？' }
                },
                {
                    id: 'intro_su_qingqian_1_2',
                    speaker: 'su_qingqian',
                    emotion: 'default',
                    text: { en: 'Yes. You\'re from the first-year class, aren\'t you? I\'m Su Qingqian.', zh: '是的。你是大一的学生吧？我是苏清浅。' }
                },
                {
                    id: 'intro_su_qingqian_1_3',
                    speaker: 'player',
                    text: { en: 'Nice to meet you, President Su. I\'ve heard a lot about you.', zh: '幸会，苏主席。我听说过您很多事。' }
                },
                {
                    id: 'intro_su_qingqian_1_4',
                    speaker: 'su_qingqian',
                    emotion: 'default',
                    text: { en: 'Don\'t call me that. Just Su Qingqian is fine. Is there something you need?', zh: '别叫主席了。直接叫我苏清浅就好。你有什么事吗？' }
                }
            ],
            options: [
                {
                    id: 'intro_su_qingqian_1_opt1',
                    label: { en: 'I need help with a form.', zh: '我需要帮忙填个表。' },
                    nextMessageId: 'intro_su_qingqian_1_end_help'
                },
                {
                    id: 'intro_su_qingqian_1_opt2',
                    label: { en: 'Just wanted to say hello.', zh: '只是想打个招呼。' },
                    nextMessageId: 'intro_su_qingqian_1_end_casual'
                }
            ]
        }
    },
    {
        id: 'intro_chen_siyao_1',
        type: 'default',
        category: 'intro',
        priority: 2,
        scene: {
            id: 'intro_chen_siyao_1',
            characterId: 'chen_siyao',
            locationId: 'city_map',
            messages: [
                {
                    id: 'intro_chen_siyao_1_1',
                    speaker: 'player',
                    text: { en: 'Wow, this area is so vibrant!', zh: '哇，这里好热闹！' }
                },
                {
                    id: 'intro_chen_siyao_1_2',
                    speaker: 'chen_siyao',
                    emotion: 'happy',
                    text: { en: 'Right? This is my favorite spot! Do you come here often? ✨', zh: '对啊！这是我最喜欢的地点！你经常来这儿吗？✨' }
                },
                {
                    id: 'intro_chen_siyao_1_3',
                    speaker: 'player',
                    text: { en: 'Not really. This is my first time in the city center.', zh: '不太经常。这是我第一次来市中心。' }
                },
                {
                    id: 'intro_chen_siyao_1_4',
                    speaker: 'chen_siyao',
                    emotion: 'happy',
                    text: { en: 'Lucky you! I\'ll be your guide! I\'m Chen Siyao, by the way.', zh: '真幸运！我来当你向导吧！我叫陈思瑶，顺便说一下。' }
                }
            ],
            options: [
                {
                    id: 'intro_chen_siyao_1_opt1',
                    label: { en: 'That would be great, Siyao!', zh: '那太好了，思瑶！' },
                    nextMessageId: 'intro_chen_siyao_1_end_excited'
                },
                {
                    id: 'intro_chen_siyao_1_opt2',
                    label: { en: 'I\'d like that.', zh: '那好啊。' },
                    nextMessageId: 'intro_chen_siyao_1_end_polite'
                }
            ]
        }
    },
    {
        id: 'intro_ling_ruoyu_1',
        type: 'default',
        category: 'intro',
        priority: 3,
        scene: {
            id: 'intro_ling_ruoyu_1',
            characterId: 'ling_ruoyu',
            locationId: 'lab',
            messages: [
                {
                    id: 'intro_ling_ruoyu_1_1',
                    speaker: 'player',
                    text: { en: 'Excuse me, is this the physics lab?', zh: '打扰一下，请问这是物理实验室吗？' }
                },
                {
                    id: 'intro_ling_ruoyu_1_2',
                    speaker: 'ling_ruoyu',
                    emotion: 'flustered',
                    text: { en: 'Oh! Uh, yes, this is it. I\'m Ling Ruoyu.', zh: '啊！嗯，是的。我是凌若羽。' }
                },
                {
                    id: 'intro_ling_ruoyu_1_3',
                    speaker: 'ling_ruoyu',
                    emotion: 'flustered',
                    text: { en: 'I was just setting up an experiment... do you mind if I continue?', zh: '我正在准备实验...你介意我继续吗？' }
                },
                {
                    id: 'intro_ling_ruoyu_1_4',
                    speaker: 'player',
                    text: { en: 'Not at all. I\'m actually fascinated by physics.', zh: '不介意。我实际上对物理很感兴趣。' }
                },
                {
                    id: 'intro_ling_ruoyu_1_5',
                    speaker: 'ling_ruoyu',
                    emotion: 'happy',
                    text: { en: 'Really? Gravity is particularly persistent today... I mean, I\'m glad!', zh: '真的吗？今天重力特别明显...啊，我是说，我很高兴！' }
                }
            ],
            options: [
                {
                    id: 'intro_ling_ruoyu_1_opt1',
                    label: { en: 'Can I watch the experiment?', zh: '我可以看你的实验吗？' },
                    nextMessageId: 'intro_ling_ruoyu_1_end_watch'
                },
                {
                    id: 'intro_ling_ruoyu_1_opt2',
                    label: { en: 'I\'ll let you work.', zh: '你忙你的。' },
                    nextMessageId: 'intro_ling_ruoyu_1_end_leave'
                }
            ]
        }
    },
    {
        id: 'intro_lu_jiaxin_1',
        type: 'default',
        category: 'intro',
        priority: 4,
        scene: {
            id: 'intro_lu_jiaxin_1',
            characterId: 'lu_jiaxin',
            locationId: 'bar',
            messages: [
                {
                    id: 'intro_lu_jiaxin_1_1',
                    speaker: 'player',
                    text: { en: 'This is quite a place.', zh: '这地方真不错。' }
                },
                {
                    id: 'intro_lu_jiaxin_1_2',
                    speaker: 'lu_jiaxin',
                    emotion: 'angry',
                    text: { en: 'Hmph. You\'re not one of those rich kids looking for trouble, are you?', zh: '哼。你不是那种来找麻烦的富家子弟吧？' }
                },
                {
                    id: 'intro_lu_jiaxin_1_3',
                    speaker: 'player',
                    text: { en: 'No, I\'m just a student. I heard you play here sometimes.', zh: '不是，我只是个学生。听说你有时会在这里演出。' }
                },
                {
                    id: 'intro_lu_jiaxin_1_4',
                    speaker: 'lu_jiaxin',
                    emotion: 'default',
                    text: { en: 'I do. When I\'m not being forced to attend boring parties.', zh: '是啊。当我不是被迫去参加无聊派对的时候。' }
                }
            ],
            options: [
                {
                    id: 'intro_lu_jiaxin_1_opt1',
                    label: { en: 'I prefer real music too.', zh: '我也更喜欢真实的音乐。' },
                    nextMessageId: 'intro_lu_jiaxin_1_end_agree'
                },
                {
                    id: 'intro_lu_jiaxin_1_opt2',
                    label: { en: 'I\'ll leave you alone.', zh: '我不打扰你了。' },
                    nextMessageId: 'intro_lu_jiaxin_1_end_leave'
                }
            ]
        }
    },

    // Stage-based dialogues
    {
        id: 'stage_acquaintance_su_qingqian',
        type: 'stage',
        category: 'stage',
        priority: 10,
        scene: {
            id: 'stage_acquaintance_su_qingqian',
            characterId: 'su_qingqian',
            locationId: 'library',
            stage: 'acquaintance',
            messages: [
                {
                    id: 'stage_acquaintance_su_qingqian_1',
                    speaker: 'player',
                    text: { en: 'Su Qingqian, you\'re still working on that report?', zh: '苏清浅，你还在做那份报告吗？' }
                },
                {
                    id: 'stage_acquaintance_su_qingqian_2',
                    speaker: 'su_qingqian',
                    emotion: 'default',
                    text: { en: 'It needs to be perfect. You\'ve been here a while. Don\'t you have anything to do?', zh: '它需要完美无缺。你来了很久了。你没什么事要忙吗？' }
                },
                {
                    id: 'stage_acquaintance_su_qingqian_3',
                    speaker: 'player',
                    text: { en: 'I could help you if you need another pair of eyes.', zh: '如果你需要另一双眼睛检查，我可以帮你。' }
                },
                {
                    id: 'stage_acquaintance_su_qingqian_4',
                    speaker: 'su_qingqian',
                    emotion: 'flustered',
                    text: { en: '...Fine. But only if you can spot formatting issues. Don\'t touch the content.', zh: '...好吧。但只能找格式问题。别碰内容。' }
                }
            ],
            options: [
                {
                    id: 'stage_acquaintance_su_qingqian_opt1',
                    label: { en: 'I\'ll be careful.', zh: '我会小心的。' },
                    nextMessageId: 'stage_acquaintance_su_qingqian_end',
                    effect: { type: 'mod_affection', charId: 'su_qingqian', amount: 5 }
                }
            ]
        },
        unlockCondition: { dayMin: 3, affectionMin: 20 }
    },
    {
        id: 'stage_friend_chen_siyao',
        type: 'stage',
        category: 'stage',
        priority: 11,
        scene: {
            id: 'stage_friend_chen_siyao',
            characterId: 'chen_siyao',
            locationId: 'cafeteria',
            stage: 'friend',
            messages: [
                {
                    id: 'stage_friend_chen_siyao_1',
                    speaker: 'player',
                    text: { en: 'Hey Siyao, you look excited about something!', zh: '嘿思瑶，你看起来很高兴啊！' }
                },
                {
                    id: 'stage_friend_chen_siyao_2',
                    speaker: 'chen_siyao',
                    emotion: 'happy',
                    text: { en: 'Hehe! I just finished my new drawing! Want to see?', zh: '嘿嘿！我刚画完新作品！要看吗？' }
                },
                {
                    id: 'stage_friend_chen_siyao_3',
                    speaker: 'chen_siyao',
                    emotion: 'flustered',
                    text: { en: 'Um... it\'s a bit embarrassing, but it\'s of you! From the campus festival!', zh: '那个...有点害羞，但那是画的你！来自校园节日！' }
                },
                {
                    id: 'stage_friend_chen_siyao_4',
                    speaker: 'player',
                    text: { en: 'You drew me? That\'s really cool!', zh: '你画我？真的很酷！' }
                }
            ],
            options: [
                {
                    id: 'stage_friend_chen_siyao_opt1',
                    label: { en: 'I\'d love to see it!', zh: '我很想看！' },
                    nextMessageId: 'stage_friend_chen_siyao_end',
                    effect: { type: 'mod_affection', charId: 'chen_siyao', amount: 10 }
                }
            ]
        },
        unlockCondition: { dayMin: 5, affectionMin: 40 }
    },
    {
        id: 'stage_crush_ling_ruoyu',
        type: 'stage',
        category: 'stage',
        priority: 12,
        scene: {
            id: 'stage_crush_ling_ruoyu',
            characterId: 'ling_ruoyu',
            locationId: 'lab',
            stage: 'crush',
            messages: [
                {
                    id: 'stage_crush_ling_ruoyu_1',
                    speaker: 'player',
                    text: { en: 'Professor Ling, you look tired. Did you sleep last night?', zh: '凌教授，你看起来很累。昨晚睡了吗？' }
                },
                {
                    id: 'stage_crush_ling_ruoyu_2',
                    speaker: 'ling_ruoyu',
                    emotion: 'flustered',
                    text: { en: 'Oh! I, uh... was working on the equations. You know how it is when inspiration strikes!', zh: '啊！我...在解方程。你知道的，当灵感来临时！' }
                },
                {
                    id: 'stage_crush_ling_ruoyu_3',
                    speaker: 'ling_ruoyu',
                    emotion: 'sad',
                    text: { en: 'Sometimes I wonder if the equations are solving me instead...', zh: '有时候我在想，是不是方程在解我...' }
                },
                {
                    id: 'stage_crush_ling_ruoyu_4',
                    speaker: 'player',
                    text: { en: 'You should take a break. Physics can wait, but you can\'t.', zh: '你该休息一下了。物理可以等，但你不能。' }
                },
                {
                    id: 'stage_crush_ling_ruoyu_5',
                    speaker: 'ling_ruoyu',
                    emotion: 'happy',
                    text: { en: 'You\'re the first person who\'s ever said that. Thank you...', zh: '你是第一个这么说的人。谢谢你...' }
                }
            ],
            options: [
                {
                    id: 'stage_crush_ling_ruoyu_opt1',
                    label: { en: 'I\'ll make you some tea.', zh: '我给你泡杯茶。' },
                    nextMessageId: 'stage_crush_ling_ruoyu_end',
                    effect: { type: 'mod_affection', charId: 'ling_ruoyu', amount: 15 }
                }
            ]
        },
        unlockCondition: { dayMin: 7, affectionMin: 60 }
    },
    {
        id: 'stage_lover_lu_jiaxin',
        type: 'stage',
        category: 'stage',
        priority: 13,
        scene: {
            id: 'stage_lover_lu_jiaxin',
            characterId: 'lu_jiaxin',
            locationId: 'park',
            stage: 'lover',
            messages: [
                {
                    id: 'stage_lover_lu_jiaxin_1',
                    speaker: 'player',
                    text: { en: 'You look peaceful here. Different from the bar.', zh: '你在这里看起来很平静。和酒吧里不一样。' }
                },
                {
                    id: 'stage_lover_lu_jiaxin_2',
                    speaker: 'lu_jiaxin',
                    emotion: 'happy',
                    text: { en: 'Yeah. Out here, I\'m just Lu Jiaxin. Not the heiress or the "bad girl".', zh: '嗯。在这里，我只是陆嘉欣。不是千金小姐，也不是"坏女孩"。' }
                },
                {
                    id: 'stage_lover_lu_jiaxin_3',
                    speaker: 'lu_jiaxin',
                    emotion: 'flustered',
                    text: { en: 'I... I mean, it\'s just that, you know, with you, I can be... me.', zh: '我...我的意思是，你知道，和你在一起，我可以做...我自己。' }
                },
                {
                    id: 'stage_lover_lu_jiaxin_4',
                    speaker: 'player',
                    text: { en: 'You don\'t have to change for anyone. I like you exactly as you are.', zh: '你不需要为任何人改变。我喜欢你本来的样子。' }
                }
            ],
            options: [
                {
                    id: 'stage_lover_lu_jiaxin_opt1',
                    label: { en: 'Can I walk you home?', zh: '我送你回家好吗？' },
                    nextMessageId: 'stage_lover_lu_jiaxin_end',
                    effect: { type: 'mod_affection', charId: 'lu_jiaxin', amount: 20 }
                }
            ]
        },
        unlockCondition: { dayMin: 10, affectionMin: 80 }
    },

    // Location-specific dialogues
    {
        id: 'location_library_su_qingqian',
        type: 'location',
        category: 'location',
        priority: 20,
        scene: {
            id: 'location_library_su_qingqian',
            characterId: 'su_qingqian',
            locationId: 'library',
            messages: [
                {
                    id: 'location_library_su_qingqian_1',
                    speaker: 'player',
                    text: { en: 'The library is always so quiet.', zh: '图书馆总是这么安静。' }
                },
                {
                    id: 'location_library_su_qingqian_2',
                    speaker: 'su_qingqian',
                    emotion: 'happy',
                    text: { en: 'Quiet is good. It allows for focused thinking. Unlike the dorms.', zh: '安静很好。有助于专注思考。不像宿舍那样。' }
                },
                {
                    id: 'location_library_su_qingqian_3',
                    speaker: 'player',
                    text: { en: 'Do you come here every day?', zh: '你每天都来这儿吗？' }
                },
                {
                    id: 'location_library_su_qingqian_4',
                    speaker: 'su_qingqian',
                    emotion: 'default',
                    text: { en: 'Almost. This is where I can think without... expectations.', zh: '几乎是。这是我可以不用...期待地思考的地方。' }
                }
            ],
            options: [
                {
                    id: 'location_library_su_qingqian_opt1',
                    label: { en: 'I\'ll keep this our secret place.', zh: '我会保守这个秘密。' },
                    nextMessageId: 'location_library_su_qingqian_end',
                    effect: { type: 'mod_affection', charId: 'su_qingqian', amount: 8 }
                }
            ]
        },
        unlockCondition: { affectionMin: 15 }
    },
    {
        id: 'location_cafe_chen_siyao',
        type: 'location',
        category: 'location',
        priority: 21,
        scene: {
            id: 'location_cafe_chen_siyao',
            characterId: 'chen_siyao',
            locationId: 'cafe',
            messages: [
                {
                    id: 'location_cafe_chen_siyao_1',
                    speaker: 'player',
                    text: { en: 'This cafe has a great atmosphere.', zh: '这家咖啡厅氛围很好。' }
                },
                {
                    id: 'location_cafe_chen_siyao_2',
                    speaker: 'chen_siyao',
                    emotion: 'happy',
                    text: { en: 'Told you! Perfect for drawing and people-watching. ☕', zh: '没错！画图和观察人的好地方。☕' }
                },
                {
                    id: 'location_cafe_chen_siyao_3',
                    speaker: 'chen_siyao',
                    emotion: 'flustered',
                    text: { en: 'Oh no! My phone! I left it on the table... wait, did you see it?', zh: '哎呀！我的手机！我落在桌子上了...等等，你看到了吗？' }
                }
            ],
            options: [
                {
                    id: 'location_cafe_chen_siyao_opt1',
                    label: { en: 'Right here. It was about to fall.', zh: '在这儿。差点掉下去了。' },
                    nextMessageId: 'location_cafe_chen_siyao_end',
                    effect: { type: 'mod_affection', charId: 'chen_siyao', amount: 10 }
                }
            ]
        },
        unlockCondition: { affectionMin: 25 }
    },
    {
        id: 'location_lab_ling_ruoyu',
        type: 'location',
        category: 'location',
        priority: 22,
        scene: {
            id: 'location_lab_ling_ruoyu',
            characterId: 'ling_ruoyu',
            locationId: 'lab',
            messages: [
                {
                    id: 'location_lab_ling_ruoyu_1',
                    speaker: 'player',
                    text: { en: 'This lab is impressive.', zh: '这个实验室真令人印象深刻。' }
                },
                {
                    id: 'location_lab_ling_ruoyu_2',
                    speaker: 'ling_ruoyu',
                    emotion: 'happy',
                    text: { en: 'Thank you. We just got the new spectrometer last month. It\'s... beautiful.', zh: '谢谢。上个月我们刚买了新的光谱仪。它很...漂亮。' }
                },
                {
                    id: 'location_lab_ling_ruoyu_3',
                    speaker: 'ling_ruoyu',
                    emotion: 'excited',
                    text: { en: 'Would you like to see it in action? It\'s not often I get to show it to someone who actually understands.', zh: '你想看看它工作吗？很少有真正理解它的人能看到。' }
                }
            ],
            options: [
                {
                    id: 'location_lab_ling_ruoyu_opt1',
                    label: { en: 'I\'d be honored.', zh: '我很荣幸。' },
                    nextMessageId: 'location_lab_ling_ruoyu_end',
                    effect: { type: 'mod_affection', charId: 'ling_ruoyu', amount: 12 }
                }
            ]
        },
        unlockCondition: { affectionMin: 35 }
    },
    {
        id: 'location_bar_lu_jiaxin',
        type: 'location',
        category: 'location',
        priority: 23,
        scene: {
            id: 'location_bar_lu_jiaxin',
            characterId: 'lu_jiaxin',
            locationId: 'bar',
            messages: [
                {
                    id: 'location_bar_lu_jiaxin_1',
                    speaker: 'player',
                    text: { en: 'The stage looks amazing.', zh: '舞台看起来很棒。' }
                },
                {
                    id: 'location_bar_lu_jiaxin_2',
                    speaker: 'lu_jiaxin',
                    emotion: 'default',
                    text: { en: 'It\'s not bad. Better than the club I played at last weekend.', zh: '还不错。比我上周末演出的俱乐部好多了。' }
                },
                {
                    id: 'location_bar_lu_jiaxin_3',
                    speaker: 'lu_jiaxin',
                    emotion: 'angry',
                    text: { en: 'At least here, no one cares about my last name. Just hope the paparazzi aren\'t around.', zh: '至少在这里，没人关心我的姓氏。只是希望狗仔队不在周围。' }
                }
            ],
            options: [
                {
                    id: 'location_bar_lu_jiaxin_opt1',
                    label: { en: 'I\'ll watch your back.', zh: '我来保护你。' },
                    nextMessageId: 'location_bar_lu_jiaxin_end',
                    effect: { type: 'mod_affection', charId: 'lu_jiaxin', amount: 15 }
                }
            ]
        },
        unlockCondition: { affectionMin: 45 }
    },

    // Daily/routine scenarios
    {
        id: 'daily_morning_campus',
        type: 'default',
        category: 'daily',
        priority: 100,
        scene: {
            id: 'daily_morning_campus',
            locationId: 'campus_map',
            messages: [
                {
                    id: 'daily_morning_campus_1',
                    speaker: 'player',
                    text: { en: 'Good morning! Another day at Mist City University.', zh: '早上好！又一天在雾城大学。' }
                },
                {
                    id: 'daily_morning_campus_2',
                    speaker: 'narrator',
                    text: { en: 'The campus is waking up. Students are heading to classes.', zh: '校园正在苏醒。学生们正前往教室。' }
                }
            ],
            options: [
                {
                    id: 'daily_morning_campus_opt1',
                    label: { en: 'Head to the library.', zh: '去图书馆。' },
                    nextMessageId: 'end',
                    effect: { type: 'mod_stat', stat: 'intelligence', amount: 2 }
                },
                {
                    id: 'daily_morning_campus_opt2',
                    label: { en: 'Walk around the campus.', zh: '在校园散步。' },
                    nextMessageId: 'end',
                    effect: { type: 'mod_stat', stat: 'charm', amount: 1 }
                }
            ]
        }
    },
    {
        id: 'daily_evening_dorm',
        type: 'default',
        category: 'daily',
        priority: 101,
        scene: {
            id: 'daily_evening_dorm',
            locationId: 'dorm_room',
            messages: [
                {
                    id: 'daily_evening_dorm_1',
                    speaker: 'player',
                    text: { en: 'Back in the dorm. Time to relax.', zh: '回到宿舍。该休息了。' }
                },
                {
                    id: 'daily_evening_dorm_2',
                    speaker: 'narrator',
                    text: { en: 'Your room is quiet. The day has ended.', zh: '你的房间很安静。一天结束了。' }
                }
            ],
            options: [
                {
                    id: 'daily_evening_dorm_opt1',
                    label: { en: 'Sleep early.', zh: '早点睡。' },
                    nextMessageId: 'end',
                    effect: { type: 'mod_stat', stat: 'fitness', amount: 2 }
                },
                {
                    id: 'daily_evening_dorm_opt2',
                    label: { en: 'Study for a while.', zh: '学习一会儿。' },
                    nextMessageId: 'end',
                    effect: { type: 'mod_stat', stat: 'intelligence', amount: 3 }
                }
            ]
        }
    },

    // Event scenarios
    {
        id: 'event_festival_campus',
        type: 'event',
        category: 'event',
        priority: 200,
        scene: {
            id: 'event_festival_campus',
            locationId: 'campus_map',
            messages: [
                {
                    id: 'event_festival_campus_1',
                    speaker: 'player',
                    text: { en: 'Whoa! The campus looks amazing for the festival!', zh: '哇！校园为了节日看起来太棒了！' }
                },
                {
                    id: 'event_festival_campus_2',
                    speaker: 'narrator',
                    text: { en: 'It\'s the annual Mist City University Cultural Festival!', zh: '这是雾城大学年度文化节日！' }
                },
                {
                    id: 'event_festival_campus_3',
                    speaker: 'chen_siyao',
                    emotion: 'excited',
                    text: { en: 'Hi! I helped decorate! What do you think? 🎨', zh: '嗨！我帮忙装饰了！你觉得怎么样？🎨' }
                }
            ],
            options: [
                {
                    id: 'event_festival_campus_opt1',
                    label: { en: 'It\'s beautiful! You did great!', zh: '太美了！你做得很好！' },
                    nextMessageId: 'event_festival_campus_end',
                    effect: { type: 'mod_affection', charId: 'chen_siyao', amount: 15 }
                }
            ],
            trigger: {
                time: { weekday: 6, hour: 10 }
            }
        },
        unlockCondition: { dayMin: 2 }
    },
    {
        id: 'event_rainy_day',
        type: 'event',
        category: 'event',
        priority: 201,
        scene: {
            id: 'event_rainy_day',
            characterId: 'su_qingqian',
            locationId: 'campus_map',
            messages: [
                {
                    id: 'event_rainy_day_1',
                    speaker: 'player',
                    text: { en: 'Oh no, it started raining!', zh: '哦不，开始下雨了！' }
                },
                {
                    id: 'event_rainy_day_2',
                    speaker: 'su_qingqian',
                    emotion: 'default',
                    text: { en: 'I forgot my umbrella again. This is inefficient.', zh: '我又忘了带伞。这效率太低了。' }
                },
                {
                    id: 'event_rainy_day_3',
                    speaker: 'player',
                    text: { en: 'I have one. Want to share?', zh: '我有一把。要一起用吗？' }
                },
                {
                    id: 'event_rainy_day_4',
                    speaker: 'su_qingqian',
                    emotion: 'flustered',
                    text: { en: '...Yes. I suppose sharing an umbrella isn\'t completely illogical.', zh: '...好吧。共享雨伞也不是完全不合逻辑。' }
                }
            ],
            options: [
                {
                    id: 'event_rainy_day_opt1',
                    label: { en: 'Let\'s go.', zh: '走吧。' },
                    nextMessageId: 'event_rainy_day_end',
                    effect: { type: 'mod_affection', charId: 'su_qingqian', amount: 12 }
                }
            ]
        },
        unlockCondition: { affectionMin: 10 }
    }
];

// ====================
// ACHIEVEMENT DEFINITIONS
// ====================

export type Achievement = {
    id: string;
    title: LocalizedText;
    description: LocalizedText;
    icon: string;
    points: number;
    trigger: {
        type: 'affection' | 'stat' | 'flag' | 'event';
        condition: {
            characterId?: CharacterId;
            value: number | string;
        };
    };
};

export const ACHIEVEMENTS: Achievement[] = [
    {
        id: 'first_meeting',
        title: { en: 'First Meeting', zh: '初次相遇' },
        description: { en: 'Meet any character for the first time.', zh: '第一次见到任何角色。' },
        icon: '👋',
        points: 10,
        trigger: { type: 'flag', condition: { value: 'met_any_character' } }
    },
    {
        id: 'campus_explorer',
        title: { en: 'Campus Explorer', zh: '校园探索者' },
        description: { en: 'Visit all campus locations.', zh: '访问所有校园地点。' },
        icon: '🗺️',
        points: 25,
        trigger: { type: 'flag', condition: { value: 'visited_all_campus' } }
    },
    {
        id: 'city_wanderer',
        title: { en: 'City Wanderer', zh: '城市漫游者' },
        description: { en: 'Explore the city center locations.', zh: '探索市中心地点。' },
        icon: '🏙️',
        points: 30,
        trigger: { type: 'flag', condition: { value: 'visited_all_city' } }
    },
    {
        id: 'library_rat',
        title: { en: 'Library Rat', zh: '书虫' },
        description: { en: 'Spend 5 hours studying in the library.', zh: '在图书馆学习5小时。' },
        icon: '📚',
        points: 20,
        trigger: { type: 'stat', condition: { value: 5 } }
    },
    {
        id: 'physics_fan',
        title: { en: 'Physics Fan', zh: '物理爱好者' },
        description: { en: 'Learn about physics from Professor Ling.', zh: '向凌教授学习物理。' },
        icon: '⚛️',
        points: 15,
        trigger: { type: 'flag', condition: { value: 'learned_physics' } }
    },
    {
        id: 'art_appreciator',
        title: { en: 'Art Appreciator', zh: '艺术鉴赏家' },
        description: { en: 'View Siyao\'s artwork.', zh: '观看思瑶的艺术作品。' },
        icon: '🎨',
        points: 20,
        trigger: { type: 'flag', condition: { value: 'seen_siyao_drawing' } }
    },
    {
        id: 'sweet_things',
        title: { en: 'Sweet Things', zh: '甜蜜的事' },
        description: { en: 'Reach 50 affection with a character.', zh: '与角色达到50好感度。' },
        icon: '💖',
        points: 35,
        trigger: { type: 'affection', condition: { value: 50 } }
    },
    {
        id: 'true_love',
        title: { en: 'True Love', zh: '真爱' },
        description: { en: 'Reach 80+ affection with a character.', zh: '与角色达到80+好感度。' },
        icon: '💞',
        points: 50,
        trigger: { type: 'affection', condition: { value: 80 } }
    },
    {
        id: 'balanced_life',
        title: { en: 'Balanced Life', zh: '平衡生活' },
        description: { en: 'Achieve 50+ in all stats.', zh: '所有属性达到50+。' },
        icon: '🌟',
        points: 60,
        trigger: { type: 'stat', condition: { value: 50 } }
    },
    {
        id: 'week_one',
        title: { en: 'Week One', zh: '第一周' },
        description: { en: 'Survive your first week at university.', zh: '在大学度过第一周。' },
        icon: '📅',
        points: 25,
        trigger: { type: 'flag', condition: { value: 'week_one_complete' } }
    }
];

// ====================
// HELPER FUNCTIONS
// ====================

/**
 * Get all dialogue scripts for a specific character
 */
export function getCharacterScripts(characterId: CharacterId): DialogueScript[] {
    return DIALOGUE_SCRIPTS.filter(script => script.scene.characterId === characterId);
}

/**
 * Get scripts that match a specific location
 */
export function getLocationScripts(locationId: LocationId): DialogueScript[] {
    return DIALOGUE_SCRIPTS.filter(script => script.scene.locationId === locationId);
}

/**
 * Get scripts that match a specific relationship stage
 */
export function getStageScripts(stage: RelationshipStatus): DialogueScript[] {
    return DIALOGUE_SCRIPTS.filter(script => script.scene.stage === stage);
}

/**
 * Find script by ID (searches both DIALOGUE_SCRIPTS and LEGACY_SCRIPTS)
 */
export function getScriptById(id: string): DialogueScript | undefined {
    // First search in DIALOGUE_SCRIPTS
    const dialogueScript = DIALOGUE_SCRIPTS.find(script => script.id === id);
    if (dialogueScript) return dialogueScript;

    // Then search in LEGACY_SCRIPTS and convert to DialogueScript
    const legacyScript = LEGACY_SCRIPTS[id];
    if (legacyScript) {
        return convertLegacyScriptToDialogueScript(legacyScript);
    }

    return undefined;
}

/**
 * Convert legacy script (with actions array) to dialogue script (with scene)
 */
function convertLegacyScriptToDialogueScript(legacyScript: LegacyScript): DialogueScript {
    // Extract dialogue and choice actions to build the scene
    const messages: DialogueScene['messages'] = [];
    const options: DialogueScene['options'] = [];

    // Find the first character speaker as the characterId
    let characterId: CharacterId = 'su_qingqian'; // Default
    for (const action of legacyScript.actions) {
        if (action.type === 'dialogue' && action.speaker !== 'player' && action.speaker !== 'narrator') {
            characterId = action.speaker as CharacterId;
            break;
        }
    }

    for (const action of legacyScript.actions) {
        if (action.type === 'dialogue') {
            messages.push({
                id: String(messages.length),
                speaker: action.speaker as 'player' | CharacterId,
                text: action.text
            });
        } else if (action.type === 'choice' && action.options) {
            for (const option of action.options) {
                options.push({
                    id: String(options.length),
                    label: option.label,
                    nextMessageId: option.nextId
                });
            }
        } else if (action.type === 'input') {
            // Input action: mark that player input is expected at the end
            // The DialogueSystem will handle this by showing an input box
            options.push({
                id: 'player_input',
                label: { en: 'Type your response', zh: '输入你的回复' },
                nextMessageId: 'player_input'
            });
        }
    }

    return {
        id: legacyScript.id,
        type: 'default',
        category: 'legacy',
        priority: 0,
        scene: {
            id: legacyScript.id,
            characterId,
            locationId: legacyScript.locationId || 'campus_map', // Use legacy location if specified
            messages,
            options
        }
    };
}

/**
 * Get all scripts that should be available in current game state
 */
export function getAvailableScripts(
    gameState: GameState,
    currentLocation: LocationId,
    currentAffections: Record<CharacterId, number>
): DialogueScript[] {
    return DIALOGUE_SCRIPTS.filter(script => {
        // Check unlock conditions
        const unlock = script.unlockCondition;
        if (unlock) {
            if (unlock.dayMin && gameState.time.day < unlock.dayMin) return false;
            if (unlock.affectionMin) {
                const charId = script.scene.characterId;
                if (charId && currentAffections[charId] < unlock.affectionMin) return false;
            }
        }
        return true;
    });
}

// Type definition for legacy script action
type LegacyScriptAction =
    | { type: 'background'; image: string }
    | { type: 'dialogue'; speaker: string; text: LocalizedText; emotion?: string }
    | { type: 'effect'; effect: DialogueEffect }
    | { type: 'choice'; options: { label: LocalizedText; nextId: string }[] }
    | { type: 'input'; prompt: LocalizedText }
    | { type: 'end' };

type LegacyScript = {
    id: string;
    locationId?: string;
    actions: LegacyScriptAction[];
};

// Legacy compatibility with old SCRIPTS format
export const LEGACY_SCRIPTS: Record<string, LegacyScript> = {
    // Prologue
    prologue: {
        id: 'prologue',
        actions: [
            { type: 'background', image: '/assets/backgrounds/campus_map.png' },
            {
                type: 'dialogue', speaker: 'narrator', text: {
                    en: 'September 1st. The air is humid and misty.',
                    zh: '9月1日。雾城的空气潮湿而多雾。'
                }
            },
            {
                type: 'dialogue', speaker: 'player', text: {
                    en: 'Phew... finally arrived at Mist City University.',
                    zh: '呼……终于到了雾城大学。'
                }
            },
            {
                type: 'dialogue', speaker: 'player', text: {
                    en: 'I am a freshman in Finance starting today.',
                    zh: '从今天起，我就是金融系的大一新生了。'
                }
            },
            {
                type: 'dialogue', speaker: 'player', text: {
                    en: 'My goal? To survive the exams... and maybe, just maybe, find a girlfriend.',
                    zh: '我的目标？通过考试……也许，只是也许，找个女朋友。'
                }
            },
            {
                type: 'dialogue', speaker: 'narrator', text: {
                    en: 'You stand at the main gate, suitcase in hand.',
                    zh: '你提着行李箱站在校门口。'
                }
            },
            {
                type: 'choice',
                options: [
                    { label: { en: 'Go straight to the Dorm', zh: '直接去宿舍' }, nextId: 'prologue_dorm' },
                    { label: { en: 'Look around the Campus first', zh: '先在校园里逛逛' }, nextId: 'prologue_explore' }
                ],
            },
        ],
    },
    prologue_dorm: {
        id: 'prologue_dorm',
        actions: [
            { type: 'effect', effect: { type: 'move', locationId: 'dorm_room' } },
            { type: 'background', image: '/assets/backgrounds/dorm_room.png' },
            {
                type: 'dialogue', speaker: 'player', text: {
                    en: 'This is it. Room 404. Hope it is not ominous.',
                    zh: '就是这里了。404室。希望这数字没什么不好的寓意。'
                }
            },
            {
                type: 'dialogue', speaker: 'player', text: {
                    en: 'It is a bit messy, but I can fix it later.',
                    zh: '有点乱，不过我晚点可以收拾一下。'
                }
            },
            { type: 'effect', effect: { type: 'set_flag', flag: 'prologue_completed', value: true } },
            {
                type: 'dialogue', speaker: 'narrator', text: {
                    en: 'You unpack your things and get ready for your university life.',
                    zh: '你收拾好行李，准备开始你的大学生活。'
                }
            },
            { type: 'end' },
        ],
    },
    prologue_explore: {
        id: 'prologue_explore',
        actions: [
            { type: 'effect', effect: { type: 'mod_stat', stat: 'fitness', amount: 2 } },
            {
                type: 'dialogue', speaker: 'narrator', text: {
                    en: 'You drag your suitcase around the massive campus.',
                    zh: '你拖着行李箱在巨大的校园里转了一圈。'
                }
            },
            {
                type: 'dialogue', speaker: 'player', text: {
                    en: 'Wow, the library is huge. And is that a lake?',
                    zh: '哇，图书馆好大。那是人工湖吗？'
                }
            },
            {
                type: 'dialogue', speaker: 'narrator', text: {
                    en: 'You feel tired but excited. (+2 Fitness)',
                    zh: '你感到有些累，但很兴奋。（+2 体能）'
                }
            },
            { type: 'effect', effect: { type: 'move', locationId: 'dorm_room' } },
            { type: 'background', image: '/assets/backgrounds/dorm_room.png' },
            { type: 'effect', effect: { type: 'set_flag', flag: 'prologue_completed', value: true } },
            {
                type: 'dialogue', speaker: 'player', text: {
                    en: 'Finally at the dorm. Time to rest.',
                    zh: '终于到宿舍了。休息一下吧。'
                }
            },
            { type: 'end' },
        ],
    },
    // Heroine 1: Su Qingqian - Location: Campus Plaza (default meeting place)
    meet_su_qingqian: {
        id: 'meet_su_qingqian',
        locationId: 'campus_map',
        actions: [
            { type: 'background', image: '/assets/backgrounds/student_council.png' },
            {
                type: 'dialogue', speaker: 'su_qingqian', text: {
                    en: 'State your business. I am busy.',
                    zh: '有事说事。我很忙。'
                }, emotion: 'default'
            },
            { type: 'input', prompt: { en: 'What do you say?', zh: '你说什么？' } },
            { type: 'effect', effect: { type: 'set_flag', flag: 'met_su_qingqian', value: true } },
            { type: 'end' },
        ],
    },
    // Heroine 2: Chen Siyao - Location: City Center
    meet_chen_siyao: {
        id: 'meet_chen_siyao',
        locationId: 'city_map',
        actions: [
            { type: 'background', image: '/assets/backgrounds/city_map.png' },
            {
                type: 'dialogue', speaker: 'narrator', text: {
                    en: 'You see a girl wearing a mask and sunglasses, looking around nervously.',
                    zh: '你看到一个戴着口罩和墨镜的女孩，神色慌张地四处张望。'
                }
            },
            {
                type: 'dialogue', speaker: 'chen_siyao', text: {
                    en: 'Shh! Did you see any paparazzi?',
                    zh: '嘘！你看到狗仔队了吗？'
                }, emotion: 'default'
            },
            { type: 'input', prompt: { en: 'What do you say?', zh: '你说什么?' } },
            { type: 'effect', effect: { type: 'set_flag', flag: 'met_chen_siyao', value: true } },
            { type: 'end' },
        ],
    },
    // Heroine 3: Ling Ruoyu - Location: Physics Lab
    meet_ling_ruoyu: {
        id: 'meet_ling_ruoyu',
        locationId: 'lab',
        actions: [
            { type: 'background', image: '/assets/backgrounds/lab.png' },
            {
                type: 'dialogue', speaker: 'narrator', text: {
                    en: 'The lab is filled with the hum of machines.',
                    zh: '实验室里充斥着机器的嗡嗡声。'
                }
            },
            {
                type: 'dialogue', speaker: 'ling_ruoyu', text: {
                    en: 'If E equals mc squared, then my coffee cup must be...',
                    zh: '如果E等于mc平方，那我的咖啡杯一定是……'
                }, emotion: 'default'
            },
            { type: 'input', prompt: { en: 'What do you say?', zh: '你说什么？' } },
            { type: 'effect', effect: { type: 'set_flag', flag: 'met_ling_ruoyu', value: true } },
            { type: 'end' },
        ],
    },
    // Heroine 4: Lu Jiaxin - Location: Bar
    meet_lu_jiaxin: {
        id: 'meet_lu_jiaxin',
        locationId: 'bar',
        actions: [
            { type: 'background', image: '/assets/backgrounds/bar.png' },
            {
                type: 'dialogue', speaker: 'narrator', text: {
                    en: 'The bar is loud. A girl with red hair is singing on stage.',
                    zh: '酒吧很吵。一个红发女孩正在台上唱歌。'
                }
            },
            {
                type: 'dialogue', speaker: 'narrator', text: {
                    en: 'She finishes the song and walks past you.',
                    zh: '她唱完歌，从你身边走过。'
                }
            },
            {
                type: 'dialogue', speaker: 'lu_jiaxin', text: {
                    en: 'What are you looking at? Never seen a singer before?',
                    zh: '看什么看？没见过歌手吗？'
                }, emotion: 'angry'
            },
            { type: 'input', prompt: { en: 'What do you say?', zh: '你说什么？' } },
            { type: 'effect', effect: { type: 'set_flag', flag: 'met_lu_jiaxin', value: true } },
            { type: 'end' },
        ],
    },
};
