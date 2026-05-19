import { RoleBasedWrapper } from "@/components/ui/roleBasedWrapper";
import { TenantDynamicAccessView } from "@/components/views/moduleAccessManagement/TenantDynamicAccessView";
import { FollowUpHubView } from "@/components/views/followup-hub/followUpHubView";

export default function TenantDynamicAccessPage() {
  return (
    <RoleBasedWrapper
      allowedRoles={["super_admin", "platform_admin"]}
      fallback={<FollowUpHubView />}
    >
      <TenantDynamicAccessView />
    </RoleBasedWrapper>
  );
}
