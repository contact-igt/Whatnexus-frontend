import { _axios } from "@/helper/axios";

export interface TenantFeatureOverride {
  feature_key: string;
  is_enabled: boolean;
}

export interface TenantFeatureMetadata {
  key: string;
  label: string;
  category: string;
  group: string;
  route: string;
  isCommon: boolean;
  allowedIndustries: string[];
}

export interface TenantFeaturesPayload {
  industry_type: string;
  default_features: string[];
  overrides: TenantFeatureOverride[];
  enabled_features: string[];
  disabled_features: string[];
  feature_metadata: TenantFeatureMetadata[];
}

export interface TenantFeaturesResponse {
  message: string;
  data: TenantFeaturesPayload;
}

export interface TenantFeaturesPatchPayload {
  industry_type: string;
  overrides: TenantFeatureOverride[];
}

export class TenantFeaturesApiData {
  getTenantFeatures = async (): Promise<TenantFeaturesResponse> => {
    return await _axios("get", "/tenant/features");
  };

  getManagementTenantFeatures = async (
    tenantId: string,
  ): Promise<TenantFeaturesResponse> => {
    return await _axios("get", `/management/tenant/${tenantId}/features`);
  };

  patchManagementTenantFeatures = async (
    tenantId: string,
    data: TenantFeaturesPatchPayload,
  ): Promise<TenantFeaturesResponse> => {
    return await _axios("patch", `/management/tenant/${tenantId}/features`, data);
  };
}
