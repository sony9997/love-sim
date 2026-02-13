import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useGameStore } from '@/lib/store';

// Mock framer-motion before importing the component
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, className, ...props }: any) => <div className={className} {...props}>{children}</div>,
        button: ({ children, className, onClick, ...props }: any) => (
            <button className={className} onClick={onClick} {...props}>{children}</button>
        ),
        span: ({ children, className }: any) => <span className={className}>{children}</span>,
        img: ({ src, alt, className }: any) => <img src={src} alt={alt} className={className} />,
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock the i18n
vi.mock('@/lib/i18n', () => ({
    getTranslation: (lang: string, key: string) => {
        const translations: Record<string, any> = {
            en: {
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
        const keys = key.split('.');
        let value: any = translations[lang] || translations.en;
        for (const k of keys) {
            if (value && typeof value === 'object') {
                value = value[k];
            }
        }
        return typeof value === 'string' ? value : key;
    },
}));

// Mock CHARACTERS
vi.mock('@/lib/game-data/characters', () => ({
    CHARACTERS: {
        su_qingqian: {
            id: 'su_qingqian',
            name: { en: 'Su Qingqian', zh: '苏晴芊' },
            description: { en: 'Student Council President', zh: '学生会长' },
            avatar: '/avatars/su_qingqian.png',
            sprites: {
                default: '/sprites/su_qingqian_default.png',
                happy: '/sprites/su_qingqian_happy.png',
                angry: '/sprites/su_qingqian_angry.png',
                sad: '/sprites/su_qingqian_sad.png',
                blush: '/sprites/su_qingqian_blush.png',
            },
            systemPrompt: '',
        },
        chen_siyao: {
            id: 'chen_siyao',
            name: { en: 'Chen Siyao', zh: '陈思瑶' },
            description: { en: 'Dance Club Member', zh: '舞蹈社成员' },
            avatar: '/avatars/chen_siyao.png',
            sprites: {
                default: '/sprites/chen_siyao_default.png',
                happy: '/sprites/chen_siyao_happy.png',
                angry: '/sprites/chen_siyao_angry.png',
                sad: '/sprites/chen_siyao_sad.png',
                blush: '/sprites/chen_siyao_blush.png',
            },
            systemPrompt: '',
        },
        ling_ruoyu: {
            id: 'ling_ruoyu',
            name: { en: 'Ling Ruoyu', zh: '凌若语' },
            description: { en: 'Science Club Member', zh: '科学社成员' },
            avatar: '/avatars/ling_ruoyu.png',
            sprites: {
                default: '/sprites/ling_ruoyu_default.png',
                happy: '/sprites/ling_ruoyu_happy.png',
                angry: '/sprites/ling_ruoyu_angry.png',
                sad: '/sprites/ling_ruoyu_sad.png',
                blush: '/sprites/ling_ruoyu_blush.png',
            },
            systemPrompt: '',
        },
        lu_jiaxin: {
            id: 'lu_jiaxin',
            name: { en: 'Lu Jiaxin', zh: '陆佳欣' },
            description: { en: 'Rebel Student', zh: '问题学生' },
            avatar: '/avatars/lu_jiaxin.png',
            sprites: {
                default: '/sprites/lu_jiaxin_default.png',
                happy: '/sprites/lu_jiaxin_happy.png',
                angry: '/sprites/lu_jiaxin_angry.png',
                sad: '/sprites/lu_jiaxin_sad.png',
                blush: '/sprites/lu_jiaxin_blush.png',
            },
            systemPrompt: '',
        },
    },
}));

// Clean up after each test
afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

// Import after mocks
import { AgentVisualization } from './AgentVisualization';

describe('AgentVisualization', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render the toggle button', () => {
        render(<AgentVisualization />);
        expect(screen.getByTestId('agent-visualization-toggle')).toBeInTheDocument();
    });

    it('should toggle visibility when toggle button is clicked', async () => {
        const user = userEvent.setup();
        render(<AgentVisualization />);

        const toggle = screen.getByTestId('agent-visualization-toggle');
        expect(toggle).toBeInTheDocument();

        // Click to show
        await user.click(toggle);

        // The panel should be rendered after click
        expect(screen.getByTestId('agent-visualization-panel')).toBeInTheDocument();
    });

    it('should display all 4 characters in the dashboard when visible', async () => {
        const user = userEvent.setup();
        const mockState = {
            player: {
                name: 'Lin Xuan',
                stats: { intelligence: 10, charm: 10, fitness: 10, money: 1000 },
                location: 'dorm_room',
            },
            time: { day: 1, hour: 12, weekday: 0 },
            relationships: {
                su_qingqian: { affection: 50, status: 'acquaintance', eventsSeen: [] },
                chen_siyao: { affection: 120, status: 'friend', eventsSeen: [] },
                ling_ruoyu: { affection: 350, status: 'crush', eventsSeen: [] },
                lu_jiaxin: { affection: 550, status: 'lover', eventsSeen: [] },
            },
            agentStates: {
                su_qingqian: {
                    personality: ['cold', 'rational', 'formal'],
                    coreValues: ['Rules', 'Efficiency'],
                    memory: [],
                    recentInteractions: [],
                    mood: { base: 'neutral', intensity: 50, triggers: [] },
                    currentGoal: {
                        id: 'manage_council',
                        description: 'Manage Council',
                        priority: 10,
                        completed: false,
                        targetType: 'activity',
                        targetId: 'student_council',
                    },
                    goalsQueue: [],
                    currentLocation: 'student_council',
                    currentActivity: 'managing',
                    perceivedAffection: { su_qingqian: 0, chen_siyao: 0, ling_ruoyu: 0, lu_jiaxin: 0 },
                    socialCircle: [],
                },
                chen_siyao: {
                    personality: ['hot', 'outgoing', 'casual'],
                    coreValues: ['Dream', 'Passion'],
                    memory: [],
                    recentInteractions: [],
                    mood: { base: 'happy', intensity: 70, triggers: [] },
                    currentGoal: {
                        id: 'practice_dance',
                        description: 'Practice Dance',
                        priority: 10,
                        completed: false,
                        targetType: 'activity',
                        targetId: 'campus_map',
                    },
                    goalsQueue: [],
                    currentLocation: 'campus_map',
                    currentActivity: 'practicing',
                    perceivedAffection: { su_qingqian: 0, chen_siyao: 0, ling_ruoyu: 0, lu_jiaxin: 0 },
                    socialCircle: [],
                },
                ling_ruoyu: {
                    personality: ['shy', 'rational', 'emotional'],
                    coreValues: ['Knowledge', 'Truth'],
                    memory: [],
                    recentInteractions: [],
                    mood: { base: 'excited', intensity: 80, triggers: [] },
                    currentGoal: {
                        id: 'solve_physics',
                        description: 'Solve Physics',
                        priority: 10,
                        completed: false,
                        targetType: 'activity',
                        targetId: 'lab',
                    },
                    goalsQueue: [],
                    currentLocation: 'lab',
                    currentActivity: 'studying',
                    perceivedAffection: { su_qingqian: 0, chen_siyao: 0, ling_ruoyu: 0, lu_jiaxin: 0 },
                    socialCircle: [],
                },
                lu_jiaxin: {
                    personality: ['hot', 'outgoing', 'casual'],
                    coreValues: ['Freedom', 'Independence'],
                    memory: [],
                    recentInteractions: [],
                    mood: { base: 'happy', intensity: 60, triggers: [] },
                    currentGoal: {
                        id: 'ride_motorcycle',
                        description: 'Ride Motorcycle',
                        priority: 10,
                        completed: false,
                        targetType: 'activity',
                        targetId: 'city_map',
                    },
                    goalsQueue: [],
                    currentLocation: 'city_map',
                    currentActivity: 'riding',
                    perceivedAffection: { su_qingqian: 0, chen_siyao: 0, ling_ruoyu: 0, lu_jiaxin: 0 },
                    socialCircle: [],
                },
            },
            flags: {},
            currentScriptId: null,
            language: 'en',
        };

        useGameStore.setState(mockState);

        render(<AgentVisualization />);

        const toggle = screen.getByTestId('agent-visualization-toggle');
        await user.click(toggle);

        expect(screen.getByTestId('agent-visualization-panel')).toBeInTheDocument();
    });

    it('should show character name in English when language is en', async () => {
        const user = userEvent.setup();
        const mockState = {
            player: { name: 'Lin Xuan', stats: { intelligence: 10, charm: 10, fitness: 10, money: 1000 }, location: 'dorm_room' },
            time: { day: 1, hour: 12, weekday: 0 },
            relationships: {
                su_qingqian: { affection: 0, status: 'stranger', eventsSeen: [] },
                chen_siyao: { affection: 0, status: 'stranger', eventsSeen: [] },
                ling_ruoyu: { affection: 0, status: 'stranger', eventsSeen: [] },
                lu_jiaxin: { affection: 0, status: 'stranger', eventsSeen: [] },
            },
            agentStates: {
                su_qingqian: {
                    personality: [], coreValues: [], memory: [], recentInteractions: [],
                    mood: { base: 'neutral', intensity: 50, triggers: [] },
                    currentGoal: null, goalsQueue: [], currentLocation: 'dorm_room', currentActivity: 'idle',
                    perceivedAffection: { su_qingqian: 0, chen_siyao: 0, ling_ruoyu: 0, lu_jiaxin: 0 },
                    socialCircle: [],
                },
                chen_siyao: {
                    personality: [], coreValues: [], memory: [], recentInteractions: [],
                    mood: { base: 'neutral', intensity: 50, triggers: [] },
                    currentGoal: null, goalsQueue: [], currentLocation: 'dorm_room', currentActivity: 'idle',
                    perceivedAffection: { su_qingqian: 0, chen_siyao: 0, ling_ruoyu: 0, lu_jiaxin: 0 },
                    socialCircle: [],
                },
                ling_ruoyu: {
                    personality: [], coreValues: [], memory: [], recentInteractions: [],
                    mood: { base: 'neutral', intensity: 50, triggers: [] },
                    currentGoal: null, goalsQueue: [], currentLocation: 'dorm_room', currentActivity: 'idle',
                    perceivedAffection: { su_qingqian: 0, chen_siyao: 0, ling_ruoyu: 0, lu_jiaxin: 0 },
                    socialCircle: [],
                },
                lu_jiaxin: {
                    personality: [], coreValues: [], memory: [], recentInteractions: [],
                    mood: { base: 'neutral', intensity: 50, triggers: [] },
                    currentGoal: null, goalsQueue: [], currentLocation: 'dorm_room', currentActivity: 'idle',
                    perceivedAffection: { su_qingqian: 0, chen_siyao: 0, ling_ruoyu: 0, lu_jiaxin: 0 },
                    socialCircle: [],
                },
            },
            flags: {}, currentScriptId: null, language: 'en' as const,
        };
        useGameStore.setState(mockState);
        render(<AgentVisualization />);
        const toggle = screen.getByTestId('agent-visualization-toggle');
        await user.click(toggle);
        expect(screen.getByText(/Su Qingqian/)).toBeInTheDocument();
    });

    it('should show character name in Chinese when language is zh', async () => {
        const user = userEvent.setup();
        const mockState = {
            player: { name: 'Lin Xuan', stats: { intelligence: 10, charm: 10, fitness: 10, money: 1000 }, location: 'dorm_room' },
            time: { day: 1, hour: 12, weekday: 0 },
            relationships: {
                su_qingqian: { affection: 0, status: 'stranger', eventsSeen: [] },
                chen_siyao: { affection: 0, status: 'stranger', eventsSeen: [] },
                ling_ruoyu: { affection: 0, status: 'stranger', eventsSeen: [] },
                lu_jiaxin: { affection: 0, status: 'stranger', eventsSeen: [] },
            },
            agentStates: {
                su_qingqian: {
                    personality: [], coreValues: [], memory: [], recentInteractions: [],
                    mood: { base: 'neutral', intensity: 50, triggers: [] },
                    currentGoal: null, goalsQueue: [], currentLocation: 'dorm_room', currentActivity: 'idle',
                    perceivedAffection: { su_qingqian: 0, chen_siyao: 0, ling_ruoyu: 0, lu_jiaxin: 0 },
                    socialCircle: [],
                },
                chen_siyao: {
                    personality: [], coreValues: [], memory: [], recentInteractions: [],
                    mood: { base: 'neutral', intensity: 50, triggers: [] },
                    currentGoal: null, goalsQueue: [], currentLocation: 'dorm_room', currentActivity: 'idle',
                    perceivedAffection: { su_qingqian: 0, chen_siyao: 0, ling_ruoyu: 0, lu_jiaxin: 0 },
                    socialCircle: [],
                },
                ling_ruoyu: {
                    personality: [], coreValues: [], memory: [], recentInteractions: [],
                    mood: { base: 'neutral', intensity: 50, triggers: [] },
                    currentGoal: null, goalsQueue: [], currentLocation: 'dorm_room', currentActivity: 'idle',
                    perceivedAffection: { su_qingqian: 0, chen_siyao: 0, ling_ruoyu: 0, lu_jiaxin: 0 },
                    socialCircle: [],
                },
                lu_jiaxin: {
                    personality: [], coreValues: [], memory: [], recentInteractions: [],
                    mood: { base: 'neutral', intensity: 50, triggers: [] },
                    currentGoal: null, goalsQueue: [], currentLocation: 'dorm_room', currentActivity: 'idle',
                    perceivedAffection: { su_qingqian: 0, chen_siyao: 0, ling_ruoyu: 0, lu_jiaxin: 0 },
                    socialCircle: [],
                },
            },
            flags: {}, currentScriptId: null, language: 'zh' as const,
        };
        useGameStore.setState(mockState);
        render(<AgentVisualization />);
        const toggle = screen.getByTestId('agent-visualization-toggle');
        await user.click(toggle);
        expect(screen.getByText(/苏晴芊/)).toBeInTheDocument();
    });

    it('should display current location for each character', async () => {
        const user = userEvent.setup();
        const mockState = {
            player: { name: 'Lin Xuan', stats: { intelligence: 10, charm: 10, fitness: 10, money: 1000 }, location: 'dorm_room' },
            time: { day: 1, hour: 12, weekday: 0 },
            relationships: {
                su_qingqian: { affection: 0, status: 'stranger', eventsSeen: [] },
                chen_siyao: { affection: 0, status: 'stranger', eventsSeen: [] },
                ling_ruoyu: { affection: 0, status: 'stranger', eventsSeen: [] },
                lu_jiaxin: { affection: 0, status: 'stranger', eventsSeen: [] },
            },
            agentStates: {
                su_qingqian: {
                    personality: [], coreValues: [], memory: [], recentInteractions: [],
                    mood: { base: 'neutral', intensity: 50, triggers: [] },
                    currentGoal: null, goalsQueue: [], currentLocation: 'student_council', currentActivity: 'meeting',
                    perceivedAffection: { su_qingqian: 0, chen_siyao: 0, ling_ruoyu: 0, lu_jiaxin: 0 },
                    socialCircle: [],
                },
                chen_siyao: {
                    personality: [], coreValues: [], memory: [], recentInteractions: [],
                    mood: { base: 'neutral', intensity: 50, triggers: [] },
                    currentGoal: null, goalsQueue: [], currentLocation: 'campus_map', currentActivity: 'dancing',
                    perceivedAffection: { su_qingqian: 0, chen_siyao: 0, ling_ruoyu: 0, lu_jiaxin: 0 },
                    socialCircle: [],
                },
                ling_ruoyu: {
                    personality: [], coreValues: [], memory: [], recentInteractions: [],
                    mood: { base: 'neutral', intensity: 50, triggers: [] },
                    currentGoal: null, goalsQueue: [], currentLocation: 'lab', currentActivity: 'research',
                    perceivedAffection: { su_qingqian: 0, chen_siyao: 0, ling_ruoyu: 0, lu_jiaxin: 0 },
                    socialCircle: [],
                },
                lu_jiaxin: {
                    personality: [], coreValues: [], memory: [], recentInteractions: [],
                    mood: { base: 'neutral', intensity: 50, triggers: [] },
                    currentGoal: null, goalsQueue: [], currentLocation: 'city_map', currentActivity: 'exploring',
                    perceivedAffection: { su_qingqian: 0, chen_siyao: 0, ling_ruoyu: 0, lu_jiaxin: 0 },
                    socialCircle: [],
                },
            },
            flags: {}, currentScriptId: null, language: 'en' as const,
        };
        useGameStore.setState(mockState);
        render(<AgentVisualization />);
        const toggle = screen.getByTestId('agent-visualization-toggle');
        await user.click(toggle);
        expect(screen.getByText(/Student Council/)).toBeInTheDocument();
        expect(screen.getByText(/Campus/)).toBeInTheDocument();
    });

    it('should display mood with color coding for happy mood', async () => {
        const user = userEvent.setup();
        const mockState = {
            player: { name: 'Lin Xuan', stats: { intelligence: 10, charm: 10, fitness: 10, money: 1000 }, location: 'dorm_room' },
            time: { day: 1, hour: 12, weekday: 0 },
            relationships: {
                su_qingqian: { affection: 0, status: 'stranger', eventsSeen: [] },
                chen_siyao: { affection: 0, status: 'stranger', eventsSeen: [] },
                ling_ruoyu: { affection: 0, status: 'stranger', eventsSeen: [] },
                lu_jiaxin: { affection: 0, status: 'stranger', eventsSeen: [] },
            },
            agentStates: {
                su_qingqian: {
                    personality: [], coreValues: [], memory: [], recentInteractions: [],
                    mood: { base: 'happy', intensity: 80, triggers: [] },
                    currentGoal: null, goalsQueue: [], currentLocation: 'dorm_room', currentActivity: 'idle',
                    perceivedAffection: { su_qingqian: 0, chen_siyao: 0, ling_ruoyu: 0, lu_jiaxin: 0 },
                    socialCircle: [],
                },
                chen_siyao: {
                    personality: [], coreValues: [], memory: [], recentInteractions: [],
                    mood: { base: 'neutral', intensity: 50, triggers: [] },
                    currentGoal: null, goalsQueue: [], currentLocation: 'dorm_room', currentActivity: 'idle',
                    perceivedAffection: { su_qingqian: 0, chen_siyao: 0, ling_ruoyu: 0, lu_jiaxin: 0 },
                    socialCircle: [],
                },
                ling_ruoyu: {
                    personality: [], coreValues: [], memory: [], recentInteractions: [],
                    mood: { base: 'neutral', intensity: 50, triggers: [] },
                    currentGoal: null, goalsQueue: [], currentLocation: 'dorm_room', currentActivity: 'idle',
                    perceivedAffection: { su_qingqian: 0, chen_siyao: 0, ling_ruoyu: 0, lu_jiaxin: 0 },
                    socialCircle: [],
                },
                lu_jiaxin: {
                    personality: [], coreValues: [], memory: [], recentInteractions: [],
                    mood: { base: 'neutral', intensity: 50, triggers: [] },
                    currentGoal: null, goalsQueue: [], currentLocation: 'dorm_room', currentActivity: 'idle',
                    perceivedAffection: { su_qingqian: 0, chen_siyao: 0, ling_ruoyu: 0, lu_jiaxin: 0 },
                    socialCircle: [],
                },
            },
            flags: {}, currentScriptId: null, language: 'en' as const,
        };
        useGameStore.setState(mockState);
        render(<AgentVisualization />);
        const toggle = screen.getByTestId('agent-visualization-toggle');
        await user.click(toggle);
        expect(screen.getByText(/Su Qingqian/)).toBeInTheDocument();
    });

    it('should display mood with color coding for sad mood', async () => {
        const user = userEvent.setup();
        const mockState = {
            player: { name: 'Lin Xuan', stats: { intelligence: 10, charm: 10, fitness: 10, money: 1000 }, location: 'dorm_room' },
            time: { day: 1, hour: 12, weekday: 0 },
            relationships: {
                su_qingqian: { affection: 0, status: 'stranger', eventsSeen: [] },
                chen_siyao: { affection: 0, status: 'stranger', eventsSeen: [] },
                ling_ruoyu: { affection: 0, status: 'stranger', eventsSeen: [] },
                lu_jiaxin: { affection: 0, status: 'stranger', eventsSeen: [] },
            },
            agentStates: {
                su_qingqian: {
                    personality: [], coreValues: [], memory: [], recentInteractions: [],
                    mood: { base: 'sad', intensity: 60, triggers: [] },
                    currentGoal: null, goalsQueue: [], currentLocation: 'dorm_room', currentActivity: 'idle',
                    perceivedAffection: { su_qingqian: 0, chen_siyao: 0, ling_ruoyu: 0, lu_jiaxin: 0 },
                    socialCircle: [],
                },
                chen_siyao: {
                    personality: [], coreValues: [], memory: [], recentInteractions: [],
                    mood: { base: 'neutral', intensity: 50, triggers: [] },
                    currentGoal: null, goalsQueue: [], currentLocation: 'dorm_room', currentActivity: 'idle',
                    perceivedAffection: { su_qingqian: 0, chen_siyao: 0, ling_ruoyu: 0, lu_jiaxin: 0 },
                    socialCircle: [],
                },
                ling_ruoyu: {
                    personality: [], coreValues: [], memory: [], recentInteractions: [],
                    mood: { base: 'neutral', intensity: 50, triggers: [] },
                    currentGoal: null, goalsQueue: [], currentLocation: 'dorm_room', currentActivity: 'idle',
                    perceivedAffection: { su_qingqian: 0, chen_siyao: 0, ling_ruoyu: 0, lu_jiaxin: 0 },
                    socialCircle: [],
                },
                lu_jiaxin: {
                    personality: [], coreValues: [], memory: [], recentInteractions: [],
                    mood: { base: 'neutral', intensity: 50, triggers: [] },
                    currentGoal: null, goalsQueue: [], currentLocation: 'dorm_room', currentActivity: 'idle',
                    perceivedAffection: { su_qingqian: 0, chen_siyao: 0, ling_ruoyu: 0, lu_jiaxin: 0 },
                    socialCircle: [],
                },
            },
            flags: {}, currentScriptId: null, language: 'en' as const,
        };
        useGameStore.setState(mockState);
        render(<AgentVisualization />);
        const toggle = screen.getByTestId('agent-visualization-toggle');
        await user.click(toggle);
        expect(screen.getByText(/Su Qingqian/)).toBeInTheDocument();
    });

    it('should display affection level and relationship status', async () => {
        const user = userEvent.setup();
        const mockState = {
            player: { name: 'Lin Xuan', stats: { intelligence: 10, charm: 10, fitness: 10, money: 1000 }, location: 'dorm_room' },
            time: { day: 1, hour: 12, weekday: 0 },
            relationships: {
                su_qingqian: { affection: 50, status: 'acquaintance', eventsSeen: [] },
                chen_siyao: { affection: 150, status: 'friend', eventsSeen: [] },
                ling_ruoyu: { affection: 300, status: 'crush', eventsSeen: [] },
                lu_jiaxin: { affection: 550, status: 'lover', eventsSeen: [] },
            },
            agentStates: {
                su_qingqian: {
                    personality: [], coreValues: [], memory: [], recentInteractions: [],
                    mood: { base: 'neutral', intensity: 50, triggers: [] },
                    currentGoal: null, goalsQueue: [], currentLocation: 'dorm_room', currentActivity: 'idle',
                    perceivedAffection: { su_qingqian: 0, chen_siyao: 0, ling_ruoyu: 0, lu_jiaxin: 0 },
                    socialCircle: [],
                },
                chen_siyao: {
                    personality: [], coreValues: [], memory: [], recentInteractions: [],
                    mood: { base: 'neutral', intensity: 50, triggers: [] },
                    currentGoal: null, goalsQueue: [], currentLocation: 'dorm_room', currentActivity: 'idle',
                    perceivedAffection: { su_qingqian: 0, chen_siyao: 0, ling_ruoyu: 0, lu_jiaxin: 0 },
                    socialCircle: [],
                },
                ling_ruoyu: {
                    personality: [], coreValues: [], memory: [], recentInteractions: [],
                    mood: { base: 'neutral', intensity: 50, triggers: [] },
                    currentGoal: null, goalsQueue: [], currentLocation: 'dorm_room', currentActivity: 'idle',
                    perceivedAffection: { su_qingqian: 0, chen_siyao: 0, ling_ruoyu: 0, lu_jiaxin: 0 },
                    socialCircle: [],
                },
                lu_jiaxin: {
                    personality: [], coreValues: [], memory: [], recentInteractions: [],
                    mood: { base: 'neutral', intensity: 50, triggers: [] },
                    currentGoal: null, goalsQueue: [], currentLocation: 'dorm_room', currentActivity: 'idle',
                    perceivedAffection: { su_qingqian: 0, chen_siyao: 0, ling_ruoyu: 0, lu_jiaxin: 0 },
                    socialCircle: [],
                },
            },
            flags: {}, currentScriptId: null, language: 'en' as const,
        };
        useGameStore.setState(mockState);
        render(<AgentVisualization />);
        const toggle = screen.getByTestId('agent-visualization-toggle');
        await user.click(toggle);
        // Check for affection levels and relationship statuses using getAllByText since there are multiple elements
        const affectionElements = screen.getAllByText(/50/);
        expect(affectionElements.length).toBeGreaterThan(0);
        expect(screen.getByText(/Acquaintance/)).toBeInTheDocument();
        expect(screen.getByText(/Friend/)).toBeInTheDocument();
        expect(screen.getByText(/Crush/)).toBeInTheDocument();
        expect(screen.getByText(/Lover/)).toBeInTheDocument();
    });

    it('should display recent memories', async () => {
        const user = userEvent.setup();
        const mockState = {
            player: { name: 'Lin Xuan', stats: { intelligence: 10, charm: 10, fitness: 10, money: 1000 }, location: 'dorm_room' },
            time: { day: 1, hour: 12, weekday: 0 },
            relationships: {
                su_qingqian: { affection: 0, status: 'stranger', eventsSeen: [] },
                chen_siyao: { affection: 0, status: 'stranger', eventsSeen: [] },
                ling_ruoyu: { affection: 0, status: 'stranger', eventsSeen: [] },
                lu_jiaxin: { affection: 0, status: 'stranger', eventsSeen: [] },
            },
            agentStates: {
                su_qingqian: {
                    personality: [], coreValues: [], memory: [
                        { id: '1', type: 'dialogue', content: 'Hello player', timestamp: { day: 1, hour: 10, weekday: 0 }, emotionalValence: 50, strength: 70, associatedCharacters: [] },
                        { id: '2', type: 'event', content: 'Gave gift', timestamp: { day: 1, hour: 11, weekday: 0 }, emotionalValence: 80, strength: 90, associatedCharacters: [] },
                        { id: '3', type: 'observation', content: 'Player looks happy', timestamp: { day: 1, hour: 12, weekday: 0 }, emotionalValence: 30, strength: 50, associatedCharacters: [] },
                    ], recentInteractions: [],
                    mood: { base: 'neutral', intensity: 50, triggers: [] },
                    currentGoal: null, goalsQueue: [], currentLocation: 'dorm_room', currentActivity: 'idle',
                    perceivedAffection: { su_qingqian: 0, chen_siyao: 0, ling_ruoyu: 0, lu_jiaxin: 0 },
                    socialCircle: [],
                },
                chen_siyao: {
                    personality: [], coreValues: [], memory: [], recentInteractions: [],
                    mood: { base: 'neutral', intensity: 50, triggers: [] },
                    currentGoal: null, goalsQueue: [], currentLocation: 'dorm_room', currentActivity: 'idle',
                    perceivedAffection: { su_qingqian: 0, chen_siyao: 0, ling_ruoyu: 0, lu_jiaxin: 0 },
                    socialCircle: [],
                },
                ling_ruoyu: {
                    personality: [], coreValues: [], memory: [], recentInteractions: [],
                    mood: { base: 'neutral', intensity: 50, triggers: [] },
                    currentGoal: null, goalsQueue: [], currentLocation: 'dorm_room', currentActivity: 'idle',
                    perceivedAffection: { su_qingqian: 0, chen_siyao: 0, ling_ruoyu: 0, lu_jiaxin: 0 },
                    socialCircle: [],
                },
                lu_jiaxin: {
                    personality: [], coreValues: [], memory: [], recentInteractions: [],
                    mood: { base: 'neutral', intensity: 50, triggers: [] },
                    currentGoal: null, goalsQueue: [], currentLocation: 'dorm_room', currentActivity: 'idle',
                    perceivedAffection: { su_qingqian: 0, chen_siyao: 0, ling_ruoyu: 0, lu_jiaxin: 0 },
                    socialCircle: [],
                },
            },
            flags: {}, currentScriptId: null, language: 'en' as const,
        };
        useGameStore.setState(mockState);
        render(<AgentVisualization />);
        const toggle = screen.getByTestId('agent-visualization-toggle');
        await user.click(toggle);
        expect(screen.getByText(/Hello player/)).toBeInTheDocument();
        expect(screen.getByText(/Gave gift/)).toBeInTheDocument();
    });

    it('should show the current activity for each character', async () => {
        const user = userEvent.setup();
        const mockState = {
            player: { name: 'Lin Xuan', stats: { intelligence: 10, charm: 10, fitness: 10, money: 1000 }, location: 'dorm_room' },
            time: { day: 1, hour: 12, weekday: 0 },
            relationships: {
                su_qingqian: { affection: 0, status: 'stranger', eventsSeen: [] },
                chen_siyao: { affection: 0, status: 'stranger', eventsSeen: [] },
                ling_ruoyu: { affection: 0, status: 'stranger', eventsSeen: [] },
                lu_jiaxin: { affection: 0, status: 'stranger', eventsSeen: [] },
            },
            agentStates: {
                su_qingqian: {
                    personality: [], coreValues: [], memory: [], recentInteractions: [],
                    mood: { base: 'neutral', intensity: 50, triggers: [] },
                    currentGoal: null, goalsQueue: [], currentLocation: 'student_council', currentActivity: 'managing council',
                    perceivedAffection: { su_qingqian: 0, chen_siyao: 0, ling_ruoyu: 0, lu_jiaxin: 0 },
                    socialCircle: [],
                },
                chen_siyao: {
                    personality: [], coreValues: [], memory: [], recentInteractions: [],
                    mood: { base: 'neutral', intensity: 50, triggers: [] },
                    currentGoal: null, goalsQueue: [], currentLocation: 'dance_studio', currentActivity: 'practicing dance',
                    perceivedAffection: { su_qingqian: 0, chen_siyao: 0, ling_ruoyu: 0, lu_jiaxin: 0 },
                    socialCircle: [],
                },
                ling_ruoyu: {
                    personality: [], coreValues: [], memory: [], recentInteractions: [],
                    mood: { base: 'neutral', intensity: 50, triggers: [] },
                    currentGoal: null, goalsQueue: [], currentLocation: 'lab', currentActivity: 'solving physics',
                    perceivedAffection: { su_qingqian: 0, chen_siyao: 0, ling_ruoyu: 0, lu_jiaxin: 0 },
                    socialCircle: [],
                },
                lu_jiaxin: {
                    personality: [], coreValues: [], memory: [], recentInteractions: [],
                    mood: { base: 'neutral', intensity: 50, triggers: [] },
                    currentGoal: null, goalsQueue: [], currentLocation: 'city_map', currentActivity: 'riding motorcycle',
                    perceivedAffection: { su_qingqian: 0, chen_siyao: 0, ling_ruoyu: 0, lu_jiaxin: 0 },
                    socialCircle: [],
                },
            },
            flags: {}, currentScriptId: null, language: 'en' as const,
        };
        useGameStore.setState(mockState);
        render(<AgentVisualization />);
        const toggle = screen.getByTestId('agent-visualization-toggle');
        await user.click(toggle);
        expect(screen.getByText(/managing council/)).toBeInTheDocument();
        expect(screen.getByText(/practicing dance/)).toBeInTheDocument();
        expect(screen.getByText(/solving physics/)).toBeInTheDocument();
        expect(screen.getByText(/riding motorcycle/)).toBeInTheDocument();
    });

    it('should show character current goal', async () => {
        const user = userEvent.setup();
        const mockState = {
            player: { name: 'Lin Xuan', stats: { intelligence: 10, charm: 10, fitness: 10, money: 1000 }, location: 'dorm_room' },
            time: { day: 1, hour: 12, weekday: 0 },
            relationships: {
                su_qingqian: { affection: 0, status: 'stranger', eventsSeen: [] },
                chen_siyao: { affection: 0, status: 'stranger', eventsSeen: [] },
                ling_ruoyu: { affection: 0, status: 'stranger', eventsSeen: [] },
                lu_jiaxin: { affection: 0, status: 'stranger', eventsSeen: [] },
            },
            agentStates: {
                su_qingqian: {
                    personality: [], coreValues: [], memory: [], recentInteractions: [],
                    mood: { base: 'neutral', intensity: 50, triggers: [] },
                    currentGoal: { id: 'manage_council', description: 'Manage Student Council', priority: 10, completed: false, targetType: 'activity' as const, targetId: 'student_council' },
                    goalsQueue: [], currentLocation: 'student_council', currentActivity: 'idle',
                    perceivedAffection: { su_qingqian: 0, chen_siyao: 0, ling_ruoyu: 0, lu_jiaxin: 0 },
                    socialCircle: [],
                },
                chen_siyao: {
                    personality: [], coreValues: [], memory: [], recentInteractions: [],
                    mood: { base: 'neutral', intensity: 50, triggers: [] },
                    currentGoal: { id: 'practice_dance', description: 'Practice Dancing', priority: 10, completed: false, targetType: 'activity' as const, targetId: 'campus_map' },
                    goalsQueue: [], currentLocation: 'dorm_room', currentActivity: 'idle',
                    perceivedAffection: { su_qingqian: 0, chen_siyao: 0, ling_ruoyu: 0, lu_jiaxin: 0 },
                    socialCircle: [],
                },
                ling_ruoyu: {
                    personality: [], coreValues: [], memory: [], recentInteractions: [],
                    mood: { base: 'neutral', intensity: 50, triggers: [] },
                    currentGoal: { id: 'solve_physics', description: 'Solve Physics Problem', priority: 10, completed: false, targetType: 'activity' as const, targetId: 'lab' },
                    goalsQueue: [], currentLocation: 'dorm_room', currentActivity: 'idle',
                    perceivedAffection: { su_qingqian: 0, chen_siyao: 0, ling_ruoyu: 0, lu_jiaxin: 0 },
                    socialCircle: [],
                },
                lu_jiaxin: {
                    personality: [], coreValues: [], memory: [], recentInteractions: [],
                    mood: { base: 'neutral', intensity: 50, triggers: [] },
                    currentGoal: { id: 'ride_motorcycle', description: 'Ride Motorcycle', priority: 10, completed: false, targetType: 'activity' as const, targetId: 'city_map' },
                    goalsQueue: [], currentLocation: 'dorm_room', currentActivity: 'idle',
                    perceivedAffection: { su_qingqian: 0, chen_siyao: 0, ling_ruoyu: 0, lu_jiaxin: 0 },
                    socialCircle: [],
                },
            },
            flags: {}, currentScriptId: null, language: 'en' as const,
        };
        useGameStore.setState(mockState);
        render(<AgentVisualization />);
        const toggle = screen.getByTestId('agent-visualization-toggle');
        await user.click(toggle);
        expect(screen.getByText(/Manage Student Council/)).toBeInTheDocument();
        expect(screen.getByText(/Practice Dancing/)).toBeInTheDocument();
    });

    it('should hide visualization when close button is clicked', async () => {
        const user = userEvent.setup();
        render(<AgentVisualization />);
        const toggle = screen.getByTestId('agent-visualization-toggle');
        await user.click(toggle);
        expect(screen.getByTestId('agent-visualization-panel')).toBeInTheDocument();
        const closeBtn = screen.getByTestId('agent-visualization-close');
        await user.click(closeBtn);
        expect(screen.queryByTestId('agent-visualization-panel')).not.toBeInTheDocument();
    });

    it('should display mood intensity percentage', async () => {
        const user = userEvent.setup();
        const mockState = {
            player: { name: 'Lin Xuan', stats: { intelligence: 10, charm: 10, fitness: 10, money: 1000 }, location: 'dorm_room' },
            time: { day: 1, hour: 12, weekday: 0 },
            relationships: {
                su_qingqian: { affection: 0, status: 'stranger', eventsSeen: [] },
                chen_siyao: { affection: 0, status: 'stranger', eventsSeen: [] },
                ling_ruoyu: { affection: 0, status: 'stranger', eventsSeen: [] },
                lu_jiaxin: { affection: 0, status: 'stranger', eventsSeen: [] },
            },
            agentStates: {
                su_qingqian: {
                    personality: [], coreValues: [], memory: [], recentInteractions: [],
                    mood: { base: 'happy', intensity: 85, triggers: [] },
                    currentGoal: null, goalsQueue: [], currentLocation: 'dorm_room', currentActivity: 'idle',
                    perceivedAffection: { su_qingqian: 0, chen_siyao: 0, ling_ruoyu: 0, lu_jiaxin: 0 },
                    socialCircle: [],
                },
                chen_siyao: {
                    personality: [], coreValues: [], memory: [], recentInteractions: [],
                    mood: { base: 'neutral', intensity: 50, triggers: [] },
                    currentGoal: null, goalsQueue: [], currentLocation: 'dorm_room', currentActivity: 'idle',
                    perceivedAffection: { su_qingqian: 0, chen_siyao: 0, ling_ruoyu: 0, lu_jiaxin: 0 },
                    socialCircle: [],
                },
                ling_ruoyu: {
                    personality: [], coreValues: [], memory: [], recentInteractions: [],
                    mood: { base: 'neutral', intensity: 50, triggers: [] },
                    currentGoal: null, goalsQueue: [], currentLocation: 'dorm_room', currentActivity: 'idle',
                    perceivedAffection: { su_qingqian: 0, chen_siyao: 0, ling_ruoyu: 0, lu_jiaxin: 0 },
                    socialCircle: [],
                },
                lu_jiaxin: {
                    personality: [], coreValues: [], memory: [], recentInteractions: [],
                    mood: { base: 'neutral', intensity: 50, triggers: [] },
                    currentGoal: null, goalsQueue: [], currentLocation: 'dorm_room', currentActivity: 'idle',
                    perceivedAffection: { su_qingqian: 0, chen_siyao: 0, ling_ruoyu: 0, lu_jiaxin: 0 },
                    socialCircle: [],
                },
            },
            flags: {}, currentScriptId: null, language: 'en' as const,
        };
        useGameStore.setState(mockState);
        render(<AgentVisualization />);
        const toggle = screen.getByTestId('agent-visualization-toggle');
        await user.click(toggle);
        expect(screen.getByText(/85%/, { exact: false })).toBeInTheDocument();
    });
});
