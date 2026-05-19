import { _axios } from "@/helper/axios";

export interface TenantDynamicNavigationItem {
  navigation_item_id: string;
  tenant_id: string | null;
  module_id: string;
  label: string;
  route_path: string;
  icon_key: string | null;
  parent_item_id: string | null;
  menu_group: string | null;
  sort_order: number;
  metadata: Record<string, unknown> | null;
}

export interface TenantDynamicNavigationGroup {
  menu_group: string;
  items: TenantDynamicNavigationItem[];
}

export interface TenantDynamicNavigationPayload {
  tenant_id: string;
  navigation: TenantDynamicNavigationGroup[];
}

export interface TenantDynamicNavigationResponse {
  message: string;
  data: TenantDynamicNavigationPayload;
}

export class TenantDynamicNavigationApiData {
  getTenantDynamicNavigation = async (): Promise<TenantDynamicNavigationResponse> => {
    return await _axios("get", "/tenant/dynamic-navigation");
  };
}
