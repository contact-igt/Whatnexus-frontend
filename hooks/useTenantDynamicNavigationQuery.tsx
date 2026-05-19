"use client";

import { useAuth } from "@/redux/selectors/auth/authSelector";
import { TenantDynamicNavigationApiData } from "@/services/tenantDynamicNavigation";
import { useQuery } from "@tanstack/react-query";

const tenantDynamicNavigationApi = new TenantDynamicNavigationApiData();

export const useTenantDynamicNavigationQuery = () => {
  const { token, user } = useAuth();

  const isTenantUser = user?.user_type === "tenant";
  const tenantId = user?.tenant_id;

  return useQuery({
    queryKey: ["tenant-dynamic-navigation", tenantId],
    enabled: Boolean(token && isTenantUser && tenantId),
    queryFn: () => tenantDynamicNavigationApi.getTenantDynamicNavigation(),
    staleTime: 2 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
  });
};
