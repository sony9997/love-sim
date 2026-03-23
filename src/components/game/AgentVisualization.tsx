'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/lib/store';
import { getTranslation } from '@/lib/i18n';
import { CHARACTERS } from '@/lib/game-data/characters';
import { CharacterId, RelationshipStatus } from '@/lib/game-data/types';
import { cn } from '@/lib/utils';

// Mood colors
const MOOD_COLORS: Record<string, string> = {
    happy: 'bg-green-500',
    excited: 'bg-lime-500',
    neutral: 'bg-gray-500',
    sad: 'bg-blue-500',
    angry: 'bg-red-500',
    anxious: 'bg-yellow-500',
    bored: 'bg-slate-500',
};

// Relationship status display text
const RELATIONSHIP_TEXT = {
    en: {
        stranger: 'Stranger',
        acquaintance: 'Acquaintance',
        friend: 'Friend',
        crush: 'Crush',
        lover: 'Lover',
        enemy: 'Enemy',
    },
    zh: {
        stranger: '陌生人',
        acquaintance: '认识',
        friend: '朋友',
        crush: '暗恋',
        lover: '恋人',
        enemy: '敌人',
    },
};

// Location names mapping
const LOCATION_NAMES = {
    en: {
        dorm_room: 'Dorm Room',
        student_council: 'Student Council',
        campus_map: 'Campus',
        lab: 'Laboratory',
        city_map: 'City',
        dance_studio: 'Dance Studio',
        library: 'Library',
        classroom: 'Classroom',
        cafeteria: 'Cafeteria',
        park: 'Park',
        mall: 'Mall',
    },
    zh: {
        dorm_room: '宿舍',
        student_council: '学生会',
        campus_map: '校园',
        lab: '实验室',
        city_map: '市区',
        dance_studio: '舞蹈室',
        library: '图书馆',
        classroom: '教室',
        cafeteria: '食堂',
        park: '公园',
        mall: '商场',
    },
};

function getLocationName(locationId: string, language: 'en' | 'zh'): string {
    const name = LOCATION_NAMES[language][locationId as keyof typeof LOCATION_NAMES.en];
    return name || locationId;
}

function getRelationshipText(status: RelationshipStatus, language: 'en' | 'zh'): string {
    return RELATIONSHIP_TEXT[language][status] || status;
}

interface AgentVisualizationProps {
    className?: string;
}

