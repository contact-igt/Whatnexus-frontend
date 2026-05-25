import { WhatsAppPlaygroundView } from '@/components/views/playground/whatsapp-playground-view';

// VERCEL_ENV is set automatically by Vercel (server-side, cannot be overridden by user env vars):
//   'production' → main production deployment
//   'preview'    → all branch deployments (stage, feature branches, etc.)
//   'development'→ local `vercel dev`
// Fall back to NEXT_PUBLIC_ENV when running outside Vercel (plain local dev).
const vercelEnv = (process.env.VERCEL_ENV || '').trim();
const appEnv    = (process.env.NEXT_PUBLIC_ENV || '').trim();
const isProduction = vercelEnv ? vercelEnv === 'production' : appEnv === 'production';

export default function PlaygroundPage() {
    if (isProduction) {
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
