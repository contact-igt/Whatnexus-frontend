import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/lib/toast";
import { PulseosIntegrationApiData } from "@/services/pulseosIntegration";

const Api = new PulseosIntegrationApiData();

const readinessKey = (tenantId: string | null) => ["pulseos-readiness", tenantId];

/** What went wrong, in the server's own words (a 409 NOT_READY names the blocking checks). */
export const pulseosErrorMessage = (error: unknown, fallback: string) => {
    const e = error as { response?: { data?: { message?: string } }; message?: string } | null;
    return e?.response?.data?.message || e?.message || fallback;
};

export const usePulseosReadinessQuery = (tenantId: string | null) =>
    useQuery({
        queryKey: readinessKey(tenantId),
        queryFn: () => Api.getReadiness(tenantId as string),
        enabled: !!tenantId,
        // A checklist is only worth anything if it is current.
        staleTime: 0,
        refetchOnWindowFocus: true,
    });

/** A mutation that refreshes the checklist afterwards. Secrets are returned to the caller once and never cached. */
const useAction = <TArgs = void, TResult = unknown>(tenantId: string | null, run: (args: TArgs) => Promise<TResult>, failure: string, success?: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: run,
        gcTime: 0, // do not keep a returned secret in the mutation cache
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: readinessKey(tenantId) });
            if (success) toast.success(success);
        },
        onError: (error: unknown) => toast.error(pulseosErrorMessage(error, failure)),
    });
};

export const usePulseosUpdateSettings = (tenantId: string | null) =>
    useAction(tenantId, (data: { pulseosTenantId?: string; callbackUrl?: string; enabled?: boolean }) => Api.updateSettings(tenantId as string, data), "Could not save the settings");

export const usePulseosRotateApiKey = (tenantId: string | null) =>
    useAction(tenantId, (data: { overlapSeconds?: number }) => Api.rotateApiKey(tenantId as string, data), "Could not generate the API key");

export const usePulseosRotateCallbackSecret = (tenantId: string | null) =>
    useAction(tenantId, () => Api.rotateCallbackSecret(tenantId as string), "Could not generate the callback secret");

export const usePulseosTestCallback = (tenantId: string | null) =>
    useAction(tenantId, () => Api.testCallback(tenantId as string), "The test callback could not be sent");

export const usePulseosReplayDead = (tenantId: string | null) =>
    useAction(tenantId, () => Api.replayDeadCallbacks(tenantId as string), "Could not replay the failed callbacks");