export function AgentVisualization({ className }: AgentVisualizationProps) {
    const [isVisible, setIsVisible] = useState(false);
    const { player, relationships, agentStates, language } = useGameStore();
    const t = (key: string) => getTranslation(language, key);

    const agentIds: CharacterId[] = ['su_qingqian', 'chen_siyao', 'ling_ruoyu', 'lu_jiaxin'];

    const toggleVisibility = () => {
        setIsVisible(!isVisible);
    };

    return (
        <div className={cn('relative z-40', className)} data-testid="agent-visualization-wrapper">
            {/* Toggle Button */}
            <motion.button
                data-testid="agent-visualization-toggle"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleVisibility}
                className={cn(
                    'fixed bottom-6 left-6 z-50 flex items-center space-x-2 rounded-full border border-white/20 bg-black/60 px-6 py-3 text-white backdrop-blur-md shadow-lg transition-all hover:bg-white/10',
                    isVisible && 'ring-2 ring-blue-500'
                )}
            >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                </div>
                <span className="font-medium">
                    {t('agentVisualization.show')}
                </span>
            </motion.button>

            {/* Dashboard Panel */}
            <AnimatePresence mode="wait">
                {isVisible && (
                    <motion.div
                        data-testid="agent-visualization-panel"
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        className={cn(
                            'fixed bottom-24 left-6 right-6 z-40 max-h-[60vh] overflow-y-auto rounded-xl border border-white/20 bg-black/80 backdrop-blur-xl shadow-2xl',
                            'lg:max-w-5xl lg:left-1/2 lg:right-auto lg:-translate-x-1/2'
                        )}
                    >
                        {/* Header */}
                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-black/80 px-6 py-4">
                            <h2 className="text-xl font-bold text-white">
                                {t('agentVisualization.title')}
                            </h2>
                            <motion.button
                                data-testid="agent-visualization-close"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={toggleVisibility}
                                className="rounded-lg p-2 text-gray-400 hover:bg-white/10 hover:text-white"
                            >
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </motion.button>
                        </div>

                        {/* Agent Grid */}
                        <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2 lg:grid-cols-4">
                            {agentIds.map((charId) => (
                                <AgentCard
                                    key={charId}
                                    charId={charId}
                                    relationship={relationships[charId]}
                                    agentState={agentStates[charId] as any}
                                    language={language}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

interface AgentCardProps {
    charId: CharacterId;
    relationship: { affection: number; status: RelationshipStatus; eventsSeen: string[] };
    agentState: any;
    language: 'en' | 'zh';
}

function AgentCard({ charId, relationship, agentState, language }: AgentCardProps) {
    const character = CHARACTERS[charId];
    const t = (key: string) => getTranslation(language, key);

    const moodColor = MOOD_COLORS[agentState?.mood?.base] || MOOD_COLORS['neutral'];
    const moodText = agentState?.mood?.base || 'neutral';
    const affection = relationship?.affection || 0;
    const status = relationship?.status || 'stranger';

    // Get recent memories (last 3)
    const memories = (agentState?.memory || []).slice(-3);

    // Get location name
    const locationName = getLocationName(agentState?.currentLocation || 'dorm_room', language);
    const activity = agentState?.currentActivity || t('agentVisualization.activity');

    // Get goal description
    const goalDescription = agentState?.currentGoal?.description || t('agentVisualization.activity');

    return (
        <motion.div
            whileHover={{ y: -4 }}
            className="relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-5 shadow-lg backdrop-blur-sm transition-all hover:border-blue-500/30 hover:shadow-blue-500/10"
        >
            {/* Character Header */}
            <div className="mb-4 flex items-start space-x-3">
                <div className="relative">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg">
                        <span className="text-lg font-bold">
                            {character?.name?.zh?.[0] || character?.name?.[0] || '?'}
                        </span>
                    </div>
                    <div
                        className={cn(
                            'absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-black',
                            moodColor
                        )}
                    />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="truncate text-lg font-bold text-white">
                        {typeof character?.name === 'string' ? character.name : character?.name?.[language] || character?.name?.en}
                    </h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                        <span>{getLocationName(agentState?.currentLocation || 'dorm_room', language)}</span>
                        <span className="h-1 w-1 rounded-full bg-white/20" />
                        <span>{activity}</span>
                    </div>
                </div>
            </div>

            {/* Mood Display */}
            <div className="mb-4 rounded-lg bg-white/5 p-3">
                <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
                        {t('agentVisualization.mood')}
                    </span>
                    <span className="text-xs font-bold text-white/80">
                        {agentState?.mood?.intensity || 50}%
                    </span>
                </div>
                <div className="flex items-center space-x-2">
                    <div className={cn('h-2 flex-1 rounded-full', moodColor)} />
                    <span className="text-sm font-medium text-white capitalize">
                        {moodText}
                    </span>
                </div>
            </div>

            {/* Affection & Status */}
            <div className="mb-4 grid grid-cols-2 gap-3 rounded-lg bg-white/5 p-3">
                <div>
                    <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-gray-400">
                        {t('agentVisualization.affection')}
                    </span>
                    <div className="text-xl font-bold text-pink-400">{affection}</div>
                </div>
                <div>
                    <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-gray-400">
                        {t('agentVisualization.status')}
                    </span>
                    <div className="truncate text-sm font-medium text-purple-400">
                        {getRelationshipText(status, language)}
                    </div>
                </div>
            </div>

            {/* Current Goal */}
            <div className="mb-3 rounded-lg bg-white/5 p-3">
                <span className="mb-2 block text-xs font-medium uppercase tracking-wider text-gray-400">
                    {t('agentVisualization.goals')}
                </span>
                <p className="truncate text-sm text-gray-300">{goalDescription}</p>
            </div>

            {/* Recent Memories */}
            {memories.length > 0 && (
                <div className="rounded-lg bg-white/5 p-3">
                    <span className="mb-2 block text-xs font-medium uppercase tracking-wider text-gray-400">
                        {t('agentVisualization.memories')}
                    </span>
                    <div className="space-y-2">
                        {memories.map((mem: any, idx: number) => (
                            <div key={idx} className="text-xs text-gray-400">
                                <span className="mr-1.5 text-blue-400">
                                    {mem.type === 'dialogue' ? '💬' : mem.type === 'event' ? '✨' : '👁️'}
                                </span>
                                <span className="truncate">{mem.content}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    );
}

export default AgentVisualization;
