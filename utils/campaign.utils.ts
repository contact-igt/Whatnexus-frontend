import type {
    CampaignStatus,
    RecipientStatus,
    CSVRecipient,
    CSVValidationResult,
    ValidationError,
    CampaignStatistics,
} from "@/services/campaign/campaign.types";

/**
 * Validates phone number format per E.164 standard.
 * Backend accepts:
 *   - 10 digits → prepends '91' (India default)
 *   - 11 digits starting with '0' → strips '0', prepends '91'
 *   - 12 digits → accepts as-is (assumed to already include country code)
 * Frontend accepts combined 10-15 digits (E.164 range).
 * @param phone Phone number to validate
 * @returns true if valid, false otherwise
 */
export const validatePhoneNumber = (phone: string): boolean => {
    // Accept 10-15 digits (E.164 standard range)
    const phoneRegex = /^\d{10,15}$/;
    return phoneRegex.test(phone);
};

/**
 * Parses CSV file and returns array of rows
 * @param file CSV file to parse
 * @returns Promise resolving to array of CSV rows
 */
export const parseCSV = async (file: File): Promise<string[][]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                let text = e.target?.result as string;
                if (!text) return resolve([]);
                // strip BOM if present
                if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
                // support CRLF, LF, CR line endings
                const lines = text.split(/\r\n|\n|\r/).filter((line) => line.trim());
                const rows = lines.map((line) => {
                    const cells: string[] = [];
                    let current = '';
                    let inQuotes = false;
                    for (let i = 0; i < line.length; i++) {
                        const ch = line[i];
                        if (ch === '"') {
                            if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
                            else inQuotes = !inQuotes;
                        } else if (ch === ',' && !inQuotes) {
                            cells.push(current.trim());
                            current = '';
                        } else {
                            current += ch;
                        }
                    }
                    cells.push(current.trim());
                    return cells;
                });
                resolve(rows);
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
    });
};

/**
 * Validates CSV data against template variable count.
 * Phone validation (E.164): accepts combined 10-15 digits.
 * Backend will normalize: 10 digits → prepend '91', 12 digits → use as-is, etc.
 * @param data Array of CSV rows (excluding header)
 * @param templateVariableCount Number of variables expected by template
 * @returns Validation result with errors and valid/invalid rows
 */
export const validateCSVData = (
    data: string[][],
    templateVariableCount: number
): CSVValidationResult => {
    const errors: ValidationError[] = [];
    const validRows: CSVRecipient[] = [];
    const invalidRows: number[] = [];

    data.forEach((row, index) => {
        const rowNumber = index + 2; // +2 because index is 0-based and row 1 is header

        const countryCode = row[0];
        const localNumber = row[1];
        const dynamicVariables = row.slice(2, templateVariableCount + 2);

        // Validate: country_code and mobile_number must contain only digits
        if (!countryCode || !/^\d+$/.test(countryCode)) {
            errors.push({ field: `Row ${rowNumber}`, message: `Invalid country code: ${countryCode}. Must contain only digits.` });
            invalidRows.push(rowNumber);
            return;
        }

        if (!localNumber || !/^\d+$/.test(localNumber)) {
            errors.push({ field: `Row ${rowNumber}`, message: `Invalid local number: ${localNumber}. Must contain only digits.` });
            invalidRows.push(rowNumber);
            return;
        }

        const fullPhoneNumber = countryCode + localNumber;
        // E.164 validation: accept 10-15 digits combined (aligned with backend)
        // Backend will normalize to backend's expected format (10→+91, 12→as-is, etc.)
        if (fullPhoneNumber.length < 10 || fullPhoneNumber.length > 15) {
            errors.push({ field: `Row ${rowNumber}`, message: `Phone number ${fullPhoneNumber} has ${fullPhoneNumber.length} digits — must be 10-15 digits (country code + local number).` });
            invalidRows.push(rowNumber);
            return;
        }

        // Check if CSV row has more variable columns than the template expects
        const actualVariableCount = row.length - 2; // subtract country_code and mobile_number columns
        if (templateVariableCount > 0 && actualVariableCount > templateVariableCount) {
            errors.push({
                field: `Row ${rowNumber}`,
                message: `Too many variables: CSV has ${actualVariableCount} but template expects ${templateVariableCount}`,
            });
            invalidRows.push(rowNumber);
            return;
        }

        // Check for empty variables
        const hasEmptyVariables = dynamicVariables.some((v) => !v || !v.trim());
        if (hasEmptyVariables) {
            errors.push({
                field: `Row ${rowNumber}`,
                message: "One or more dynamic variables are empty",
            });
            invalidRows.push(rowNumber);
            return;
        }

        // Valid row
        validRows.push({
            mobile_number: fullPhoneNumber,
            dynamic_variables: dynamicVariables,
        });
    });

    return {
        isValid: errors.length === 0,
        errors,
        validRows,
        invalidRows,
    };
};

