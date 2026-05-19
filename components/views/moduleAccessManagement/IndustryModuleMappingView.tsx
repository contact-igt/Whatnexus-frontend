"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";
import { Select } from "@/components/ui/select";
import { ConfirmDialog } from "@/components/ui/confirmDialog";
import { ModuleMappingMatrix } from "./ModuleMappingMatrix";
import {
  useIndustriesQuery,
  useIndustrySaaSModulesQuery,
  usePatchIndustrySaaSModulesMutation,
  useSaaSModulesQuery,
} from "@/hooks/useModuleAccessManagementQuery";
import { toast } from "@/lib/toast";

export const IndustryModuleMappingView = () => {
  const { isDarkMode } = useTheme();
  const [selectedIndustryId, setSelectedIndustryId] = useState("");
  const [mappingState, setMappingState] = useState<Record<string, boolean>>({});
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingMappings, setPendingMappings] = useState<
    { module_id: string; is_enabled: boolean; metadata: Record<string, never> }[]
  >([]);

  const { data: industriesData, isLoading: isIndustriesLoading } = useIndustriesQuery();
  const { data: modulesData, isLoading: isModulesLoading } = useSaaSModulesQuery();
  const {
    data: industryMappingData,
    isLoading: isIndustryMappingLoading,
  } = useIndustrySaaSModulesQuery(selectedIndustryId);

  const { mutate: patchIndustryMappings, isPending: isSaving } =
    usePatchIndustrySaaSModulesMutation();

  const industries = useMemo(() => industriesData?.data || [], [industriesData]);
  const modules = useMemo(() => modulesData?.data || [], [modulesData]);
  const serverMappings = useMemo(
    () => industryMappingData?.data?.mappings || [],
    [industryMappingData],
  );

  useEffect(() => {
    if (!selectedIndustryId || modules.length === 0) {
      setMappingState({});
      return;
    }

    const mappingById = new Map<string, boolean>();
    for (const row of serverMappings) {
      mappingById.set(row.module_id, Boolean(row.is_enabled));
    }

    const next: Record<string, boolean> = {};
    for (const module of modules) {
      next[module.module_id] = mappingById.get(module.module_id) ?? false;
    }

    setMappingState(next);
  }, [selectedIndustryId, modules, serverMappings]);

  const industryOptions = industries.map((industry: any) => ({
    value: industry.industry_id,
    label: `${industry.industry_name} (${industry.industry_id})`,
  }));

  const handleToggleMapping = (moduleId: string, isEnabled: boolean) => {
    setMappingState((prev) => ({
      ...prev,
      [moduleId]: isEnabled,
    }));
  };

  const handleSave = () => {
    if (!selectedIndustryId) {
      toast.error("Please select an industry first");
      return;
    }

    if (isModulesLoading || isIndustryMappingLoading) {
      toast.error("Please wait until modules and mappings finish loading");
      return;
    }

    if (modules.length === 0) {
      toast.error("No modules available to map");
      return;
    }

    const seen = new Set<string>();
    const mappings: { module_id: string; is_enabled: boolean; metadata: Record<string, never> }[] = [];
    for (const module of modules) {
      if (seen.has(module.module_id)) {
        toast.error(`Duplicate module detected: ${module.module_id}`);
        return;
      }
      seen.add(module.module_id);
      mappings.push({
        module_id: module.module_id,
        is_enabled: Boolean(mappingState[module.module_id]),
        metadata: {},
      });
    }

    if (mappings.length !== modules.length) {
      toast.error("Invalid mapping payload. Please refresh and retry.");
      return;
    }

    setPendingMappings(mappings);
    setIsConfirmOpen(true);
  };

  return (
    <div className="h-full overflow-y-auto p-8 space-y-6 max-w-[1400px] mx-auto no-scrollbar pb-32">
      <div className="space-y-2">
        <h1 className={cn("text-3xl font-bold tracking-tight", isDarkMode ? "text-white" : "text-slate-900")}>
          Industry Module Mapping
        </h1>
        <p className={cn("text-sm", isDarkMode ? "text-white/60" : "text-slate-600")}>
          Configure which SaaS modules are enabled per industry.
        </p>
      </div>

      <div className={cn("rounded-xl border p-4", isDarkMode ? "border-white/10 bg-white/5" : "border-slate-200 bg-white")}>
        <Select
          isDarkMode={isDarkMode}
          label="Select Industry"
          value={selectedIndustryId}
          onChange={(value) => setSelectedIndustryId(value)}
          options={industryOptions}
          disabled={isIndustriesLoading}
        />
      </div>

      {!selectedIndustryId ? (
        <div className={cn("rounded-xl border p-6 text-sm", isDarkMode ? "border-white/10 bg-white/5 text-white/60" : "border-slate-200 bg-white text-slate-600")}>
          Select an industry to manage module mappings.
        </div>
      ) : (
        <>
          <ModuleMappingMatrix
            modules={modules}
            mappings={mappingState}
            isLoading={isModulesLoading || isIndustryMappingLoading}
            onChange={handleToggleMapping}
            disabled={isSaving}
            isDarkMode={isDarkMode}
          />

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={
                !selectedIndustryId ||
                isSaving ||
                isModulesLoading ||
                isIndustryMappingLoading ||
                modules.length === 0
              }
              className="px-6 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSaving ? "Saving..." : "Save Full Mapping"}
            </button>
          </div>
        </>
      )}

      <ConfirmDialog
        open={isConfirmOpen}
        title="Save Industry Module Mapping?"
        description="This will replace the full module mapping for the selected industry."
        confirmText="Save Mapping"
        cancelText="Cancel"
        variant="warning"
        isLoading={isSaving}
        onCancel={() => {
          if (!isSaving) {
            setIsConfirmOpen(false);
            setPendingMappings([]);
          }
        }}
        onConfirm={() => {
          if (!selectedIndustryId || pendingMappings.length === 0) return;
          patchIndustryMappings(
            {
              industryId: selectedIndustryId,
              payload: { mappings: pendingMappings },
            },
            {
              onSettled: () => {
                setIsConfirmOpen(false);
                setPendingMappings([]);
              },
            },
          );
        }}
      />
    </div>
  );
};
