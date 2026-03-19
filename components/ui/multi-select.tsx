
"use client";

import { cn } from "@/lib/utils";
import { ChevronDown, X, Check, Edit2, Trash2 } from "lucide-react";
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
    onEditOption?: (value: string, e: React.MouseEvent) => void;
    onDeleteOption?: (value: string, e: React.MouseEvent) => void;
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
    variant = 'default',
    onEditOption,
    onDeleteOption
}: MultiSelectProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [position, setPosition] = useState({ top: 0, left: 0, width: 0, maxHeight: 240 });
    const containerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedOptions = options.filter(opt => value.includes(opt.value));
    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opt.value.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleOpen = () => {
        if (disabled) return;
        if (isOpen) {
            setIsOpen(false);
        } else {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                const spaceBelow = window.innerHeight - rect.bottom - 10;
                const spaceAbove = rect.top - 10;
                
                let maxHeight = Math.min(240, spaceBelow); 
                let topOffset = rect.bottom + 5;

                // Drop upwards if there's very little space below and more space above
                if (spaceBelow < 150 && spaceAbove > spaceBelow) {
                    maxHeight = Math.min(240, spaceAbove);
                    topOffset = rect.top - maxHeight - 5;
                }

                setPosition({
                    top: topOffset,
                    left: rect.left,
                    width: rect.width,
                    maxHeight
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

        const handleScroll = (event: Event) => {
            if (dropdownRef.current && dropdownRef.current.contains(event.target as Node)) {
                return;
            }
            if (isOpen) setIsOpen(false);
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
                        maxHeight: position.maxHeight,
                        position: 'fixed'
                    }}
                    className={cn(
                        "z-[999999] rounded-xl border shadow-xl overflow-hidden overflow-y-auto custom-scrollbar animate-in fade-in duration-100",
                        isDarkMode
                            ? "bg-[#1c1c21] border-white/10"
                            : "bg-white border-slate-200"
                    )}
                >
                    <div className={cn(
                        "p-2 border-b sticky top-0 z-10",
                        isDarkMode ? "bg-[#1c1c21] border-white/10" : "bg-white border-slate-100"
                    )}>
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={cn(
                                "w-full px-3 py-1.5 text-xs rounded-lg border focus:outline-none focus:ring-1 focus:ring-emerald-500/50",
                                isDarkMode ? "bg-white/5 border-white/10 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                            )}
                        />
                    </div>
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((option) => {
                            const isSelected = value.includes(option.value);
                            return (
                                <div
                                    key={option.value}
                                    className={cn(
                                        "group px-4 py-2.5 font-sans text-sm cursor-pointer flex items-center gap-3 transition-colors",
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
                                    <div className="flex-1 flex justify-between items-center">
                                        <span>{option.label}</span>
                                        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {onEditOption && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); setIsOpen(false); onEditOption(option.value, e); }}
                                                    className={cn("p-1.5 rounded-md transition-colors", isDarkMode ? "hover:bg-blue-500/20 text-blue-400" : "hover:bg-blue-100 text-blue-600")}
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                            )}
                                            {onDeleteOption && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); setIsOpen(false); onDeleteOption(option.value, e); }}
                                                    className={cn("p-1.5 rounded-md transition-colors", isDarkMode ? "hover:bg-red-500/20 text-red-400" : "hover:bg-red-100 text-red-600")}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className={cn(
                            "px-4 py-8 text-center text-xs opacity-50 italic",
                            isDarkMode ? "text-white" : "text-slate-500"
                        )}>
                            {options.length === 0 ? "No specializations available" : "No results found"}
                        </div>
                    )}
                </div>,
                document.body
            )}

            {error && (
                <p className="text-xs text-red-500 mt-1 ml-1">{error}</p>
            )}
        </div>
    );
};
