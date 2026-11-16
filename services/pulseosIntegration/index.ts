import { _axios } from "@/helper/axios";

export type CheckStatus = "pass" | "fail" | "warn";

export interface ReadinessCheck {
    id: string;
    label: string;
    required: boolean;
    status: CheckStatus;
    detail: string;
    fix?: string;
}

export interface AuditEntry {
    at: string;
    by: string;
    action: string;
    detail?: string;
}

export interface PulseosIntegrationView {
    configured: boolean;
    enabled: boolean;
    pulseosTenantId: string | null;
    keyId: string | null;
    hasApiKey: boolean;
    callbackUrl: string | null;
    hasCallbackSecret: boolean;
    previousKeyExpiresAt: string | null;
    updatedAt: string | null;
    updatedBy: string | null;
    lastPing: { ok: boolean; at: number; status: number | null; error?: string | null; url: string } | null;
    audit: AuditEntry[];
    pairing: { active: boolean; expiresAt: string | null; expectedPulseosTenantId: string | null };
}

export interface PulseosReadiness {
    ready: boolean;
    enabled: boolean;
    blocking: string[];
    checks: ReadinessCheck[];
    checkedAt: string;
    integration: PulseosIntegrationView;
    handoff: { baseUrl: string; whatsnexusTenantId: string; callbackUrl: string | null };
}

/** What the server returns once, when a credential is generated. Never stored by the page beyond the reveal dialog. */
export interface ApiKeyIssued { apiKey: string; keyId: string; previousKeyExpiresAt: string | null }
export interface CallbackSecretIssued { callbackSecret: string }
export interface PairingIssued { code: string; expiresAt: string }
export interface TestResult { ok: boolean; status: number | null; error: string | null }
export interface Envelope<T> { success: boolean; data: T }

const base = (tenantId: string) => `/management/integrations/pulseos/${encodeURIComponent(tenantId)}`;

export class PulseosIntegrationApiData {
    getReadiness = async (tenantId: string): Promise<{ success: boolean; data: PulseosReadiness }> =>
        await _axios("get", `${base(tenantId)}/readiness`);

    updateSettings = async (tenantId: string, data: { pulseosTenantId?: string; callbackUrl?: string; enabled?: boolean }): Promise<Envelope<PulseosIntegrationView>> =>
        await _axios("put", base(tenantId), data);

    rotateApiKey = async (tenantId: string, data: { overlapSeconds?: number } = {}): Promise<Envelope<ApiKeyIssued>> =>
        await _axios("post", `${base(tenantId)}/api-key`, data);

    rotateCallbackSecret = async (tenantId: string): Promise<Envelope<CallbackSecretIssued>> =>
        await _axios("post", `${base(tenantId)}/callback-secret`, {});

    createPairing = async (tenantId: string, data: { expectedPulseosTenantId?: string } = {}): Promise<Envelope<PairingIssued>> =>
        await _axios("post", `${base(tenantId)}/pairing`, data);

    cancelPairing = async (tenantId: string): Promise<Envelope<{ cancelled: boolean }>> => await _axios("delete", `${base(tenantId)}/pairing`);

    testCallback = async (tenantId: string): Promise<Envelope<TestResult>> => await _axios("post", `${base(tenantId)}/test-callback`, {});

    replayDeadCallbacks = async (tenantId: string): Promise<Envelope<{ replayed: number }>> =>
        await _axios("post", `${base(tenantId)}/callbacks/replay-dead`, {});
}
