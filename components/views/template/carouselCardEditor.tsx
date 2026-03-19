"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { Trash2, PlusCircle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { CarouselCard } from './templateTypes';

interface CarouselCardEditorProps {
    isDarkMode: boolean;
    cards: CarouselCard[];
    setCards: (cards: CarouselCard[]) => void;
    isViewMode?: boolean;
}

export const CarouselCardEditor: React.FC<CarouselCardEditorProps> = ({
    isDarkMode,
    cards,
    setCards,
    isViewMode = false
}) => {
    const updateCard = (id: string, updates: Partial<CarouselCard>) => {
        setCards(cards.map(card => card.id === id ? { ...card, ...updates } : card));
    };

    const addCard = () => {
        if (cards.length < 10) {
            setCards([...cards, {
                id: `card-${Date.now()}`,
                mediaType: cards[0]?.mediaType || 'IMAGE',
                mediaUrl: '',
                bodyText: '',
                buttons: []
            }]);
        }
    };

    const removeCard = (id: string) => {
        if (cards.length > 2) {
            setCards(cards.filter(card => card.id !== id));
        }
    };

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 gap-6">
                {cards.map((card, index) => (
                    <div
                        key={card.id}
                        className={cn(
                            "rounded-2xl border p-6 transition-all relative overflow-hidden",
                            isDarkMode ? "bg-white/5 border-white/10" : "bg-white border-slate-200"
                        )}
                    >
                        {/* Card Header Info */}
                        <div className="flex items-center justify-between mb-4 border-b border-dashed pb-4" style={{ borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs",
                                    isDarkMode ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-700"
                                )}>
                                    {index + 1}
                                </div>
                                <h3 className={cn("text-xs font-bold uppercase tracking-wider", isDarkMode ? "text-white" : "text-slate-900")}>
                                    Card {index + 1}
                                </h3>
                            </div>
                            {!isViewMode && cards.length > 2 && (
                                <button
                                    onClick={() => removeCard(card.id)}
                                    className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                                    title="Remove Card"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>

                        {/* Card Body */}
                        <div className="space-y-1">
                            <Textarea
                                isDarkMode={isDarkMode}
                                label="Body Text"
                                placeholder="Enter body text for this card (e.g. exclusive offer for you)"
                                value={card.bodyText}
                                onChange={(e) => updateCard(card.id, { bodyText: e.target.value.slice(0, 160) })}
                                maxLength={160}
                                disabled={isViewMode}
                                rows={3}
                            />
                            <div className="flex justify-end pr-1">
                                <span className={cn("text-[10px]", isDarkMode ? "text-white/40" : "text-slate-500")}>
                                    {card.bodyText.length}/160
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {!isViewMode && cards.length < 10 && (
                <button
                    onClick={addCard}
                    className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:border-emerald-500/50 hover:text-emerald-500 hover:bg-emerald-500/5 transition-all flex items-center justify-center gap-2 font-bold"
                >
                    <PlusCircle size={20} />
                    <span>Add Carousel Card</span>
                </button>
            )}
        </div>
    );
};