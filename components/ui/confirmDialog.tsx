"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "danger" | "warning";
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog = ({
  open,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  const { isDarkMode } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isLoading) {
        onCancel();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, isLoading, onCancel]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const confirmButtonClass = useMemo(() => {
    if (variant === "danger") {
      return "bg-red-600 hover:bg-red-700 text-white";
    }
    if (variant === "warning") {
      return "bg-amber-600 hover:bg-amber-700 text-white";
    }
    return "bg-emerald-600 hover:bg-emerald-700 text-white";
  }, [variant]);

  const iconClass = useMemo(() => {
    if (variant === "danger") return "text-red-500";
    if (variant === "warning") return "text-amber-500";
    return "text-emerald-500";
  }, [variant]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close confirmation dialog"
        onClick={() => {
          if (!isLoading) onCancel();
        }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative z-10 w-full max-w-md rounded-xl border shadow-2xl",
          isDarkMode ? "bg-[#1c1c21] border-white/10" : "bg-white border-slate-200",
        )}
      >
        <div className="p-6 space-y-3">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "shrink-0 p-2 rounded-lg",
                isDarkMode ? "bg-white/5" : "bg-slate-100",
              )}
            >
              <AlertTriangle size={18} className={iconClass} />
            </div>

            <div className="space-y-1">
              <h2
                className={cn(
                  "text-base font-semibold",
                  isDarkMode ? "text-white" : "text-slate-900",
                )}
              >
                {title}
              </h2>
              {description ? (
                <p
                  className={cn(
                    "text-sm",
                    isDarkMode ? "text-white/65" : "text-slate-600",
                  )}
                >
                  {description}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <div
          className={cn(
            "px-6 pb-6 pt-2 flex items-center justify-end gap-2",
            isDarkMode ? "border-white/10" : "border-slate-200",
          )}
        >
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              isDarkMode
                ? "bg-white/10 text-white hover:bg-white/15"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200",
              isLoading && "opacity-60 cursor-not-allowed",
            )}
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-semibold min-w-[120px] inline-flex items-center justify-center gap-2 transition-colors",
              confirmButtonClass,
              isLoading && "opacity-60 cursor-not-allowed",
            )}
          >
            {isLoading ? <Loader2 size={14} className="animate-spin" /> : null}
            {isLoading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

