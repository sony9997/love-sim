import { CharacterId, GameState, LocalizedText } from './game-data/types';

// Mock responses for each character
const MOCK_RESPONSES: Record<CharacterId, { en: string[]; zh: string[] }> = {
    su_qingqian: {
        en: [
            "I'm busy with the Student Council. Make it quick.",
            "Do you understand the rules of this university?",
            "..."
        ],
        zh: [
            "我还在忙学生会的事，长话短说。",
            "你了解这所大学的规章制度吗？",
            "……"
        ]
    },
    chen_siyao: {
        en: [
            "Hey! Want to see my new dance move?",
            "Shh! Don't tell anyone I'm here.",
            "Do you like pop music?"
        ],
        zh: [
            "嘿！想看我的新舞步吗？",
            "嘘！别告诉别人我在这里。",
            "你喜欢流行音乐吗？"
        ]
    },
    ling_ruoyu: {
        en: [
            "The quantum fluctuations are interesting today...",
            "Oh, did I forget my coffee again?",
            "Physics is the language of the universe."
        ],
        zh: [
            "今天的量子涨落很有趣……",
            "啊，我又忘带咖啡了吗？",
            "物理是宇宙的语言。"
        ]
    },
    lu_jiaxin: {
        en: [
            "Get on, let's go for a ride.",
            "My family is so annoying.",
            "What are you looking at?"
        ],
        zh: [
            "上车，带你去兜风。",
            "我家那群人真烦。",
            "你看什么看？"
        ]
    }
};

export const AIService = {
    getAgentResponse: async (
        characterId: CharacterId,
        playerInput: string,
        gameState: GameState
    ): Promise<LocalizedText> => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const responses = MOCK_RESPONSES[characterId];
        const lang = gameState.language;

        // Simple random response
        const randomIndex = Math.floor(Math.random() * responses[lang].length);

        return {
            en: responses.en[randomIndex],
            zh: responses.zh[randomIndex]
        };
    },

    getScreenwriterEvent: async (): Promise<string | null> => {
        // Simple logic: Trigger an event if affection > 10 and no events seen
        // This is just a placeholder
        return null;
    }
};
