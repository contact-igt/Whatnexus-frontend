import { cn } from "@/lib/utils";

interface TenantAccessOverviewProps {
  isDarkMode: boolean;
  tenant: any;
  tenantId: string;
  industryType: string;
}

export const TenantAccessOverview = ({
  isDarkMode,
  tenant,
  tenantId,
  industryType,
}: TenantAccessOverviewProps) => {
  return (
    <div className={cn("rounded-xl border p-4", isDarkMode ? "border-white/10 bg-white/5" : "border-slate-200 bg-white")}>
      <h2 className={cn("text-sm font-bold uppercase tracking-wider mb-3", isDarkMode ? "text-white/60" : "text-slate-500")}>
        Tenant Access Overview
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 text-sm">
        <div>
          <p className={cn("text-xs uppercase tracking-wider", isDarkMode ? "text-white/40" : "text-slate-500")}>Organization</p>
          <p className={cn("font-semibold", isDarkMode ? "text-white" : "text-slate-900")}>{tenant?.company_name || "-"}</p>
        </div>
        <div>
          <p className={cn("text-xs uppercase tracking-wider", isDarkMode ? "text-white/40" : "text-slate-500")}>Tenant ID</p>
          <p className={cn("font-semibold", isDarkMode ? "text-white" : "text-slate-900")}>{tenantId || "-"}</p>
        </div>
        <div>
          <p className={cn("text-xs uppercase tracking-wider", isDarkMode ? "text-white/40" : "text-slate-500")}>Industry Type</p>
          <p className={cn("font-semibold capitalize", isDarkMode ? "text-white" : "text-slate-900")}>{industryType || "general"}</p>
        </div>
        <div>
          <p className={cn("text-xs uppercase tracking-wider", isDarkMode ? "text-white/40" : "text-slate-500")}>Subscription</p>
          <p className={cn("font-semibold capitalize", isDarkMode ? "text-white" : "text-slate-900")}>{tenant?.subscription_plan || "basic"}</p>
        </div>
        <div>
          <p className={cn("text-xs uppercase tracking-wider", isDarkMode ? "text-white/40" : "text-slate-500")}>Status</p>
          <p className={cn("font-semibold capitalize", isDarkMode ? "text-white" : "text-slate-900")}>{tenant?.status || "-"}</p>
        </div>
      </div>
    </div>
  );
};
