export const sanitizePhoneInput = (
    value: string,
    hasSeparateCountryCode = false,
) => {
    const sanitizedValue = value.replace(/\D/g, "");
    return sanitizedValue.slice(0, hasSeparateCountryCode ? 10 : 12);
};

export const formatFullPhone = (countryCode?: string | null, phone?: string | null) => {
    const p = phone ? String(phone).replace(/\D/g, "") : "";
    if (!p) return "";

    if (countryCode) {
        const cc = String(countryCode).replace(/\D/g, "");
        if (cc) return `+${cc}${p}`;
    }

    // If phone already includes country code (more than 10 digits), display as +<digits>
    if (p.length > 10) return `+${p}`;

    // Default fallback: show local phone prefixed with +
    return `+${p}`;
};

export const isPlaceholderName = (name?: string | null) => {
    if (!name) return true;
    const n = String(name).trim().toLowerCase();
    if (!n) return true;
    const placeholders = ['patient', 'unknown', 'contact', 'guest', 'user'];
    return placeholders.includes(n);
};

export const displayNameOrPhone = (name?: string | null, countryCode?: string | null, phone?: string | null) => {
    return !isPlaceholderName(name) ? (name || '') : formatFullPhone(countryCode, phone);
};
