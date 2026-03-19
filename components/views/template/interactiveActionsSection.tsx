"use client";

import { useState } from 'react';
import { Zap, Plus, X, Link, Phone, Copy, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { InteractiveActionType, CTAButton, CTAType } from './templateTypes';
import { generateId } from './templateUtils';

interface InteractiveActionsSectionProps {
    isDarkMode: boolean;
    actionType: InteractiveActionType;
    onActionTypeChange: (type: InteractiveActionType) => void;
    ctaButtons: CTAButton[];
    onCTAButtonsChange: (buttons: CTAButton[]) => void;
    quickReplies: string[];
    onQuickRepliesChange: (replies: string[]) => void;
    ctaErrors?: any[];
    disabled?: boolean;
    isCarousel?: boolean;
}

const COUNTRY_CODES = [
    { value: '+91', label: '🇮🇳 India (+91)' },
    { value: '+1', label: '🇺🇸 USA (+1)' },
    { value: '+44', label: '🇬🇧 UK (+44)' },
    { value: '+971', label: '🇦🇪 UAE (+971)' },
    { value: '+65', label: '🇸🇬 Singapore (+65)' },
    { value: '+61', label: '🇦🇺 Australia (+61)' },
    { value: '+966', label: '🇸🇦 Saudi Arabia (+966)' },
    { value: '+92', label: '🇵🇰 Pakistan (+92)' },
    { value: '+880', label: '🇧🇩 Bangladesh (+880)' },
    { value: '+62', label: '🇮🇩 Indonesia (+62)' },
    { value: '+60', label: '🇲🇾 Malaysia (+60)' },
    { value: '+63', label: '🇵🇭 Philippines (+63)' },
    { value: '+84', label: '🇻🇳 Vietnam (+84)' },
    { value: '+234', label: '🇳🇬 Nigeria (+234)' },
    { value: '+27', label: '🇿🇦 South Africa (+27)' },
    { value: '+20', label: '🇪🇬 Egypt (+20)' },
    { value: '+55', label: '🇧🇷 Brazil (+55)' },
    { value: '+52', label: '🇲🇽 Mexico (+52)' },
    { value: '+33', label: '🇫🇷 France (+33)' },
    { value: '+49', label: '🇩🇪 Germany (+49)' },
    { value: '+39', label: '🇮🇹 Italy (+39)' },
    { value: '+34', label: '🇪🇸 Spain (+34)' },
    { value: '+7', label: '🇷🇺 Russia (+7)' },
    { value: '+86', label: '🇨🇳 China (+86)' },
    { value: '+81', label: '🇯🇵 Japan (+81)' },
    { value: '+82', label: '🇰🇷 South Korea (+82)' },
];

export const InteractiveActionsSection = ({
    isDarkMode,
    actionType,
    onActionTypeChange,
    ctaButtons,
    onCTAButtonsChange,
    quickReplies,
    onQuickRepliesChange,
    ctaErrors = [],
    disabled = false,
    isCarousel = false
}: InteractiveActionsSectionProps) => {

    const addCTAButton = (type: CTAType) => {
        const urlButtons = ctaButtons.filter(b => b.type === 'URL').length;
        const phoneButtons = ctaButtons.filter(b => b.type === 'PHONE').length;
        const copyCodeButtons = ctaButtons.filter(b => b.type === 'COPY_CODE').length;
        const commerceButtons = ctaButtons.filter(b => (b.type === 'CATALOG' || b.type === 'MPM')).length;

        // Carousel specific limit check
        const maxTotalButtons = isCarousel ? 2 : 3;
        if (ctaButtons.length >= maxTotalButtons) return;

        if (type === 'URL' && urlButtons >= 2) return;
        if (type === 'PHONE' && phoneButtons >= 1) return;
        if (type === 'COPY_CODE' && copyCodeButtons >= 1) return;
        if ((type === 'CATALOG' || type === 'MPM') && commerceButtons >= 1) return;

        const newButton: CTAButton = {
            id: generateId(),
            type,
            label: type === 'URL' ? 'Visit Website' : 
                   type === 'PHONE' ? 'Call Us' : 
                   type === 'COPY_CODE' ? 'Copy Code' :
                   type === 'CATALOG' ? 'View Catalog' : 'View Products',
            value: type === 'PHONE' ? '+91 ' : ''
        };
        onCTAButtonsChange([...ctaButtons, newButton]);
    };

    const updateCTAButton = (id: string, field: 'label' | 'value', value: string) => {
        onCTAButtonsChange(
            ctaButtons.map(btn => btn.id === id ? { ...btn, [field]: value } : btn)
        );
    };

    const removeCTAButton = (id: string) => {
        onCTAButtonsChange(ctaButtons.filter(btn => btn.id !== id));
    };

    const addQuickReply = () => {
        if (quickReplies.length >= 3) return; // maximum of 3 quick reply button is applicable
        onQuickRepliesChange([...quickReplies, '']);
    };

    const updateQuickReply = (index: number, value: string) => {
        if (value.length > 25) return; // Max 25 characters
        const newReplies = [...quickReplies];
        newReplies[index] = value;
        onQuickRepliesChange(newReplies);
    };

    const removeQuickReply = (index: number) => {
        onQuickRepliesChange(quickReplies.filter((_, i) => i !== index));
    };

    const isAuthMode = actionType === 'Authentication';
    const showCTA = !isAuthMode && (actionType === 'CTA' || actionType === 'All');
    const showQuickReplies = !isAuthMode && !isCarousel && (actionType === 'QuickReplies' || actionType === 'All');

    // Filter action types for Carousel
    const allowedActionTypes: InteractiveActionType[] = isCarousel 
        ? ['None', 'CTA'] 
        : ['None', 'CTA', 'QuickReplies', 'All'];

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Zap size={16} className="text-emerald-500" />
                <h3 className={cn("text-sm font-bold", isDarkMode ? 'text-white' : 'text-slate-900')}>
                    Interactive Actions
                </h3>
            </div>

            <p className={cn("text-xs", isDarkMode ? 'text-white/50' : 'text-slate-500')}>
                {isCarousel 
                    ? "Add common Call to Action buttons that will be applied to all your carousel cards. Maximum 2 buttons are allowed."
                    : "In addition to your message, you can send actions with your message. Maximum 25 characters are allowed in CTA button title & Quick Replies."
                }
            </p>

            {/* Action Type Radio Group — hide for Authentication mode */}
            {!isAuthMode && (
                <div className={cn(
                    "grid gap-3",
                    isCarousel ? "grid-cols-2" : "grid-cols-2 md:grid-cols-4"
                )}>
                    {allowedActionTypes.map((type) => (
                        <button
                            key={type}
                            onClick={() => onActionTypeChange(type)}
                            disabled={disabled}
                            className={cn(
                                "py-2.5 px-4 rounded-xl border text-sm font-semibold transition-all",
                                actionType === type
                                    ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20'
                                    : isDarkMode
                                        ? 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50',
                                disabled && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            {type === 'CTA' ? 'Call to Actions' : type === 'QuickReplies' ? 'Quick Replies' : type}
                        </button>
                    ))}
                </div>
            )}

            {/* Authentication OTP Button — locked, read-only */}
            {isAuthMode && (
                <div className={cn(
                    "rounded-xl p-4 border space-y-3",
                    isDarkMode ? 'bg-violet-500/10 border-violet-500/30' : 'bg-violet-50 border-violet-200'
                )}>
                    <p className={cn("text-xs font-bold uppercase tracking-wide", isDarkMode ? 'text-violet-400' : 'text-violet-700')}>
                        🔐 OTP Button — Managed by Meta
                    </p>
                    <div className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border",
                        isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'
                    )}>
                        <Copy size={16} className={isDarkMode ? 'text-violet-400' : 'text-violet-600'} />
                        <div>
                            <p className={cn("text-sm font-semibold", isDarkMode ? 'text-white' : 'text-slate-800')}>Copy Code</p>
                            <p className={cn("text-[10px]", isDarkMode ? 'text-white/40' : 'text-slate-500')}>Type: OTP · otp_type: COPY_CODE · Auto-added by Meta</p>
                        </div>
                        <span className={cn(
                            "ml-auto text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide",
                            isDarkMode ? 'bg-violet-500/20 text-violet-400' : 'bg-violet-100 text-violet-700'
                        )}>LOCKED</span>
                    </div>
                    <p className={cn("text-[10px]", isDarkMode ? 'text-violet-400/60' : 'text-violet-600')}>
                        This button is automatically added by Meta for all Authentication templates. It cannot be customized.
                    </p>
                </div>
            )}

            {/* CTA Buttons Section */}
            {showCTA && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h4 className={cn("text-xs font-bold uppercase tracking-wide", isDarkMode ? 'text-white/60' : 'text-slate-600')}>
                            Call to Action Buttons
                        </h4>
                    </div>

                    {/* Add CTA Buttons */}
                    {!disabled && (
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => addCTAButton('URL')}
                                disabled={ctaButtons.filter(b => b.type === 'URL').length >= 2}
                                className={cn(
                                    "py-2 px-4 rounded-lg border text-xs font-semibold transition-all flex items-center gap-2",
                                    isDarkMode
                                        ? 'bg-white/5 border-white/10 text-white hover:bg-white/10 disabled:opacity-40'
                                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40'
                                )}
                            >
                                <Link size={14} />
                                URL ({ctaButtons.filter(b => b.type === 'URL').length}/2)
                            </button>
                            <button
                                onClick={() => addCTAButton('PHONE')}
                                disabled={ctaButtons.some(b => b.type === 'PHONE') || ctaButtons.length >= 3}
                                className={cn(
                                    "py-2 px-4 rounded-lg border text-xs font-semibold transition-all flex items-center gap-2",
                                    isDarkMode
                                        ? 'bg-white/5 border-white/10 text-white hover:bg-white/10 disabled:opacity-40'
                                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40'
                                )}
                            >
                                <Phone size={14} />
                                Phone Number ({ctaButtons.some(b => b.type === 'PHONE') ? '1' : '0'}/1)
                            </button>
                            <button
                                onClick={() => addCTAButton('COPY_CODE')}
                                disabled={ctaButtons.some(b => b.type === 'COPY_CODE')}
                                className={cn(
                                    "py-2 px-4 rounded-lg border text-xs font-semibold transition-all flex items-center gap-2",
                                    isDarkMode
                                        ? 'bg-white/5 border-white/10 text-white hover:bg-white/10 disabled:opacity-40'
                                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40'
                                )}
                            >
                                <Copy size={14} />
                                Copy Code ({ctaButtons.some(b => b.type === 'COPY_CODE') ? '1' : '0'}/1)
                            </button>
                            <button
                                onClick={() => addCTAButton('CATALOG')}
                                disabled={ctaButtons.some(b => b.type === 'CATALOG')}
                                className={cn(
                                    "py-2 px-4 rounded-lg border text-xs font-semibold transition-all flex items-center gap-2",
                                    isDarkMode
                                        ? 'bg-white/5 border-white/10 text-white hover:bg-white/10 disabled:opacity-40'
                                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40'
                                )}
                            >
                                <ShoppingBag size={14} />
                                Catalog ({ctaButtons.some(b => b.type === 'CATALOG') ? '1' : '0'}/1)
                            </button>
                            <button
                                onClick={() => addCTAButton('MPM')}
                                disabled={ctaButtons.some(b => b.type === 'MPM')}
                                className={cn(
                                    "py-2 px-4 rounded-lg border text-xs font-semibold transition-all flex items-center gap-2",
                                    isDarkMode
                                        ? 'bg-white/5 border-white/10 text-white hover:bg-white/10 disabled:opacity-40'
                                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40'
                                )}
                            >
                                <ShoppingBag size={14} />
                                MPM ({ctaButtons.some(b => b.type === 'MPM') ? '1' : '0'}/1)
                            </button>
                        </div>
                    )}

                    {/* CTA Button Inputs */}
                    {ctaButtons.map((button, index) => (
                        <div key={button.id} className={cn(
                            "p-4 rounded-xl border space-y-3",
                            isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'
                        )}>
                            <div className="flex items-center justify-between">
                                <span className={cn("text-xs font-bold", isDarkMode ? 'text-white/70' : 'text-slate-700')}>
                                    {button.type === 'URL' ? '🔗 URL Button' : 
                                     button.type === 'PHONE' ? '📞 Phone Button' : 
                                     button.type === 'CATALOG' ? '🛍️ Catalog' :
                                     button.type === 'MPM' ? '🛍️ Products (MPM)' :
                                     '📋 Copy Code'}
                                </span>
                                {!disabled && (
                                    <button
                                        onClick={() => removeCTAButton(button.id)}
                                        className="p-1 rounded hover:bg-red-500/10 text-red-500 transition-colors"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                            <Input
                                isDarkMode={isDarkMode}
                                type="text"
                                value={button.label}
                                onChange={(e) => updateCTAButton(button.id, 'label', e.target.value.slice(0, 25))}
                                placeholder="Button Label (max 25 chars)"
                                error={ctaErrors && ctaErrors[index]?.label?.message}
                                disabled={disabled}
                            />
                            {button.type === 'PHONE' ? (
                                <div className="space-y-2">
                                    <div className="flex gap-2">
                                        <div className="w-[180px] shrink-0">
                                            <Select
                                                isDarkMode={isDarkMode}
                                                label="Code"
                                                value={button.value.split(' ')[0] || '+91'}
                                                onChange={(val: string) => {
                                                    const parts = button.value.split(' ');
                                                    const num = parts.slice(1).join(' ');
                                                    updateCTAButton(button.id, 'value', `${val} ${num}`);
                                                }}
                                                options={COUNTRY_CODES}
                                                disabled={disabled}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <Input
                                                isDarkMode={isDarkMode}
                                                label="Mobile Number"
                                                type="text"
                                                value={button.value.split(' ').slice(1).join(' ') || ''}
                                                onChange={(e) => {
                                                    const parts = button.value.split(' ');
                                                    const cc = parts[0] || '';
                                                    updateCTAButton(button.id, 'value', `${cc} ${e.target.value}`);
                                                }}
                                                placeholder="e.g. 9876543210"
                                                variant="secondary"
                                                error={ctaErrors?.[index]?.value?.message?.toLowerCase().includes('phone') || ctaErrors?.[index]?.value?.message?.toLowerCase().includes('digit') ? ctaErrors[index].value.message : undefined}
                                                disabled={disabled}
                                            />
                                        </div>
                                    </div>
                                    {/* The error message is now handled by the Input above, but we keep this as a fallback for visibility if needed */}
                                    {(!ctaErrors?.[index]?.value?.message && ctaErrors?.[index]?.label?.message) && (
                                        <p className="text-[10px] text-red-500 ml-1">
                                            {ctaErrors[index].label.message}
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <Input
                                    isDarkMode={isDarkMode}
                                    type="text"
                                    value={button.value}
                                    onChange={(e) => updateCTAButton(button.id, 'value', e.target.value)}
                                placeholder={
                                        button.type === 'URL' ? 'https://example.com' :
                                            button.type === 'COPY_CODE' ? 'CODE123' :
                                            button.type === 'CATALOG' ? 'Catalog Value / ID' :
                                            button.type === 'MPM' ? 'MPM Value' :
                                            'Value'
                                    }
                                    disabled={disabled}
                                    error={ctaErrors && ctaErrors[index]?.value?.message}
                                />
                            )}
                            <span className={cn("text-[10px]", isDarkMode ? 'text-white/40' : 'text-slate-500')}>
                                {button.label.length}/25 characters
                                {button.type === 'PHONE' && " • Use international format"}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* Quick Replies Section */}
            {showQuickReplies && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h4 className={cn("text-xs font-bold uppercase tracking-wide", isDarkMode ? 'text-white/60' : 'text-slate-600')}>
                            Quick Replies
                        </h4>
                        {!disabled && (
                            <button
                                onClick={addQuickReply}
                                disabled={quickReplies.length >= 3}
                                className={cn(
                                    "py-1.5 px-3 rounded-lg border text-xs font-semibold transition-all flex items-center gap-1",
                                    isDarkMode
                                        ? 'bg-white/5 border-white/10 text-white hover:bg-white/10 disabled:opacity-40'
                                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40'
                                )}
                            >
                                <Plus size={12} />
                                Add Reply ({quickReplies.length}/3)
                            </button>
                        )}
                    </div>

                    {quickReplies.map((reply, index) => (
                        <div key={index} className="flex gap-2 items-center">
                            <div className="flex-1">
                                <Input
                                    isDarkMode={isDarkMode}
                                    type="text"
                                    value={reply}
                                    onChange={(e) => updateQuickReply(index, e.target.value)}
                                    placeholder={`Quick Reply ${index + 1}`}
                                    maxLength={25}
                                    disabled={disabled}
                                />
                            </div>
                            {!disabled && (
                                <button
                                    onClick={() => removeQuickReply(index)}
                                    className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            )}
                            <span className={cn("text-xs min-w-[40px]", isDarkMode ? 'text-white/40' : 'text-slate-500')}>
                                {reply.length}/25
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
