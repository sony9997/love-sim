'use client';

import { useGameStore } from '@/lib/store';
import { LOCATIONS } from '@/lib/game-data/locations';
import { cn } from '@/lib/utils';
import { getTranslation } from '@/lib/i18n';
import { MapPin, Bed, Book, GraduationCap, Coffee, Building2, User, LucideIcon } from 'lucide-react';
import { getAvailableCharacters } from '@/lib/schedule-utils';
import { CharacterId } from '@/lib/game-data/types';

const ICONS: Record<string, LucideIcon> = {
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

const CHARACTER_ICONS: Record<CharacterId, string> = {
    su_qingqian: '冰山',
    chen_siyao: '活力',
    ling_ruoyu: '教授',
    lu_jiaxin: '机车',
};

type MapNavigationProps = React.HTMLAttributes<HTMLDivElement>;

export default function MapNavigation({ className, ...props }: MapNavigationProps) {
    const { player, setPlayerLocation, advanceTime, language } = useGameStore();
    const currentLocation = LOCATIONS[player.location];
    const t = (key: string) => getTranslation(language, key);

    // Helper to get text based on language
    const getText = (text: string | { en: string; zh: string }) => {
        if (typeof text === 'string') return text;
        return text[language] || text.en;
    };

    // Get available characters at current location
    const availableCharacters = getAvailableCharacters(player.location, useGameStore.getState());
    const gameState = useGameStore.getState();

    if (!currentLocation) return <div data-testid="map-navigation-error">Error: Unknown Location {player.location}</div>;

    // Debug: add marker to DOM
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
        (window as any).__mapNavigationRendered = true;
        console.log('[MapNavigation] Rendering for location:', player.location);
    }

    // Return a marker element to indicate the component rendered
    const renderMarker = typeof window !== 'undefined' && process.env.NODE_ENV === 'development' ? (
        <div data-testid="map-navigation-render-marker" style={{ display: 'block' }} data-rendered="true" className="mb-4 p-2 bg-green-500 text-black text-xs">
            MapNavigation Rendered
        </div>
    ) : null;

    const handleInteract = (action: string, target?: string) => {
        console.log('[MapNavigation] handleInteract called:', { action, target });
        if (action === 'move' && target) {
            setPlayerLocation(target);
            advanceTime(0.5); // Moving takes 30 mins
        } else if (action === 'talk' && target) {
            console.log('[MapNavigation] Setting currentScriptId to:', target);
            useGameStore.setState({ currentScriptId: target });
        } else if (action === 'examine') {
            console.log('Examining...');
        }
    };

    return (
        <div className={`relative h-full w-full ${className || ''}`} {...(props as React.HTMLAttributes<HTMLDivElement>)}>
            {/* Background Image Layer */}
            <div
                className="absolute inset-0 bg-cover bg-center transition-all duration-500"
                style={{ backgroundImage: `url(${currentLocation.background})`, filter: 'brightness(0.6)' }}
            />

            {/* Content Layer */}
            <div className="relative z-10 flex h-full flex-col justify-between p-8">
                {/* Header */}
                <div className="rounded-lg bg-black/50 p-4 backdrop-blur-md">
                    <h1 className="text-3xl font-bold text-white">{getText(currentLocation.name)}</h1>
                    <p className="text-gray-300">{getText(currentLocation.description)}</p>
                </div>

                {/* Interactables / Navigation */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {currentLocation.interactables.map((item) => {
                        const Icon = ICONS[item.id] || MapPin;
                        const dataTestId = item.id.startsWith('loc_')
                            ? `btn-move-${item.id.replace('loc_', '')}`
                            : `btn-${item.id.replace('_', '-')}`;
                        return (
                            <button
                                key={item.id}
                                data-interact-id={item.id}
                                data-testid={dataTestId}
                                data-action={item.action}
                                data-target={item.target || ''}
                                onClick={(e) => {
                                    console.log('[MapNavigation] Button clicked, item.id:', item.id, 'action:', item.action, 'target:', item.target);
                                    handleInteract(item.action, item.target);
                                }}
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
                                    <h3 className="font-semibold text-white">{getText(item.label)}</h3>
                                    <p className="text-xs text-gray-400 uppercase tracking-wider">{t(`actions.${item.action}`)}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Character Encounter Display */}
                {availableCharacters.length > 0 && (
                    <div className="mt-4 rounded-lg bg-black/40 backdrop-blur-sm p-4 border border-white/10">
                        <div className="mb-2 flex items-center text-xs text-gray-400 uppercase tracking-wider">
                            <User className="mr-2 h-4 w-4" />
                            {t('characters_here')}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {availableCharacters.map((charId) => {
                                const charName = gameState.relationships[charId]
                                    ? language === 'zh'
                                        ? CHARACTER_ICONS[charId]
                                        : charId
                                    : charId;
                                return (
                                    <button
                                        key={charId}
                                        data-testid={`char-btn-${charId}`}
                                        className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm text-white hover:bg-white/20 active:scale-95 transition-all"
                                        onClick={(e) => {
                                            console.log('[MapNavigation] Character encounter button clicked, charId:', charId);
                                            handleInteract('talk', charId);
                                        }}
                                    >
                                        <span>{CHARACTER_ICONS[charId]}</span>
                                        <span>{charName}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
            {renderMarker}
        </div>
    );
}
