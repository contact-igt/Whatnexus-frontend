/**
 * HTTP Error Code to User-Friendly Message Mapper
 * Maps HTTP status codes to specific, actionable error messages
 */

export interface HttpErrorInfo {
    message: string;
    actionable: boolean;
    retry?: boolean;
}

/**
 * Map HTTP status code to specific error message and metadata
 * @param code HTTP status code
 * @param fallback Fallback message if code is not recognized
 * @returns Error info with message and metadata
 */
export const getHttpErrorMessage = (code: number | null | undefined, fallback?: string): HttpErrorInfo => {
    if (!code) {
        return {
            message: fallback || 'An error occurred. Please try again.',
            actionable: false,
            retry: true,
        };
    }

    const codeToMessage: Record<number, HttpErrorInfo> = {
        // 4xx Client Errors
        400: {
            message: 'Invalid request. Please check your input and try again.',
            actionable: true,
            retry: false,
        },
        401: {
            message: 'Your session has expired. Please log in again.',
            actionable: true,
            retry: false,
        },
        403: {
            message: 'You do not have permission to perform this action. Contact your administrator if this is unexpected.',
            actionable: true,
            retry: false,
        },
        404: {
            message: 'The resource was not found. It may have been deleted or you may not have access to it.',
            actionable: true,
            retry: false,
        },
        409: {
            message: 'This resource is already in use or has been modified. Please refresh and try again.',
            actionable: true,
            retry: true,
        },
        422: {
            message: 'The data provided is invalid. Please check your input and try again.',
            actionable: true,
            retry: false,
        },
        429: {
            message: 'Too many requests. Please wait a moment before trying again.',
            actionable: true,
            retry: true,
        },

        // 5xx Server Errors
        500: {
            message: 'Server error. Please try again in a moment.',
            actionable: false,
            retry: true,
        },
        502: {
            message: 'Service temporarily unavailable. Please try again shortly.',
            actionable: false,
            retry: true,
        },
        503: {
            message: 'Service is undergoing maintenance. Please try again later.',
            actionable: false,
            retry: true,
        },
        504: {
            message: 'Request timeout. Please check your connection and try again.',
            actionable: false,
            retry: true,
        },
    };

    return codeToMessage[code] || {
        message: fallback || 'An error occurred. Please try again.',
        actionable: false,
        retry: code >= 500,
    };
};

/**
 * Extract HTTP status code from various error object structures
 * @param error Error object (axios, fetch, or custom)
 * @returns HTTP status code or null
 */
export const extractHttpStatusCode = (error: unknown): number | null => {
    if (typeof error !== 'object' || error === null) return null;

    const err = error as any;

    // Axios error structure
    if (err?.response?.status) return err.response.status;
    if (err?.status) return err.status;

    // Fetch error structure
    if (err?.statusCode) return err.statusCode;

    // Meta API error structure
    if (err?.error?.code) {
        const code = Number(err.error.code);
        return isNaN(code) ? null : code;
    }

    // HTTP error code in message
    const httpMatch = String(err?.message || '').match(/(\d{3})/);
    if (httpMatch) {
        const code = Number(httpMatch[1]);
        if (code >= 100 && code < 600) return code;
    }

    return null;
};

/**
 * Get formatted error message for display to user
 * Combines API error message with HTTP code-specific guidance
 * @param error Error object
 * @param fallback Fallback message
 * @returns User-friendly error message
 */
export const formatApiErrorForUser = (error: unknown, fallback?: string): string => {
    const httpCode = extractHttpStatusCode(error);
    const errorInfo = getHttpErrorMessage(httpCode, fallback);

    // If we have API-provided message, prepend it to the HTTP guidance
    if (typeof error === 'object' && error !== null) {
        const err = error as any;
        const apiMessage = err?.response?.data?.message || err?.message;

        if (apiMessage && apiMessage !== errorInfo.message) {
            return `${apiMessage} — ${errorInfo.message}`;
        }
    }

    return errorInfo.message;
};

/**
 * Determine if an error is retryable based on HTTP code
 * @param error Error object
 * @returns True if the error is transient and should be retried
 */
export const isRetryableError = (error: unknown): boolean => {
    const httpCode = extractHttpStatusCode(error);
    if (!httpCode) return false;

    // 5xx errors are generally retryable
    if (httpCode >= 500 && httpCode < 600) return true;

    // Specific retryable 4xx errors
    if (httpCode === 429 || httpCode === 409) return true;

    return false;
};
