"use client";

import React, { useEffect, useRef, useCallback } from 'react';
import { cn } from "@/lib/utils";

interface ThemedLoaderProps {
    isDarkMode?: boolean;
    text?: string;
    subtext?: string;
    className?: string;
    showLogo?: boolean;
    /** Signal that data has loaded — bar races to 100% then calls onComplete */
    isComplete?: boolean;
    /** Fired after the 100% hold finishes — parent hides loader */
    onComplete?: () => void;
}

/**
 * Uses requestAnimationFrame for buttery-smooth progress.
 * Phase 1 (waiting): 0→88% over ~4s with deceleration curve
 * Phase 2 (api done): sprint 88→100% in ~250ms then hold 400ms → onComplete
 */
export const ThemedLoader = ({
    isDarkMode = true,
    text = "Loading",
    subtext = "Please wait...",
    className,
    showLogo = true,
    isComplete = false,
    onComplete,
}: ThemedLoaderProps) => {
    const barRef = useRef<HTMLDivElement>(null);
    const numRef = useRef<HTMLSpanElement>(null);
    const subRef = useRef<HTMLParagraphElement>(null);
    const progressRef = useRef(0);
    const rafRef = useRef<number>(0);
    const phaseRef = useRef<'waiting' | 'sprinting' | 'done'>('waiting');
    const startRef = useRef(performance.now());
    const sprintStartRef = useRef(0);
    const sprintFromRef = useRef(0);
    const completeFiredRef = useRef(false);

    // Smooth write — direct DOM for 0 re-renders during animation
    const paint = useCallback((val: number) => {
        progressRef.current = val;
        const rounded = Math.round(val);
        if (barRef.current) barRef.current.style.width = `${val}%`;
        if (numRef.current) numRef.current.textContent = `${rounded}%`;
        if (rounded >= 100 && subRef.current) subRef.current.textContent = 'Ready';
    }, []);

    // Phase 1: deceleration curve  0→88 in ~4s
    const tickWaiting = useCallback((now: number) => {
        const elapsed = now - startRef.current;
        // Asymptotic approach: fast start, slow finish
        // target = 88 * (1 - e^(-elapsed/1800))
        const target = 88 * (1 - Math.exp(-elapsed / 1800));
        paint(Math.min(target, 88));
        if (phaseRef.current === 'waiting') {
            rafRef.current = requestAnimationFrame(tickWaiting);
        }
    }, [paint]);

    // Phase 2: sprint to 100 in ~250ms using ease-out
    const tickSprint = useCallback((now: number) => {
        const elapsed = now - sprintStartRef.current;
        const duration = 250;
        const t = Math.min(elapsed / duration, 1);
        // ease-out cubic
        const eased = 1 - Math.pow(1 - t, 3);
        const val = sprintFromRef.current + (100 - sprintFromRef.current) * eased;
        paint(val);

        if (t < 1) {
            rafRef.current = requestAnimationFrame(tickSprint);
        } else {
            paint(100);
            phaseRef.current = 'done';
            // Hold at 100% briefly then hand off
            setTimeout(() => {
                if (!completeFiredRef.current) {
                    completeFiredRef.current = true;
                    onComplete?.();
                }
            }, 400);
        }
    }, [paint, onComplete]);

    // Start waiting phase on mount
    useEffect(() => {
        startRef.current = performance.now();
        phaseRef.current = 'waiting';
        rafRef.current = requestAnimationFrame(tickWaiting);
        return () => cancelAnimationFrame(rafRef.current);
    }, [tickWaiting]);

    // Transition to sprint when isComplete flips true
    useEffect(() => {
        if (!isComplete || phaseRef.current !== 'waiting') return;
        cancelAnimationFrame(rafRef.current);
        phaseRef.current = 'sprinting';
        sprintStartRef.current = performance.now();
        sprintFromRef.current = progressRef.current;
        rafRef.current = requestAnimationFrame(tickSprint);
    }, [isComplete, tickSprint]);

    return (
        <div className={cn(
            "flex flex-col items-center justify-center p-8 animate-in fade-in zoom-in-95 duration-1000 ease-out",
            className
        )}>
            {showLogo && (
                <div className="relative mb-12 group">
                    <div className="absolute -inset-4 bg-emerald-500/10 rounded-3xl blur-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
                    <div className={cn(
                        "relative w-24 h-24 rounded-3xl flex items-center justify-center font-black text-5xl tracking-tighter shadow-2xl transition-all border-b-4 border-r-4",
                        isDarkMode
                            ? 'bg-white text-zinc-950 border-emerald-500/20 shadow-emerald-500/5'
                            : 'bg-zinc-950 text-white border-emerald-600/30'
                    )}>
                        W<span className="text-emerald-500">.</span>
                    </div>
                </div>
            )}

            <div className="w-72 space-y-5">
                <div className="flex items-center justify-between gap-4 px-0.5">
                    <p className={cn(
                        "text-[13px] font-bold tracking-widest uppercase whitespace-nowrap",
                        isDarkMode ? "text-white/90" : "text-zinc-900"
                    )}>
                        {text}
                    </p>
                    <span
                        ref={numRef}
                        className={cn(
                            "text-[24px] font-black tabular-nums tracking-tight ml-3",
                            isDarkMode ? "text-emerald-400" : "text-emerald-600"
                        )}
                    >
                        0%
                    </span>
                </div>

                <div className={cn(
                    "h-2 w-full rounded-full overflow-hidden",
                    isDarkMode ? "bg-white/10" : "bg-zinc-200"
                )}>
                    <div
                        ref={barRef}
                        className="h-full rounded-full"
                        style={{
                            width: '0%',
                            background: 'linear-gradient(90deg, #10b981 0%, #34d399 50%, #10b981 100%)',
                            backgroundSize: '200% 100%',
                            animation: 'shimmer 1.5s ease-in-out infinite',
                        }}
                    />
                </div>

                {subtext && (
                    <p
                        ref={subRef}
                        className={cn(
                            "text-[11px] font-medium tracking-tight text-center",
                            isDarkMode ? "text-zinc-500" : "text-zinc-400"
                        )}
                    >
                        {subtext}
                    </p>
                )}
            </div>

            <style jsx>{`
                @keyframes shimmer {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
            `}</style>
        </div>
    );
};
