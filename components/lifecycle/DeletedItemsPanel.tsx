"use client";
/**
 * DeletedItemsPanel.tsx
 *
 * Generic "Trash" panel used by every Tier 1 resource.
 * Renders a list of soft-deleted items with:
 *  - Item name + deleted date
 *  - "N days left" badge (red when < 3)
 *  - Restore button
 *  - Permanently delete button (admin only)
 *  - Empty state
 *
 * Usage:
 *   <DeletedItemsPanel
 *     items={data?.items}
 *     isLoading={isLoading}
 *     onRestore={(item) => restoreMutation.mutate(item.id)}
 *     onHardDelete={(item) => hardDeleteMutation.mutate(item.id)}
 *     getItemName={(item) => item.title}
 *     isAdmin={user.role === "tenant_admin"}
 *   />
 */

import React from "react";
import { RotateCcw, Trash2, Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/components/gallery/types";

export interface DeletedItem {
  id: string | number;
  deleted_at: string;
  created_at: string;
  days_remaining: number;
  can_restore: boolean;
  [key: string]: any;
}

interface Props {
  items: DeletedItem[] | undefined;
  isLoading: boolean;
  isDarkMode?: boolean;
  onRestore: (item: DeletedItem) => void;
  onHardDelete: (item: DeletedItem) => void;
  getItemName: (item: DeletedItem) => string;
  getItemMeta?: (item: DeletedItem) => string;
  isAdmin: boolean;
  /** Label shown in the empty state */
  resourceLabel?: string;
}

const DaysBadge = ({ days, isDarkMode }: { days: number; isDarkMode?: boolean }) => {
  const isCritical = days < 3;
  const isExpired = days === 0;

  if (isExpired) {
    return (
      <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-500 border border-red-500/20">
        <AlertTriangle size={9} strokeWidth={3} />
        Expired
      </span>
    );
  }

  return (
    <span
      className={cn(
        "flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border",
        isCritical
          ? "bg-red-500/15 text-red-500 border-red-500/20 animate-pulse"
          : isDarkMode
            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
            : "bg-amber-50 text-amber-600 border-amber-200",
      )}
    >
      <Clock size={9} strokeWidth={3} />
      {days} day{days !== 1 ? "s" : ""} left
    </span>
  );
};

export function DeletedItemsPanel({
  items,
  isLoading,
  isDarkMode = true,
  onRestore,
  onHardDelete,
  getItemName,
  getItemMeta,
  isAdmin,
  resourceLabel = "items",
}: Props) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className={cn("text-sm", isDarkMode ? "text-white/30" : "text-slate-400")}>
          Loading trash…
        </div>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className={cn(
          "w-14 h-14 rounded-2xl flex items-center justify-center",
          isDarkMode ? "bg-white/5" : "bg-slate-100",
        )}>
          <Trash2 size={24} className={isDarkMode ? "text-white/20" : "text-slate-300"} />
        </div>
        <p className={cn("text-sm font-medium", isDarkMode ? "text-white/40" : "text-slate-500")}>
          No deleted {resourceLabel}
        </p>
        <p className={cn("text-xs text-center max-w-xs", isDarkMode ? "text-white/20" : "text-slate-400")}>
          Deleted {resourceLabel} appear here for 30 days. After that they are permanently removed.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* Header */}
      <div className={cn(
        "flex items-center gap-3 px-4 py-2 text-[10px] font-bold uppercase tracking-wider",
        isDarkMode ? "text-white/25" : "text-slate-400",
      )}>
        <span className="flex-1">Name</span>
        <span className="w-28 hidden sm:block">Deleted</span>
        <span className="w-24">Remaining</span>
        <span className="w-28 text-right">Actions</span>
      </div>

      {items.map((item) => (
        <div
          key={item.id}
          className={cn(
            "flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all",
            isDarkMode
              ? "bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04]"
              : "bg-white border-slate-100 hover:border-slate-200",
          )}
        >
          {/* Icon */}
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
            isDarkMode ? "bg-red-500/10" : "bg-red-50",
          )}>
            <Trash2 size={14} className="text-red-400/70" />
          </div>

          {/* Name + meta */}
          <div className="flex-1 min-w-0">
            <p className={cn(
              "text-[13px] font-semibold truncate",
              isDarkMode ? "text-white/75" : "text-slate-700",
            )}>
              {getItemName(item)}
            </p>
            {getItemMeta && (
              <p className={cn("text-[11px] truncate", isDarkMode ? "text-white/30" : "text-slate-400")}>
                {getItemMeta(item)}
              </p>
            )}
          </div>

          {/* Deleted date */}
          <div className={cn(
            "w-28 text-[11px] hidden sm:block shrink-0",
            isDarkMode ? "text-white/30" : "text-slate-400",
          )}>
            {formatDate(item.deleted_at)}
          </div>

          {/* Days remaining badge */}
          <div className="w-24 shrink-0">
            <DaysBadge days={item.days_remaining} isDarkMode={isDarkMode} />
          </div>

          {/* Actions */}
          <div className="w-28 flex items-center justify-end gap-1.5 shrink-0">
            {item.can_restore && (
              <button
                type="button"
                onClick={() => onRestore(item)}
                title="Restore"
                className={cn(
                  "flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all",
                  isDarkMode
                    ? "text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20"
                    : "text-emerald-600 bg-emerald-50 hover:bg-emerald-100",
                )}
              >
                <RotateCcw size={11} strokeWidth={2.5} />
                Restore
              </button>
            )}

            {isAdmin && (
              <button
                type="button"
                onClick={() => onHardDelete(item)}
                title="Permanently delete"
                className={cn(
                  "p-1.5 rounded-lg transition-all",
                  isDarkMode
                    ? "text-red-400/50 hover:bg-red-500/10 hover:text-red-400"
                    : "text-red-400 hover:bg-red-50 hover:text-red-600",
                )}
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
