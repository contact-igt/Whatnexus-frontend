import { _axios } from "@/helper/axios";

export interface ApiRequestLog {
  id: number;
  request_id: string;
  tenant_id?: string | null;
  user_id?: string | null;
  actor_type?: string | null;
  actor_name?: string | null;
  actor_email?: string | null;
  actor_role?: string | null;
  user_type?: string | null;
  method?: string | null;
  original_url?: string | null;
  route_path?: string | null;
  module?: string | null;
  status_code?: number | null;
  success?: boolean | null;
  duration_ms?: number | null;
  ip_address?: string | null;
  forwarded_for?: string | null;
  country?: string | null;
  region?: string | null;
  city?: string | null;
  latitude?: string | null;
  longitude?: string | null;
  timezone?: string | null;
  isp?: string | null;
  user_agent?: string | null;
  browser?: string | null;
  browser_version?: string | null;
  os?: string | null;
  os_version?: string | null;
  device_type?: string | null;
  device_vendor?: string | null;
  device_model?: string | null;
  referer?: string | null;
  origin?: string | null;
  accept_language?: string | null;
  query_json?: Record<string, unknown> | unknown[] | string | null;
  body_keys_json?: string[] | string | null;
  metadata_json?: Record<string, unknown> | string | null;
  error_message?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export class ApiRequestLogsApiData {
  getApiRequestLogs = async (): Promise<ApiRequestLog[]> => {
    const response = await _axios("get", "/management/api-request-logs");
    const logs = response?.data?.logs;
    return Array.isArray(logs) ? logs : [];
  };

  getApiRequestLogById = async (id: string | number): Promise<ApiRequestLog | null> => {
    const response = await _axios("get", `/management/api-request-logs/${id}`);
    return response?.data?.log || null;
  };
}
