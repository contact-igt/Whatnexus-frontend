import { useQuery } from "@tanstack/react-query";

import { ApiRequestLogsApiData } from "@/services/apiRequestLogs";
import { useAuth } from "@/redux/selectors/auth/authSelector";

const apiRequestLogsApi = new ApiRequestLogsApiData();

export const useApiRequestLogsQuery = () => {
  const { user, token } = useAuth();
  const isManagement = user?.user_type === "management";

  return useQuery({
    queryKey: ["api-request-logs"],
    enabled: !!token && isManagement,
    queryFn: () => apiRequestLogsApi.getApiRequestLogs(),
    staleTime: 2 * 60 * 1000,
    refetchOnMount: "always",
  });
};

export const useApiRequestLogDetailsQuery = (id: string | number) => {
  const { user, token } = useAuth();
  const isManagement = user?.user_type === "management";

  return useQuery({
    queryKey: ["api-request-log", id],
    enabled: !!token && isManagement && !!id,
    queryFn: () => apiRequestLogsApi.getApiRequestLogById(id),
    staleTime: 5 * 60 * 1000,
  });
};