/**
 * Detailed row-level CSV validator that uses header mappings to template variables.
 * Returns structured errors per row and parsed recipient objects keyed by variable_key.
 */
export const validateCSVRowsDetailed = (
    rows: string[][],
    headers: string[],
    mappings: Record<string, string>,
    variableDefs: CsvVariableDefinition[]
): {
    isValid: boolean;
    validRows: Array<{ mobile_number: string; dynamic_variables: Record<string, string> }>;
    errors: Array<{
        rowIndex: number;
        column?: string;
        variableKey?: string;
        value?: string;
        message: string;
    }>;
} => {
    const errors: Array<any> = [];
    const validRows: Array<{ mobile_number: string; dynamic_variables: Record<string, string> }> = [];

    const headerIndex: Record<string, number> = {};
    headers.forEach((h, i) => (headerIndex[h] = i));

    // Pre-check mappings: ensure each mapped header exists
    Object.entries(mappings).forEach(([variableKey, headerName]) => {
        if (!headerName) {
            errors.push({ rowIndex: 0, variableKey, message: `Variable '${variableKey}' is not mapped to any CSV column` });
        } else if (headerIndex[headerName] === undefined) {
            errors.push({ rowIndex: 0, variableKey, message: `Mapped column '${headerName}' for '${variableKey}' not found in CSV headers` });
        }
    });

    rows.forEach((row, idx) => {
        const rowNumber = idx + 2; // account for header row

        // phone columns: try to resolve using header names if present, else fallback to first two columns
        let countryCode = '';
        let mobileLocal = '';

        if (headerIndex['country_code'] !== undefined) countryCode = (row[headerIndex['country_code']] || '').toString().trim();
        if (headerIndex['mobile_number'] !== undefined) mobileLocal = (row[headerIndex['mobile_number']] || '').toString().trim();
        if (!countryCode && row[0] !== undefined) countryCode = (row[0] || '').toString().trim();
        if (!mobileLocal && row[1] !== undefined) mobileLocal = (row[1] || '').toString().trim();

        if (!countryCode || !/^\d+$/.test(countryCode)) {
            errors.push({ rowIndex: rowNumber, column: 'country_code', message: `Invalid or missing country code: '${countryCode}'` });
            return;
        }

        if (!mobileLocal || !/^\d+$/.test(mobileLocal)) {
            errors.push({ rowIndex: rowNumber, column: 'mobile_number', message: `Invalid or missing local mobile number: '${mobileLocal}'` });
            return;
        }

        const fullNumber = `${countryCode}${mobileLocal}`;
        if (fullNumber.length !== 12) {
            errors.push({ rowIndex: rowNumber, column: 'mobile_number', message: `Combined phone '${fullNumber}' must be exactly 12 digits (country code + local number)` });
            return;
        }

        // collect dynamic variables by variable_key
        const dynamicVariables: Record<string, string> = {};
        let rowHasError = false;

        variableDefs.forEach((def) => {
            const key = def.variable_key || def.name || '';
            if (!key) return;
            const mappedHeader = mappings[key];
            if (!mappedHeader) {
                errors.push({ rowIndex: rowNumber, variableKey: key, message: `Variable '${key}' is not mapped to any column` });
                rowHasError = true;
                return;
            }
            const colIdx = headerIndex[mappedHeader];
            if (colIdx === undefined) {
                errors.push({ rowIndex: rowNumber, variableKey: key, column: mappedHeader, message: `Mapped column '${mappedHeader}' not found` });
                rowHasError = true;
                return;
            }
            const value = (row[colIdx] || '').toString().trim();
            // basic non-empty check
            if (!value) {
                errors.push({ rowIndex: rowNumber, variableKey: key, column: mappedHeader, value, message: `Empty value for variable '${key}'` });
                rowHasError = true;
                return;
            }
            // optional basic format checks (phone/email/date) by heuristic on key or header name
            if (/phone|mobile|number/.test(key.toLowerCase()) || /phone|mobile|number/.test(mappedHeader.toLowerCase())) {
                const digits = value.replace(/\D/g, '');
                if (digits.length < 7 || digits.length > 15) {
                    errors.push({ rowIndex: rowNumber, variableKey: key, column: mappedHeader, value, message: `Invalid phone value for '${key}': '${value}'` });
                    rowHasError = true;
                    return;
                }
            }
            if (/email/.test(key.toLowerCase()) || /email/.test(mappedHeader.toLowerCase())) {
                const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRe.test(value)) {
                    errors.push({ rowIndex: rowNumber, variableKey: key, column: mappedHeader, value, message: `Invalid email for '${key}': '${value}'` });
                    rowHasError = true;
                    return;
                }
            }

            dynamicVariables[key] = value;
        });

        if (!rowHasError) {
            validRows.push({ mobile_number: fullNumber, dynamic_variables: dynamicVariables });
        }
    });

    return { isValid: errors.length === 0, validRows, errors };
};

