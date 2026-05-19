"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";
import { Select } from "@/components/ui/select";
import { ConfirmDialog } from "@/components/ui/confirmDialog";
import { toast } from "@/lib/toast";
import { useGetTenantsQuery } from "@/hooks/useTenantQuery";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  useIndustriesQuery,
  useManagementTenantDynamicAccessQuery,
  usePatchManagementTenantDynamicAccessMutation,
  usePlansQuery,
  useSaaSModulesQuery,
} from "@/hooks/useModuleAccessManagementQuery";
import { TenantModuleOverrideMatrix } from "./TenantModuleOverrideMatrix";

export const TenantDynamicAccessView = () => {
  const { isDarkMode } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryTenantId = searchParams.get("tenantId") || "";

  const [selectedTenantId, setSelectedTenantId] = useState(queryTenantId);
  const [selectedIndustryId, setSelectedIndustryId] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [overrideState, setOverrideState] = useState<Record<string, boolean>>({});
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<{
    industry_id: string | null;
    plan_id: string | null;
    overrides: Array<{ module_id: string; is_enabled: boolean; metadata: Record<string, never> }>;
  } | null>(null);

  const { data: tenantsData, isLoading: isTenantsLoading } = useGetTenantsQuery();
  const { data: industriesData, isLoading: isIndustriesLoading } = useIndustriesQuery();
  const { data: plansData, isLoading: isPlansLoading } = usePlansQuery();
  const { data: modulesData, isLoading: isModulesLoading } = useSaaSModulesQuery();

  const {
    data: tenantDynamicAccessResponse,
    isLoading: isDynamicAccessLoading,
  } = useManagementTenantDynamicAccessQuery(selectedTenantId);

  const { mutate: patchTenantDynamicAccess, isPending: isSaving } =
    usePatchManagementTenantDynamicAccessMutation();

  const tenants = useMemo(() => tenantsData?.data || [], [tenantsData]);
  const industries = useMemo(() => industriesData?.data || [], [industriesData]);
  const plans = useMemo(() => plansData?.data || [], [plansData]);
  const modules = useMemo(() => modulesData?.data || [], [modulesData]);
  const activeModules = useMemo(
    () => modules.filter((module: any) => module.is_active),
    [modules],
  );

  const tenantDynamicAccess = tenantDynamicAccessResponse?.data;

  const selectedTenant = useMemo(
    () => tenants.find((tenant: any) => tenant.tenant_id === selectedTenantId),
    [tenants, selectedTenantId],
  );

  useEffect(() => {
    if (queryTenantId && queryTenantId !== selectedTenantId) {
      setSelectedTenantId(queryTenantId);
    }
  }, [queryTenantId, selectedTenantId]);

  useEffect(() => {
    if (!selectedTenantId || !tenantDynamicAccess) {
      setSelectedIndustryId("");
      setSelectedPlanId("");
      setOverrideState({});
      return;
    }

    setSelectedIndustryId(tenantDynamicAccess.industry_id || "");
    setSelectedPlanId(tenantDynamicAccess.plan_id || "");

    const enabledModuleSet = new Set(
      (tenantDynamicAccess.enabled_modules || []).map((module: any) => module.module_id),
    );
    const overrideMap = new Map(
      (tenantDynamicAccess.overrides || []).map((override: any) => [override.module_id, Boolean(override.is_enabled)]),
    );

    const nextOverrideState: Record<string, boolean> = {};
    for (const module of activeModules) {
      if (module.is_system_core) {
        nextOverrideState[module.module_id] = true;
        continue;
      }

      if (overrideMap.has(module.module_id)) {
        nextOverrideState[module.module_id] = Boolean(overrideMap.get(module.module_id));
      } else {
        nextOverrideState[module.module_id] = enabledModuleSet.has(module.module_id);
      }
    }

    setOverrideState(nextOverrideState);
  }, [selectedTenantId, tenantDynamicAccess, activeModules]);

  const tenantOptions = useMemo(
    () =>
      tenants.map((tenant: any) => ({
        value: tenant.tenant_id,
        label: `${tenant.company_name || tenant.organization_name || "Tenant"} (${tenant.tenant_id})`,
      })),
    [tenants],
  );

  const industryOptions = useMemo(
    () => [
      { value: "", label: "Not Set" },
      ...industries.map((industry: any) => ({
        value: industry.industry_id,
        label: `${industry.industry_name} (${industry.industry_id})`,
      })),
    ],
    [industries],
  );

  const planOptions = useMemo(
    () => [
      { value: "", label: "Not Set" },
      ...plans.map((plan: any) => ({
        value: plan.plan_id,
        label: `${plan.plan_name} (${plan.plan_id})`,
      })),
    ],
    [plans],
  );

  const handleToggleOverride = (moduleId: string, isEnabled: boolean) => {
    const module = activeModules.find((item: any) => item.module_id === moduleId);
    if (!module || module.is_system_core) return;

    setOverrideState((prev) => ({
      ...prev,
      [moduleId]: isEnabled,
    }));
  };

  const handleSave = () => {
    if (!selectedTenantId) {
      toast.error("Please select a tenant first");
      return;
    }

    if (
      isIndustriesLoading ||
      isPlansLoading ||
      isModulesLoading ||
      isDynamicAccessLoading ||
      !tenantDynamicAccess
    ) {
      toast.error("Please wait for tenant access data to finish loading");
      return;
    }

    if (selectedIndustryId && !industries.some((item: any) => item.industry_id === selectedIndustryId)) {
      toast.error("Selected industry is invalid");
      return;
    }

    if (selectedPlanId && !plans.some((item: any) => item.plan_id === selectedPlanId)) {
      toast.error("Selected plan is invalid");
      return;
    }

    const seen = new Set<string>();
    const overrides: Array<{ module_id: string; is_enabled: boolean; metadata: Record<string, never> }> = [];

    for (const module of activeModules) {
      if (module.is_system_core) continue;

      if (seen.has(module.module_id)) {
        toast.error(`Duplicate module detected: ${module.module_id}`);
        return;
      }
      seen.add(module.module_id);

      const value = overrideState[module.module_id];
      if (typeof value !== "boolean") {
        toast.error(`Invalid override value for module: ${module.module_key}`);
        return;
      }

      overrides.push({
        module_id: module.module_id,
        is_enabled: value,
        metadata: {},
      });
    }

    setPendingPayload({
      industry_id: selectedIndustryId || null,
      plan_id: selectedPlanId || null,
      overrides,
    });
    setIsConfirmOpen(true);
  };

  const isDataLoading =
    isTenantsLoading || isIndustriesLoading || isPlansLoading || isModulesLoading;
  const ignoredOverrides = tenantDynamicAccess?.ignored_overrides || [];

  const handleTenantChange = (tenantId: string) => {
    setSelectedTenantId(tenantId);

    const params = new URLSearchParams(searchParams.toString());
    if (tenantId) {
      params.set("tenantId", tenantId);
    } else {
      params.delete("tenantId");
    }

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  return (
    <div className="h-full overflow-y-auto p-8 space-y-6 max-w-[1400px] mx-auto no-scrollbar pb-32">
      <div className="space-y-2">
        <h1 className={cn("text-3xl font-bold tracking-tight", isDarkMode ? "text-white" : "text-slate-900")}>
          Tenant Dynamic Access Management
        </h1>
        <p className={cn("text-sm", isDarkMode ? "text-white/60" : "text-slate-600")}>
          Assign industry and plan, then manage tenant-level module overrides.
        </p>
      </div>

      <div className={cn("rounded-xl border p-4", isDarkMode ? "border-white/10 bg-white/5" : "border-slate-200 bg-white")}>
        <Select
          isDarkMode={isDarkMode}
          label="Select Tenant"
          value={selectedTenantId}
          onChange={handleTenantChange}
          options={tenantOptions}
          disabled={isTenantsLoading}
        />
      </div>

      {!selectedTenantId ? (
        <div className={cn("rounded-xl border p-6 text-sm", isDarkMode ? "border-white/10 bg-white/5 text-white/60" : "border-slate-200 bg-white text-slate-600")}>
          Select a tenant to manage dynamic access.
        </div>
      ) : isDataLoading || isDynamicAccessLoading || !tenantDynamicAccess ? (
        <div className={cn("rounded-xl border p-6 text-sm", isDarkMode ? "border-white/10 bg-white/5 text-white/60" : "border-slate-200 bg-white text-slate-600")}>
          Loading tenant dynamic access configuration...
        </div>
      ) : (
        <>
          <div className={cn("rounded-xl border p-4 grid gap-4 md:grid-cols-2", isDarkMode ? "border-white/10 bg-white/5" : "border-slate-200 bg-white")}>
            <Select
              isDarkMode={isDarkMode}
              label="Industry"
              value={selectedIndustryId}
              onChange={setSelectedIndustryId}
              options={industryOptions}
              disabled={isSaving}
            />

            <Select
              isDarkMode={isDarkMode}
              label="Plan"
              value={selectedPlanId}
              onChange={setSelectedPlanId}
              options={planOptions}
              disabled={isSaving}
            />
          </div>

          <div className={cn("rounded-xl border p-4 space-y-4", isDarkMode ? "border-white/10 bg-white/5" : "border-slate-200 bg-white")}>
            <h2 className={cn("text-sm font-bold uppercase tracking-wider", isDarkMode ? "text-white/70" : "text-slate-700")}>
              Resolved Access Summary
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className={cn("text-xs font-semibold uppercase", isDarkMode ? "text-white/60" : "text-slate-600")}>
                  Tenant
                </p>
                <p className={cn("text-sm", isDarkMode ? "text-white" : "text-slate-900")}>
                  {selectedTenant?.company_name || selectedTenant?.organization_name || selectedTenantId}
                </p>
                <p className={cn("text-xs", isDarkMode ? "text-white/50" : "text-slate-500")}>{selectedTenantId}</p>
              </div>

              <div>
                <p className={cn("text-xs font-semibold uppercase", isDarkMode ? "text-white/60" : "text-slate-600")}>
                  Modules
                </p>
                <p className={cn("text-sm", isDarkMode ? "text-white" : "text-slate-900")}>
                  Enabled {tenantDynamicAccess.enabled_modules?.length || 0} / Disabled {tenantDynamicAccess.disabled_modules?.length || 0}
                </p>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <p className={cn("text-xs font-semibold uppercase mb-2", isDarkMode ? "text-white/60" : "text-slate-600")}>
                  Enabled Module Keys
                </p>
                <div className={cn("text-xs rounded-lg p-3 min-h-16", isDarkMode ? "bg-white/5 text-white/80" : "bg-slate-50 text-slate-700")}>
                  {(tenantDynamicAccess.enabled_module_keys || []).length > 0
                    ? tenantDynamicAccess.enabled_module_keys.join(", ")
                    : "None"}
                </div>
              </div>

              <div>
                <p className={cn("text-xs font-semibold uppercase mb-2", isDarkMode ? "text-white/60" : "text-slate-600")}>
                  Disabled Module Keys
                </p>
                <div className={cn("text-xs rounded-lg p-3 min-h-16", isDarkMode ? "bg-white/5 text-white/80" : "bg-slate-50 text-slate-700")}>
                  {(tenantDynamicAccess.disabled_module_keys || []).length > 0
                    ? tenantDynamicAccess.disabled_module_keys.join(", ")
                    : "None"}
                </div>
              </div>
            </div>

            {ignoredOverrides.length > 0 && (
              <div>
                <p className={cn("text-xs font-semibold uppercase mb-2", isDarkMode ? "text-white/60" : "text-slate-600")}>
                  Ignored Overrides
                </p>
                <div className={cn("rounded-lg border overflow-hidden", isDarkMode ? "border-white/10" : "border-slate-200")}>
                  <table className="w-full text-xs">
                    <thead className={cn(isDarkMode ? "bg-white/5" : "bg-slate-50")}>
                      <tr>
                        <th className="px-3 py-2 text-left">Module</th>
                        <th className="px-3 py-2 text-left">Requested</th>
                        <th className="px-3 py-2 text-left">Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ignoredOverrides.map((item: any, index: number) => (
                        <tr key={`${item.module_id || "unknown"}-${index}`} className={cn("border-t", isDarkMode ? "border-white/10" : "border-slate-200")}>
                          <td className="px-3 py-2">{item.module_id || "unknown"}</td>
                          <td className="px-3 py-2">{String(item.is_enabled)}</td>
                          <td className="px-3 py-2">{item.reason || "n/a"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <TenantModuleOverrideMatrix
            modules={activeModules}
            overrideState={overrideState}
            isLoading={false}
            onToggle={handleToggleOverride}
            disabled={isSaving}
            isDarkMode={isDarkMode}
          />

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={
                isSaving ||
                !selectedTenantId ||
                isIndustriesLoading ||
                isPlansLoading ||
                isModulesLoading ||
                isDynamicAccessLoading ||
                !tenantDynamicAccess
              }
              className="px-6 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSaving ? "Saving..." : "Save Tenant Dynamic Access"}
            </button>
          </div>
        </>
      )}

      <ConfirmDialog
        open={isConfirmOpen}
        title="Save Tenant Dynamic Access?"
        description="This will update the tenant's industry, plan, and module overrides."
        confirmText="Save Dynamic Access"
        cancelText="Cancel"
        variant="warning"
        isLoading={isSaving}
        onCancel={() => {
          if (!isSaving) {
            setIsConfirmOpen(false);
            setPendingPayload(null);
          }
        }}
        onConfirm={() => {
          if (!selectedTenantId || !pendingPayload) return;
          patchTenantDynamicAccess(
            {
              tenantId: selectedTenantId,
              payload: pendingPayload,
            },
            {
              onSettled: () => {
                setIsConfirmOpen(false);
                setPendingPayload(null);
              },
            },
          );
        }}
      />
    </div>
  );
};
