import { useQuery, keepPreviousData } from "@tanstack/react-query";
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
        // Keep the previous period's data visible while the new period fetch is in-flight.
        // Without this, data becomes undefined on every filter change which causes
        // wabaConnected to evaluate false → flashes WhatsAppConnectionPlaceholder.
        placeholderData: keepPreviousData,
    });
};

// Weekly Summary Query - Get 4 weeks of aggregated statistics
export const useGetWeeklySummaryQuery = () => {
    const { token } = useAuth();

    return useQuery({
        queryKey: ['weekly-summary'],
        enabled: !!token,
        queryFn: () => dashboardApis.getWeeklySummary(),
        staleTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
    });
};

// Contact Weekly Summary Query - Get 4 weeks of conversation analytics for a specific contact
export const useGetContactWeeklySummaryQuery = (
    contactId?: string | number,
    phone?: string,
    options?: { enabled?: boolean }
) => {
    const { token } = useAuth();
    const contactIdStr = contactId?.toString();

    return useQuery({
        queryKey: ['contact-weekly-summary', contactIdStr, phone],
        enabled: (options?.enabled ?? true) && !!token && (!!contactIdStr || !!phone),
        queryFn: () => dashboardApis.getContactWeeklySummary(contactIdStr, phone),
        staleTime: 0, // Always fetch fresh data
        gcTime: 0,   // Don't cache stale results
        refetchOnWindowFocus: false,
    });
};
