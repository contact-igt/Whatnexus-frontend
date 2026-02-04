"use client";

import { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp, Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { MessageStyle, OptimizationGoal } from './template-types';

interface AIGeneratorSectionProps {
    isDarkMode: boolean;
    onGenerate: (prompt: string, style: MessageStyle, goal: OptimizationGoal, category: string) => Promise<void>;
    onGenerateTitle?: (prompt: string) => Promise<void>;
    generationsLeft?: number;
}

export const AIGeneratorSection = ({
    isDarkMode,
    onGenerate,
    onGenerateTitle,
    generationsLeft = 3
}: AIGeneratorSectionProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [messageStyle, setMessageStyle] = useState<MessageStyle>('Normal');
    const [optimizationGoal, setOptimizationGoal] = useState<OptimizationGoal>('Click Rate');
    const [aiCategory, setAiCategory] = useState<'Utility' | 'Marketing'>('Utility');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);

    const messageStyles: MessageStyle[] = ['Normal', 'Poetic', 'Exciting', 'Funny'];
    const optimizationGoals: OptimizationGoal[] = ['Click Rate', 'Reply Rate'];
    const aiCategories: string[] = ['Utility', 'Marketing'];

    const styleIcons: Record<MessageStyle, string> = {
        'Normal': '😊',
        'Poetic': '✨',
        'Exciting': '🎉',
        'Funny': '😄'
    };

    const handleGenerate = async () => {
        if (!prompt.trim() || isGenerating) return;

        setIsGenerating(true);
        try {
            await onGenerate(prompt, messageStyle, optimizationGoal, aiCategory);
        } finally {
            setIsGenerating(false);
        }
    };

    // const handleGenerateTitle = async () => {
    //     if (!prompt.trim() || isGeneratingTitle || !onGenerateTitle) return;

    //     setIsGeneratingTitle(true);
    //     try {
    //         await onGenerateTitle(prompt);
    //     } finally {
    //         setIsGeneratingTitle(false);
    //     }
    // };

    return (
        <div className={cn(
            "rounded-xl border overflow-hidden transition-all",
            isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'
        )}>
            {/* Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={cn(
                    "w-full p-4 flex items-center justify-between transition-colors",
                    isDarkMode ? 'hover:bg-white/5' : 'hover:bg-slate-100'
                )}
            >
                <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-purple-500" />
                    <h3 className={cn("text-sm font-bold", isDarkMode ? 'text-white' : 'text-slate-900')}>
                        Generate with AI
                    </h3>
                    <span className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full font-bold",
                        isDarkMode ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-100 text-purple-600'
                    )}>
                        BETA
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <span className={cn("text-xs", isDarkMode ? 'text-white/50' : 'text-slate-500')}>
                        Create customized variations with AI
                    </span>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
            </button>

            {/* Expanded Content */}
            {isExpanded && (
                <div className={cn(
                    "p-4 pt-0 space-y-4 border-t",
                    isDarkMode ? 'border-white/10' : 'border-slate-200'
                )}>
                    {/* Prompt Input */}
                    <div className='mt-3'>
                        <Textarea
                            isDarkMode={isDarkMode}
                            label="Write your prompt"
                            required
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g. Please generate a promotional message to give a discount of 20% off on our product line."
                            rows={3}
                            maxLength={1024}
                            showCharCount
                        />
                        <div className="flex justify-between mt-2">
                            {/* Suitable Title Generator Button */}
                            {/* {onGenerateTitle && (
                                <button
                                    onClick={handleGenerateTitle}
                                    disabled={!prompt.trim() || isGeneratingTitle}
                                    className={cn(
                                        "text-xs font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all",
                                        isDarkMode
                                            ? 'border-purple-500/30 text-purple-400 hover:bg-purple-500/10'
                                            : 'border-purple-200 text-purple-600 hover:bg-purple-50'
                                    )}
                                >
                                    <Wand2 size={12} className={isGeneratingTitle ? 'animate-spin' : ''} />
                                    {isGeneratingTitle ? 'Generating...' : 'Generate Suitable Title'}
                                </button>
                            )} */}
                            {/* <button className={cn(
                                "text-[10px] font-semibold flex items-center gap-1 hover:underline ml-auto",
                                isDarkMode ? 'text-purple-400' : 'text-purple-600'
                            )}>
                                📝 Previous prompts
                            </button> */}
                        </div>
                    </div>

                    {/* Template Category Select */}
                    <div className="space-y-2">
                        <label className={cn("text-xs font-semibold", isDarkMode ? 'text-white/70' : 'text-slate-700')}>
                            Template Focus:
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {aiCategories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setAiCategory(cat as 'Utility' | 'Marketing')}
                                    className={cn(
                                        "py-2 px-3 rounded-lg border text-xs font-semibold transition-all flex items-center justify-center gap-1.5",
                                        aiCategory === cat
                                            ? 'bg-purple-500 text-white border-purple-500 shadow-lg shadow-purple-500/20'
                                            : isDarkMode
                                                ? 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                    )}
                                >
                                    {cat === 'Marketing' ? '📢' : '🛠️'}
                                    <span>{cat}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Message Style */}
                    <div className="space-y-2">
                        <label className={cn("text-xs font-semibold", isDarkMode ? 'text-white/70' : 'text-slate-700')}>
                            Choose your message style:
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {messageStyles.map((style) => (
                                <button
                                    key={style}
                                    onClick={() => setMessageStyle(style)}
                                    className={cn(
                                        "py-2 px-3 rounded-lg border text-xs font-semibold transition-all flex items-center justify-center gap-1.5",
                                        messageStyle === style
                                            ? 'bg-purple-500 text-white border-purple-500 shadow-lg shadow-purple-500/20'
                                            : isDarkMode
                                                ? 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                    )}
                                >
                                    <span>{styleIcons[style]}</span>
                                    <span>{style}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Optimization Goal */}
                    <div className="space-y-2">
                        <label className={cn("text-xs font-semibold", isDarkMode ? 'text-white/70' : 'text-slate-700')}>
                            Optimize your message for:
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {optimizationGoals.map((goal) => (
                                <button
                                    key={goal}
                                    onClick={() => setOptimizationGoal(goal)}
                                    className={cn(
                                        "py-2 px-3 rounded-lg border text-xs font-semibold transition-all flex items-center justify-center gap-1.5",
                                        optimizationGoal === goal
                                            ? 'bg-purple-500 text-white border-purple-500 shadow-lg shadow-purple-500/20'
                                            : isDarkMode
                                                ? 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                    )}
                                >
                                    {goal === 'Click Rate' ? '👆' : '💬'}
                                    <span>{goal}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Generate Button */}
                    <button
                        onClick={handleGenerate}
                        disabled={!prompt.trim() || isGenerating || generationsLeft <= 0}
                        className={cn(
                            "w-full py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2",
                            "bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/20",
                            "hover:shadow-xl hover:shadow-purple-500/30 active:scale-95",
                            "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
                        )}
                    >
                        <Wand2 size={16} className={isGenerating ? 'animate-spin' : ''} />
                        <span>
                            {isGenerating
                                ? 'Generating...'
                                : `Generate`
                            }
                        </span>
                    </button>
                </div>
            )}
        </div>
    );
};
