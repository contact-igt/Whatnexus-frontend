
"use client";

import { cn } from "@/lib/utils";
import { ChevronDown, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

interface SelectProps {
    isDarkMode: boolean;
    label?: string;
    error?: string;
    required?: boolean;
    options: { value: string; label: string }[];
    value?: string;
    onChange?: (value: any) => void;
    className?: string;
    placeholder?: string;
    disabled?: boolean;
}

export const Select = ({
    isDarkMode,
    label,
    error,
    required,
    options,
    value,
    onChange,
    className,
    placeholder = "Select an option",
    disabled
}: SelectProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
    const containerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

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

        const handleScroll = () => {
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

    const handleSelect = (optionValue: string) => {
        onChange?.(optionValue);
        setIsOpen(false);
    };

    return (
        <div className={cn("w-full relative", className)}>
            {label && (
                <label className={cn(
                    "text-xs font-semibold mb-2 block ml-1",
                    isDarkMode ? 'text-white/70' : 'text-slate-700'
                )}>
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <div
                ref={containerRef}
                className={cn(
                    "w-full px-4 py-2.5 rounded-xl text-sm border transition-all flex items-center justify-between cursor-pointer",
                    isDarkMode
                        ? 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                        : 'bg-white border-slate-200 text-slate-900 hover:bg-slate-50',
                    isOpen && (isDarkMode ? 'ring-2 ring-emerald-500/30 border-emerald-500/50' : 'ring-2 ring-emerald-500/30 border-emerald-500/50'),
                    error && 'border-red-500 ring-red-500/30',
                    disabled && 'opacity-60 cursor-not-allowed pointer-events-none'
                )}
                onClick={toggleOpen}
            >
                <span className={cn(!selectedOption && (isDarkMode ? "text-white/30" : "text-slate-400"))}>
                    {selectedOption ? selectedOption.label : placeholder}
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
                    {options.map((option) => (
                        <div
                            key={option.value}
                            className={cn(
                                "px-4 py-2.5 text-sm cursor-pointer flex items-center justify-between transition-colors",
                                isDarkMode
                                    ? "text-slate-200 hover:bg-white/5"
                                    : "text-slate-700 hover:bg-slate-50",
                                option.value === value && (isDarkMode ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-600")
                            )}
                            onClick={() => handleSelect(option.value)}
                        >
                            <span>{option.label}</span>
                            {option.value === value && (
                                <Check size={16} className={isDarkMode ? "text-emerald-400" : "text-emerald-600"} />
                            )}
                        </div>
                    ))}
                </div>,
                document.body
            )}

            {error && (
                <p className="text-xs text-red-500 mt-1 ml-1">{error}</p>
            )}
        </div>
    );
};
