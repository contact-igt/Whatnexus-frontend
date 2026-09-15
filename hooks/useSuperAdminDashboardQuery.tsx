import { useQuery } from "@tanstack/react-query";
import { SuperAdminDashboardApiData } from "@/services/superAdminDashboard";
import { useAuth } from "@/redux/selectors/auth/authSelector";

const dashboardApis = new SuperAdminDashboardApiData();

export const useGetSuperAdminDashboardQuery = (period: string = "30days") => {
    const { user, token } = useAuth();

    const isManagement = user?.user_type === "management";

    return useQuery({
        queryKey: ["super-admin-dashboard", period],
        enabled: !!token && isManagement,
        queryFn: () => dashboardApis.getDashboardData(period),
        // Keep the dashboard close to live; cross-app mutations also invalidate
        // this key (see lib/queryClient.ts).
        staleTime: 30 * 1000,
        refetchInterval: 2 * 60 * 1000,
        refetchIntervalInBackground: false,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
    });
};
