
"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface CheckboxProps {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    disabled?: boolean;
    className?: string;
}

export const Checkbox = ({
    checked,
    onCheckedChange,
    disabled = false,
    className,
    ...props
}: CheckboxProps & Omit<React.HTMLAttributes<HTMLButtonElement>, 'onCheckedChange'>) => {
    return (
        <button
            type="button"
            role="checkbox"
            aria-checked={checked}
            disabled={disabled}
            onClick={() => !disabled && onCheckedChange(!checked)}
            className={cn(
                "w-4 h-4 rounded border-2 flex items-center justify-center transition-all",
                checked
                    ? "bg-emerald-500 border-emerald-500"
                    : "bg-transparent border-slate-300 hover:border-emerald-500",
                disabled && "opacity-50 cursor-not-allowed",
                className
            )}
            {...props}
        >
            {checked && <Check size={12} className="text-white" strokeWidth={3} />}
        </button>
    );
};
