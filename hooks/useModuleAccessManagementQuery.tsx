"use client";

import { toast } from "@/lib/toast";
import {
  CreateIndustryPayload,
  CreatePlanPayload,
  CreateSaaSModulePayload,
  ModuleAccessManagementApiData,
  PatchIndustryPayload,
  PatchModuleMappingsPayload,
  PatchPlanPayload,
  PatchSaaSModulePayload,
  PatchTenantDynamicAccessPayload,
} from "@/services/moduleAccessManagement";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const moduleAccessManagementApi = new ModuleAccessManagementApiData();

export const moduleAccessManagementQueryKeys = {
  industries: ["management-industries"] as const,
  saasModules: ["management-saas-modules"] as const,
  plans: ["management-plans"] as const,
  industrySaaSModules: (industryId: string) =>
    ["management-industry-saas-modules", industryId] as const,
  planSaaSModules: (planId: string) =>
    ["management-plan-saas-modules", planId] as const,
  tenantDynamicAccess: (tenantId: string) =>
    ["management-tenant-dynamic-access", tenantId] as const,
};

export const useIndustriesQuery = () => {
  return useQuery({
    queryKey: moduleAccessManagementQueryKeys.industries,
    queryFn: () => moduleAccessManagementApi.listIndustries(),
    staleTime: 2 * 60 * 1000,
  });
};

export const useSaaSModulesQuery = () => {
  return useQuery({
    queryKey: moduleAccessManagementQueryKeys.saasModules,
    queryFn: () => moduleAccessManagementApi.listSaaSModules(),
    staleTime: 2 * 60 * 1000,
  });
};

export const usePlansQuery = () => {
  return useQuery({
    queryKey: moduleAccessManagementQueryKeys.plans,
    queryFn: () => moduleAccessManagementApi.listPlans(),
    staleTime: 2 * 60 * 1000,
  });
};

export const useIndustrySaaSModulesQuery = (industryId: string) => {
  return useQuery({
    queryKey: moduleAccessManagementQueryKeys.industrySaaSModules(industryId),
    queryFn: () => moduleAccessManagementApi.getIndustrySaaSModules(industryId),
    enabled: Boolean(industryId),
    staleTime: 2 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
  });
};

export const usePlanSaaSModulesQuery = (planId: string) => {
  return useQuery({
    queryKey: moduleAccessManagementQueryKeys.planSaaSModules(planId),
    queryFn: () => moduleAccessManagementApi.getPlanSaaSModules(planId),
    enabled: Boolean(planId),
    staleTime: 2 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
  });
};

export const useManagementTenantDynamicAccessQuery = (tenantId: string) => {
  return useQuery({
    queryKey: moduleAccessManagementQueryKeys.tenantDynamicAccess(tenantId),
    queryFn: () => moduleAccessManagementApi.getManagementTenantDynamicAccess(tenantId),
    enabled: Boolean(tenantId),
    staleTime: 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
  });
};

export const useCreateIndustryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateIndustryPayload) =>
      moduleAccessManagementApi.createIndustry(payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({
        queryKey: moduleAccessManagementQueryKeys.industries,
      });
      toast.success(response?.message || "Industry created successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Failed to create industry");
    },
  });
};

export const usePatchIndustryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      industryId,
      payload,
    }: {
      industryId: string;
      payload: PatchIndustryPayload;
    }) => moduleAccessManagementApi.patchIndustry(industryId, payload),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({
        queryKey: moduleAccessManagementQueryKeys.industries,
      });
      queryClient.invalidateQueries({
        queryKey: moduleAccessManagementQueryKeys.industrySaaSModules(variables.industryId),
      });
      toast.success(response?.message || "Industry updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Failed to update industry");
    },
  });
};

export const useDeleteIndustryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (industryId: string) =>
      moduleAccessManagementApi.deleteIndustry(industryId),
    onSuccess: (response) => {
      queryClient.invalidateQueries({
        queryKey: moduleAccessManagementQueryKeys.industries,
      });
      toast.success(response?.message || "Deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Delete failed");
    },
  });
};

