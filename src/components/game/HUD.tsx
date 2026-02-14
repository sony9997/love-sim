'use client';

import { useGameStore } from '@/lib/store';
import { getTranslation } from '@/lib/i18n';
import { Clock, Wallet, Brain, Heart, Dumbbell, LucideIcon } from 'lucide-react';
import { getRelationshipStage, getProgressToNextStage } from '@/lib/relationship-utils';
import { getUnlockedAchievements, getAchievementPoints } from '@/lib/achievement-utils';
import { CHARACTER_SCHEDULES } from '@/lib/schedule-utils';
import { CharacterId } from '@/lib/game-data/types';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const WEEKDAYS_ZH = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

export default function HUD() {
    const { time, player, relationships, language } = useGameStore();
    const t = (key: string) => getTranslation(language, key);

    const weekdays = language === 'zh' ? WEEKDAYS_ZH : WEEKDAYS;
    const unlockedAchievements = getUnlockedAchievements(useGameStore.getState());
    const achievementPoints = getAchievementPoints(unlockedAchievements);

    return (
        <div className="absolute top-0 left-0 right-0 z-40 flex items-start justify-between p-6 pointer-events-none">
            {/* Time & Money Widget */}
            <div className="flex flex-col space-y-2 pointer-events-auto">
                <div className="flex items-center space-x-4 rounded-full border border-white/10 bg-black/60 px-6 py-3 backdrop-blur-md shadow-lg">
                    <div className="flex items-center space-x-2 text-blue-300">
                        <Clock className="h-5 w-5" />
                        <span className="text-xl font-mono font-bold">
                            {weekdays[time.weekday]} {time.hour.toString().padStart(2, '0')}:00
                        </span>
                    </div>
                    <div className="h-6 w-px bg-white/20" />
                    <div className="flex items-center space-x-2 text-yellow-400">
                        <Wallet className="h-5 w-5" />
                        <span className="text-lg font-bold">{t('money')}{player.stats.money}</span>
                    </div>
                </div>

                <div className="px-4 py-1 rounded-full bg-black/40 backdrop-blur-sm text-xs text-gray-400 text-center w-fit self-center">
                    {t('day')} {time.day}
                </div>
            </div>

            {/* Stats Widget */}
            <div className="flex space-x-3 pointer-events-auto">
                <StatBadge icon={Brain} value={player.stats.intelligence} color="text-blue-400" label={t('stats.intelligence')} />
                <StatBadge icon={Heart} value={player.stats.charm} color="text-pink-400" label={t('stats.charm')} />
                <StatBadge icon={Dumbbell} value={player.stats.fitness} color="text-orange-400" label={t('stats.fitness')} />
            </div>

            {/* Relationship & Achievement Widget */}
            <div className="flex flex-col space-y-2 pointer-events-auto items-end">
                {/* Relationship Status */}
                <div className="flex space-x-2">
                    {Object.keys(relationships).map((charIdStr) => {
                        const charId = charIdStr as CharacterId;
                        const rel = relationships[charId];
                        const stage = getRelationshipStage(rel.affection);
                        const progress = getProgressToNextStage(rel.affection, stage);
                        const charName = language === 'zh'
                            ? CHARACTER_SCHEDULES[charId].schedule[0][8] || '角色'
                            : charId;

                        return (
                            <div key={charId} className="relative group">
                                <div className="flex items-center space-x-1 rounded-lg bg-black/60 px-2 py-1 backdrop-blur-md border border-white/10">
                                    <span className="text-sm text-white">{charId}</span>
                                    <span className="text-xs text-blue-400">{stage}</span>
                                </div>
                                {/* Tooltip */}
                                <div className="absolute right-0 top-6 hidden w-48 rounded-lg bg-black/90 p-2 text-xs text-white shadow-lg group-hover:block">
                                    <p>{charName}</p>
                                    <p className="text-gray-400">Affection: {rel.affection}</p>
                                    <div className="mt-1 h-1 w-full rounded-full bg-gray-700">
                                        <div
                                            className="h-full rounded-full bg-blue-500"
                                            style={{ width: `${progress.progress}%` }}
                                        />
                                    </div>
                                    <p className="mt-1 text-gray-400">{progress.progress}% to next stage</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Achievement Points */}
                {unlockedAchievements.length > 0 && (
                    <div className="rounded-lg bg-black/60 px-3 py-1 backdrop-blur-md border border-white/10">
                        <span className="text-xs text-yellow-400">🏆 {achievementPoints} pts</span>
                        <span className="ml-2 text-xs text-gray-400">{unlockedAchievements.length} unlocked</span>
                    </div>
                )}
            </div>
        </div>
    );
}

function StatBadge({ icon: Icon, value, color, label }: { icon: LucideIcon, value: number, color: string, label: string }) {
    return (
        <div className="group flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-black/60 p-2 backdrop-blur-md transition-all hover:scale-110 hover:bg-white/10 w-16 h-20">
            <Icon className={`h-5 w-5 ${color} mb-1`} />
            <span className="text-sm font-bold text-white">{value}</span>
            <span className="text-[10px] text-gray-400 uppercase">{label}</span>
        </div>
    );
}
