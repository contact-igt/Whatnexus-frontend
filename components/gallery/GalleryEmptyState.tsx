"use client";

import React from "react";
import { Upload, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { FilterType } from "./types";

interface Props {
  filterType:    FilterType;
  isDarkMode:    boolean;
  onUploadClick: () => void;
}

const EMPTY_MESSAGES: Record<FilterType, { title: string; subtitle: string }> = {
  all:      { title: "No media assets yet",   subtitle: "Upload your first file to get started." },
  image:    { title: "No images found",        subtitle: "Try uploading an image or clearing filters." },
  video:    { title: "No videos found",        subtitle: "Try uploading a video or clearing filters." },
  document: { title: "No documents found",     subtitle: "Try uploading a document or clearing filters." },
};

export function GalleryEmptyState({ filterType, isDarkMode, onUploadClick }: Props) {
  const msg = EMPTY_MESSAGES[filterType];

  return (
    <div className="flex flex-col items-center justify-center py-24 gap-6 text-center select-none">
      {/* Animated illustration */}
      <div className="relative">
        <div
          className={cn(
            "w-28 h-28 rounded-3xl flex items-center justify-center",
            isDarkMode ? "bg-white/[0.04] border border-white/[0.08]" : "bg-slate-100 border border-slate-200"
          )}
        >
          <ImageIcon
            className={cn("w-12 h-12", isDarkMode ? "text-white/20" : "text-slate-300")}
            strokeWidth={1}
          />
        </div>
        {/* Floating dot decorations */}
        <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-emerald-500/30 animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="absolute -bottom-2 -left-2 w-3 h-3 rounded-full bg-violet-500/30 animate-bounce" style={{ animationDelay: "200ms" }} />
      </div>

      <div className="space-y-1.5">
        <p className={cn("text-base font-semibold", isDarkMode ? "text-white/80" : "text-slate-800")}>
          {msg.title}
        </p>
        <p className={cn("text-sm", isDarkMode ? "text-white/35" : "text-slate-500")}>
          {msg.subtitle}
        </p>
      </div>

      <button
        type="button"
        onClick={onUploadClick}
        className={cn(
          "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all",
          "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
        )}
      >
        <Upload className="w-4 h-4" />
        Upload a file
      </button>
    </div>
  );
}
