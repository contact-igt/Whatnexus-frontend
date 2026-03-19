
"use client";

import { cn } from "@/lib/utils";
import { ChevronDown, Check, Search } from "lucide-react";
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
    const [searchTerm, setSearchTerm] = useState("");
    const [position, setPosition] = useState({ top: 0, left: 0, width: 0, maxHeight: 240 });
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
        } else {
            setSearchTerm(""); // Reset search term on close
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            window.removeEventListener('scroll', handleScroll, true);
            window.removeEventListener('resize', handleScroll);
        };
    }, [isOpen]);

    const filteredOptions = options.filter(opt => 
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (optionValue: string) => {
        onChange?.(optionValue);
        setIsOpen(false);
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
                    "w-full px-4 py-2.5 rounded-xl font-sans text-sm border transition-all flex items-center justify-between cursor-pointer",
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
                        maxHeight: position.maxHeight,
                        position: 'fixed'
                    }}
                    className={cn(
                        "z-[999999] rounded-xl border shadow-xl overflow-hidden overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-100",
                        isDarkMode
                            ? "bg-[#1c1c21] border-white/10"
                            : "bg-white border-slate-200"
                    )}
                >
                    {/* Search Bar */}
                    <div className={cn(
                        "sticky top-0 z-10 px-3 py-2 border-b backdrop-blur-md",
                        isDarkMode ? "bg-[#1c1c21]/80 border-white/10" : "bg-white/80 border-slate-100"
                    )}>
                        <div className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-lg border",
                            isDarkMode ? "bg-white/5 border-white/10 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                        )}>
                            <Search size={14} className={isDarkMode ? "text-white/40" : "text-slate-400"} />
                            <input 
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-transparent border-none outline-none text-xs w-full placeholder:opacity-50"
                                autoFocus
                            />
                        </div>
                    </div>

                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((option) => (
                            <div
                                key={option.value}
                                className={cn(
                                    "px-4 py-2.5 font-sans text-sm cursor-pointer flex items-center justify-between transition-colors",
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
                        ))
                    ) : (
                        <div className={cn(
                            "px-4 py-8 text-center text-xs opacity-50 italic",
                            isDarkMode ? "text-white" : "text-slate-500"
                        )}>
                            No options found
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
