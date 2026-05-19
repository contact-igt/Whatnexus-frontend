/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { jwtDecode } from "jwt-decode";
import { store } from "../redux/store";
import type { RootState } from "../redux/store";
import {
  clearAuthData,
  setAccountError,
  setAuthData,
} from "@/redux/slices/auth/authSlice";
import { queryClient } from "@/lib/queryClient";

interface JwtPayload {
  exp: number;
  [key: string]: any;
}

const DEFAULT_TIMEOUT = Number(process.env.NEXT_PUBLIC_AXIOS_TIMEOUT || 15000);
const DEFAULT_MAX_RETRIES = Number(process.env.NEXT_PUBLIC_AXIOS_MAX_RETRIES || 3);
const DEFAULT_RETRY_DELAY_MS = Number(process.env.NEXT_PUBLIC_AXIOS_RETRY_DELAY_MS || 300);

const isPrivateIpv4Host = (hostname: string) => {
  return /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(hostname);
};

const isLocalBrowserHost = () => {
  if (typeof window === "undefined") return true;
  const hostname = window.location.hostname;
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    hostname === "[::1]" ||
    isPrivateIpv4Host(hostname)
  );
};

const isNgrokBrowserHost = () => {
  if (typeof window === "undefined") return false;
  const hostname = window.location.hostname;
  return hostname.includes("ngrok-free.dev") || hostname.includes("ngrok.io");
};

const getApiBaseUrl = (): string => {
  const env = (process.env.NEXT_PUBLIC_ENV || "").trim();
  const localhostUrl = (process.env.NEXT_PUBLIC_LOCALHOST_API_URL || "").trim();
  const ngrokUrl = (process.env.NEXT_PUBLIC_NGROK_URL || "").trim();

  if (env === "ngrok") return ngrokUrl;
  if (env === "production") return (process.env.NEXT_PUBLIC_PRODUCTION_API_URL || "").trim();
  if (env === "development") return (process.env.NEXT_PUBLIC_DEVELOPMENT_API_URL || "").trim();
  if (env === "stage") return (process.env.NEXT_PUBLIC_STAGE_API_URL || "").trim();
  if (env === "local") return localhostUrl;

  if (isNgrokBrowserHost() && ngrokUrl) return ngrokUrl;
  if (isLocalBrowserHost() && localhostUrl) return localhostUrl;

  return localhostUrl || ngrokUrl;
};

const isAuthEndpoint = (url?: string) => {
  if (!url) return false;
  return (
    url.includes("/management/login") ||
    url.includes("/tenant/login") ||
    url.includes("/management/refresh-token") ||
    url.includes("/management/forgot-Password") ||
    url.includes("/management/verify-otp") ||
    url.includes("/management/reset-password") ||
    url.includes("/tenant/forgot-password") ||
    url.includes("/tenant/verify-otp") ||
    url.includes("/tenant/reset-password")
  );
};

// Plain axios without our interceptors (used for refresh token calls)
const plainAxios = axios.create({ timeout: DEFAULT_TIMEOUT });

// Main axios instance used across the app
const axiosInstance: AxiosInstance = axios.create({ timeout: DEFAULT_TIMEOUT });

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;
let refreshSubscribers: Array<(token: string | null) => void> = [];

const subscribeTokenRefresh = (cb: (token: string | null) => void) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token: string | null) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

const isRetryableStatus = (status?: number) => {
  if (!status) return false;
  // Only retry on server errors and rate limits — never on network/CORS errors
  return status >= 500 || status === 429;
};

