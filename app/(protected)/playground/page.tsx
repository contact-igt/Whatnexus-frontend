import { WhatsAppPlaygroundView } from '@/components/views/playground/whatsapp-playground-view';

const isLocalServer = process.env.NEXT_PUBLIC_ENV === 'local' || "ngrok";

export default function PlaygroundPage() {
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

    return <WhatsAppPlaygroundView />;
}