/**
 * Validates CSV header row against required columns and expected variable columns.
 * @param headers Array of header names (first row)
 * @param expectedVariableColumns Optional array of expected variable column names (e.g., ['name','email'])
 */
export const validateCSVHeaders = (
    headers: string[],
    expectedVariableColumns: string[] = []
): { isValid: boolean; errors: Array<{ field: string; message: string }> } => {
    const errors: Array<{ field: string; message: string }> = [];

    if (!headers || headers.length === 0) {
        errors.push({ field: 'Header', message: 'CSV appears to be empty or missing a header row.' });
        return { isValid: false, errors };
    }

    const normalized = headers.map(h => (h || '').toString().trim().toLowerCase());

    // Required phone columns
    const required = ['country_code', 'mobile_number'];
    for (const req of required) {
        if (!normalized.includes(req)) {
            errors.push({ field: 'Header', message: `Missing required column: ${req}` });
        }
    }

    // Check for duplicate header names
    const seen: Record<string, number> = {};
    normalized.forEach((h, idx) => {
        if (!h) {
            errors.push({ field: 'Header', message: `Empty header detected at column ${idx + 1}` });
        }
        seen[h] = (seen[h] || 0) + 1;
    });
    Object.keys(seen).forEach(k => {
        if (k && seen[k] > 1) {
            errors.push({ field: 'Header', message: `Duplicate header name: ${k}` });
        }
    });

    // Check expected variable columns (if provided)
    for (const expected of expectedVariableColumns) {
        const key = (expected || '').toString().trim().toLowerCase();
        if (!key) continue;
        if (!normalized.includes(key)) {
            errors.push({ field: 'Header', message: `Missing variable column: ${expected}` });
        }
    }

    return { isValid: errors.length === 0, errors };
};

/**
 * Formats ISO date string to readable format
 * @param dateString ISO 8601 date string
 * @returns Formatted date string (e.g., "Jan 10, 2026")
 */
export const formatCampaignDate = (dateString: string): string => {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    } catch {
        return dateString;
    }
};

/**
 * Formats ISO datetime string to readable format with time
 * @param dateString ISO 8601 datetime string
 * @returns Formatted datetime string (e.g., "Jan 10, 2026 at 3:30 PM")
 */
export const formatCampaignDateTime = (dateString: string): string => {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
    } catch {
        return dateString;
    }
};

/**
 * Calculates percentage and returns formatted string
 * @param part Partial value
 * @param total Total value
 * @returns Percentage string (e.g., "85%")
 */
export const calculatePercentage = (part: number, total: number): string => {
    if (total === 0) return "0%";
    const percentage = Math.round((part / total) * 100);
    return `${percentage}%`;
};

