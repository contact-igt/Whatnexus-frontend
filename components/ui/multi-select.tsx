
"use client";

import { cn } from "@/lib/utils";
import { ChevronDown, X, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

interface MultiSelectProps {
    isDarkMode: boolean;
    label?: string;
    error?: string;
    required?: boolean;
    options: { value: string; label: string }[];
    value?: string[];
    onChange?: (value: string[]) => void;
    className?: string;

    placeholder?: string;
    disabled?: boolean;
    variant?: 'default' | 'secondary';
}

export const MultiSelect = ({
    isDarkMode,
    label,
    error,
    required,
    options,
    value = [],
    onChange,
    className,
    placeholder = "Select options",
    disabled,
    variant = 'default'
}: MultiSelectProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
    const containerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedOptions = options.filter(opt => value.includes(opt.value));

    const toggleOpen = () => {
        if (disabled) return;
        if (isOpen) {
            setIsOpen(false);
        } else {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                setPosition({
                    top: rect.bottom + window.scrollY + 5,
                    left: rect.left + window.scrollX,
                    width: rect.width
                });
            }
            setIsOpen(true);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node) &&
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        const handleScroll = (e: Event) => {
            if (isOpen && dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            window.addEventListener('scroll', handleScroll, true);
            window.addEventListener('resize', handleScroll);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            window.removeEventListener('scroll', handleScroll, true);
            window.removeEventListener('resize', handleScroll);
        };
    }, [isOpen]);

    const handleToggleOption = (optionValue: string) => {
        const newValue = value.includes(optionValue)
            ? value.filter(v => v !== optionValue)
            : [...value, optionValue];
        onChange?.(newValue);
    };

    const handleRemoveOption = (optionValue: string, e: React.MouseEvent) => {
        e.stopPropagation();
        onChange?.(value.filter(v => v !== optionValue));
    };

    return (
        <div className={cn("w-full relative font-sans", className)}>
            {label && (
                <label className={cn(
                    "text-xs font-semibold font-sans mb-2 block ml-1",
                    isDarkMode ? 'text-white/70' : 'text-slate-700'
                )}>
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <div
                ref={containerRef}
                className={cn(
                    "w-full px-4 py-2.5 rounded-xl font-sans text-sm border transition-all cursor-pointer min-h-[42px]",
                    variant === 'default' && (isDarkMode
                        ? 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                        : 'bg-white border-slate-200 text-slate-900 hover:bg-slate-50'),
                    variant === 'secondary' && (isDarkMode
                        ? 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                        : 'bg-white border-slate-200 text-slate-900 hover:bg-slate-50'),
                    isOpen && (isDarkMode ? 'ring-2 ring-emerald-500/30 border-emerald-500/50' : 'ring-2 ring-emerald-500/30 border-emerald-500/50'),
                    error && 'border-red-500 ring-red-500/30',
                    disabled && 'opacity-60 cursor-not-allowed pointer-events-none'
                )}
                onClick={toggleOpen}
            >
                {selectedOptions.length === 0 ? (
                    <div className="flex items-center justify-between">
                        <span className={cn(isDarkMode ? "text-white/30" : "text-slate-400")}>
                            {placeholder}
                        </span>
                        <ChevronDown
                            className={cn(
                                "transition-transform duration-200",
                                isOpen && "rotate-180",
                                isDarkMode ? "text-white/40" : "text-slate-400"
                            )}
                            size={16}
                        />
                    </div>
                ) : (
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex flex-wrap gap-1.5 flex-1">
                            {selectedOptions.map((option) => (
                                <span
                                    key={option.value}
                                    className={cn(
                                        "inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium",
                                        isDarkMode
                                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    )}

                                >
                                    {option.label}
                                    <X
                                        size={12}
                                        className="cursor-pointer hover:opacity-70"
                                        onClick={(e) => handleRemoveOption(option.value, e)}
                                    />
                                </span>
                            ))}
                        </div>
                        <ChevronDown
                            className={cn(
                                "transition-transform duration-200 flex-shrink-0",
                                isOpen && "rotate-180",
                                isDarkMode ? "text-white/40" : "text-slate-400"
                            )}
                            size={16}
                        />
                    </div>
                )}
            </div>

            {isOpen && createPortal(
                <div
                    ref={dropdownRef}
                    style={{
                        top: position.top,
                        left: position.left,
                        width: position.width,
                        position: 'absolute'
                    }}
                    className={cn(
                        "z-[9999] mt-2 rounded-xl border shadow-xl overflow-hidden max-h-60 overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-100",
                        isDarkMode
                            ? "bg-[#1c1c21] border-white/10"
                            : "bg-white border-slate-200"
                    )}
                >
                    {options.map((option) => {
                        const isSelected = value.includes(option.value);
                        return (
                            <div
                                key={option.value}
                                className={cn(
                                    "px-4 py-2.5 font-sans text-sm cursor-pointer flex items-center gap-3 transition-colors",
                                    isDarkMode
                                        ? "text-slate-200 hover:bg-white/5"
                                        : "text-slate-700 hover:bg-slate-50",
                                    isSelected && (isDarkMode ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-600")
                                )}
                                onClick={() => handleToggleOption(option.value)}
                            >
                                <div className="relative flex-shrink-0">
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => { }}
                                        className="sr-only"
                                    />
                                    <div className={cn(
                                        "w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-200",
                                        isDarkMode
                                            ? "bg-slate-800/50 border-slate-600"
                                            : "bg-white/50 border-slate-300",
                                        isSelected && (isDarkMode ? "bg-emerald-500 border-emerald-500" : "bg-emerald-600 border-emerald-600")
                                    )}>
                                        <Check
                                            strokeWidth={3}
                                            className={cn(
                                                "w-3.5 h-3.5 text-white transition-all duration-200",
                                                isSelected ? "opacity-100 scale-100" : "opacity-0 scale-50"
                                            )}
                                        />
                                    </div>
                                </div>
                                <span>{option.label}</span>
                            </div>
                        );
                    })}
                </div>,
                document.body
            )}

            {error && (
                <p className="text-xs text-red-500 mt-1 ml-1">{error}</p>
            )}
        </div>
    );
};
