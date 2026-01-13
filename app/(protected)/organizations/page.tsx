import { OrganizationView } from "@/components/views/organization/organization-view";
import { RoleBasedWrapper } from "@/components/ui/role-based-wrapper";

export default function OrganizationPage() {
  return (
    <RoleBasedWrapper
      allowedRoles={['super_admin']}
      fallback={
        <div className="h-full w-full flex flex-col items-center justify-center text-slate-500 gap-2">
          <span className="text-4xl">🔒</span>
          <p className="font-semibold">Access Denied</p>
          <p className="text-sm opacity-70">You do not have permission to view this page.</p>
        </div>
      }
    >
      <OrganizationView />
    </RoleBasedWrapper>
  );
}