/**
 * Gets color class for campaign status
 * @param status Campaign status
 * @returns Tailwind color classes
 */
export const getCampaignStatusColor = (status: CampaignStatus): string => {
    switch (status) {
        case "completed":
            return "bg-emerald-500/10 text-emerald-500";
        case "active":
            return "bg-blue-500/10 text-blue-500 animate-pulse";
        case "scheduled":
            return "bg-yellow-500/10 text-yellow-500";
        case "failed":
            return "bg-red-500/10 text-red-500";
        case "paused":
            return "bg-amber-500/10 text-amber-500";
        case "draft":
            return "bg-slate-500/10 text-slate-500";
        case "cancelled":
            return "bg-orange-500/10 text-orange-500";
        case "deleted":
            return "bg-rose-500/10 text-rose-500";
        default:
            return "bg-slate-500/10 text-slate-500";
    }
};

/**
 * Gets color class for recipient status
 * @param status Recipient status
 * @returns Tailwind color classes
 */
export const getRecipientStatusColor = (status: RecipientStatus): string => {
    switch (status) {
        case "delivered":
            return "bg-emerald-500/10 text-emerald-500";
        case "read":
            return "bg-blue-500/10 text-blue-500";
        case "sent":
            return "bg-yellow-500/10 text-yellow-500";
        case "pending":
            return "bg-slate-500/10 text-slate-500";
        case "failed":
            return "bg-red-500/10 text-red-500"; // Retryable failure (lighter)
        case "permanently_failed":
            return "bg-red-900/20 text-red-700 font-semibold"; // F-13: Distinct permanent failure (darker, bold)
        default:
            return "bg-slate-500/10 text-slate-500";
    }
};

/**
 * Calculates campaign statistics with percentages
 * @param data Campaign data
 * @returns Statistics object with percentages
 */
export const calculateCampaignStatistics = (data: {
    total_audience: number;
    delivered_count: number;
    read_count: number;
    replied_count: number;
}): CampaignStatistics => {
    const { total_audience, delivered_count, read_count, replied_count } = data;

    return {
        total_audience,
        delivered_count,
        read_count,
        replied_count,
        delivered_percentage: total_audience
            ? Math.round((delivered_count / total_audience) * 100)
            : 0,
        read_percentage: total_audience
            ? Math.round((read_count / total_audience) * 100)
            : 0,
        replied_percentage: total_audience
            ? Math.round((replied_count / total_audience) * 100)
            : 0,
    };
};

/**
 * Checks if a campaign is currently active
 * @param status Campaign status
 * @returns true if campaign is active
 */
export const isCampaignActive = (status: CampaignStatus): boolean => {
    return status === "active";
};

/**
 * Checks if a campaign can be executed manually
 * @param status Campaign status
 * @returns true if campaign can be executed
 */
export const canExecuteCampaign = (status: CampaignStatus): boolean => {
    return status === "draft" || status === "scheduled";
};

interface CsvVariableDefinition {
    variable_key?: string;
    name?: string;
    label?: string;
    sample_value?: string;
}

const normalizeCsvHeader = (value: string) =>
    value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "") || "value";

/**
 * Generates CSV template for download
 * @param variableCount Number of dynamic variables
 * @returns CSV string
 */
export const generateCSVTemplate = (variableArray: CsvVariableDefinition[]): string => {
    const headers = ["country_code", "mobile_number"];
    variableArray.forEach((v, i) => {
        const rawLabel = v.name || v.label || v.variable_key || String(i + 1);
        headers.push(normalizeCsvHeader(rawLabel));
    });

    const exampleRow = ["91", "6369441531"];
    variableArray.forEach((v, i) => {
        exampleRow.push(v.sample_value || `Value ${i + 1}`);
    });

    return `${headers.join(",")}\n${exampleRow.join(",")}`;
};

/**
 * Downloads CSV template file
 * @param variableCount Number of dynamic variables
 * @param templateName Template name for filename
 */
export const downloadCSVTemplate = (
    variableArray: CsvVariableDefinition[],
    templateName: string
): void => {
    const csv = generateCSVTemplate(variableArray);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `campaign_template_${templateName}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
};
