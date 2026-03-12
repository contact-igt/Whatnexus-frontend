/**
 * Shared glass card style constants for the dashboard.
 * Using inline styles guarantees they are applied regardless of
 * Tailwind's purge / custom-class detection behaviour.
 */

// ─── Dark-mode glass card (outer container) ───
export const GLASS_CARD_DARK: React.CSSProperties = {
    background: 'linear-gradient(145deg, rgba(18, 24, 38, 0.82) 0%, rgba(10, 14, 24, 0.90) 100%)',
    border: '1px solid rgba(255, 255, 255, 0.09)',
    backdropFilter: 'blur(24px) saturate(160%)',
    WebkitBackdropFilter: 'blur(24px) saturate(160%)',
    boxShadow: `
        inset 0 1px 0 rgba(255,255,255,0.08),
        inset 0 -1px 0 rgba(0,0,0,0.20),
        0 8px 32px rgba(0,0,0,0.40),
        0 2px 8px rgba(0,0,0,0.25)
    `,
};

// ─── Light-mode glass card ───
export const GLASS_CARD_LIGHT: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.96)',
    border: '1px solid rgba(203, 213, 225, 0.80)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    boxShadow: '0 2px 20px rgba(15,23,42,0.06), 0 1px 4px rgba(15,23,42,0.04)',
};

// ─── Dark inner card / nested panel ───
export const GLASS_INNER_DARK: React.CSSProperties = {
    background: 'rgba(0, 0, 0, 0.28)',
    border: '1px solid rgba(255, 255, 255, 0.07)',
};

// ─── Light inner card ───
export const GLASS_INNER_LIGHT: React.CSSProperties = {
    background: 'rgba(241, 245, 249, 0.90)',
    border: '1px solid rgba(203, 213, 225, 0.70)',
};

// ─── Helper functions ───
export const glassCard = (dark: boolean): React.CSSProperties => dark ? GLASS_CARD_DARK : GLASS_CARD_LIGHT;
export const glassInner = (dark: boolean): React.CSSProperties => dark ? GLASS_INNER_DARK : GLASS_INNER_LIGHT;

// ─── Dark-mode text colours ───
export const T = {
    value: 'rgba(255, 255, 255, 1.00)',   // large numbers, headlines
    primary: 'rgba(255, 255, 255, 0.90)',   // body text, names
    secondary: 'rgba(255, 255, 255, 0.55)',   // sub-text, descriptions
    label: 'rgba(255, 255, 255, 0.38)',   // uppercase micro-labels
    micro: 'rgba(255, 255, 255, 0.22)',   // timestamps, icon fills
    divider: 'rgba(255, 255, 255, 0.08)',   // separator lines
};

// ─── Light-mode text colours ───
export const TL = {
    value: '#0f172a',   // large numbers, headlines
    primary: '#1e293b',   // body text, names
    secondary: '#475569',   // sub-text, descriptions
    label: '#64748b',   // uppercase micro-labels
    micro: '#94a3b8',   // timestamps, icon fills
    divider: '#e2e8f0',   // separator lines
};

/**
 * Returns the correct text colour set for the current theme.
 * Usage: const t = tx(isDarkMode); then t.value, t.label, etc.
 */
export const tx = (dark: boolean) => dark ? T : TL;

/**
 * Returns a progress-bar track colour for the current theme.
 */
export const trackBg = (dark: boolean) =>
    dark ? 'rgba(255,255,255,0.07)' : 'rgba(15,23,42,0.08)';
