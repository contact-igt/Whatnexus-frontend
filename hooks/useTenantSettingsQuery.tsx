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
    onSuccess: (response) => {
      // Use refreshed data from server response (includes masked key info)
      if (response?.data) {
        queryClient.setQueryData(["tenantSettings"], (old: any) => {
          if (!old) return old;
          return {
            ...old,
            data: response.data,
          };
        });
      }
      // Invalidate to ensure full consistency
      queryClient.invalidateQueries({ queryKey: ["tenantSettings"] });
    },
  });
};
