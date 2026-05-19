import { _axios } from "@/helper/axios";

export interface ApiResponse<T> {
  message: string;
  data: T;
}

export type ModuleType = "core" | "feature" | "addon" | "experimental" | "enterprise";
export type VisibilityType = "sidebar" | "hidden" | "internal" | "api_only";
export type BillingCycle = "monthly" | "quarterly" | "yearly" | "custom";

export interface Industry {
  industry_id: string;
  industry_key: string;
  industry_name: string;
  description: string | null;
  is_active: boolean;
  metadata: Record<string, unknown> | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface SaaSModule {
  module_id: string;
  module_key: string;
  module_name: string;
  description: string | null;
  category: string | null;
  parent_module_id: string | null;
  route_path: string | null;
  icon_key: string | null;
  module_type: ModuleType;
  visibility_type: VisibilityType;
  is_system_core: boolean;
  is_active: boolean;
  sort_order: number;
  metadata: Record<string, unknown> | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Plan {
  plan_id: string;
  plan_key: string;
  plan_name: string;
  description: string | null;
  price: number | null;
  billing_cycle: BillingCycle | null;
  sort_order: number;
  is_active: boolean;
  metadata: Record<string, unknown> | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ModuleMapping {
  module_id: string;
  is_enabled: boolean;
  metadata?: Record<string, unknown> | null;
}

export interface IndustryModuleMappingsResponse {
  industry: Industry;
  mappings: ModuleMapping[];
}

export interface PlanModuleMappingsResponse {
  plan: Plan;
  mappings: ModuleMapping[];
}

export interface TenantModuleOverride {
  module_id: string;
  is_enabled: boolean;
  metadata?: Record<string, unknown> | null;
  reason?: string;
}

export interface TenantDynamicAccess {
  tenant_id: string;
  industry_id: string | null;
  plan_id: string | null;
  enabled_modules: SaaSModule[];
  disabled_modules: SaaSModule[];
  overrides: TenantModuleOverride[];
  ignored_overrides?: TenantModuleOverride[];
  module_metadata: SaaSModule[];
  enabled_module_keys: string[];
  disabled_module_keys: string[];
}

export interface CreateIndustryPayload {
  industry_id: string;
  industry_key: string;
  industry_name: string;
  description?: string | null;
  is_active?: boolean;
  metadata?: Record<string, unknown> | null;
}

export interface PatchIndustryPayload {
  industry_key?: string;
  industry_name?: string;
  description?: string | null;
  is_active?: boolean;
  metadata?: Record<string, unknown> | null;
}

export interface CreateSaaSModulePayload {
  module_id: string;
  module_key: string;
  module_name: string;
  description?: string | null;
  category?: string | null;
  parent_module_id?: string | null;
  route_path?: string | null;
  icon_key?: string | null;
  module_type?: ModuleType;
  visibility_type?: VisibilityType;
  is_system_core?: boolean;
  is_active?: boolean;
  sort_order?: number;
  metadata?: Record<string, unknown> | null;
}

export interface PatchSaaSModulePayload {
  module_key?: string;
  module_name?: string;
  description?: string | null;
  category?: string | null;
  parent_module_id?: string | null;
  route_path?: string | null;
  icon_key?: string | null;
  module_type?: ModuleType;
  visibility_type?: VisibilityType;
  is_system_core?: boolean;
  is_active?: boolean;
  sort_order?: number;
  metadata?: Record<string, unknown> | null;
}

export interface CreatePlanPayload {
  plan_id: string;
  plan_key: string;
  plan_name: string;
  description?: string | null;
  price?: number | null;
  billing_cycle?: BillingCycle | null;
  sort_order?: number;
  is_active?: boolean;
  metadata?: Record<string, unknown> | null;
}

export interface PatchPlanPayload {
  plan_key?: string;
  plan_name?: string;
  description?: string | null;
  price?: number | null;
  billing_cycle?: BillingCycle | null;
  sort_order?: number;
  is_active?: boolean;
  metadata?: Record<string, unknown> | null;
}

export interface PatchModuleMappingsPayload {
  mappings: ModuleMapping[];
}

export interface PatchTenantDynamicAccessPayload {
  industry_id?: string | null;
  plan_id?: string | null;
  overrides?: ModuleMapping[];
}

export class ModuleAccessManagementApiData {
  listIndustries = async (): Promise<ApiResponse<Industry[]>> => {
    return await _axios("get", "/management/industries");
  };

  createIndustry = async (
    payload: CreateIndustryPayload,
  ): Promise<ApiResponse<Industry>> => {
    return await _axios("post", "/management/industries", payload);
  };

  patchIndustry = async (
    industryId: string,
    payload: PatchIndustryPayload,
  ): Promise<ApiResponse<Industry>> => {
    return await _axios("patch", `/management/industries/${industryId}`, payload);
  };

  listSaaSModules = async (): Promise<ApiResponse<SaaSModule[]>> => {
    return await _axios("get", "/management/saas-modules");
  };

  createSaaSModule = async (
    payload: CreateSaaSModulePayload,
  ): Promise<ApiResponse<SaaSModule>> => {
    return await _axios("post", "/management/saas-modules", payload);
  };

  patchSaaSModule = async (
    moduleId: string,
    payload: PatchSaaSModulePayload,
  ): Promise<ApiResponse<SaaSModule>> => {
    return await _axios("patch", `/management/saas-modules/${moduleId}`, payload);
  };

  listPlans = async (): Promise<ApiResponse<Plan[]>> => {
    return await _axios("get", "/management/plans");
  };

  createPlan = async (payload: CreatePlanPayload): Promise<ApiResponse<Plan>> => {
    return await _axios("post", "/management/plans", payload);
  };

  patchPlan = async (
    planId: string,
    payload: PatchPlanPayload,
  ): Promise<ApiResponse<Plan>> => {
    return await _axios("patch", `/management/plans/${planId}`, payload);
  };

  getIndustrySaaSModules = async (
    industryId: string,
  ): Promise<ApiResponse<IndustryModuleMappingsResponse>> => {
    return await _axios("get", `/management/industries/${industryId}/saas-modules`);
  };

  patchIndustrySaaSModules = async (
    industryId: string,
    payload: PatchModuleMappingsPayload,
  ): Promise<ApiResponse<IndustryModuleMappingsResponse>> => {
    return await _axios(
      "patch",
      `/management/industries/${industryId}/saas-modules`,
      payload,
    );
  };

  getPlanSaaSModules = async (
    planId: string,
  ): Promise<ApiResponse<PlanModuleMappingsResponse>> => {
    return await _axios("get", `/management/plans/${planId}/saas-modules`);
  };

  patchPlanSaaSModules = async (
    planId: string,
    payload: PatchModuleMappingsPayload,
  ): Promise<ApiResponse<PlanModuleMappingsResponse>> => {
    return await _axios("patch", `/management/plans/${planId}/saas-modules`, payload);
  };

  getManagementTenantDynamicAccess = async (
    tenantId: string,
  ): Promise<ApiResponse<TenantDynamicAccess>> => {
    return await _axios("get", `/management/tenants/${tenantId}/dynamic-access`);
  };

  patchManagementTenantDynamicAccess = async (
    tenantId: string,
    payload: PatchTenantDynamicAccessPayload,
  ): Promise<ApiResponse<TenantDynamicAccess>> => {
    return await _axios(
      "patch",
      `/management/tenants/${tenantId}/dynamic-access`,
      payload,
    );
  };
}
