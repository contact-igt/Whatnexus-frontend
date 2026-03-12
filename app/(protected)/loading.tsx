// Next.js calls this file on every route transition within (protected).
// Since all routes are eagerly prefetched by the sidebar on mount, actual
// navigation is already instant. We still need this file to exist so Next.js
// doesn't throw, but we render nothing — no spinner, no "Loading Hub".
export default function ProtectedLoading() {
    return null;
}
