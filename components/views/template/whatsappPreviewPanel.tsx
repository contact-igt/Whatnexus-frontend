"use client";

import { useState, useRef } from 'react';
import { MessageCircle, Image as ImageIcon, Video, FileText, Check, MapPin, ShoppingBag, Copy, Link, Phone, ChevronLeft, ChevronRight, Trash2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TemplateType, CTAButton, HeaderType, CarouselCard } from './templateTypes';
import { replaceVariables, formatWhatsAppText } from './templateUtils';

interface WhatsAppPreviewPanelProps {
    isDarkMode: boolean;
    templateType: TemplateType;
    headerType?: HeaderType;
    headerValue?: string;
    content: string;
    footer?: string;
    variables: Record<string, string>;
    ctaButtons?: CTAButton[];
    quickReplies?: string[];
    carouselCards?: CarouselCard[];
    onCarouselCardsChange?: (cards: CarouselCard[]) => void;
    fileName?: string | null;
}

// Inline Carousel Preview Sub-Component
const CarouselPreview = ({ 
    cards, 
    isDarkMode, 
    onRemoveCard, 
    onAddCard,
    ctaButtons = []
}: { 
    cards: CarouselCard[]; 
    isDarkMode: boolean;
    onRemoveCard?: (id: string) => void;
    onAddCard?: () => void;
    ctaButtons?: CTAButton[];
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);

    const scrollTo = (index: number) => {
        if (scrollRef.current) {
            const cardWidth = 252; // 240 width + 12 gap
            scrollRef.current.scrollTo({
                left: index * cardWidth,
                behavior: 'smooth'
            });
            setCurrentIndex(index);
        }
    };

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const scrollLeft = e.currentTarget.scrollLeft;
        const cardWidth = 252;
        const index = Math.round(scrollLeft / cardWidth);
        if (index !== currentIndex) {
            setCurrentIndex(index);
        }
    };

    return (
        <div className="relative group/carousel w-full">
            <style jsx>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>

            <div className="relative">
                {/* Scrollable Card List */}
                <div 
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="mt-3 flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory px-1"
                >
                    {cards.map((card, index) => (
                        <div 
                            key={card.id} 
                            className={cn(
                                "flex-shrink-0 w-[240px] snap-center rounded-2xl overflow-hidden shadow-lg border relative transition-opacity duration-300",
                                isDarkMode ? 'bg-[#1c2c33] border-white/5' : 'bg-white border-slate-200',
                                index !== currentIndex && "opacity-60 scale-95 grayscale-[0.2]"
                            )}
                        >
                            {/* Card Media placeholder */}
                            <div className={cn("w-full h-32 flex items-center justify-center relative overflow-hidden",
                                card.mediaType === 'VIDEO' ? 'bg-blue-500/5' : 'bg-orange-500/5'
                            )}>
                                {card.mediaUrl ? (
                                    card.mediaType === 'VIDEO' ? (
                                        <video src={card.mediaUrl} className="w-full h-full object-cover" />
                                    ) : (
                                        <img src={card.mediaUrl} alt={`Card ${index + 1}`} className="w-full h-full object-cover" />
                                    )
                                ) : (
                                    <div className="flex flex-col items-center gap-1.5 opacity-40">
                                        {card.mediaType === 'VIDEO'
                                            ? <Video size={28} className="text-blue-400" />
                                            : <ImageIcon size={28} className="text-orange-400" />
                                        }
                                        <span className={cn("text-[8px] font-bold tracking-wider",
                                            card.mediaType === 'VIDEO' ? 'text-blue-500' : 'text-orange-500'
                                        )}>
                                            {card.mediaType} HEADER
                                        </span>
                                    </div>
                                )}

                                {/* Delete Button on Card Preview */}
                                {onRemoveCard && cards.length > 2 && (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onRemoveCard(card.id); }}
                                        className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-rose-500 transition-colors backdrop-blur-sm"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                )}
                            </div>

                            {/* Card Body */}
                            <div className="p-3 space-y-2">
                                {card.bodyText ? (
                                    <p className={cn("text-[12px] leading-snug line-clamp-3", isDarkMode ? 'text-white' : 'text-slate-800')}>
                                        {card.bodyText}
                                    </p>
                                ) : (
                                    <p className={cn("text-[11px] italic", isDarkMode ? 'text-white/20' : 'text-slate-400')}>
                                        Your card text here...
                                    </p>
                                )}

                                {/* Common Carousel Buttons */}
                                {ctaButtons.length > 0 && (
                                    <div className="pt-2 space-y-1.5 border-t border-slate-100 dark:border-white/5">
                                        {ctaButtons.map(btn => (
                                            <div key={btn.id} className={cn(
                                                "flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-bold border transition-colors shadow-sm",
                                                isDarkMode ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5' : 'text-emerald-700 border-emerald-100 bg-emerald-50'
                                            )}>
                                                {btn.type === 'URL' ? <Link size={10} /> : btn.type === 'PHONE' ? <Phone size={10} /> : <Copy size={10} />}
                                                {btn.label || (btn.type === 'URL' ? 'Visit Website' : btn.type === 'PHONE' ? 'Call Us' : 'Copy Code')}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Navigation Arrows - Centered on cards and kept inside mockup */}
                {cards.length > 1 && (
                    <>
                        <button 
                            onClick={() => scrollTo(Math.max(0, currentIndex - 1))}
                            disabled={currentIndex === 0}
                            className={cn(
                                "absolute left-1 top-[125px] -translate-y-1/2 p-2 rounded-full shadow-xl transition-all z-10",
                                isDarkMode 
                                    ? 'bg-slate-800/90 text-white hover:bg-slate-700 disabled:opacity-0 border border-white/10' 
                                    : 'bg-white/90 text-slate-600 hover:bg-slate-50 disabled:opacity-0 border border-slate-200'
                            )}
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button 
                            onClick={() => scrollTo(Math.min(cards.length - 1, currentIndex + 1))}
                            disabled={currentIndex === cards.length - 1}
                            className={cn(
                                "absolute right-1 top-[125px] -translate-y-1/2 p-2 rounded-full shadow-xl transition-all z-10",
                                isDarkMode 
                                    ? 'bg-slate-800/90 text-white hover:bg-slate-700 disabled:opacity-0 border border-white/10' 
                                    : 'bg-white/90 text-slate-600 hover:bg-slate-50 disabled:opacity-0 border border-slate-200'
                            )}
                        >
                            <ChevronRight size={16} />
                        </button>
                    </>
                )}
            </div>

            {/* Pagination Dots */}
            {cards.length > 1 && (
                <div className="flex justify-center gap-1.5 mt-2 mb-4">
                    {cards.map((_, i) => (
                        <div 
                            key={i}
                            className={cn(
                                "w-1.5 h-1.5 rounded-full transition-all duration-300",
                                i === currentIndex 
                                    ? (isDarkMode ? 'bg-emerald-500 w-3' : 'bg-emerald-600 w-3')
                                    : (isDarkMode ? 'bg-white/20' : 'bg-slate-300')
                            )}
                        />
                    ))}
                </div>
            )}

            {/* Add Card Button at Bottom */}
            {onAddCard && cards.length < 10 && (
                <button
                    onClick={onAddCard}
                    className={cn(
                        "w-full py-3 mt-2 rounded-xl border border-dashed flex items-center justify-center gap-2 transition-all hover:bg-emerald-500/5 hover:border-emerald-500/50",
                        isDarkMode ? 'border-white/10 text-white/40' : 'border-slate-200 text-slate-500'
                    )}
                >
                    <Plus size={16} />
                    <span className="text-[11px] font-bold uppercase">Add Carousel Card</span>
                </button>
            )}
        </div>
    );
};

export const WhatsAppPreviewPanel = ({
    isDarkMode,
    templateType,
    headerType = 'NONE',
    headerValue = '',
    content,
    footer,
    variables,
    ctaButtons = [],
    quickReplies = [],
    carouselCards = [],
    onCarouselCardsChange,
    fileName = null
}: WhatsAppPreviewPanelProps) => {
    // Replace variables and format text
    let processedContent = content;

    // Always replace variables if they exist
    if (content && Object.keys(variables).length > 0) {
        processedContent = replaceVariables(content, variables);
    }

    const renderHeaderPlaceholder = () => {
        if (!headerType || headerType === 'NONE') return null;

        const normalizedType = headerType.toUpperCase();

        if (normalizedType === 'TEXT' && headerValue) {
            return (
                <div className="w-full px-4 pt-3 pb-2">
                    <p className={cn(
                        "text-base font-semibold leading-tight",
                        isDarkMode ? 'text-white' : 'text-slate-900'
                    )}>
                        {headerValue}
                    </p>
                </div>
            );
        }

        if (normalizedType === 'IMAGE' || normalizedType === 'VIDEO') {
            if (headerValue) {
                const isVideo = normalizedType === 'VIDEO' || headerValue.startsWith('data:video') || headerValue.match(/\.(mp4|webm|ogg)$/i);

                return (
                    <div className="w-full">
                        {isVideo ? (
                            <video src={headerValue} className="w-full max-h-64 object-cover rounded-t-xl" controls />
                        ) : (
                            <img src={headerValue} alt="Header media" className="w-full max-h-64 object-cover rounded-t-xl" />
                        )}
                    </div>
                );
            }
            const isVideo = normalizedType === 'VIDEO';
            return (
                <div className={cn("w-full h-48 rounded-t-xl flex flex-col items-center justify-center gap-2",
                    isVideo ? "bg-blue-500/10" : "bg-orange-500/10"
                )}>
                    {isVideo ? <Video size={56} className="text-blue-400" /> : <ImageIcon size={56} className="text-orange-400" />}
                    <span className={cn("text-xs font-semibold", isVideo ? "text-blue-400" : "text-orange-400")}>
                        {isVideo ? 'Video' : 'Image'} Preview
                    </span>
                </div>
            );
        }

        if (normalizedType === 'DOCUMENT') {
            if (headerValue) {
                return (
                    <div className={cn(
                        "w-full px-4 py-3 border-b",
                        isDarkMode ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'
                    )}>
                        <div className="flex items-center gap-3">
                            <div className={cn("p-2.5 rounded-lg", isDarkMode ? "bg-purple-500/20" : "bg-purple-100/50")}>
                                <FileText size={20} className="text-purple-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={cn("text-sm font-medium truncate", isDarkMode ? "text-white" : "text-slate-900")}>
                                    {fileName || headerValue.split('/').pop()?.split('?')[0] || 'Document.pdf'}
                                </p>
                                <p className={cn("text-[10px] uppercase font-bold tracking-tight", isDarkMode ? "text-white/30" : "text-slate-400")}>
                                    {headerValue.split('.').pop()?.toUpperCase().split('?')[0] || 'PDF'} • 1.2 MB
                                </p>
                            </div>
                        </div>
                    </div>
                );
            }
            return (
                <div className={cn("w-full h-48 rounded-t-xl flex flex-col items-center justify-center gap-2 bg-purple-500/10")}>
                    <FileText size={56} className="text-purple-400" />
                    <span className="text-xs font-semibold text-purple-400">Document Preview</span>
                </div>
            );
        }

        if (normalizedType === 'LOCATION') {
            return (
                <div className={cn("w-full h-48 rounded-t-xl flex flex-col items-center justify-center gap-2 bg-emerald-500/10")}>
                    <MapPin size={56} className="text-emerald-400" />
                    <span className="text-xs font-semibold text-emerald-400">Location Header</span>
                </div>
            );
        }

        return null;
    };

    const isCarousel = templateType?.toUpperCase() === 'CAROUSEL';

    return (
        <div className="sticky top-6 space-y-4">
            {/* Header */}
            <div className="flex items-center gap-2">
                <MessageCircle size={18} className="text-emerald-500" />
                <h3 className={cn("text-sm font-bold", isDarkMode ? 'text-white' : 'text-slate-900')}>
                    Template Preview
                </h3>
            </div>

            <p className={cn("text-xs", isDarkMode ? 'text-white/50' : 'text-slate-500')}>
                Your template message preview. It will update as you fill in the values in the form.
            </p>

            {/* WhatsApp Phone Mockup */}
            <div className={cn(
                "rounded-3xl p-3 border-2 shadow-2xl",
                isDarkMode
                    ? 'bg-gradient-to-b from-slate-900 to-slate-800 border-slate-700'
                    : 'bg-gradient-to-b from-slate-100 to-white border-slate-300'
            )}>
                {/* Phone Header - WhatsApp Style */}
                <div className={cn(
                    "rounded-t-2xl px-4 py-3 flex items-center gap-3",
                    isDarkMode ? 'bg-[#1f2c33]' : 'bg-[#075e54]'
                )}>
                    {/* Business Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
                        <MessageCircle size={20} className="text-white" />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-sm font-semibold text-white">Your Business</h4>
                        <p className="text-[10px] text-white/70 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            Online
                        </p>
                    </div>
                </div>

                {/* Chat Background */}
                <div className={cn(
                    "rounded-b-2xl p-4 overflow-y-auto",
                    "bg-cover bg-center",
                    isCarousel ? "min-h-[500px] max-h-[700px]" : "min-h-[400px] max-h-[600px]",
                    isDarkMode
                        ? 'bg-[#0b141a]'
                        : 'bg-[#e5ddd5]'
                )}
                    style={{
                        backgroundImage: isDarkMode
                            ? 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h100v100H0z\' fill=\'%230b141a\'/%3E%3Cpath d=\'M20 20l5 5-5 5m15-10l5 5-5 5\' stroke=\'%23ffffff\' stroke-width=\'0.5\' opacity=\'0.03\' fill=\'none\'/%3E%3C/svg%3E")'
                            : 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h100v100H0z\' fill=\'%23e5ddd5\'/%3E%3Cpath d=\'M20 20l5 5-5 5m15-10l5 5-5 5\' stroke=\'%23000000\' stroke-width=\'0.5\' opacity=\'0.05\' fill=\'none\'/%3E%3C/svg%3E")'
                    }}
                >
                    {/* Date Badge */}
                    <div className="flex justify-center mb-4">
                        <div className={cn(
                            "px-3 py-1 rounded-lg text-[10px] font-medium shadow-sm",
                            isDarkMode
                                ? 'bg-[#1c2c33] text-white/70'
                                : 'bg-white/80 text-slate-600'
                        )}>
                            Today
                        </div>
                    </div>

                    {/* Message Bubble */}
                    <div className={cn("flex mb-2", isCarousel ? "justify-start" : "justify-end")}>
                        <div className={isCarousel ? "w-[90%]" : "max-w-[85%]"}>
                            <div className={cn(
                                "rounded-2xl overflow-hidden shadow-lg relative",
                                isCarousel ? (isDarkMode ? 'bg-[#1f2c33]' : 'bg-white') : (isDarkMode ? 'bg-[#005c4b]' : 'bg-[#dcf8c6]'),
                                !isCarousel && "rounded-tr-sm"
                            )}>
                                {/* Header Placeholder (non-carousel) */}
                                {!isCarousel && renderHeaderPlaceholder()}

                                {/* Content */}
                                <div className="p-3 space-y-0.5">
                                    {content ? (
                                        <div
                                            className={cn(
                                                "text-[13px] leading-relaxed break-words",
                                                isDarkMode ? 'text-white' : 'text-slate-900'
                                            )}
                                        >
                                            {processedContent.split('\n').map((line, i) => (
                                                <p
                                                    key={i}
                                                    dangerouslySetInnerHTML={{
                                                        __html: formatWhatsAppText(line) || '<br>'
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <p className={cn(
                                            "text-[13px] italic",
                                            isDarkMode ? 'text-white/40' : 'text-slate-500'
                                        )}>
                                            {isCarousel ? 'Fallback message will appear here...' : 'Your message will appear here...'}
                                        </p>
                                    )}

                                    {/* Footer */}
                                    {footer && (
                                        <div className={cn(
                                            "text-[11px] pt-2 border-t",
                                            isDarkMode
                                                ? 'text-white/60 border-white/10'
                                                : 'text-slate-600 border-slate-900/10'
                                        )}>
                                            {footer}
                                        </div>
                                    )}

                                    {/* Message Time & Status */}
                                    <div className="flex items-center justify-end gap-1 pt-1">
                                        <span className={cn(
                                            "text-[10px]",
                                            isDarkMode ? 'text-white/50' : 'text-slate-600/70'
                                        )}>
                                            {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                        </span>
                                        <div className="flex">
                                            <Check size={14} className={cn(isDarkMode ? 'text-blue-400' : 'text-blue-600')} />
                                            <Check size={14} className={cn("ml-[-8px]", isDarkMode ? 'text-blue-400' : 'text-blue-600')} />
                                        </div>
                                    </div>
                                </div>

                                {/* Message Tail - Hidden for Carousel */}
                                {!isCarousel && (
                                    <div className={cn(
                                        "absolute -right-2 bottom-0 w-0 h-0",
                                        "border-l-[12px] border-b-[12px] border-b-transparent",
                                        isDarkMode ? 'border-l-[#005c4b]' : 'border-l-[#dcf8c6]'
                                    )} />
                                )}
                            </div>

                            {/* Carousel Cards Preview */}
                            {isCarousel && carouselCards.length > 0 && (
                                <CarouselPreview 
                                    cards={carouselCards} 
                                    isDarkMode={isDarkMode} 
                                    ctaButtons={ctaButtons}
                                    onRemoveCard={(id) => {
                                        if (onCarouselCardsChange) {
                                            onCarouselCardsChange(carouselCards.filter(c => c.id !== id));
                                        }
                                    }}
                                    onAddCard={() => {
                                        if (onCarouselCardsChange && carouselCards.length < 10) {
                                            onCarouselCardsChange([...carouselCards, {
                                                id: `card-${Date.now()}`,
                                                mediaType: 'IMAGE',
                                                mediaUrl: '',
                                                bodyText: '',
                                                buttons: []
                                            }]);
                                        }
                                    }}
                                />
                            )}

                            {/* Carousel placeholder when no cards yet */}
                            {isCarousel && carouselCards.length === 0 && (
                                <div className={cn(
                                    "mt-2 p-4 rounded-xl border-2 border-dashed text-center",
                                    isDarkMode ? 'border-white/10 text-white/30' : 'border-slate-200 text-slate-400'
                                )}>
                                    <p className="text-xs">Carousel cards will appear here</p>
                                    <p className="text-[10px] mt-1">Add at least 2 cards below</p>
                                </div>
                            )}

                            {/* CTA Buttons (non-carousel only) */}
                            {!isCarousel && ctaButtons.length > 0 && (
                                <div className="mt-2 space-y-1">
                                    {ctaButtons.map((button) => (
                                        <button
                                            key={button.id}
                                            className={cn(
                                                "w-full py-2.5 px-4 rounded-lg text-[13px] font-medium text-center border transition-all hover:scale-[1.02] active:scale-95",
                                                isDarkMode
                                                    ? 'bg-[#1c2c33] text-emerald-400 border-emerald-500/20 hover:bg-[#233239]'
                                                    : 'bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50 shadow-sm'
                                            )}
                                        >
                                            <div className="flex items-center justify-center gap-2">
                                                {button.type === 'URL' && <Link size={14} />}
                                                {button.type === 'PHONE' && <Phone size={14} />}
                                                {button.type === 'COPY_CODE' && <Copy size={14} />}
                                                {button.type === 'CATALOG' && <ShoppingBag size={14} />}
                                                {button.type === 'MPM' && <ShoppingBag size={14} />}
                                                <span>{button.label || 'CTA Button'}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Quick Replies */}
                            {!isCarousel && quickReplies.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {quickReplies.map((reply, index) => (
                                        <button
                                            key={index}
                                            className={cn(
                                                "py-1.5 px-3 rounded-full text-[12px] font-medium border transition-all hover:scale-105 active:scale-95",
                                                isDarkMode
                                                    ? 'bg-[#1c2c33] text-emerald-400 border-emerald-500/20 hover:bg-[#233239]'
                                                    : 'bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50 shadow-sm'
                                            )}
                                        >
                                            {reply}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Disclaimer */}
            <div className={cn(
                "text-[10px] text-center leading-relaxed px-2",
                isDarkMode ? 'text-white/30' : 'text-slate-400'
            )}>
                📱 This is a graphical representation. Actual message may appear different on WhatsApp.
            </div>
        </div>
    );
};
