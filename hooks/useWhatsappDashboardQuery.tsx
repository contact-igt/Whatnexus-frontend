import { useQuery } from "@tanstack/react-query";
import { DashboardApiData } from "@/services/whatsappDashboard";
import { useAuth } from "@/redux/selectors/auth/authSelector";

const dashboardApis = new DashboardApiData();

export const useGetWhatsappDashboardQuery = (period: string = "30days") => {
    const { user, token } = useAuth();
    
    // Check if user and tenant_id exist
    const tenantId = user?.tenant_id;
    
    return useQuery({
        queryKey: ['whatsapp-dashboard', tenantId, period],
        enabled: !!token && !!tenantId,
        queryFn: () => dashboardApis.getDashboardData(tenantId as string, period),
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
    });
};
