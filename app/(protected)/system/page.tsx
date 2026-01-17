import { SystemGovernanceView } from "@/components/views/system-view";
import { RoleBasedWrapper } from "@/components/ui/role-based-wrapper";

export default function SystemPage() {
    return (
        <RoleBasedWrapper
            allowedRoles={['admin', 'super_admin']}
            fallback={
                <div className="h-full w-full flex flex-col items-center justify-center text-slate-500 gap-2">
                    <span className="text-4xl">🔒</span>
                    <p className="font-semibold">Access Denied</p>
                    <p className="text-sm opacity-70">You do not have permission to view this page.</p>
                </div>
            }
        >
            <SystemGovernanceView />
        </RoleBasedWrapper>
    );
}
