import { CharacterId, LocationId, Stats, LocalizedText } from './types';

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
    condition?: (state: any) => boolean;
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
                    en: 'September 1st. The air is humid and hot in Changsha.',
                    zh: '9月1日。常纱市的空气潮湿而闷热。'
                }
            },
            {
                type: 'dialogue', speaker: 'player', text: {
                    en: 'Phew... finally arrived at Qingyun University.',
                    zh: '呼……终于到了庆云大学。'
                }
            },
            {
                type: 'dialogue', speaker: 'player', text: {
                    en: 'I am a freshman in Computer Science starting today.',
                    zh: '从今天起，我就是计算机系的大一新生了。'
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
    // HEROINE 1: Lin Yue (Library)
    // ==========================================
    meet_linyue: {
        id: 'meet_linyue',
        actions: [
            { type: 'background', image: '/assets/backgrounds/library.png' },
            {
                type: 'dialogue', speaker: 'narrator', text: {
                    en: 'You wander into the library. It is quiet and smells of old paper.',
                    zh: '你漫步走进图书馆。这里很安静，弥漫着陈旧纸张的气味。'
                }
            },
            {
                type: 'dialogue', speaker: 'narrator', text: {
                    en: 'You notice a girl sitting alone in the corner, surrounded by stacks of books.',
                    zh: '你注意到一个女孩独自坐在角落里，身边堆满了书。'
                }
            },
            { type: 'dialogue', speaker: 'heroine1', text: '...', emotion: 'default' },
            {
                type: 'dialogue', speaker: 'player', text: {
                    en: '(She looks like she is struggling with that stack...)',
                    zh: '（她看起来好像搬不动那堆书……）'
                }
            },
            {
                type: 'choice',
                options: [
                    {
                        label: { en: 'Offer to help', zh: '主动帮忙' },
                        nextId: 'meet_linyue_help'
                    },
                    {
                        label: { en: 'Ignore her', zh: '无视她' },
                        nextId: 'meet_linyue_ignore'
                    },
                ],
            },
        ],
    },
    meet_linyue_help: {
        id: 'meet_linyue_help',
        actions: [
            { type: 'effect', effect: { type: 'mod_affection', charId: 'heroine1', amount: 5 } },
            { type: 'effect', effect: { type: 'mod_stat', stat: 'charm', amount: 1 } },
            { type: 'effect', effect: { type: 'set_flag', flag: 'met_heroine1', value: true } },
            {
                type: 'dialogue', speaker: 'player', text: {
                    en: 'Need a hand with those?',
                    zh: '需要帮忙吗？'
                }
            },
            {
                type: 'dialogue', speaker: 'heroine1', text: {
                    en: 'Ah! ...Oh, um, thank you.',
                    zh: '啊！……噢，嗯，谢谢。'
                }, emotion: 'blush'
            },
            {
                type: 'dialogue', speaker: 'heroine1', text: {
                    en: 'I am Lin Yue. These are for my thesis.',
                    zh: '我是林月。这些是我的论文资料。'
                }, emotion: 'default'
            },
            {
                type: 'dialogue', speaker: 'player', text: {
                    en: 'I am [Player]. Nice to meet you.',
                    zh: '我是[玩家]。很高兴认识你。'
                }
            },
            { type: 'end' },
        ],
    },
    meet_linyue_ignore: {
        id: 'meet_linyue_ignore',
        actions: [
            {
                type: 'dialogue', speaker: 'player', text: {
                    en: '(Better not disturb her.)',
                    zh: '（还是别打扰她了。）'
                }
            },
            { type: 'end' },
        ],
    },

    // ==========================================
    // HEROINE 2: Su Qing (Cafeteria/Club)
    // ==========================================
    meet_suqing: {
        id: 'meet_suqing',
        actions: [
            { type: 'background', image: '/assets/backgrounds/cafeteria.png' },
            {
                type: 'dialogue', speaker: 'narrator', text: {
                    en: 'You are looking for a seat in the crowded cafeteria.',
                    zh: '你在拥挤的食堂里寻找座位。'
                }
            },
            {
                type: 'dialogue', speaker: 'heroine2', text: {
                    en: 'Hey you! The one with the confused face!',
                    zh: '嘿，你！那个一脸迷茫的家伙！'
                }, emotion: 'happy'
            },
            {
                type: 'dialogue', speaker: 'player', text: {
                    en: 'Me?',
                    zh: '我？'
                }
            },
            {
                type: 'dialogue', speaker: 'heroine2', text: {
                    en: 'Yes you! Do you like Anime? Games? Manga?',
                    zh: '就是你！你喜欢动漫吗？游戏？漫画？'
                }, emotion: 'default'
            },
            {
                type: 'choice',
                options: [
                    {
                        label: { en: 'I love them!', zh: '我超爱！' },
                        nextId: 'meet_suqing_love'
                    },
                    {
                        label: { en: 'Not really...', zh: '一般般吧……' },
                        nextId: 'meet_suqing_meh'
                    },
                ],
            },
        ],
    },
    meet_suqing_love: {
        id: 'meet_suqing_love',
        actions: [
            { type: 'effect', effect: { type: 'mod_affection', charId: 'heroine2', amount: 10 } },
            { type: 'effect', effect: { type: 'set_flag', flag: 'met_heroine2', value: true } },
            {
                type: 'dialogue', speaker: 'heroine2', text: {
                    en: 'I knew it! You have the aura of an otaku!',
                    zh: '我就知道！你身上有宅男的气息！'
                }, emotion: 'happy'
            },
            {
                type: 'dialogue', speaker: 'heroine2', text: {
                    en: 'I am Su Qing, president of the Anime Club. You MUST join us!',
                    zh: '我是苏晴，动漫社社长。你必须加入我们！'
                }, emotion: 'happy'
            },
            { type: 'end' },
        ],
    },
    meet_suqing_meh: {
        id: 'meet_suqing_meh',
        actions: [
            { type: 'effect', effect: { type: 'mod_affection', charId: 'heroine2', amount: -2 } },
            {
                type: 'dialogue', speaker: 'heroine2', text: {
                    en: 'Boring... what a waste of a face.',
                    zh: '真无聊……白长了一张脸。'
                }, emotion: 'sad'
            },
            { type: 'end' },
        ],
    },

    // ==========================================
    // HEROINE 3: Chen Xi (City/Mall)
    // ==========================================
    meet_chenxi: {
        id: 'meet_chenxi',
        actions: [
            { type: 'background', image: '/assets/backgrounds/city_map.png' },
            {
                type: 'dialogue', speaker: 'narrator', text: {
                    en: 'You are walking near the luxury shopping mall.',
                    zh: '你走在豪华购物中心附近。'
                }
            },
            {
                type: 'dialogue', speaker: 'narrator', text: {
                    en: 'A bright red sports car zooms past and screeches to a halt.',
                    zh: '一辆鲜红色的跑车呼啸而过，然后急刹停下。'
                }
            },
            {
                type: 'dialogue', speaker: 'heroine3', text: {
                    en: 'Hey, commoner. Do you know where the VIP parking is?',
                    zh: '喂，庶民。你知道VIP停车场在哪吗？'
                }, emotion: 'angry'
            },
            {
                type: 'dialogue', speaker: 'player', text: {
                    en: 'Commoner...?',
                    zh: '庶民……？'
                }
            },
            {
                type: 'choice',
                options: [
                    {
                        label: { en: 'Politely give directions', zh: '礼貌地指路' },
                        nextId: 'meet_chenxi_polite'
                    },
                    {
                        label: { en: 'Get angry', zh: '生气' },
                        nextId: 'meet_chenxi_angry'
                    },
                ],
            },
        ],
    },
    meet_chenxi_polite: {
        id: 'meet_chenxi_polite',
        actions: [
            { type: 'effect', effect: { type: 'mod_affection', charId: 'heroine3', amount: 5 } },
            { type: 'effect', effect: { type: 'set_flag', flag: 'met_heroine3', value: true } },
            {
                type: 'dialogue', speaker: 'heroine3', text: {
                    en: 'Hmph. At least you have manners.',
                    zh: '哼。至少你还懂点礼貌。'
                }, emotion: 'default'
            },
            {
                type: 'dialogue', speaker: 'heroine3', text: {
                    en: 'I am Chen Xi. Remember that name.',
                    zh: '我是陈曦。记住这个名字。'
                }, emotion: 'default'
            },
            { type: 'end' },
        ],
    },
    meet_chenxi_angry: {
        id: 'meet_chenxi_angry',
        actions: [
            { type: 'effect', effect: { type: 'mod_affection', charId: 'heroine3', amount: -5 } },
            {
                type: 'dialogue', speaker: 'heroine3', text: {
                    en: 'How dare you speak to me like that!',
                    zh: '你竟敢这样跟我说话！'
                }, emotion: 'angry'
            },
            { type: 'end' },
        ],
    },

    // ==========================================
    // HEROINE 4: Jiang Yu (Dorm/Phone)
    // ==========================================
    meet_jiangyu: {
        id: 'meet_jiangyu',
        actions: [
            { type: 'background', image: '/assets/backgrounds/dorm_room.png' },
            {
                type: 'dialogue', speaker: 'narrator', text: {
                    en: 'Your phone rings. It is a video call.',
                    zh: '你的手机响了。是视频通话。'
                }
            },
            {
                type: 'dialogue', speaker: 'heroine4', text: {
                    en: 'Yahoo~! Big Brother! Did you settle in yet?',
                    zh: '呀吼~！大哥哥！你安顿好了吗？'
                }, emotion: 'happy'
            },
            {
                type: 'dialogue', speaker: 'player', text: {
                    en: 'Jiang Yu? Shouldn\'t you be practicing?',
                    zh: '江雨？你不应该在练习吗？'
                }
            },
            {
                type: 'dialogue', speaker: 'heroine4', text: {
                    en: 'I snuck out! Being an idol trainee is so hard...',
                    zh: '我偷偷溜出来的！当偶像练习生太辛苦了……'
                }, emotion: 'sad'
            },
            { type: 'effect', effect: { type: 'set_flag', flag: 'met_heroine4', value: true } },
            {
                type: 'dialogue', speaker: 'heroine4', text: {
                    en: 'Anyway, I will come visit you at school soon! Don\'t tell my manager!',
                    zh: '总之，我很快会去学校看你的！别告诉我的经纪人！'
                }, emotion: 'happy'
            },
            { type: 'end' },
        ],
    },

    // ==========================================
    // HEROINE 5: Professor Li (Classroom)
    // ==========================================
    meet_professor: {
        id: 'meet_professor',
        actions: [
            { type: 'background', image: '/assets/backgrounds/classroom.png' },
            {
                type: 'dialogue', speaker: 'narrator', text: {
                    en: 'You rush into the classroom, slightly late.',
                    zh: '你冲进教室，稍微迟到了一点。'
                }
            },
            {
                type: 'dialogue', speaker: 'heroine5', text: {
                    en: 'You are late, student.',
                    zh: '你迟到了，同学。'
                }, emotion: 'default'
            },
            {
                type: 'dialogue', speaker: 'player', text: {
                    en: 'I am so sorry! I got lost!',
                    zh: '非常抱歉！我迷路了！'
                }
            },
            {
                type: 'dialogue', speaker: 'heroine5', text: {
                    en: 'Sit down. I am Professor Li. In my CS class, precision is everything.',
                    zh: '坐下。我是李教授。在我的计算机课上，精确就是一切。'
                }, emotion: 'default'
            },
            {
                type: 'dialogue', speaker: 'heroine5', text: {
                    en: 'Don\'t let it happen again.',
                    zh: '下不为例。'
                }, emotion: 'default'
            },
            { type: 'effect', effect: { type: 'set_flag', flag: 'met_heroine5', value: true } },
            { type: 'effect', effect: { type: 'mod_stat', stat: 'intelligence', amount: 1 } },
            { type: 'end' },
        ],
    },
};
