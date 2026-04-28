"use client";
import { Header } from "@/components/layout/header";
import { GroupedSidebar } from "@/components/layout/groupedSidebar";
import { WalletAnnouncementBar } from "@/components/layout/walletAnnouncementBar";
import { useFaqRealtimeUpdates } from "@/hooks/useFaqNotifications";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import ProtectedRoute from "@/routes/ProtectedRoute";
import { AccountStatusOverlay } from "@/components/ui/accountStatusOverlay";
import { useAuth } from "@/redux/selectors/auth/authSelector";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { tenantUserApiData } from "@/services/tenantUser";
import { managementApiData } from "@/services/management";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const { isDarkMode, setTheme } = useTheme();
    const { user } = useAuth();
    const tenantUserApi = new tenantUserApiData();
    const managementApi = new managementApiData();
    useFaqRealtimeUpdates();

    const { data: preferencesData } = useQuery({
        queryKey: ["user-preferences", user?.user_type, user?.tenant_user_id || user?.management_id],
        queryFn: () => user?.user_type === "management"
            ? managementApi.getManagementPreferences()
            : tenantUserApi.getTenantUserPreferences(),
        enabled: !!user?.user_type && !!(user?.tenant_user_id || user?.management_id),
        staleTime: 2 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    useEffect(() => {
        const localTheme = typeof window !== "undefined" ? localStorage.getItem("theme") : null;
        // Only apply DB theme if the user has no explicit local preference saved
        if (localTheme === "light" || localTheme === "dark") return;
        const userTheme = user?.preferences?.theme || preferencesData?.data?.theme;
        if (userTheme === "light" || userTheme === "dark") {
            setTheme(userTheme);
        }
    }, [setTheme, user?.preferences?.theme, preferencesData?.data?.theme]);

    return (<ProtectedRoute>
        <AccountStatusOverlay />
        <div className={cn("flex h-screen font-sans overflow-hidden relative transition-colors duration-300", isDarkMode ? 'bg-[#0A0A0B] text-slate-200' : 'bg-[#FAFAFB] text-slate-900')}>
            <div className={cn("absolute top-[-20%] left-[-10%] w-[80%] h-[80%] blur-[200px] rounded-full transition-all duration-300", isDarkMode ? 'bg-emerald-900/10' : 'bg-emerald-200/40')} />
            <GroupedSidebar />
            <main className="flex-1 flex flex-col min-w-0 relative z-10 overflow-hidden">
                <WalletAnnouncementBar />
                <Header />
                <div className="flex-1 min-h-0 overflow-hidden relative">
                    {children}
                </div>
            </main>
        </div>
    </ProtectedRoute>)
}
