'use client';

import { useState } from 'react';
import { useGameStore } from '@/lib/store';
import { getTranslation } from '@/lib/i18n';
import { X } from 'lucide-react';

interface Item {
    id: string;
    name: { en: string; zh: string };
    description: { en: string; zh: string };
    icon: string;
    type: 'consumable' | 'key' | 'gift';
    value?: number; // For consumables (restores affection, etc.)
    count: number;
}

const INITIAL_ITEMS: Item[] = [
    { id: 'coffee', name: { en: 'Coffee', zh: '咖啡' }, description: { en: 'A cup of hot coffee', zh: '一杯热咖啡' }, icon: '☕', type: 'consumable', value: 5, count: 0 },
    { id: 'chocolate', name: { en: 'Chocolate', zh: '巧克力' }, description: { en: 'Delicious Belgian chocolate', zh: '美味的比利时巧克力' }, icon: '🍫', type: 'gift', value: 10, count: 0 },
    { id: 'book', name: { en: 'Novel', zh: '小说' }, description: { en: 'A romantic novel', zh: '一本浪漫小说' }, icon: '📖', type: 'gift', value: 8, count: 0 },
    { id: 'flower', name: { en: 'Red Rose', zh: '红玫瑰' }, description: { en: 'A beautiful red rose', zh: '一朵美丽的红玫瑰' }, icon: '🌹', type: 'gift', value: 15, count: 0 },
    { id: 'gift_card', name: { en: 'Gift Card', zh: '礼品卡' }, description: { en: '100 yuan gift card', zh: '100元礼品卡' }, icon: '💳', type: 'gift', value: 20, count: 0 },
];

interface InventoryPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function InventoryPanel({ isOpen, onClose }: InventoryPanelProps) {
    const { player, modStats, language } = useGameStore();
    const t = (key: string) => getTranslation(language, key);

    const [items, setItems] = useState<Item[]>(() => {
        // Load from player inventory
        const savedItems = player.inventory.map(itemId => {
            const item = INITIAL_ITEMS.find(i => i.id === itemId);
            return item ? { ...item, count: 1 } : null;
        }).filter(Boolean) as Item[];
        return savedItems;
    });

    const handleUseItem = (itemId: string) => {
        const itemIndex = items.findIndex(i => i.id === itemId);
        if (itemIndex === -1) return;

        const item = items[itemIndex];
        if (item.count <= 0) return;

        if (item.type === 'consumable') {
            // For consumables, just remove and maybe give stats
            if (item.value) {
                modStats({ money: -item.value });
            }
        } else if (item.type === 'gift') {
            // For gifts, you need to select a character
            // For now, just show a message
            alert(t('inventory.select_character'));
            return;
        }

        // Decrease count or remove item
        if (item.count > 1) {
            const newItems = [...items];
            newItems[itemIndex].count -= 1;
            setItems(newItems);
        } else {
            setItems(items.filter(i => i.id !== itemId));
            // Note: This would require adding a setInventory action to the store
        }
    };

    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-2xl rounded-2xl bg-black border border-white/10 shadow-2xl flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <h2 className="text-2xl font-bold text-white">
                        {t('inventory.title')}
                    </h2>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 hover:bg-white/10 transition-colors"
                    >
                        <X className="h-6 w-6 text-gray-400" />
                    </button>
                </div>

                {/* Inventory Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                            <div className="mb-4 text-6xl">🎒</div>
                            <p>{t('inventory.empty')}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {items.map((item, index) => (
                                <div
                                    key={`${item.id}-${index}`}
                                    className="group relative rounded-xl border border-white/10 bg-white/5 p-4 transition-all hover:border-blue-500/50 hover:bg-white/10"
                                >
                                    <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-4xl">
                                        {item.icon}
                                    </div>
                                    <h3 className="mb-1 font-semibold text-white">{item.name[language]}</h3>
                                    <p className="mb-3 text-xs text-gray-400 line-clamp-2">
                                        {item.description[language]}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-blue-400">
                                            {item.count} {t('inventory.x')}
                                        </span>
                                        {item.count > 1 && (
                                            <button
                                                onClick={() => handleUseItem(item.id)}
                                                className="rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-blue-700"
                                            >
                                                {t('inventory.use')}
                                            </button>
                                        )}
                                        {item.count === 1 && (
                                            <span className="text-xs text-gray-500">
                                                Last one
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-white/10 p-4">
                    <div className="flex items-center justify-between text-sm text-gray-400">
                        <span>{t('inventory.total')}: {items.length} {t('inventory.items')}</span>
                        <button
                            onClick={onClose}
                            className="rounded-lg bg-white/10 px-6 py-2 font-medium text-white transition-colors hover:bg-white/20"
                        >
                            {t('inventory.close')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
