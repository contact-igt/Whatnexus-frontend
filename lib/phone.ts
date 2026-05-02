export const sanitizePhoneInput = (
    value: string,
    hasSeparateCountryCode = false,
) => {
    const sanitizedValue = value.replace(/\D/g, "");
    return sanitizedValue.slice(0, hasSeparateCountryCode ? 10 : 12);
};
