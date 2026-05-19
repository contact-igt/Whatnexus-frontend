"use client";

import { Select } from "@/components/ui/select";
import { useTheme } from "@/hooks/useTheme";
import { useGetTenantsQuery } from "@/hooks/useTenantQuery";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { TenantFeaturesApiData } from "@/services/tenantFeatures";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ALL_FEATURE_KEYS,
  getDefaultFeaturesForIndustry,
  IndustryType,
} from "../organization/TenantFeatureAccessChecklist";
import { TenantAccessOverview } from "./TenantAccessOverview";
import { TenantAccessSummary } from "./TenantAccessSummary";
import { TenantFeatureMatrix } from "./TenantFeatureMatrix";
import { TenantIndustrySelector } from "./TenantIndustrySelector";

const tenantFeatureAccessApi = new TenantFeaturesApiData();

export const TenantAccessContainer = () => {
  const { isDarkMode } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const queryTenantId = searchParams.get("tenantId") || "";
  const [selectedTenantId, setSelectedTenantId] = useState(queryTenantId);
  const [selectedIndustryType, setSelectedIndustryType] =
    useState<IndustryType>("general");
  const [originalIndustryType, setOriginalIndustryType] =
    useState<IndustryType>("general");
  const [selectedFeatures, setSelectedFeatures] = useState<Record<string, boolean>>({});
  const [isFormInitialized, setIsFormInitialized] = useState(false);

  const { data: tenantsData, isLoading: isTenantListLoading } = useGetTenantsQuery();
  const tenants = useMemo(() => tenantsData?.data || [], [tenantsData]);

  const selectedTenant = useMemo(
    () => tenants.find((tenant: any) => tenant.tenant_id === selectedTenantId),
    [tenants, selectedTenantId],
  );

  useEffect(() => {
    setSelectedTenantId(queryTenantId);
  }, [queryTenantId]);

  const {
    data: tenantFeatureAccessResponse,
    isLoading: isFeatureLoading,
    isError: isFeatureError,
    refetch,
  } = useQuery({
    queryKey: ["management-tenant-features", selectedTenantId],
    enabled: Boolean(selectedTenantId),
    queryFn: () => tenantFeatureAccessApi.getManagementTenantFeatures(selectedTenantId),
    staleTime: 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!tenantFeatureAccessResponse?.data) return;

    const payload = tenantFeatureAccessResponse.data;
    const resolvedIndustry =
      payload.industry_type === "healthcare" || payload.industry_type === "education"
        ? payload.industry_type
        : "general";

    const enabledSet = new Set(payload.enabled_features || []);
    const nextSelectedFeatures: Record<string, boolean> = {};
    ALL_FEATURE_KEYS.forEach((featureKey) => {
      nextSelectedFeatures[featureKey] = enabledSet.has(featureKey);
    });

    setSelectedIndustryType(resolvedIndustry as IndustryType);
    setOriginalIndustryType(resolvedIndustry as IndustryType);
    setSelectedFeatures(nextSelectedFeatures);
    setIsFormInitialized(true);
  }, [tenantFeatureAccessResponse]);

  useEffect(() => {
    if (isFeatureError && selectedTenantId) {
      toast.error("Failed to load tenant feature access");
    }
  }, [isFeatureError, selectedTenantId]);

  const { mutate: patchTenantFeatureAccess, isPending: isSaving } = useMutation({
    mutationFn: ({
      tenantId,
      data,
    }: {
      tenantId: string;
      data: {
        industry_type: IndustryType;
        overrides: Array<{ feature_key: string; is_enabled: boolean }>;
      };
    }) => tenantFeatureAccessApi.patchManagementTenantFeatures(tenantId, data),
    onSuccess: (response) => {
      toast.success(response?.message || "Tenant access updated successfully");
      queryClient.invalidateQueries({ queryKey: ["management-tenant-features", selectedTenantId] });
      refetch();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Failed to update tenant access");
    },
  });

  const handleTenantChange = (tenantId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (tenantId) {
      params.set("tenantId", tenantId);
    } else {
      params.delete("tenantId");
    }
    const query = params.toString();
    router.push(query ? `/management/tenant-access?${query}` : "/management/tenant-access");
    setIsFormInitialized(false);
  };

  const handleToggleFeature = (featureKey: string, checked: boolean) => {
    setSelectedFeatures((prev) => ({
      ...prev,
      [featureKey]: checked,
    }));
  };

  const buildOverridesPayload = () => {
    const defaultFeatureSet = new Set(getDefaultFeaturesForIndustry(selectedIndustryType));

    return ALL_FEATURE_KEYS
      .map((featureKey) => {
        const isEnabled = Boolean(selectedFeatures[featureKey]);
        const isDefaultEnabled = defaultFeatureSet.has(featureKey);

        if (isEnabled === isDefaultEnabled) return null;

        return {
          feature_key: featureKey,
          is_enabled: isEnabled,
        };
      })
      .filter(Boolean) as Array<{ feature_key: string; is_enabled: boolean }>;
  };

  const handleSave = () => {
    if (!selectedTenantId) {
      toast.error("Please select a tenant first");
      return;
    }

    const overrides = buildOverridesPayload();
    const industryChanged = selectedIndustryType !== originalIndustryType;

    if (industryChanged) {
      const confirmed = window.confirm(
        "Industry Type has changed. Default feature access will change for this tenant. Do you want to continue?",
      );
      if (!confirmed) return;
    }

    patchTenantFeatureAccess({
      tenantId: selectedTenantId,
      data: {
        industry_type: selectedIndustryType,
        overrides,
      },
    });
  };

  const featureData = tenantFeatureAccessResponse?.data;

  return (
    <div className="h-full overflow-y-auto p-8 space-y-6 animate-in slide-in-from-bottom-8 duration-700 max-w-[1400px] mx-auto no-scrollbar pb-32">
      <div className="space-y-2">
        <h1 className={cn("text-3xl font-bold tracking-tight", isDarkMode ? "text-white" : "text-slate-900")}>Tenant Access Control</h1>
        <p className={cn("text-sm", isDarkMode ? "text-white/60" : "text-slate-600")}>
          Manage tenant industry type and feature access overrides using platform-level controls.
        </p>
      </div>

      <div className={cn("rounded-xl border p-4", isDarkMode ? "border-white/10 bg-white/5" : "border-slate-200 bg-white")}>
        <Select
          isDarkMode={isDarkMode}
          label="Select Organization"
          value={selectedTenantId}
          onChange={handleTenantChange}
          options={tenants.map((tenant: any) => ({
            value: tenant.tenant_id,
            label: `${tenant.company_name} (${tenant.tenant_id})`,
          }))}
          disabled={isTenantListLoading}
        />
      </div>

      {!selectedTenantId ? (
        <div className={cn("rounded-xl border p-6 text-sm", isDarkMode ? "border-white/10 bg-white/5 text-white/60" : "border-slate-200 bg-white text-slate-600")}>
          Select an organization to manage access controls.
        </div>
      ) : isFeatureLoading || !featureData || !isFormInitialized ? (
        <div className={cn("rounded-xl border p-6 text-sm", isDarkMode ? "border-white/10 bg-white/5 text-white/60" : "border-slate-200 bg-white text-slate-600")}>
          Loading tenant access configuration...
        </div>
      ) : (
        <>
          <TenantAccessOverview isDarkMode={isDarkMode} tenant={selectedTenant} tenantId={selectedTenantId} industryType={selectedIndustryType} />

          <TenantIndustrySelector
            isDarkMode={isDarkMode}
            selectedIndustryType={selectedIndustryType}
            onChange={setSelectedIndustryType}
          />

          <TenantFeatureMatrix
            isDarkMode={isDarkMode}
            selectedIndustryType={selectedIndustryType}
            selectedFeatures={selectedFeatures}
            onToggleFeature={handleToggleFeature}
            featureMetadata={featureData.feature_metadata || []}
          />

          <TenantAccessSummary
            isDarkMode={isDarkMode}
            selectedIndustryType={selectedIndustryType}
            selectedFeatures={selectedFeatures}
            featureMetadata={featureData.feature_metadata || []}
          />

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={cn(
                "px-6 py-2 rounded-lg text-sm font-medium text-white transition-colors",
                "bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed",
              )}
            >
              {isSaving ? "Saving..." : "Save Access Changes"}
            </button>
          </div>
        </>
      )}
    </div>
  );
};
