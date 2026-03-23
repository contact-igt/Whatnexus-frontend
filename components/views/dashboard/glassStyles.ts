/**
 * Shared glass card style constants for the dashboard.
 * Using inline styles guarantees they are applied regardless of
 * Tailwind's purge / custom-class detection behaviour.
 */

// ─── Dark-mode flat card (outer container) ───
export const GLASS_CARD_DARK: React.CSSProperties = {
    background: '#09090b', // Zinc 950
    border: '1px solid #27272a', // Zinc 800
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.4)',
};

// ─── Light-mode flat card ───
export const GLASS_CARD_LIGHT: React.CSSProperties = {
    background: '#ffffff',
    border: '1px solid #e4e4e7', // Zinc 200
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.03)',
};

// ─── Dark inner card / nested panel ───
export const GLASS_INNER_DARK: React.CSSProperties = {
    background: '#18181b', // Zinc 900
    border: '1px solid #27272a',
    boxShadow: 'none',
};

// ─── Light inner card ───
export const GLASS_INNER_LIGHT: React.CSSProperties = {
    background: '#fafafa', // Zinc 50
    border: '1px solid #e4e4e7',
    boxShadow: 'none',
};

// ─── Helper functions ───
export const glassCard = (dark: boolean): React.CSSProperties => dark ? GLASS_CARD_DARK : GLASS_CARD_LIGHT;
export const glassInner = (dark: boolean): React.CSSProperties => dark ? GLASS_INNER_DARK : GLASS_INNER_LIGHT;

// ─── Dark-mode text colours ───
export const T = {
    value: 'rgba(255, 255, 255, 1.00)',   // Headlines
    primary: 'rgba(255, 255, 255, 0.92)', // Body text
    secondary: 'rgba(255, 255, 255, 0.68)', // Sub-text
    label: 'rgba(255, 255, 255, 0.58)', // labels
    micro: 'rgba(255, 255, 255, 0.38)', // fills
    divider: 'rgba(255, 255, 255, 0.11)', // separators
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

// ─── Shared typography scale ───
export const fs = {
    micro: '10px',     // was 8px
    label: '11px',     // was 9px
    body: '12px',      // was 10px
    sm: '13px',        // was 11px
    md: '14px',        // was 12px
    lg: '16px',        // was 14px
    xl: '18px',
    '2xl': '22px',
    '3xl': '28px',
    '4xl': '36px',
};
