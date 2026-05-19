"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { SaaSModule } from "@/services/moduleAccessManagement";

interface TenantModuleOverrideMatrixProps {
  modules: SaaSModule[];
  overrideState: Record<string, boolean>;
  isLoading: boolean;
  disabled?: boolean;
  isDarkMode: boolean;
  onToggle: (moduleId: string, isEnabled: boolean) => void;
}

export const TenantModuleOverrideMatrix = ({
  modules,
  overrideState,
  isLoading,
  disabled = false,
  isDarkMode,
  onToggle,
}: TenantModuleOverrideMatrixProps) => {
  const [search, setSearch] = useState("");

  const filteredModules = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return modules;

    return modules.filter((module) => {
      const haystack = [
        module.module_name,
        module.module_key,
        module.category || "",
        module.module_type,
        module.visibility_type,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [modules, search]);

  const enabledCount = useMemo(() => {
    return modules.reduce((count, module) => {
      if (overrideState[module.module_id]) return count + 1;
      return count;
    }, 0);
  }, [modules, overrideState]);

  if (isLoading) {
    return (
      <div
        className={cn(
          "rounded-xl border p-6 text-sm",
          isDarkMode
            ? "border-white/10 bg-white/5 text-white/60"
            : "border-slate-200 bg-white text-slate-600",
        )}
      >
        Loading tenant module override editor...
      </div>
    );
  }

  if (modules.length === 0) {
    return (
      <div
        className={cn(
          "rounded-xl border p-6 text-sm",
          isDarkMode
            ? "border-white/10 bg-white/5 text-white/60"
            : "border-slate-200 bg-white text-slate-600",
        )}
      >
        No active modules available for tenant overrides.
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl border overflow-hidden",
        isDarkMode ? "border-white/10 bg-white/5" : "border-slate-200 bg-white",
      )}
    >
      <div className={cn("p-4 border-b space-y-3", isDarkMode ? "border-white/10" : "border-slate-200")}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2
            className={cn(
              "text-sm font-bold uppercase tracking-wider",
              isDarkMode ? "text-white/70" : "text-slate-700",
            )}
          >
            Tenant Module Overrides
          </h2>
          <span className={cn("text-xs", isDarkMode ? "text-white/60" : "text-slate-600")}>
            Enabled {enabledCount} / {modules.length}
          </span>
        </div>

        <Input
          isDarkMode={isDarkMode}
          label="Search Modules"
          placeholder="Search by name, key, category, type..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead
            className={cn(
              isDarkMode ? "bg-white/5 border-b border-white/10" : "bg-slate-50 border-b border-slate-200",
            )}
          >
            <tr>
              <th className={cn("px-4 py-3 text-left font-semibold", isDarkMode ? "text-white/70" : "text-slate-700")}>Module</th>
              <th className={cn("px-4 py-3 text-left font-semibold", isDarkMode ? "text-white/70" : "text-slate-700")}>Category</th>
              <th className={cn("px-4 py-3 text-left font-semibold", isDarkMode ? "text-white/70" : "text-slate-700")}>Type</th>
              <th className={cn("px-4 py-3 text-left font-semibold", isDarkMode ? "text-white/70" : "text-slate-700")}>Visibility</th>
              <th className={cn("px-4 py-3 text-left font-semibold", isDarkMode ? "text-white/70" : "text-slate-700")}>Override</th>
            </tr>
          </thead>
          <tbody>
            {filteredModules.length === 0 ? (
              <tr>
                <td colSpan={5} className={cn("px-4 py-8 text-center", isDarkMode ? "text-white/60" : "text-slate-600")}>
                  No modules matched your search.
                </td>
              </tr>
            ) : (
              filteredModules.map((module) => {
                const checked = Boolean(overrideState[module.module_id]);
                const isLocked = module.is_system_core;
                const toggleDisabled = disabled || isLocked;

                return (
                  <tr key={module.module_id} className={cn("border-t", isDarkMode ? "border-white/10" : "border-slate-200")}>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className={cn("font-medium", isDarkMode ? "text-white" : "text-slate-900")}>{module.module_name}</span>
                        <span className={cn("text-xs", isDarkMode ? "text-white/50" : "text-slate-500")}>{module.module_key}</span>
                      </div>
                    </td>
                    <td className={cn("px-4 py-3", isDarkMode ? "text-white/80" : "text-slate-700")}>{module.category || "-"}</td>
                    <td className={cn("px-4 py-3", isDarkMode ? "text-white/80" : "text-slate-700")}>
                      <div className="flex items-center gap-2">
                        <span>{module.module_type}</span>
                        {module.is_system_core && (
                          <span className="px-2 py-0.5 text-[10px] rounded-md font-semibold bg-emerald-500/15 text-emerald-500">
                            Core
                          </span>
                        )}
                      </div>
                    </td>
                    <td className={cn("px-4 py-3", isDarkMode ? "text-white/80" : "text-slate-700")}>{module.visibility_type}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={checked}
                          disabled={toggleDisabled}
                          onCheckedChange={(value) => onToggle(module.module_id, value)}
                        />
                        {isLocked && (
                          <span className={cn("text-xs", isDarkMode ? "text-amber-300" : "text-amber-700")}>
                            Locked (system core)
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
