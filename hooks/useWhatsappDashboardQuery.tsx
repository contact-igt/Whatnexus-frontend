import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { DashboardApiData } from "@/services/whatsappDashboard";
import { useAuth } from "@/redux/selectors/auth/authSelector";

const dashboardApis = new DashboardApiData();

function toISODate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

export const useGetWhatsappDashboardQuery = (startDate: Date, endDate: Date) => {
    const { user, token } = useAuth();

    const tenantId = user?.tenant_id;
    const startStr = toISODate(startDate);
    const endStr = toISODate(endDate);

    return useQuery({
        queryKey: ['whatsapp-dashboard', tenantId, startStr, endStr],
        enabled: !!token && !!tenantId,
        queryFn: () => dashboardApis.getDashboardData(tenantId as string, startStr, endStr),
        // Keep the dashboard close to live: short staleness window so navigating
        // back re-fetches, a 60s poll, plus refetch on tab focus / reconnect.
        // Cross-app mutations also invalidate this key (see lib/queryClient.ts).
        staleTime: 10 * 1000,             // 10 seconds
        refetchInterval: 60 * 1000,       // auto-refresh every 60s while on screen
        refetchIntervalInBackground: false, // pause polling when the tab is hidden
        refetchOnMount: true,              // re-fetch on mount if stale
        refetchOnWindowFocus: true,        // refresh when the user returns to the tab
        refetchOnReconnect: true,          // refresh after the network comes back
        // Keep previous data visible while new fetch is in-flight to avoid
        // wabaConnected flashing false → WhatsAppConnectionPlaceholder.
        placeholderData: keepPreviousData,
    });
};

// Weekly Summary Query - Get 4 weeks of aggregated statistics
export const useGetWeeklySummaryQuery = () => {
    const { token, user } = useAuth();
    const tenantId = user?.tenant_id;

    return useQuery({
        queryKey: ['weekly-summary', tenantId],
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
    const { token, user } = useAuth();
    const tenantId = user?.tenant_id;
    const contactIdStr = contactId?.toString();

    return useQuery({
        queryKey: ['contact-weekly-summary', tenantId, contactIdStr, phone],
        enabled: (options?.enabled ?? true) && !!token && (!!contactIdStr || !!phone),
        queryFn: () => dashboardApis.getContactWeeklySummary(contactIdStr, phone),
        staleTime: 0, // Always fetch fresh data
        gcTime: 0,   // Don't cache stale results
        refetchOnWindowFocus: false,
    });
};
