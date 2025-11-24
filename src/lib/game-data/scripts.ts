import { CharacterId, LocationId, Stats } from './types';

export type Emotion = 'default' | 'happy' | 'angry' | 'sad' | 'blush';

export type ScriptAction =
    | { type: 'dialogue'; speaker: CharacterId | 'player' | 'narrator'; text: string; emotion?: Emotion }
    | { type: 'choice'; options: ChoiceOption[] }
    | { type: 'jump'; nextId: string }
    | { type: 'effect'; effect: Effect }
    | { type: 'background'; image: string }
    | { type: 'end' };

export type ChoiceOption = {
    label: string;
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
            { type: 'dialogue', speaker: 'narrator', text: 'September 1st. The air is humid and hot in Changsha.' },
            { type: 'dialogue', speaker: 'player', text: 'Phew... finally arrived at Qingyun University.' },
            { type: 'dialogue', speaker: 'player', text: 'I am a freshman in Computer Science starting today.' },
            { type: 'dialogue', speaker: 'player', text: 'My goal? To survive the exams... and maybe, just maybe, find a girlfriend.' },
            { type: 'dialogue', speaker: 'narrator', text: 'You stand at the main gate, suitcase in hand.' },
            {
                type: 'choice',
                options: [
                    { label: 'Go straight to the Dorm', nextId: 'prologue_dorm' },
                    { label: 'Look around the Campus first', nextId: 'prologue_explore' },
                ],
            },
        ],
    },
    prologue_dorm: {
        id: 'prologue_dorm',
        actions: [
            { type: 'effect', effect: { type: 'move', locationId: 'dorm_room' } },
            { type: 'background', image: '/assets/backgrounds/dorm_room.png' },
            { type: 'dialogue', speaker: 'player', text: 'This is it. Room 404. Hope it is not ominous.' },
            { type: 'dialogue', speaker: 'player', text: 'It is a bit messy, but I can fix it later.' },
            { type: 'effect', effect: { type: 'set_flag', flag: 'prologue_completed', value: true } },
            { type: 'dialogue', speaker: 'narrator', text: 'You unpack your things and get ready for your university life.' },
            { type: 'end' },
        ],
    },
    prologue_explore: {
        id: 'prologue_explore',
        actions: [
            { type: 'effect', effect: { type: 'mod_stat', stat: 'fitness', amount: 2 } },
            { type: 'dialogue', speaker: 'narrator', text: 'You drag your suitcase around the massive campus.' },
            { type: 'dialogue', speaker: 'player', text: 'Wow, the library is huge. And is that a lake?' },
            { type: 'dialogue', speaker: 'narrator', text: 'You feel tired but excited. (+2 Fitness)' },
            { type: 'effect', effect: { type: 'move', locationId: 'dorm_room' } },
            { type: 'background', image: '/assets/backgrounds/dorm_room.png' },
            { type: 'effect', effect: { type: 'set_flag', flag: 'prologue_completed', value: true } },
            { type: 'dialogue', speaker: 'player', text: 'Finally at the dorm. Time to rest.' },
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
            { type: 'dialogue', speaker: 'narrator', text: 'You wander into the library. It is quiet and smells of old paper.' },
            { type: 'dialogue', speaker: 'narrator', text: 'You notice a girl sitting alone in the corner, surrounded by stacks of books.' },
            { type: 'dialogue', speaker: 'heroine1', text: '...', emotion: 'default' },
            { type: 'dialogue', speaker: 'player', text: '(She looks like she is struggling with that stack...)' },
            {
                type: 'choice',
                options: [
                    { label: 'Offer to help', nextId: 'meet_linyue_help' },
                    { label: 'Ignore her', nextId: 'meet_linyue_ignore' },
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
            { type: 'dialogue', speaker: 'player', text: 'Need a hand with those?' },
            { type: 'dialogue', speaker: 'heroine1', text: 'Ah! ...Oh, um, thank you.', emotion: 'blush' },
            { type: 'dialogue', speaker: 'heroine1', text: 'I am Lin Yue. These are for my thesis.', emotion: 'default' },
            { type: 'dialogue', speaker: 'player', text: 'I am [Player]. Nice to meet you.' },
            { type: 'end' },
        ],
    },
    meet_linyue_ignore: {
        id: 'meet_linyue_ignore',
        actions: [
            { type: 'dialogue', speaker: 'player', text: '(Better not disturb her.)' },
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
            { type: 'dialogue', speaker: 'narrator', text: 'You are looking for a seat in the crowded cafeteria.' },
            { type: 'dialogue', speaker: 'heroine2', text: 'Hey you! The one with the confused face!', emotion: 'happy' },
            { type: 'dialogue', speaker: 'player', text: 'Me?' },
            { type: 'dialogue', speaker: 'heroine2', text: 'Yes you! Do you like Anime? Games? Manga?', emotion: 'default' },
            {
                type: 'choice',
                options: [
                    { label: 'I love them!', nextId: 'meet_suqing_love' },
                    { label: 'Not really...', nextId: 'meet_suqing_meh' },
                ],
            },
        ],
    },
    meet_suqing_love: {
        id: 'meet_suqing_love',
        actions: [
            { type: 'effect', effect: { type: 'mod_affection', charId: 'heroine2', amount: 10 } },
            { type: 'effect', effect: { type: 'set_flag', flag: 'met_heroine2', value: true } },
            { type: 'dialogue', speaker: 'heroine2', text: 'I knew it! You have the aura of an otaku!', emotion: 'happy' },
            { type: 'dialogue', speaker: 'heroine2', text: 'I am Su Qing, president of the Anime Club. You MUST join us!', emotion: 'happy' },
            { type: 'end' },
        ],
    },
    meet_suqing_meh: {
        id: 'meet_suqing_meh',
        actions: [
            { type: 'effect', effect: { type: 'mod_affection', charId: 'heroine2', amount: -2 } },
            { type: 'dialogue', speaker: 'heroine2', text: 'Boring... what a waste of a face.', emotion: 'sad' },
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
            { type: 'dialogue', speaker: 'narrator', text: 'You are walking near the luxury shopping mall.' },
            { type: 'dialogue', speaker: 'narrator', text: 'A bright red sports car zooms past and screeches to a halt.' },
            { type: 'dialogue', speaker: 'heroine3', text: 'Hey, commoner. Do you know where the VIP parking is?', emotion: 'angry' },
            { type: 'dialogue', speaker: 'player', text: 'Commoner...?' },
            {
                type: 'choice',
                options: [
                    { label: 'Politely give directions', nextId: 'meet_chenxi_polite' },
                    { label: 'Get angry', nextId: 'meet_chenxi_angry' },
                ],
            },
        ],
    },
    meet_chenxi_polite: {
        id: 'meet_chenxi_polite',
        actions: [
            { type: 'effect', effect: { type: 'mod_affection', charId: 'heroine3', amount: 5 } },
            { type: 'effect', effect: { type: 'set_flag', flag: 'met_heroine3', value: true } },
            { type: 'dialogue', speaker: 'heroine3', text: 'Hmph. At least you have manners.', emotion: 'default' },
            { type: 'dialogue', speaker: 'heroine3', text: 'I am Chen Xi. Remember that name.', emotion: 'default' },
            { type: 'end' },
        ],
    },
    meet_chenxi_angry: {
        id: 'meet_chenxi_angry',
        actions: [
            { type: 'effect', effect: { type: 'mod_affection', charId: 'heroine3', amount: -5 } },
            { type: 'dialogue', speaker: 'heroine3', text: 'How dare you speak to me like that!', emotion: 'angry' },
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
            { type: 'dialogue', speaker: 'narrator', text: 'Your phone rings. It is a video call.' },
            { type: 'dialogue', speaker: 'heroine4', text: 'Yahoo~! Big Brother! Did you settle in yet?', emotion: 'happy' },
            { type: 'dialogue', speaker: 'player', text: 'Jiang Yu? Shouldn\'t you be practicing?' },
            { type: 'dialogue', speaker: 'heroine4', text: 'I snuck out! Being an idol trainee is so hard...', emotion: 'sad' },
            { type: 'effect', effect: { type: 'set_flag', flag: 'met_heroine4', value: true } },
            { type: 'dialogue', speaker: 'heroine4', text: 'Anyway, I will come visit you at school soon! Don\'t tell my manager!', emotion: 'happy' },
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
            { type: 'dialogue', speaker: 'narrator', text: 'You rush into the classroom, slightly late.' },
            { type: 'dialogue', speaker: 'heroine5', text: 'You are late, student.', emotion: 'default' },
            { type: 'dialogue', speaker: 'player', text: 'I am so sorry! I got lost!' },
            { type: 'dialogue', speaker: 'heroine5', text: 'Sit down. I am Professor Li. In my CS class, precision is everything.', emotion: 'default' },
            { type: 'dialogue', speaker: 'heroine5', text: 'Don\'t let it happen again.', emotion: 'default' },
            { type: 'effect', effect: { type: 'set_flag', flag: 'met_heroine5', value: true } },
            { type: 'effect', effect: { type: 'mod_stat', stat: 'intelligence', amount: 1 } },
            { type: 'end' },
        ],
    },
};
