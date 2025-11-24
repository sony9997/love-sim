'use client';

import { useGameStore } from '@/lib/store';
import { Clock, Wallet, Brain, Heart, Dumbbell } from 'lucide-react';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function HUD() {
    const { time, player } = useGameStore();

    return (
        <div className="absolute top-0 left-0 right-0 z-40 flex items-start justify-between p-6 pointer-events-none">
            {/* Time & Money Widget */}
            <div className="flex flex-col space-y-2 pointer-events-auto">
                <div className="flex items-center space-x-4 rounded-full border border-white/10 bg-black/60 px-6 py-3 backdrop-blur-md shadow-lg">
                    <div className="flex items-center space-x-2 text-blue-300">
                        <Clock className="h-5 w-5" />
                        <span className="text-xl font-mono font-bold">
                            {WEEKDAYS[time.weekday]} {time.hour.toString().padStart(2, '0')}:00
                        </span>
                    </div>
                    <div className="h-6 w-px bg-white/20" />
                    <div className="flex items-center space-x-2 text-yellow-400">
                        <Wallet className="h-5 w-5" />
                        <span className="text-lg font-bold">¥{player.stats.money}</span>
                    </div>
                </div>

                <div className="px-4 py-1 rounded-full bg-black/40 backdrop-blur-sm text-xs text-gray-400 text-center w-fit self-center">
                    Day {time.day}
                </div>
            </div>

            {/* Stats Widget */}
            <div className="flex space-x-3 pointer-events-auto">
                <StatBadge icon={Brain} value={player.stats.intelligence} color="text-blue-400" label="INT" />
                <StatBadge icon={Heart} value={player.stats.charm} color="text-pink-400" label="CHM" />
                <StatBadge icon={Dumbbell} value={player.stats.fitness} color="text-orange-400" label="FIT" />
            </div>
        </div>
    );
}

function StatBadge({ icon: Icon, value, color, label }: { icon: any, value: number, color: string, label: string }) {
    return (
        <div className="group flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-black/60 p-3 backdrop-blur-md transition-all hover:scale-110 hover:bg-white/10 w-16 h-16">
            <Icon className={`h-6 w-6 ${color} mb-1`} />
            <span className="text-sm font-bold text-white">{value}</span>
        </div>
    );
}
