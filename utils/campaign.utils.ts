import type {
    CampaignStatus,
    RecipientStatus,
    CSVRecipient,
    CSVValidationResult,
    ValidationError,
    CampaignStatistics,
} from "@/services/campaign/campaign.types";

/**
 * Validates phone number format (91XXXXXXXXXX)
 * @param phone Phone number to validate
 * @returns true if valid, false otherwise
 */
export const validatePhoneNumber = (phone: string): boolean => {
    // Must be exactly 12 digits starting with 91
    const phoneRegex = /^91\d{10}$/;
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
                const text = e.target?.result as string;
                const lines = text.split("\n").filter((line) => line.trim());
                const rows = lines.map((line) =>
                    line.split(",").map((cell) => cell.trim())
                );
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
 * Validates CSV data against template variable count
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

        // Check if row has enough columns (phone + variables)
        if (row.length < templateVariableCount + 1) {
            errors.push({
                field: `Row ${rowNumber}`,
                message: `Insufficient columns. Expected ${templateVariableCount + 1
                    }, got ${row.length}`,
            });
            invalidRows.push(rowNumber);
            return;
        }

        const phoneNumber = row[0];
        const dynamicVariables = row.slice(1, templateVariableCount + 1);

        // Validate phone number
        if (!validatePhoneNumber(phoneNumber)) {
            errors.push({
                field: `Row ${rowNumber}`,
                message: `Invalid phone number format: ${phoneNumber}. Must be 91XXXXXXXXXX`,
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
            mobile_number: phoneNumber,
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
        case "draft":
            return "bg-slate-500/10 text-slate-500";
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
            return "bg-red-500/10 text-red-500";
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

/**
 * Generates CSV template for download
 * @param variableCount Number of dynamic variables
 * @returns CSV string
 */
export const generateCSVTemplate = (variableCount: number): string => {
    const headers = ["mobile_number"];
    for (let i = 1; i <= variableCount; i++) {
        headers.push(`variable_${i}`);
    }

    const exampleRow = ["916369441531"];
    for (let i = 1; i <= variableCount; i++) {
        exampleRow.push(`Example ${i}`);
    }

    return `${headers.join(",")}\n${exampleRow.join(",")}`;
};

/**
 * Downloads CSV template file
 * @param variableCount Number of dynamic variables
 * @param templateName Template name for filename
 */
export const downloadCSVTemplate = (
    variableCount: number,
    templateName: string
): void => {
    const csv = generateCSVTemplate(variableCount);
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
