
import { RoleBasedWrapper } from "@/components/ui/roleBasedWrapper";
import { WhatsAppPlaygroundView } from "@/components/views/playground/whatsapp-playground-view";
import { headers } from 'next/headers';

export default async function WhatsAppPlaygroundPage() {
    const headersList = await headers();
    const host = headersList.get('host') || '';
    const isLocalServer = host.includes('localhost') || host.includes('127.0.0.1') || host.includes('ngrok');

    // Show access denied if not in local development mode
    if (!isLocalServer) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center text-slate-500 gap-2">
                <span className="text-4xl">🔒</span>
                <p className="font-semibold">Access Denied</p>
                <p className="text-sm opacity-70">This page is only available in local development mode.</p>
            </div>
        );
    }

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
            <WhatsAppPlaygroundView />
        </RoleBasedWrapper>
    );
}
