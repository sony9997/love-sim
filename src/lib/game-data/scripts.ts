import { CharacterId, LocationId, Stats, LocalizedText, GameState } from './types';

export type Emotion = 'default' | 'happy' | 'angry' | 'sad' | 'blush';

// export type LocalizedText = string | { en: string; zh: string }; // Removed local definition

export type ScriptAction =
    | { type: 'dialogue'; speaker: CharacterId | 'player' | 'narrator'; text: LocalizedText; emotion?: Emotion }
    | { type: 'choice'; options: ChoiceOption[] }
    | { type: 'jump'; nextId: string }
    | { type: 'effect'; effect: Effect }
    | { type: 'background'; image: string }
    | { type: 'end' };

export type ChoiceOption = {
    label: LocalizedText;
    nextId: string;
    condition?: (state: GameState) => boolean;
};

export type Effect =
    | { type: 'set_flag'; flag: string; value: boolean }
    | { type: 'mod_stat'; stat: keyof Stats; amount: number }
    | { type: 'mod_affection'; charId: CharacterId; amount: number }
    | { type: 'move'; locationId: LocationId }
    | { type: 'advance_time'; hours: number };

export type Script = {
    id: string;
    actions: ScriptAction[];
};

export const SCRIPTS: Record<string, Script> = {
    // ==========================================
    // PROLOGUE
    // ==========================================
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
                    {
                        label: { en: 'Go straight to the Dorm', zh: '直接去宿舍' },
                        nextId: 'prologue_dorm'
                    },
                    {
                        label: { en: 'Look around the Campus first', zh: '先在校园里逛逛' },
                        nextId: 'prologue_explore'
                    },
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

    // ==========================================
    // HEROINE 1: Su Qingqian (Library/Student Council)
    // ==========================================
    meet_su_qingqian: {
        id: 'meet_su_qingqian',
        actions: [
            { type: 'background', image: '/assets/backgrounds/student_council.png' },
            {
                type: 'dialogue', speaker: 'narrator', text: {
                    en: 'You enter the Student Council Office. It is impeccably clean.',
                    zh: '你走进学生会办公室。这里一尘不染。'
                }
            },
            {
                type: 'dialogue', speaker: 'su_qingqian', text: {
                    en: 'State your business. I am busy.',
                    zh: '有事说事。我很忙。'
                }, emotion: 'default'
            },
            {
                type: 'dialogue', speaker: 'player', text: {
                    en: 'I... uh, just wanted to say hi.',
                    zh: '我……呃，只是想打个招呼。'
                }
            },
            {
                type: 'dialogue', speaker: 'su_qingqian', text: {
                    en: 'Greetings are inefficient. If you have no business, please leave.',
                    zh: '打招呼是低效的。如果没事，请离开。'
                }, emotion: 'default'
            },
            { type: 'effect', effect: { type: 'set_flag', flag: 'met_su_qingqian', value: true } },
            { type: 'end' },
        ],
    },

    // ==========================================
    // HEROINE 2: Chen Siyao (City/Idol)
    // ==========================================
    meet_chen_siyao: {
        id: 'meet_chen_siyao',
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
            {
                type: 'dialogue', speaker: 'player', text: {
                    en: 'Papa-what?',
                    zh: '狗仔……什么？'
                }
            },
            {
                type: 'dialogue', speaker: 'chen_siyao', text: {
                    en: 'Oh, never mind! Just act natural!',
                    zh: '噢，没事！表现得自然点！'
                }, emotion: 'happy'
            },
            { type: 'effect', effect: { type: 'set_flag', flag: 'met_chen_siyao', value: true } },
            { type: 'end' },
        ],
    },

    // ==========================================
    // HEROINE 3: Ling Ruoyu (Lab)
    // ==========================================
    meet_ling_ruoyu: {
        id: 'meet_ling_ruoyu',
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
            {
                type: 'dialogue', speaker: 'narrator', text: {
                    en: 'She knocks over a stack of papers.',
                    zh: '她碰倒了一堆文件。'
                }
            },
            {
                type: 'dialogue', speaker: 'ling_ruoyu', text: {
                    en: 'Oh dear. Gravity is quite persistent today.',
                    zh: '哎呀。今天的重力真是顽固。'
                }, emotion: 'sad'
            },
            { type: 'effect', effect: { type: 'set_flag', flag: 'met_ling_ruoyu', value: true } },
            { type: 'end' },
        ],
    },

    // ==========================================
    // HEROINE 4: Lu Jiaxin (Bar/Biker)
    // ==========================================
    meet_lu_jiaxin: {
        id: 'meet_lu_jiaxin',
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
            { type: 'effect', effect: { type: 'set_flag', flag: 'met_lu_jiaxin', value: true } },
            { type: 'end' },
        ],
    },
};
