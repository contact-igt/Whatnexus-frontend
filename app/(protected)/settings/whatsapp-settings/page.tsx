
import { RoleBasedWrapper } from "@/components/ui/role-based-wrapper";
import { WhatsAppConnectionView } from "@/components/views/whatsappConfiguration/whatsapp-connection-view";

export default function WhatsAppSettingsPage() {
    return (
        <RoleBasedWrapper
            allowedRoles={['tenant_admin', 'staff', 'agent', 'doctor']}
            fallback={
                <div className="h-full w-full flex flex-col items-center justify-center text-slate-500 gap-2">
                    <span className="text-4xl">🔒</span>
                    <p className="font-semibold">Access Denied</p>
                    <p className="text-sm opacity-70">You do not have permission to view this page.</p>
                </div>
            }
        >
            <WhatsAppConnectionView />
        </RoleBasedWrapper>
    );
}
