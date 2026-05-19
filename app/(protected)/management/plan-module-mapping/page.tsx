import { RoleBasedWrapper } from "@/components/ui/roleBasedWrapper";
import { PlanModuleMappingView } from "@/components/views/moduleAccessManagement/PlanModuleMappingView";

export default function PlanModuleMappingPage() {
  return (
    <RoleBasedWrapper
      allowedRoles={["super_admin", "platform_admin"]}
      fallback={
        <div className="h-full w-full flex flex-col items-center justify-center text-slate-500 gap-2">
          <span className="text-4xl">LOCK</span>
          <p className="font-semibold">Access Denied</p>
          <p className="text-sm opacity-70">You do not have permission to view this page.</p>
        </div>
      }
    >
      <PlanModuleMappingView />
    </RoleBasedWrapper>
  );
}