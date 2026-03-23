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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenantSettings"] });
    },
  });
};
