import { WhatsAppPlaygroundView } from '@/components/views/playground/whatsapp-playground-view';

const env = (process.env.NEXT_PUBLIC_ENV || "").trim();
const isAllowedEnv = env !== 'production';

export default function PlaygroundPage() {
    // Block production — allow local, ngrok, stage, development
    if (!isAllowedEnv) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center text-slate-500 gap-2">
                <span className="text-4xl">🔒</span>
                <p className="font-semibold">Access Denied</p>
                <p className="text-sm opacity-70">This page is not available in production.</p>
            </div>
        );
    }

    return <WhatsAppPlaygroundView />;
}
