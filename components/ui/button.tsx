"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "ghost" | "outline" | "destructive" | "secondary" | "link";
    size?: "default" | "sm" | "lg" | "icon";
    asChild?: boolean;
}

const variantStyles: Record<string, string> = {
    default:
        "bg-[#00E599] text-black hover:bg-[#00c985] shadow",
    ghost:
        "bg-transparent hover:bg-white/10 text-inherit shadow-none",
    outline:
        "border border-[#2a2a2a] bg-transparent hover:bg-white/5 text-inherit",
    destructive:
        "bg-red-500 text-white hover:bg-red-600 shadow",
    secondary:
        "bg-[#1a1a1a] text-white hover:bg-[#252525] shadow",
    link:
        "underline-offset-4 hover:underline bg-transparent shadow-none text-[#00E599] p-0 h-auto",
};

const sizeStyles: Record<string, string> = {
    default: "h-9 px-4 py-2 text-sm",
    sm: "h-8 rounded-md px-3 text-xs",
    lg: "h-11 rounded-md px-8 text-base",
    icon: "h-9 w-9 p-0",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            variant = "default",
            size = "default",
            asChild = false,
            children,
            ...props
        },
        ref
    ) => {
        if (asChild && React.isValidElement(children)) {
            return React.cloneElement(
                children as React.ReactElement<React.HTMLAttributes<HTMLElement>>,
                {
                    className: cn(
                        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00E599]/50 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
                        variantStyles[variant] ?? variantStyles.default,
                        sizeStyles[size] ?? sizeStyles.default,
                        className,
                        (children as React.ReactElement<React.HTMLAttributes<HTMLElement>>).props.className
                    ),
                }
            );
        }

        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00E599]/50 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
                    variantStyles[variant] ?? variantStyles.default,
                    sizeStyles[size] ?? sizeStyles.default,
                    className
                )}
                {...props}
            >
                {children}
            </button>
        );
    }
);

Button.displayName = "Button";
