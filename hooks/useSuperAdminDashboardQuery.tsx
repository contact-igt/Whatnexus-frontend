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
        staleTime: 5 * 60 * 1000,
        refetchInterval: 10 * 60 * 1000,
    });
};
