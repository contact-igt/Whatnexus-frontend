"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, Copy, KeyRound, Loader2, Plug, RefreshCw, Send, ShieldCheck, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";
import { ConfirmationModal } from "@/components/ui/confirmationModal";
import { toast } from "@/lib/toast";
import type { AuditEntry, ReadinessCheck } from "@/services/pulseosIntegration";
import {
    pulseosErrorMessage,
    usePulseosReadinessQuery,
    usePulseosReplayDead,
    usePulseosRotateApiKey,
    usePulseosRotateCallbackSecret,
    usePulseosTestCallback,
    usePulseosUpdateSettings,
} from "@/hooks/usePulseosIntegrationQuery";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const AUDIT_LABEL: Record<string, string> = {
    tenant_bound: "Bound a PulseOS tenant",
    callback_url_set: "Set the callback address",
    api_key_issued: "Issued an API key",
    api_key_rotated: "Rotated the API key",
    callback_secret_issued: "Issued a callback secret",
    callback_secret_rotated: "Rotated the callback secret",
    test_callback_ok: "Test callback succeeded",
    test_callback_failed: "Test callback failed",
    enabled: "Enabled the integration",
    disabled: "Disabled the integration",
    callbacks_replayed: "Replayed failed callbacks",
};

const OVERLAPS = [
    { label: "in 1 hour (recommended)", value: 3600 },
    { label: "in 24 hours", value: 86400 },
    { label: "immediately", value: 0 },
];

type Reveal = { title: string; label: string; value: string; note: string };
type Confirm = "enable" | "disable" | "replay" | null;

const copy = async (text: string, what: string) => {
    try {
        await navigator.clipboard.writeText(text);
        toast.success(`${what} copied`);
    } catch {
        toast.error("Copy failed. Select the text and copy it manually.");
    }
};

const when = (iso: string) => {
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? iso : d.toLocaleString();
};

