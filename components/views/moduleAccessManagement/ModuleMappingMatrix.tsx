"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { SaaSModule } from "@/services/moduleAccessManagement";

interface ModuleMappingMatrixProps {
  modules: SaaSModule[];
  mappings: Record<string, boolean>;
  isLoading: boolean;
  onChange: (moduleId: string, isEnabled: boolean) => void;
  disabled?: boolean;
  isDarkMode: boolean;
}

export const ModuleMappingMatrix = ({
  modules,
  mappings,
  isLoading,
  onChange,
  disabled = false,
  isDarkMode,
}: ModuleMappingMatrixProps) => {
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
      if (mappings[module.module_id]) return count + 1;
      return count;
    }, 0);
  }, [modules, mappings]);

  if (isLoading) {
    return (
      <div className={cn("rounded-xl border p-6 text-sm", isDarkMode ? "border-white/10 bg-white/5 text-white/60" : "border-slate-200 bg-white text-slate-600")}>
        Loading module mapping...
      </div>
    );
  }

  if (modules.length === 0) {
    return (
      <div className={cn("rounded-xl border p-6 text-sm", isDarkMode ? "border-white/10 bg-white/5 text-white/60" : "border-slate-200 bg-white text-slate-600")}>
        No modules available for mapping.
      </div>
    );
  }

  return (
    <div className={cn("rounded-xl border overflow-hidden", isDarkMode ? "border-white/10 bg-white/5" : "border-slate-200 bg-white")}>
      <div className={cn("p-4 border-b space-y-3", isDarkMode ? "border-white/10" : "border-slate-200")}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className={cn("text-sm font-bold uppercase tracking-wider", isDarkMode ? "text-white/70" : "text-slate-700")}>
            Module Mapping Matrix
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
          <thead className={cn(isDarkMode ? "bg-white/5 border-b border-white/10" : "bg-slate-50 border-b border-slate-200")}>
            <tr>
              <th className={cn("px-4 py-3 text-left font-semibold", isDarkMode ? "text-white/70" : "text-slate-700")}>Module</th>
              <th className={cn("px-4 py-3 text-left font-semibold", isDarkMode ? "text-white/70" : "text-slate-700")}>Category</th>
              <th className={cn("px-4 py-3 text-left font-semibold", isDarkMode ? "text-white/70" : "text-slate-700")}>Type</th>
              <th className={cn("px-4 py-3 text-left font-semibold", isDarkMode ? "text-white/70" : "text-slate-700")}>Visibility</th>
              <th className={cn("px-4 py-3 text-left font-semibold", isDarkMode ? "text-white/70" : "text-slate-700")}>Status</th>
              <th className={cn("px-4 py-3 text-center font-semibold", isDarkMode ? "text-white/70" : "text-slate-700")}>Enabled</th>
            </tr>
          </thead>
          <tbody>
            {filteredModules.length === 0 ? (
              <tr>
                <td colSpan={6} className={cn("px-4 py-8 text-center", isDarkMode ? "text-white/60" : "text-slate-600")}>
                  No modules matched your search.
                </td>
              </tr>
            ) : (
              filteredModules.map((module) => {
                const isEnabled = Boolean(mappings[module.module_id]);
                const toggleDisabled = disabled || !module.is_active;

                return (
                  <tr
                    key={module.module_id}
                    className={cn("border-t", isDarkMode ? "border-white/10" : "border-slate-200")}
                  >
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className={cn("font-medium", isDarkMode ? "text-white" : "text-slate-900")}>
                          {module.module_name}
                        </span>
                        <span className={cn("text-xs", isDarkMode ? "text-white/50" : "text-slate-500")}>
                          {module.module_key}
                        </span>
                      </div>
                    </td>
                    <td className={cn("px-4 py-3", isDarkMode ? "text-white/80" : "text-slate-700")}>
                      {module.category || "-"}
                    </td>
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
                    <td className={cn("px-4 py-3", isDarkMode ? "text-white/80" : "text-slate-700")}>
                      {module.visibility_type}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "px-2 py-1 text-xs rounded-lg font-semibold",
                          module.is_active
                            ? "bg-emerald-500/15 text-emerald-500"
                            : "bg-amber-500/15 text-amber-500",
                        )}
                      >
                        {module.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center">
                        <Checkbox
                          checked={isEnabled}
                          disabled={toggleDisabled}
                          onCheckedChange={(checked) => onChange(module.module_id, checked)}
                        />
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
