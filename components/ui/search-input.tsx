
"use client";

import { cn } from "@/lib/utils";
import { Search as SearchIcon } from "lucide-react";

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    isDarkMode: boolean;
    onSearch?: (value: string) => void;
}

export const SearchInput = ({
    isDarkMode,
    onSearch,
    className,
    value,
    onChange,
    ...props
}: SearchInputProps) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (onChange) {
            onChange(e);
        }
        if (onSearch) {
            onSearch(e.target.value);
        }
    };

    return (
        <div className={cn("relative flex-1 min-w-[250px]", className)}>
            <SearchIcon
                className={cn(
                    "absolute left-3 top-1/2 -translate-y-1/2",
                    isDarkMode ? "text-white/30" : "text-slate-400"
                )}
                size={18}
            />
            <input
                type="text"
                value={value}
                onChange={handleChange}
                {...props}
                className={cn(
                    "w-full pl-10 pr-4 py-2 rounded-xl text-sm border transition-all focus:outline-none",
                    isDarkMode
                        ? 'bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:ring-2 focus:ring-emerald-500/30'
                        : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/30'
                )}
            />
        </div>
    );
};
