"use client";

import { useState } from 'react';
import { Zap, Plus, X, Link, Phone, Copy, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
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
}

export const InteractiveActionsSection = ({
    isDarkMode,
    actionType,
    onActionTypeChange,
    ctaButtons,
    onCTAButtonsChange,
    quickReplies,
    onQuickRepliesChange,
    ctaErrors = [],
    disabled = false
}: InteractiveActionsSectionProps) => {

    const addCTAButton = (type: CTAType) => {
        if (type === 'URL' && ctaButtons.filter(b => b.type === 'URL').length >= 2) {
            return; // Max 2 URL buttons
        }
        if (type === 'PHONE' && ctaButtons.some(b => b.type === 'PHONE')) {
            return; // Max 1 phone button
        }
        if (type === 'COPY_CODE' && ctaButtons.some(b => b.type === 'COPY_CODE')) {
            return; // Max 1 copy code button
        }
        if (type === 'CATALOG' && ctaButtons.some(b => b.type === 'CATALOG')) {
            return; // Max 1 catalog button
        }
        if (type === 'MPM' && ctaButtons.some(b => b.type === 'MPM')) {
            return; // Max 1 MPM button
        }

        const newButton: CTAButton = {
            id: generateId(),
            type,
            label: type === 'URL' ? 'Visit Website' : 
                   type === 'PHONE' ? 'Call Us' : 
                   type === 'COPY_CODE' ? 'Copy Code' :
                   type === 'CATALOG' ? 'View Catalog' : 'View Products',
            value: type === 'PHONE' ? '+ ' : ''
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
        if (quickReplies.length >= 10) return; // Max 10 quick replies
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

    const showCTA = actionType === 'CTA' || actionType === 'All';
    const showQuickReplies = actionType === 'QuickReplies' || actionType === 'All';

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Zap size={16} className="text-emerald-500" />
                <h3 className={cn("text-sm font-bold", isDarkMode ? 'text-white' : 'text-slate-900')}>
                    Interactive Actions
                </h3>
            </div>

            <p className={cn("text-xs", isDarkMode ? 'text-white/50' : 'text-slate-500')}>
                In addition to your message, you can send actions with your message.
                Maximum 25 characters are allowed in CTA button title & Quick Replies.
            </p>

            {/* Action Type Radio Group */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {(['None', 'CTA', 'QuickReplies', 'All'] as InteractiveActionType[]).map((type) => (
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
                                disabled={ctaButtons.some(b => b.type === 'PHONE')}
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
                                        <div className="w-[100px] shrink-0">
                                            <Input
                                                isDarkMode={isDarkMode}
                                                type="text"
                                                value={button.value.split(' ')[0] || ''}
                                                onChange={(e) => {
                                                    const parts = button.value.split(' ');
                                                    const num = parts.slice(1).join(' ');
                                                    updateCTAButton(button.id, 'value', `${e.target.value} ${num}`);
                                                }}
                                                placeholder="+91"
                                                variant="secondary"
                                                error={ctaErrors?.[index]?.value?.message?.toLowerCase().includes('country') ? ctaErrors[index].value.message : undefined}
                                                disabled={disabled}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <Input
                                                isDarkMode={isDarkMode}
                                                type="text"
                                                value={button.value.split(' ').slice(1).join(' ') || ''}
                                                onChange={(e) => {
                                                    const parts = button.value.split(' ');
                                                    const cc = parts[0] || '';
                                                    updateCTAButton(button.id, 'value', `${cc} ${e.target.value}`);
                                                }}
                                                placeholder="Mobile Number"
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
                                            'No value required for this button type'
                                    }
                                    disabled={disabled || button.type === 'CATALOG' || button.type === 'MPM'}
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
                                disabled={quickReplies.length >= 10}
                                className={cn(
                                    "py-1.5 px-3 rounded-lg border text-xs font-semibold transition-all flex items-center gap-1",
                                    isDarkMode
                                        ? 'bg-white/5 border-white/10 text-white hover:bg-white/10 disabled:opacity-40'
                                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40'
                                )}
                            >
                                <Plus size={12} />
                                Add Reply ({quickReplies.length}/10)
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