// Attach authorization header, meta token and debug logging
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const state: RootState = store.getState();
      const activeTab = state?.auth?.activeTabData;
      let token = state?.auth?.token;

      // If token exists, try decode and proactively refresh if expired
      if (token) {
        try {
          const decoded = jwtDecode<JwtPayload>(token);
          const currentTime = Math.floor(Date.now() / 1000);
          if (decoded?.exp && decoded.exp < currentTime) {
            const refreshToken = state?.auth?.refreshToken;
            if (refreshToken) {
              // perform refresh synchronously so the request proceeds with fresh token
              if (!isRefreshing) {
                isRefreshing = true;
                refreshPromise = performTokenRefresh(refreshToken).catch(() => null);
              }
              const newToken = await refreshPromise;
              if (newToken) token = newToken;
            } else {
              queryClient.clear();
              store.dispatch(clearAuthData());
              throw new Error("Token expired");
            }
          }
        } catch (e) {
          // Bad token format -> clear and continue (will be handled by response)
          console.debug("JWT decode failed in request interceptor", e);
        }
      }

      if (!config.headers) config.headers = {} as any;

      // Skip auth header when explicitly requested
      if (!config.headers["x-skip-auth"] && token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Attach meta token for chat flows when applicable
      const metaToken = state?.auth?.whatsappApiDetails?.accessToken;
      if (activeTab === "chats" && metaToken) {
        config.headers["x-meta-token"] = metaToken;
      }

      // ngrok helper header (backend expects it)
      config.headers["ngrok-skip-browser-warning"] = true;

      // Basic debug
      if (process.env.NODE_ENV !== "production") {
        console.debug(`[Axios][Request] ${config.method?.toUpperCase()} ${config.url}`);
      }

      return config;
    } catch (err) {
      return Promise.reject(err);
    }
  },
  (error) => Promise.reject(error),
);

// Response interceptor handles logging and 401 refresh flow
axiosInstance.interceptors.response.use(
  (res) => {
    if (process.env.NODE_ENV !== "production") {
      console.debug(`[Axios][Response] ${res.config.method?.toUpperCase()} ${res.config.url} -> ${res.status}`);
    }
    return res;
  },
  async (error: AxiosError & { config?: any }) => {
    const originalRequest = error.config;

    // If no response - it's a network-level error; let caller handle retries
    if (!error.response) return Promise.reject(error);

    const status = error.response?.status;

    // 401 handling
    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthEndpoint(originalRequest?.url)
    ) {
      originalRequest._retry = true;
      const state: RootState = store.getState();
      const refreshToken = state?.auth?.refreshToken;

      if (!refreshToken) {
        queryClient.clear();
        store.dispatch(clearAuthData());
        return Promise.reject(error);
      }

      // If refresh is already in progress, queue the request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((token) => {
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(axiosInstance(originalRequest));
            } else {
              reject(error);
            }
          });
        });
      }

      // Start refresh
      isRefreshing = true;
      refreshPromise = performTokenRefresh(refreshToken)
        .then((newToken) => {
          isRefreshing = false;
          onRefreshed(newToken);
          return newToken;
        })
        .catch((refreshErr) => {
          isRefreshing = false;
          onRefreshed(null);
          queryClient.clear();
          store.dispatch(clearAuthData());
          throw refreshErr;
        });

      try {
        const newToken = await refreshPromise;
        if (!newToken) return Promise.reject(error);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } catch (err) {
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  },
);

// Perform refresh token call (raw axios, bypassing axiosInstance interceptors)
async function performTokenRefresh(refreshToken: string): Promise<string | null> {
  try {
    const refreshUrl = `${getApiBaseUrl()}/management/refresh-token`;
    const resp = await plainAxios.post(refreshUrl, { refreshToken });
    const accessToken = resp?.data?.accessToken || resp?.data?.token || null;
    const newRefreshToken = resp?.data?.refreshToken || null;
    if (!accessToken) throw new Error("Refresh failed: no access token returned");

    // Keep current user info in store
    const currentUser = store.getState().auth.user;
    store.dispatch(
      setAuthData({ token: accessToken, refreshToken: newRefreshToken, user: currentUser as any }),
    );
    return accessToken;
  } catch (err) {
    console.error("Token refresh failed:", err);
    return null;
  }
}

