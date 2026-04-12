"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface Props { isDarkMode: boolean; }

// ─── Grid Card Skeleton ───────────────────────────────────────────────────────

function GridSkeleton({ isDarkMode }: Props) {
  return (
    <div
      className={cn(
        "rounded-xl overflow-hidden animate-pulse",
        isDarkMode ? "bg-white/[0.04] border border-white/[0.07]" : "bg-slate-100 border border-slate-200"
      )}
    >
      <div className={cn("aspect-square", isDarkMode ? "bg-white/[0.06]" : "bg-slate-200")} />
      <div className="p-3 space-y-2">
        <div className={cn("h-2.5 rounded-full w-4/5", isDarkMode ? "bg-white/10" : "bg-slate-300")} />
        <div className={cn("h-2 rounded-full w-2/5",   isDarkMode ? "bg-white/[0.06]" : "bg-slate-200")} />
      </div>
    </div>
  );
}

// ─── List Row Skeleton ────────────────────────────────────────────────────────

function ListSkeleton({ isDarkMode }: Props) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 p-4 rounded-xl animate-pulse",
        isDarkMode ? "bg-white/[0.03] border border-white/[0.06]" : "bg-slate-50 border border-slate-200"
      )}
    >
      <div className={cn("w-10 h-10 rounded-lg flex-shrink-0", isDarkMode ? "bg-white/10" : "bg-slate-200")} />
      <div className="flex-1 space-y-2">
        <div className={cn("h-2.5 rounded-full w-2/5", isDarkMode ? "bg-white/10" : "bg-slate-300")} />
        <div className={cn("h-2 rounded-full w-1/4",   isDarkMode ? "bg-white/[0.06]" : "bg-slate-200")} />
      </div>
      <div className={cn("h-2 rounded-full w-16",      isDarkMode ? "bg-white/[0.06]" : "bg-slate-200")} />
      <div className={cn("h-2 rounded-full w-20",      isDarkMode ? "bg-white/[0.06]" : "bg-slate-200")} />
    </div>
  );
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export function GridSkeletons({ isDarkMode, count = 8 }: Props & { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => <GridSkeleton key={i} isDarkMode={isDarkMode} />)}
    </div>
  );
}

export function ListSkeletons({ isDarkMode, count = 6 }: Props & { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => <ListSkeleton key={i} isDarkMode={isDarkMode} />)}
    </div>
  );
}
