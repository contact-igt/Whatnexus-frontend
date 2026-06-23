"use client";

import { useMemo, useState } from "react";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import {
  useCreatePlanMutation,
  useDeletePlanMutation,
  usePatchPlanMutation,
  usePlansQuery,
} from "@/hooks/useModuleAccessManagementQuery";
import { Input } from "@/components/ui/input";
import { Drawer } from "@/components/ui/drawer";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmDialog } from "@/components/ui/confirmDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ActionMenu } from "@/components/ui/actionMenu";

const BILLING_CYCLE_OPTIONS = ["monthly", "quarterly", "yearly", "custom"] as const;
const DEFAULT_BILLING_CYCLE = "monthly";

const toSnakeCaseKey = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "_");

const toNullableText = (value: string) => {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
};

const toNullableNumber = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizeBillingCycle = (value?: string) =>
  BILLING_CYCLE_OPTIONS.includes((value || "") as (typeof BILLING_CYCLE_OPTIONS)[number])
    ? (value as (typeof BILLING_CYCLE_OPTIONS)[number])
    : DEFAULT_BILLING_CYCLE;

export const PlansManagementView = () => {
  const { isDarkMode } = useTheme();
  const { data, isLoading } = usePlansQuery();
  const { mutate: createPlan, isPending: isCreatePending } = useCreatePlanMutation();
  const { mutate: patchPlan, isPending: isPatchPending } = usePatchPlanMutation();
  const { mutate: deletePlan, isPending: isDeletePending } = useDeletePlanMutation();

  const plans = useMemo(() => data?.data || [], [data]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
  const [pendingStatusPlan, setPendingStatusPlan] = useState<any | null>(null);
  const [pendingDeletePlan, setPendingDeletePlan] = useState<any | null>(null);
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({});
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  const [createForm, setCreateForm] = useState({
    plan_id: "",
    plan_key: "",
    plan_name: "",
    description: "",
    price: "",
    billing_cycle: DEFAULT_BILLING_CYCLE,
    sort_order: "0",
    is_active: true,
  });

  const [editForm, setEditForm] = useState({
    plan_key: "",
    plan_name: "",
    description: "",
    price: "",
    billing_cycle: "monthly",
    sort_order: "0",
    is_active: true,
  });

  const resetCreate = () => {
    setCreateForm({
      plan_id: "",
      plan_key: "",
      plan_name: "",
      description: "",
      price: "",
      billing_cycle: DEFAULT_BILLING_CYCLE,
      sort_order: "0",
      is_active: true,
    });
    setCreateErrors({});
  };

  const openEdit = (plan: any) => {
    setSelectedPlan(plan);
    setEditForm({
      plan_key: plan.plan_key || "",
      plan_name: plan.plan_name || "",
      description: plan.description || "",
      price: plan.price === null || plan.price === undefined ? "" : String(plan.price),
      billing_cycle: plan.billing_cycle || "monthly",
      sort_order: String(plan.sort_order ?? 0),
      is_active: Boolean(plan.is_active),
    });
    setEditErrors({});
    setIsEditOpen(true);
  };

  const validateCreate = () => {
    const nextErrors: Record<string, string> = {};
    if (!createForm.plan_id.trim()) nextErrors.plan_id = "plan_id is required";
    if (!createForm.plan_key.trim()) nextErrors.plan_key = "plan_key is required";
    if (!createForm.plan_name.trim()) nextErrors.plan_name = "plan_name is required";
    setCreateErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateEdit = () => {
    const nextErrors: Record<string, string> = {};
    if (!editForm.plan_key.trim()) nextErrors.plan_key = "plan_key is required";
    if (!editForm.plan_name.trim()) nextErrors.plan_name = "plan_name is required";
    setEditErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleCreate = () => {
    if (!validateCreate()) return;

    createPlan(
      {
        plan_id: createForm.plan_id.trim(),
        plan_key: toSnakeCaseKey(createForm.plan_key),
        plan_name: createForm.plan_name.trim(),
        description: toNullableText(createForm.description),
        price: toNullableNumber(createForm.price),
        billing_cycle: normalizeBillingCycle(createForm.billing_cycle),
        sort_order: Number(createForm.sort_order || 0),
        is_active: Boolean(createForm.is_active),
      },
      {
        onSuccess: () => {
          setIsCreateOpen(false);
          resetCreate();
        },
      },
    );
  };

  const handleEditSave = () => {
    if (!selectedPlan) return;
    if (!validateEdit()) return;

    patchPlan(
      {
        planId: selectedPlan.plan_id,
        payload: {
          plan_key: toSnakeCaseKey(editForm.plan_key),
          plan_name: editForm.plan_name.trim(),
          description: toNullableText(editForm.description),
          price: toNullableNumber(editForm.price),
          billing_cycle: editForm.billing_cycle as any,
          sort_order: Number(editForm.sort_order || 0),
          is_active: Boolean(editForm.is_active),
        },
      },
      {
        onSuccess: () => {
          setIsEditOpen(false);
          setSelectedPlan(null);
        },
      },
    );
  };

  const toggleStatus = (plan: any) => {
    patchPlan({
      planId: plan.plan_id,
      payload: { is_active: !Boolean(plan.is_active) },
    }, {
      onSettled: () => setPendingStatusPlan(null),
    });
  };

  const handleDeletePlan = (plan: any) => {
    deletePlan(plan.plan_id, {
      onSuccess: () => {
        setPendingDeletePlan(null);
      },
    });
  };

  return (
    <div className="h-full overflow-y-auto p-8 space-y-6 max-w-[1400px] mx-auto no-scrollbar pb-32">
      <div className="flex justify-between items-end gap-4">
        <div>
          <h1 className={cn("text-3xl font-bold tracking-tight", isDarkMode ? "text-white" : "text-slate-900")}>
            Plans
          </h1>
          <p className={cn("text-sm mt-1", isDarkMode ? "text-white/60" : "text-slate-600")}>
            Manage plan master records for dynamic SaaS access.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors"
        >
          Add Plan
        </button>
      </div>

      <div className={cn("rounded-xl border overflow-hidden", isDarkMode ? "bg-white/5 border-white/10" : "bg-white border-slate-200")}>
        <Table isDarkMode={isDarkMode}>
          <TableHeader isDarkMode={isDarkMode}>
            <TableRow isDarkMode={isDarkMode}>
              <TableHead isDarkMode={isDarkMode}>Plan ID</TableHead>
              <TableHead isDarkMode={isDarkMode}>Key</TableHead>
              <TableHead isDarkMode={isDarkMode}>Name</TableHead>
              <TableHead isDarkMode={isDarkMode}>Billing Cycle</TableHead>
              <TableHead isDarkMode={isDarkMode} align="right">Price</TableHead>
              <TableHead isDarkMode={isDarkMode} align="right">Sort</TableHead>
              <TableHead isDarkMode={isDarkMode} align="center">Status</TableHead>
              <TableHead isDarkMode={isDarkMode} align="center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow isDarkMode={isDarkMode}>
                <TableCell colSpan={8} align="center">
                  <div className={cn("py-10 text-sm", isDarkMode ? "text-white/60" : "text-slate-600")}>
                    Loading plans...
                  </div>
                </TableCell>
              </TableRow>
            ) : plans.length === 0 ? (
              <TableRow isDarkMode={isDarkMode}>
                <TableCell colSpan={8} align="center">
                  <div className={cn("py-10 text-sm", isDarkMode ? "text-white/60" : "text-slate-600")}>
                    No plans found.
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              plans.map((plan: any, index: number) => (
                <TableRow key={plan.plan_id} isDarkMode={isDarkMode} isLast={index === plans.length - 1}>
                  <TableCell>{plan.plan_id}</TableCell>
                  <TableCell>{plan.plan_key}</TableCell>
                  <TableCell>{plan.plan_name}</TableCell>
                  <TableCell>{plan.billing_cycle || "-"}</TableCell>
                  <TableCell align="right">{plan.price ?? "-"}</TableCell>
                  <TableCell align="right">{plan.sort_order ?? 0}</TableCell>
                  <TableCell align="center">
                    <span
                      className={cn(
                        "px-2 py-1 text-xs rounded-lg font-semibold",
                        plan.is_active
                          ? "bg-emerald-500/15 text-emerald-500"
                          : "bg-amber-500/15 text-amber-500",
                      )}
                    >
                      {plan.is_active ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell align="center">
                    <div className="flex items-center justify-center">
                      <ActionMenu
                        isDarkMode={isDarkMode}
                        isEdit
                        onEdit={() => openEdit(plan)}
                        isDelete
                        onDelete={() => setPendingDeletePlan(plan)}
                        isActivate={!plan.is_active}
                        onActivate={() => setPendingStatusPlan(plan)}
                        isDeactivate={plan.is_active}
                        onDeactivate={() => setPendingStatusPlan(plan)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Drawer
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          resetCreate();
        }}
        title="Create Plan"
        description="Add a new plan."
        isDarkMode={isDarkMode}
        className="max-w-xl"
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setIsCreateOpen(false);
                resetCreate();
              }}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-medium",
                isDarkMode ? "bg-white/10 text-white hover:bg-white/15" : "bg-slate-100 text-slate-700 hover:bg-slate-200",
              )}
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={isCreatePending}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60"
            >
              {isCreatePending ? "Creating..." : "Create"}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            isDarkMode={isDarkMode}
            label="Plan ID"
            required
            value={createForm.plan_id}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, plan_id: e.target.value }))}
            error={createErrors.plan_id}
          />
          <Input
            isDarkMode={isDarkMode}
            label="Plan Key"
            required
            value={createForm.plan_key}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, plan_key: e.target.value }))}
            error={createErrors.plan_key}
          />
          <Input
            isDarkMode={isDarkMode}
            label="Plan Name"
            required
            value={createForm.plan_name}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, plan_name: e.target.value }))}
            error={createErrors.plan_name}
          />
          <Input
            isDarkMode={isDarkMode}
            label="Description"
            value={createForm.description}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, description: e.target.value }))}
          />
          <Input
            isDarkMode={isDarkMode}
            label="Price"
            type="number"
            value={createForm.price}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, price: e.target.value }))}
          />
          <Select
            isDarkMode={isDarkMode}
            label="Billing Cycle"
            value={normalizeBillingCycle(createForm.billing_cycle)}
            onChange={(value) => setCreateForm((prev) => ({ ...prev, billing_cycle: value }))}
            options={BILLING_CYCLE_OPTIONS.map((v) => ({ value: v, label: v }))}
          />
          <Input
            isDarkMode={isDarkMode}
            label="Sort Order"
            type="number"
            value={createForm.sort_order}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, sort_order: e.target.value }))}
          />
          <div className="flex items-center gap-3">
            <Checkbox
              checked={createForm.is_active}
              onCheckedChange={(checked) => setCreateForm((prev) => ({ ...prev, is_active: checked }))}
            />
            <span className={cn("text-sm", isDarkMode ? "text-white/90" : "text-slate-800")}>Is Active</span>
          </div>
        </div>
      </Drawer>

      <Drawer
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedPlan(null);
        }}
        title="Edit Plan"
        description="Update plan details."
        isDarkMode={isDarkMode}
        className="max-w-xl"
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setIsEditOpen(false);
                setSelectedPlan(null);
              }}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-medium",
                isDarkMode ? "bg-white/10 text-white hover:bg-white/15" : "bg-slate-100 text-slate-700 hover:bg-slate-200",
              )}
            >
              Cancel
            </button>
            <button
              onClick={handleEditSave}
              disabled={isPatchPending}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60"
            >
              {isPatchPending ? "Saving..." : "Save"}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input isDarkMode={isDarkMode} label="Plan ID" value={selectedPlan?.plan_id || ""} disabled />
          <Input
            isDarkMode={isDarkMode}
            label="Plan Key"
            required
            value={editForm.plan_key}
            onChange={(e) => setEditForm((prev) => ({ ...prev, plan_key: e.target.value }))}
            error={editErrors.plan_key}
          />
          <Input
            isDarkMode={isDarkMode}
            label="Plan Name"
            required
            value={editForm.plan_name}
            onChange={(e) => setEditForm((prev) => ({ ...prev, plan_name: e.target.value }))}
            error={editErrors.plan_name}
          />
          <Input
            isDarkMode={isDarkMode}
            label="Description"
            value={editForm.description}
            onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
          />
          <Input
            isDarkMode={isDarkMode}
            label="Price"
            type="number"
            value={editForm.price}
            onChange={(e) => setEditForm((prev) => ({ ...prev, price: e.target.value }))}
          />
          <Select
            isDarkMode={isDarkMode}
            label="Billing Cycle"
            value={editForm.billing_cycle}
            onChange={(value) => setEditForm((prev) => ({ ...prev, billing_cycle: value }))}
            options={BILLING_CYCLE_OPTIONS.map((v) => ({ value: v, label: v }))}
          />
          <Input
            isDarkMode={isDarkMode}
            label="Sort Order"
            type="number"
            value={editForm.sort_order}
            onChange={(e) => setEditForm((prev) => ({ ...prev, sort_order: e.target.value }))}
          />
          <div className="flex items-center gap-3">
            <Checkbox
              checked={editForm.is_active}
              onCheckedChange={(checked) => setEditForm((prev) => ({ ...prev, is_active: checked }))}
            />
            <span className={cn("text-sm", isDarkMode ? "text-white/90" : "text-slate-800")}>Is Active</span>
          </div>
        </div>
      </Drawer>

      <ConfirmDialog
        open={Boolean(pendingStatusPlan)}
        title="Update Plan Status?"
        description="This will change whether this plan can be used for tenants."
        confirmText={pendingStatusPlan?.is_active ? "Deactivate Plan" : "Activate Plan"}
        cancelText="Cancel"
        variant="warning"
        isLoading={isPatchPending}
        onCancel={() => {
          if (!isPatchPending) setPendingStatusPlan(null);
        }}
        onConfirm={() => {
          if (!pendingStatusPlan) return;
          toggleStatus(pendingStatusPlan);
        }}
      />

      <ConfirmDialog
        open={Boolean(pendingDeletePlan)}
        title="Delete Item?"
        description="Are you sure you want to delete this item? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeletePending}
        onCancel={() => {
          if (!isDeletePending) setPendingDeletePlan(null);
        }}
        onConfirm={() => {
          if (!pendingDeletePlan) return;
          handleDeletePlan(pendingDeletePlan);
        }}
      />
    </div>
  );
};