// Generic request wrapper with retry + exponential backoff
async function requestWithRetry<T = any>(
  config: AxiosRequestConfig,
  maxRetries = DEFAULT_MAX_RETRIES,
  retryDelayMs = DEFAULT_RETRY_DELAY_MS,
): Promise<AxiosResponse<T>> {
  let attempt = 0;
  let lastError: any = null;

  while (attempt <= maxRetries) {
    try {
      const start = Date.now();
      const res = await axiosInstance.request<T>(config);
      if (process.env.NODE_ENV !== "production") {
        const time = Date.now() - start;
        console.debug(`[Axios][Timing] ${config.method?.toUpperCase()} ${config.url} - ${time}ms`);
      }
      return res;
    } catch (err: any) {
      lastError = err;

      // If it's a 401 we should not retry here (interceptor handles refresh)
      const status = err?.response?.status;
      if (status === 401) throw err;

      // Only retry on server-side failures (5xx, 429).
      // Network errors and CORS failures are not retryable here.
      if (!isRetryableStatus(status)) {
        throw err;
      }

      attempt += 1;
      if (attempt > maxRetries) break;

      const backoff = Math.pow(2, attempt - 1) * retryDelayMs;
      const jitter = Math.floor(Math.random() * 100);
      const wait = backoff + jitter;
      console.warn(`[Axios][Retry] attempt ${attempt}/${maxRetries} for ${config.url}, waiting ${wait}ms`);
      // eslint-disable-next-line no-await-in-loop
      await sleep(wait);
      // retry loop
    }
  }

  throw lastError;
}

export const _axios = async (
  method: string,
  url?: string,
  body?: any,
  contentType: string = "application/json",
  params?: any,
  requestConfig: AxiosRequestConfig = {},
) => {
  const APIURL = getApiBaseUrl();
  const endpoint = `${APIURL}${url || ""}`;
  const state: RootState = store.getState();
  const activeTab = state?.auth?.activeTabData;

  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  const headers: Record<string, any> = {
    ...(isFormData ? {} : { "Content-Type": contentType }),
    "ngrok-skip-browser-warning": true,
  };

  if (activeTab === "chats" && state?.auth?.whatsappApiDetails?.accessToken) {
    headers["x-meta-token"] = state.auth.whatsappApiDetails.accessToken;
  }

  const axiosConfig: AxiosRequestConfig = {
    method: method as any,
    url: endpoint,
    data: body,
    params: params,
    headers: { ...(requestConfig.headers || {}), ...headers },
    timeout: requestConfig.timeout || DEFAULT_TIMEOUT,
    ...requestConfig,
  };

  try {
    const res = await requestWithRetry(axiosConfig);
    return res.data;
  } catch (err: any) {
    // Normalize billing guard errors: backend sends `reason` but frontend expects `message`
    if (err?.response?.data?.blocked && err?.response?.data?.reason && !err?.response?.data?.message) {
      err.response.data.message = err.response.data.reason;
    }

    // If token was rejected and refresh didnt work, clear auth state
    // Skip this for public auth endpoints (login/otp/forgot flows).
    if (err?.response?.status === 401 && !isAuthEndpoint(endpoint)) {
      queryClient.clear();
      store.dispatch(clearAuthData());
    }

    // Detect account-level errors (deactivated / suspended / blocked) and store globally
    const errMsg: string = err?.response?.data?.message || err?.message || "";
    if (/deactivat|suspend|block|disabled|contact your admin/i.test(errMsg)) {
      store.dispatch(setAccountError(errMsg));
    }

    const status = err?.response?.status;
    const isExpectedAuthFailure = isAuthEndpoint(endpoint) && (status === 400 || status === 401);

    // Avoid noisy stack dumps for expected login/auth failures
    if (isExpectedAuthFailure) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("Axios auth request failed:", {
          message: err?.response?.data?.message || err?.message,
          method,
          url: endpoint,
          status,
        });
      }
    } else {
      // Log detailed debug info (include request for CORS/network issues)
      console.error("Axios error:", {
        message: err?.message,
        method,
        url: endpoint,
        status,
        response: err?.response?.data,
        responseHeaders: err?.response?.headers,
        request: err?.request,
        errorJSON: typeof err?.toJSON === "function" ? err.toJSON() : undefined,
        config: err?.config,
      });
    }

    throw err;
  }
};

export const getWebhookBaseURL = (): string => {
  return getApiBaseUrl() || "";
};