export const useCreateSaaSModuleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateSaaSModulePayload) =>
      moduleAccessManagementApi.createSaaSModule(payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({
        queryKey: moduleAccessManagementQueryKeys.saasModules,
      });
      toast.success(response?.message || "SaaS module created successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Failed to create SaaS module");
    },
  });
};

export const usePatchSaaSModuleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      moduleId,
      payload,
    }: {
      moduleId: string;
      payload: PatchSaaSModulePayload;
    }) => moduleAccessManagementApi.patchSaaSModule(moduleId, payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({
        queryKey: moduleAccessManagementQueryKeys.saasModules,
      });
      queryClient.invalidateQueries({
        queryKey: moduleAccessManagementQueryKeys.industries,
      });
      queryClient.invalidateQueries({
        queryKey: moduleAccessManagementQueryKeys.plans,
      });
      toast.success(response?.message || "SaaS module updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Failed to update SaaS module");
    },
  });
};

export const useDeleteSaaSModuleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (moduleId: string) =>
      moduleAccessManagementApi.deleteSaaSModule(moduleId),
    onSuccess: (response) => {
      queryClient.invalidateQueries({
        queryKey: moduleAccessManagementQueryKeys.saasModules,
      });
      toast.success(response?.message || "Deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Delete failed");
    },
  });
};

export const useCreatePlanMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePlanPayload) =>
      moduleAccessManagementApi.createPlan(payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({
        queryKey: moduleAccessManagementQueryKeys.plans,
      });
      toast.success(response?.message || "Plan created successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Failed to create plan");
    },
  });
};

export const usePatchPlanMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      planId,
      payload,
    }: {
      planId: string;
      payload: PatchPlanPayload;
    }) => moduleAccessManagementApi.patchPlan(planId, payload),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({
        queryKey: moduleAccessManagementQueryKeys.plans,
      });
      queryClient.invalidateQueries({
        queryKey: moduleAccessManagementQueryKeys.planSaaSModules(variables.planId),
      });
      toast.success(response?.message || "Plan updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Failed to update plan");
    },
  });
};

export const useDeletePlanMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (planId: string) => moduleAccessManagementApi.deletePlan(planId),
    onSuccess: (response) => {
      queryClient.invalidateQueries({
        queryKey: moduleAccessManagementQueryKeys.plans,
      });
      toast.success(response?.message || "Deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Delete failed");
    },
  });
};

export const usePatchIndustrySaaSModulesMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      industryId,
      payload,
    }: {
      industryId: string;
      payload: PatchModuleMappingsPayload;
    }) => moduleAccessManagementApi.patchIndustrySaaSModules(industryId, payload),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({
        queryKey: moduleAccessManagementQueryKeys.industrySaaSModules(variables.industryId),
      });
      toast.success(response?.message || "Industry module mapping updated successfully");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update industry module mapping",
      );
    },
  });
};

export const usePatchPlanSaaSModulesMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      planId,
      payload,
    }: {
      planId: string;
      payload: PatchModuleMappingsPayload;
    }) => moduleAccessManagementApi.patchPlanSaaSModules(planId, payload),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({
        queryKey: moduleAccessManagementQueryKeys.planSaaSModules(variables.planId),
      });
      toast.success(response?.message || "Plan module mapping updated successfully");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update plan module mapping",
      );
    },
  });
};

export const usePatchManagementTenantDynamicAccessMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      tenantId,
      payload,
    }: {
      tenantId: string;
      payload: PatchTenantDynamicAccessPayload;
    }) => moduleAccessManagementApi.patchManagementTenantDynamicAccess(tenantId, payload),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({
        queryKey: moduleAccessManagementQueryKeys.tenantDynamicAccess(variables.tenantId),
      });
      toast.success(response?.message || "Tenant dynamic access updated successfully");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update tenant dynamic access",
      );
    },
  });
};
