'use client';

import { useGameStore } from '@/lib/store';
import { LOCATIONS } from '@/lib/game-data/locations';
import { cn } from '@/lib/utils';
import { MapPin, Bed, Book, GraduationCap, Coffee, Building2 } from 'lucide-react';

const ICONS: Record<string, any> = {
    bed: Bed,
    computer: Building2, // Placeholder
    door: MapPin,
    study_table: Book,
    desk: GraduationCap,
    food_counter: Coffee,
    loc_dorm: Bed,
    loc_library: Book,
    loc_classroom: GraduationCap,
    loc_cafeteria: Coffee,
    loc_city: Building2,
    loc_campus: Building2,
    loc_mall: Building2,
    loc_park: Building2,
};

export default function MapNavigation() {
    const { player, setPlayerLocation, advanceTime } = useGameStore();
    const currentLocation = LOCATIONS[player.location];

    if (!currentLocation) return <div>Error: Unknown Location {player.location}</div>;

    const handleInteract = (action: string, target?: string) => {
        if (action === 'move' && target) {
            setPlayerLocation(target);
            advanceTime(0.5); // Moving takes 30 mins
        } else if (action === 'talk' && target) {
            // This needs to trigger the DialogueSystem in GameEngine
            // We can dispatch a custom event or use a store method if we had one for 'currentScript'
            // For now, let's use a window event as a quick hack or better, expose a method from GameEngine via context?
            // Actually, the cleanest way is to add 'setCurrentScript' to the store or pass it down.
            // Let's add 'currentScriptId' to the store!
            useGameStore.setState({ currentScriptId: target });
        } else if (action === 'examine') {
            console.log('Examining...');
            // Trigger dialogue or description
        }
    };

    return (
        <div className="relative h-full w-full">
            {/* Background Image Layer */}
            <div
                className="absolute inset-0 bg-cover bg-center transition-all duration-500"
                style={{ backgroundImage: `url(${currentLocation.background})`, filter: 'brightness(0.6)' }}
            />

            {/* Content Layer */}
            <div className="relative z-10 flex h-full flex-col justify-between p-8">
                {/* Header */}
                <div className="rounded-lg bg-black/50 p-4 backdrop-blur-md">
                    <h1 className="text-3xl font-bold text-white">{currentLocation.name}</h1>
                    <p className="text-gray-300">{currentLocation.description}</p>
                </div>

                {/* Interactables / Navigation */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {currentLocation.interactables.map((item) => {
                        const Icon = ICONS[item.id] || MapPin;
                        return (
                            <button
                                key={item.id}
                                onClick={() => handleInteract(item.action, item.target)}
                                className={cn(
                                    "group flex items-center space-x-4 rounded-xl border border-white/10 bg-black/60 p-4 text-left backdrop-blur-sm transition-all hover:bg-white/10 hover:scale-105 active:scale-95",
                                    item.action === 'move' ? "border-blue-500/30 hover:border-blue-400" : "border-white/10"
                                )}
                            >
                                <div className={cn(
                                    "flex h-12 w-12 items-center justify-center rounded-full bg-white/10 transition-colors group-hover:bg-blue-500",
                                    item.action === 'move' ? "text-blue-200" : "text-gray-200"
                                )}>
                                    <Icon className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white">{item.label}</h3>
                                    <p className="text-xs text-gray-400 uppercase tracking-wider">{item.action}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
