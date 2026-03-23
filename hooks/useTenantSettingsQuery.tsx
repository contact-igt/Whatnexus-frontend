import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TenantApiData } from "@/services/tenant";

const tenantApi = new TenantApiData();

export const useGetTenantSettingsQuery = () => {
  return useQuery({
    queryFn: () => tenantApi.getTenantSettings(),
    queryKey: ["tenantSettings"],
  });
};

export const useUpdateTenantAiSettingsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { ai_settings: any }) => tenantApi.updateTenantAiSettings(data),
    onSuccess: (_, variables) => {
      // Manually update the cache with the new settings to avoid flicker
      // when the local optimistic state is cleared in GeneralSettingsView
      queryClient.setQueryData(["tenantSettings"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: {
            ...old.data,
            ai_settings: {
              ...(old.data?.ai_settings || {}),
              ...(variables.ai_settings || {})
            }
          }
        };
      });
      // Invalidate to ensure consistency with server
      queryClient.invalidateQueries({ queryKey: ["tenantSettings"] });
    },
  });
};