export const PulseosIntegrationPanel = ({
    tenant,
    canManage,
    isDarkMode,
    onClose,
}: {
    tenant: { tenant_id: string; company_name: string } | null;
    /** Only a super admin changes anything; a platform admin reads. */
    canManage: boolean;
    isDarkMode: boolean;
    onClose: () => void;
}) => {
    const tenantId = tenant?.tenant_id ?? null;
    const { data, isLoading, isFetching, isError, error, refetch } = usePulseosReadinessQuery(tenantId);
    const settings = usePulseosUpdateSettings(tenantId);
    const apiKey = usePulseosRotateApiKey(tenantId);
    const secret = usePulseosRotateCallbackSecret(tenantId);
    const test = usePulseosTestCallback(tenantId);
    const replay = usePulseosReplayDead(tenantId);

    const readiness = data?.data;
    const integration = readiness?.integration;

    // null = untouched: the box shows what the server has. (The page is keyed by tenant, so a draft never leaks into another one.)
    const [tenantDraft, setTenantDraft] = useState<string | null>(null);
    const [urlDraft, setUrlDraft] = useState<string | null>(null);
    const [overlap, setOverlap] = useState(3600);
    const [reveal, setReveal] = useState<Reveal | null>(null);
    const [saved, setSaved] = useState(false);
    const [rotating, setRotating] = useState<"apiKey" | "secret" | null>(null);
    const [typed, setTyped] = useState("");
    const [confirm, setConfirm] = useState<Confirm>(null);

    const pulseosTenant = tenantDraft ?? integration?.pulseosTenantId ?? "";
    const callbackUrl = urlDraft ?? integration?.callbackUrl ?? "";

    const muted = isDarkMode ? "text-white/50" : "text-slate-500";
    const strong = isDarkMode ? "text-white" : "text-slate-900";
    const card = cn("rounded-xl border p-4", isDarkMode ? "border-white/10 bg-white/[0.03]" : "border-slate-200 bg-slate-50/60");
    const input = cn(
        "w-full rounded-lg border px-3 py-2 text-sm font-mono outline-none focus:ring-2 focus:ring-emerald-500/40 disabled:opacity-60",
        isDarkMode ? "border-white/10 bg-white/5 text-white placeholder:text-white/30" : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400",
    );
    const btn = (kind: "primary" | "ghost" | "danger" = "ghost") =>
        cn(
            "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
            kind === "primary" && "bg-emerald-600 text-white hover:bg-emerald-500",
            kind === "danger" && (isDarkMode ? "bg-red-500/15 text-red-300 hover:bg-red-500/25" : "bg-red-50 text-red-700 hover:bg-red-100"),
            kind === "ghost" && (isDarkMode ? "bg-white/5 text-white/80 hover:bg-white/10" : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"),
        );

    const state = !readiness ? "…" : readiness.enabled ? "Enabled" : readiness.ready ? "Ready to enable" : "Not ready";
    const stateTone =
        state === "Enabled" ? "bg-emerald-500/15 text-emerald-600" : state === "Ready to enable" ? "bg-sky-500/15 text-sky-600" : "bg-amber-500/15 text-amber-600";

    const issued = integration?.hasApiKey;
    const hasSecret = integration?.hasCallbackSecret;
    const bindDirty = tenantDraft !== null && pulseosTenant.trim() !== (integration?.pulseosTenantId ?? "");
    const urlDirty = urlDraft !== null && callbackUrl.trim() !== (integration?.callbackUrl ?? "");
    const bindValid = UUID.test(pulseosTenant.trim());
    const deadWarn = readiness?.checks.find((c) => c.id === "deadCallbacks")?.status === "warn";

    const generate = (which: "apiKey" | "secret") => {
        const show = (value: string, label: string, note: string) => {
            setSaved(false);
            setRotating(null);
            setTyped("");
            setReveal({ title: label, label, value, note });
        };
        if (which === "apiKey") {
            apiKey.mutateAsync({ overlapSeconds: overlap }).then((res) => {
                const d = res.data;
                show(d.apiKey, "API key", `Enter this in PulseOS (Integrations → WhatsNexus → API key). ${d.previousKeyExpiresAt ? `The previous key keeps working until ${when(d.previousKeyExpiresAt)}.` : ""}`);
            }).catch(() => {});
        } else {
            secret.mutateAsync().then((res) => {
                show(res.data.callbackSecret, "Callback secret", "Enter this in PulseOS (Integrations → WhatsNexus → Callback secret). Until you do, callbacks will be refused.");
            }).catch(() => {});
        }
    };

    const startRotate = (which: "apiKey" | "secret") => {
        const exists = which === "apiKey" ? issued : hasSecret;
        if (!exists) return generate(which);
        setTyped("");
        setRotating(which);
    };

    const sendTest = () =>
        test.mutateAsync().then((res) => {
            const r = res.data;
            if (r.ok) toast.success("PulseOS answered the signed test.");
            else toast.error(r.status ? `PulseOS answered HTTP ${r.status}. Check the callback secret entered there.` : `No answer from PulseOS${r.error ? ` (${r.error})` : ""}.`);
        }).catch(() => {});

    const runConfirm = () => {
        const which = confirm;
        setConfirm(null);
        if (which === "enable") settings.mutate({ enabled: true }, { onSuccess: () => toast.success("PulseOS integration enabled.") });
        if (which === "disable") settings.mutate({ enabled: false }, { onSuccess: () => toast.success("PulseOS integration disabled.") });
        if (which === "replay") replay.mutate(undefined, { onSuccess: (r) => toast.success(`${r.data.replayed} callbacks queued again.`) });
    };

    const busy = settings.isPending || apiKey.isPending || secret.isPending || test.isPending || replay.isPending;

    return (
        <>
            <Modal
                isOpen={!!tenant}
                onClose={onClose}
                title="PulseOS integration"
                description={tenant ? `${tenant.company_name} · ${tenant.tenant_id}` : undefined}
                isDarkMode={isDarkMode}
                className="max-w-3xl"
            >
                {isLoading ? (
                    <div className={cn("flex items-center gap-2 py-12 justify-center text-sm", muted)}><Loader2 className="animate-spin" size={16} /> Checking this tenant…</div>
                ) : isError || !readiness ? (
                    <div className={card}>
                        <p className={cn("text-sm font-semibold", strong)}>The checklist could not be loaded.</p>
                        <p className={cn("mt-1 text-xs", muted)}>{pulseosErrorMessage(error, "Try again in a moment.")}</p>
                        <button className={cn(btn(), "mt-3")} onClick={() => refetch()}><RefreshCw size={13} /> Try again</button>
                    </div>
                ) : (
                    <div className="space-y-5 font-sans">
                        {/* Status + enable */}
                        <div className={cn(card, "flex flex-wrap items-center justify-between gap-3")}>
                            <div className="flex items-center gap-3">
                                <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", stateTone)} data-testid="pulseos-state">{state}</span>
                                <p className={cn("text-xs", muted)}>
                                    {readiness.enabled
                                        ? "PulseOS can send messages through this tenant's WhatsApp number."
                                        : readiness.ready
                                            ? "Every required check passes. Enabling lets PulseOS send messages."
                                            : `${readiness.blocking.length} required check${readiness.blocking.length === 1 ? "" : "s"} still need attention.`}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className={btn()} onClick={() => refetch()} disabled={isFetching} aria-label="Re-check"><RefreshCw size={13} className={cn(isFetching && "animate-spin")} /> Re-check</button>
                                {canManage && (readiness.enabled ? (
                                    <button className={btn("danger")} onClick={() => setConfirm("disable")} disabled={busy}>Disable</button>
                                ) : (
                                    <button className={btn("primary")} onClick={() => setConfirm("enable")} disabled={busy || !readiness.ready} title={readiness.ready ? undefined : "Every required check must pass first"} data-testid="pulseos-enable">
                                        <ShieldCheck size={13} /> Enable
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Checklist */}
                        <section aria-label="Readiness checklist">
                            <h3 className={cn("mb-2 text-xs font-semibold uppercase tracking-wide", muted)}>Checklist</h3>
                            <ul className="space-y-1.5">
                                {readiness.checks.map((c: ReadinessCheck) => (
                                    <li key={c.id} className={cn("flex gap-3 rounded-lg px-3 py-2", isDarkMode ? "bg-white/[0.03]" : "bg-slate-50")} data-testid={`check-${c.id}`} data-status={c.status}>
                                        {c.status === "pass" ? <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-500" /> : c.status === "warn" ? <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-500" /> : <XCircle size={16} className="mt-0.5 shrink-0 text-red-500" />}
                                        <div className="min-w-0">
                                            <p className={cn("text-sm font-medium", strong)}>{c.label}{!c.required && <span className={cn("ml-2 text-[10px] font-normal uppercase", muted)}>advisory</span>}</p>
                                            <p className={cn("break-words text-xs", muted)}>{c.detail}</p>
                                            {c.status !== "pass" && c.fix && <p className="mt-0.5 text-xs text-amber-600">{c.fix}</p>}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </section>

                        {/* Setup */}
                        <section aria-label="Setup" className="space-y-3">
                            <h3 className={cn("text-xs font-semibold uppercase tracking-wide", muted)}>Setup</h3>
                            {!canManage && <p className={cn("text-xs", muted)}>You can see this tenant&apos;s status. Only a super admin can change it.</p>}

                            <div className={card}>
                                <label className={cn("mb-1 block text-xs font-semibold", strong)} htmlFor="pulseos-tenant">PulseOS tenant id</label>
                                <div className="flex gap-2">
                                    <input id="pulseos-tenant" className={input} value={pulseosTenant} onChange={(e) => setTenantDraft(e.target.value)} placeholder="00000000-0000-0000-0000-000000000000" disabled={!canManage} spellCheck={false} />
                                    {canManage && <button className={btn("primary")} disabled={busy || !bindDirty || !bindValid} onClick={() => settings.mutate({ pulseosTenantId: pulseosTenant.trim() }, { onSuccess: () => { setTenantDraft(null); toast.success("PulseOS tenant bound."); } })}>Bind</button>}
                                </div>
                                <p className={cn("mt-1 text-xs", muted)}>The UUID shown in PulseOS for this hospital. Requests for any other tenant are refused.</p>
                                {pulseosTenant && !bindValid && <p className="mt-1 text-xs text-red-500">That is not a valid UUID.</p>}
                            </div>

                            <div className={card}>
                                <label className={cn("mb-1 block text-xs font-semibold", strong)} htmlFor="pulseos-callback">Callback address</label>
                                <div className="flex gap-2">
                                    <input id="pulseos-callback" className={input} value={callbackUrl} onChange={(e) => setUrlDraft(e.target.value)} placeholder="https://pulseos.example.org/webhooks/whatsnexus/<PulseOS tenant id>" disabled={!canManage} spellCheck={false} />
                                    {canManage && <button className={btn("primary")} disabled={busy || !urlDirty || !callbackUrl.trim()} onClick={() => settings.mutate({ callbackUrl: callbackUrl.trim() }, { onSuccess: () => { setUrlDraft(null); toast.success("Callback address saved."); } })}>Save</button>}
                                </div>
                                <p className={cn("mt-1 text-xs", muted)}>Where WhatsNexus sends delivery status and patient replies. Must be a public https address.</p>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className={card}>
                                    <div className="flex items-center gap-2"><KeyRound size={14} className={muted} /><p className={cn("text-xs font-semibold", strong)}>API key</p></div>
                                    <p className={cn("mt-1 text-xs", muted)}>{issued ? `Active key ${integration?.keyId}. The value cannot be shown again.` : "Not issued yet."}</p>
                                    {canManage && (
                                        <button className={cn(btn(issued ? "ghost" : "primary"), "mt-3")} disabled={busy} onClick={() => startRotate("apiKey")} data-testid="pulseos-api-key">
                                            {apiKey.isPending ? <Loader2 size={13} className="animate-spin" /> : <KeyRound size={13} />} {issued ? "Rotate key" : "Generate key"}
                                        </button>
                                    )}
                                </div>
                                <div className={card}>
                                    <div className="flex items-center gap-2"><ShieldCheck size={14} className={muted} /><p className={cn("text-xs font-semibold", strong)}>Callback secret</p></div>
                                    <p className={cn("mt-1 text-xs", muted)}>{hasSecret ? "A secret is set. The value cannot be shown again." : "Not issued yet."}</p>
                                    {canManage && (
                                        <button className={cn(btn(hasSecret ? "ghost" : "primary"), "mt-3")} disabled={busy} onClick={() => startRotate("secret")} data-testid="pulseos-secret">
                                            {secret.isPending ? <Loader2 size={13} className="animate-spin" /> : <ShieldCheck size={13} />} {hasSecret ? "Rotate secret" : "Generate secret"}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {canManage && (
                                <div className="flex flex-wrap gap-2">
                                    <button className={btn()} disabled={busy || !hasSecret || !integration?.callbackUrl} onClick={sendTest} data-testid="pulseos-test">
                                        {test.isPending ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />} Send test callback
                                    </button>
                                    {deadWarn && <button className={btn()} disabled={busy} onClick={() => setConfirm("replay")}><RefreshCw size={13} /> Replay failed callbacks</button>}
                                </div>
                            )}
                        </section>

                        {/* Hand-off */}
                        <section aria-label="What to enter in PulseOS">
                            <h3 className={cn("mb-2 text-xs font-semibold uppercase tracking-wide", muted)}>Enter this in PulseOS</h3>
                            <div className={cn(card, "space-y-2")}>
                                <p className={cn("text-xs", muted)}>PulseOS → Integrations → WhatsNexus → set Live mode, fill these, then Check Status.</p>
                                {[
                                    ["Base URL", readiness.handoff.baseUrl],
                                    ["WhatsNexus tenant id", readiness.handoff.whatsnexusTenantId],
                                    ["Callback URL", readiness.handoff.callbackUrl],
                                ].map(([label, value]) => (
                                    <div key={label} className="flex items-center justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className={cn("text-[11px] uppercase", muted)}>{label}</p>
                                            <p className={cn("truncate font-mono text-xs", strong)}>{value}</p>
                                        </div>
                                        {value && <button className={btn()} onClick={() => copy(value as string, label as string)} aria-label={`Copy ${label}`}><Copy size={13} /></button>}
                                    </div>
                                ))}
                                <p className={cn("text-xs", muted)}>The API key and callback secret are shown once, when you generate them.</p>
                            </div>
                        </section>

                        {/* Audit */}
                        <section aria-label="History">
                            <h3 className={cn("mb-2 text-xs font-semibold uppercase tracking-wide", muted)}>History</h3>
                            {integration?.audit.length ? (
                                <ul className="space-y-1">
                                    {integration.audit.map((a: AuditEntry, i) => (
                                        <li key={`${a.at}-${i}`} className={cn("flex flex-wrap items-baseline justify-between gap-2 text-xs", muted)}>
                                            <span><span className={strong}>{AUDIT_LABEL[a.action] ?? a.action}</span>{a.detail ? ` · ${a.detail}` : ""}</span>
                                            <span>{when(a.at)} · {a.by}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className={cn("text-xs", muted)}>Nothing has been changed yet.</p>
                            )}
                        </section>
                    </div>
                )}
            </Modal>

            {/* Rotating something that is already in use needs the tenant's name typed. */}
            <Modal
                isOpen={!!rotating}
                onClose={() => setRotating(null)}
                title={rotating === "apiKey" ? "Rotate the API key?" : "Rotate the callback secret?"}
                description={rotating === "apiKey" ? "PulseOS stops working for this tenant until the new key is entered there." : "PulseOS will refuse callbacks until the new secret is entered there."}
                isDarkMode={isDarkMode}
                footer={
                    <div className="flex justify-end gap-3 font-sans">
                        <button className={btn()} onClick={() => setRotating(null)}>Cancel</button>
                        <button className={btn("danger")} disabled={typed.trim() !== tenant?.company_name || busy} onClick={() => rotating && generate(rotating)} data-testid="pulseos-rotate-confirm">Rotate</button>
                    </div>
                }
            >
                <div className="space-y-3 font-sans">
                    {rotating === "apiKey" && (
                        <div>
                            <label className={cn("mb-1 block text-xs font-semibold", strong)} htmlFor="pulseos-overlap">Old key stops working</label>
                            <select id="pulseos-overlap" className={input} value={overlap} onChange={(e) => setOverlap(Number(e.target.value))}>
                                {OVERLAPS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </div>
                    )}
                    <label className={cn("block text-xs", muted)} htmlFor="pulseos-typed">Type <span className={cn("font-semibold", strong)}>{tenant?.company_name}</span> to confirm</label>
                    <input id="pulseos-typed" className={input} value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" spellCheck={false} />
                </div>
            </Modal>

            {/* A generated secret is shown exactly once. */}
            <Modal
                isOpen={!!reveal}
                onClose={() => { if (saved) setReveal(null); }}
                title={reveal ? `${reveal.title} — copy it now` : undefined}
                description="It is shown only this once and cannot be retrieved later."
                isDarkMode={isDarkMode}
                footer={
                    <div className="flex items-center justify-between gap-3 font-sans">
                        <label className={cn("flex cursor-pointer items-center gap-2 text-xs", strong)}>
                            <input type="checkbox" checked={saved} onChange={(e) => setSaved(e.target.checked)} data-testid="pulseos-saved" /> I have saved it
                        </label>
                        <button className={btn("primary")} disabled={!saved} onClick={() => setReveal(null)} data-testid="pulseos-reveal-done">Done</button>
                    </div>
                }
            >
                {reveal && (
                    <div className="space-y-3 font-sans">
                        <div className={cn(card, "flex items-center justify-between gap-3")}>
                            <code className={cn("min-w-0 break-all text-xs", strong)} data-testid="pulseos-secret-value">{reveal.value}</code>
                            <button className={btn()} onClick={() => copy(reveal.value, reveal.label)} aria-label={`Copy ${reveal.label}`}><Copy size={13} /> Copy</button>
                        </div>
                        <p className={cn("text-xs", muted)}>{reveal.note}</p>
                    </div>
                )}
            </Modal>

            <ConfirmationModal
                isOpen={!!confirm}
                onClose={() => setConfirm(null)}
                onConfirm={runConfirm}
                isDarkMode={isDarkMode}
                variant={confirm === "disable" ? "danger" : "warning"}
                title={confirm === "enable" ? "Enable the PulseOS integration?" : confirm === "disable" ? "Disable the PulseOS integration?" : "Replay failed callbacks?"}
                message={
                    confirm === "enable"
                        ? "PulseOS will be able to send approved templates to patients through this tenant's WhatsApp number."
                        : confirm === "disable"
                            ? "PulseOS can no longer send through this tenant. Messages already accepted are still finished and reported."
                            : "Callbacks that could not be delivered will be sent to PulseOS again."
                }
                confirmText={confirm === "enable" ? "Enable" : confirm === "disable" ? "Disable" : "Replay"}
            />
        </>
    );
};

export const PulseosIntegrationButton = ({ isDarkMode, onClick }: { isDarkMode: boolean; onClick: () => void }) => (
    <button
        onClick={onClick}
        title="PulseOS integration"
        aria-label="PulseOS integration"
        className={cn("p-2 rounded-lg transition-colors hover:bg-emerald-500/10 hover:text-emerald-500", isDarkMode ? "text-white/60" : "text-slate-500")}
    >
        <Plug size={16} />
    </button>
);
