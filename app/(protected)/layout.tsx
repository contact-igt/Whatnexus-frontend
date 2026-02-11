"use client";
import { Header } from "@/components/layout/header";
import { GroupedSidebar } from "@/components/layout/grouped-sidebar";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import ProtectedRoute from "@/routes/ProtectedRoute";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const { isDarkMode } = useTheme();

    return (<ProtectedRoute>
        <div className={cn("flex h-screen font-sans overflow-hidden relative transition-colors duration-300", isDarkMode ? 'bg-[#0A0A0B] text-slate-200' : 'bg-[#FAFAFB] text-slate-900')}>
            <div className={cn("absolute top-[-20%] left-[-10%] w-[80%] h-[80%] blur-[200px] rounded-full transition-all duration-300", isDarkMode ? 'bg-emerald-900/10' : 'bg-emerald-200/40')} />
            <GroupedSidebar />
            <main className="flex-1 flex flex-col min-w-0 relative z-10 overflow-hidden">
                <Header />
                <div className="flex-1 min-h-0 overflow-hidden relative">
                    {children}
                </div>
            </main>
        </div>
    </ProtectedRoute>)
}