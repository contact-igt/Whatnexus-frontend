"use client";

import { useMemo, useState } from "react";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import {
  useCreateIndustryMutation,
  useIndustriesQuery,
  usePatchIndustryMutation,
} from "@/hooks/useModuleAccessManagementQuery";
import { Input } from "@/components/ui/input";
import { Drawer } from "@/components/ui/drawer";
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

export const IndustriesManagementView = () => {
  const { isDarkMode } = useTheme();
  const { data, isLoading } = useIndustriesQuery();
  const { mutate: createIndustry, isPending: isCreatePending } =
    useCreateIndustryMutation();
  const { mutate: patchIndustry, isPending: isPatchPending } =
    usePatchIndustryMutation();

  const industries = useMemo(() => data?.data || [], [data]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState<any | null>(null);
  const [pendingStatusIndustry, setPendingStatusIndustry] = useState<any | null>(null);

  const [createForm, setCreateForm] = useState({
    industry_id: "",
    industry_key: "",
    industry_name: "",
    description: "",
    is_active: true,
  });

  const [editForm, setEditForm] = useState({
    industry_key: "",
    industry_name: "",
    description: "",
    is_active: true,
  });

  const [createErrors, setCreateErrors] = useState<Record<string, string>>({});
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  const resetCreate = () => {
    setCreateForm({
      industry_id: "",
      industry_key: "",
      industry_name: "",
      description: "",
      is_active: true,
    });
    setCreateErrors({});
  };

  const openEdit = (industry: any) => {
    setSelectedIndustry(industry);
    setEditForm({
      industry_key: industry.industry_key || "",
      industry_name: industry.industry_name || "",
      description: industry.description || "",
      is_active: Boolean(industry.is_active),
    });
    setEditErrors({});
    setIsEditOpen(true);
  };

  const validateCreate = () => {
    const nextErrors: Record<string, string> = {};
    if (!createForm.industry_id.trim()) nextErrors.industry_id = "industry_id is required";
    if (!createForm.industry_key.trim()) nextErrors.industry_key = "industry_key is required";
    if (!createForm.industry_name.trim()) nextErrors.industry_name = "industry_name is required";
    setCreateErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateEdit = () => {
    const nextErrors: Record<string, string> = {};
    if (!editForm.industry_key.trim()) nextErrors.industry_key = "industry_key is required";
    if (!editForm.industry_name.trim()) nextErrors.industry_name = "industry_name is required";
    setEditErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleCreate = () => {
    if (!validateCreate()) return;

    createIndustry(
      {
        industry_id: createForm.industry_id.trim(),
        industry_key: toSnakeCaseKey(createForm.industry_key),
        industry_name: createForm.industry_name.trim(),
        description: toNullableText(createForm.description),
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
    if (!selectedIndustry) return;
    if (!validateEdit()) return;

    patchIndustry(
      {
        industryId: selectedIndustry.industry_id,
        payload: {
          industry_key: toSnakeCaseKey(editForm.industry_key),
          industry_name: editForm.industry_name.trim(),
          description: toNullableText(editForm.description),
          is_active: Boolean(editForm.is_active),
        },
      },
      {
        onSuccess: () => {
          setIsEditOpen(false);
          setSelectedIndustry(null);
        },
      },
    );
  };

  const toggleIndustryStatus = (industry: any) => {
    patchIndustry({
      industryId: industry.industry_id,
      payload: { is_active: !Boolean(industry.is_active) },
    }, {
      onSettled: () => setPendingStatusIndustry(null),
    });
  };

  return (
    <div className="h-full overflow-y-auto p-8 space-y-6 max-w-[1400px] mx-auto no-scrollbar pb-32">
      <div className="flex justify-between items-end gap-4">
        <div>
          <h1 className={cn("text-3xl font-bold tracking-tight", isDarkMode ? "text-white" : "text-slate-900")}>
            Industries
          </h1>
          <p className={cn("text-sm mt-1", isDarkMode ? "text-white/60" : "text-slate-600")}>
            Manage industry master records for dynamic SaaS access control.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors"
        >
          Add Industry
        </button>
      </div>

      <div className={cn("rounded-xl border overflow-hidden", isDarkMode ? "bg-white/5 border-white/10" : "bg-white border-slate-200")}>
        <Table isDarkMode={isDarkMode}>
          <TableHeader isDarkMode={isDarkMode}>
            <TableRow isDarkMode={isDarkMode}>
              <TableHead isDarkMode={isDarkMode}>Industry ID</TableHead>
              <TableHead isDarkMode={isDarkMode}>Key</TableHead>
              <TableHead isDarkMode={isDarkMode}>Name</TableHead>
              <TableHead isDarkMode={isDarkMode}>Description</TableHead>
              <TableHead isDarkMode={isDarkMode} align="center">Status</TableHead>
              <TableHead isDarkMode={isDarkMode} align="center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow isDarkMode={isDarkMode}>
                <TableCell colSpan={6} align="center">
                  <div className={cn("py-10 text-sm", isDarkMode ? "text-white/60" : "text-slate-600")}>
                    Loading industries...
                  </div>
                </TableCell>
              </TableRow>
            ) : industries.length === 0 ? (
              <TableRow isDarkMode={isDarkMode}>
                <TableCell colSpan={6} align="center">
                  <div className={cn("py-10 text-sm", isDarkMode ? "text-white/60" : "text-slate-600")}>
                    No industries found.
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              industries.map((industry: any, index: number) => (
                <TableRow key={industry.industry_id} isDarkMode={isDarkMode} isLast={index === industries.length - 1}>
                  <TableCell>{industry.industry_id}</TableCell>
                  <TableCell>{industry.industry_key}</TableCell>
                  <TableCell>{industry.industry_name}</TableCell>
                  <TableCell>{industry.description || "-"}</TableCell>
                  <TableCell align="center">
                    <span
                      className={cn(
                        "px-2 py-1 text-xs rounded-lg font-semibold",
                        industry.is_active
                          ? "bg-emerald-500/15 text-emerald-500"
                          : "bg-amber-500/15 text-amber-500",
                      )}
                    >
                      {industry.is_active ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell align="center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openEdit(industry)}
                        className={cn(
                          "px-2.5 py-1.5 text-xs rounded-lg font-medium",
                          isDarkMode ? "bg-white/10 text-white hover:bg-white/15" : "bg-slate-100 text-slate-700 hover:bg-slate-200",
                        )}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setPendingStatusIndustry(industry)}
                        disabled={isPatchPending}
                        className={cn(
                          "px-2.5 py-1.5 text-xs rounded-lg font-medium",
                          industry.is_active
                            ? "bg-amber-500/15 text-amber-500 hover:bg-amber-500/25"
                            : "bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25",
                          isPatchPending && "opacity-60 cursor-not-allowed",
                        )}
                      >
                        {industry.is_active ? "Deactivate" : "Activate"}
                      </button>
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
        title="Create Industry"
        description="Add a new industry for dynamic access management."
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
            label="Industry ID"
            required
            value={createForm.industry_id}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, industry_id: e.target.value }))}
            error={createErrors.industry_id}
            placeholder="e.g. healthcare"
          />
          <Input
            isDarkMode={isDarkMode}
            label="Industry Key"
            required
            value={createForm.industry_key}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, industry_key: e.target.value }))}
            error={createErrors.industry_key}
            placeholder="e.g. healthcare"
          />
          <Input
            isDarkMode={isDarkMode}
            label="Industry Name"
            required
            value={createForm.industry_name}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, industry_name: e.target.value }))}
            error={createErrors.industry_name}
            placeholder="e.g. Healthcare"
          />
          <Input
            isDarkMode={isDarkMode}
            label="Description"
            value={createForm.description}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Optional description"
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
          setSelectedIndustry(null);
        }}
        title="Edit Industry"
        description="Update existing industry details."
        isDarkMode={isDarkMode}
        className="max-w-xl"
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setIsEditOpen(false);
                setSelectedIndustry(null);
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
          <Input
            isDarkMode={isDarkMode}
            label="Industry ID"
            value={selectedIndustry?.industry_id || ""}
            disabled
          />
          <Input
            isDarkMode={isDarkMode}
            label="Industry Key"
            required
            value={editForm.industry_key}
            onChange={(e) => setEditForm((prev) => ({ ...prev, industry_key: e.target.value }))}
            error={editErrors.industry_key}
          />
          <Input
            isDarkMode={isDarkMode}
            label="Industry Name"
            required
            value={editForm.industry_name}
            onChange={(e) => setEditForm((prev) => ({ ...prev, industry_name: e.target.value }))}
            error={editErrors.industry_name}
          />
          <Input
            isDarkMode={isDarkMode}
            label="Description"
            value={editForm.description}
            onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
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
        open={Boolean(pendingStatusIndustry)}
        title="Update Industry Status?"
        description="This will change whether this industry is active across the platform."
        confirmText={
          pendingStatusIndustry?.is_active ? "Deactivate Industry" : "Activate Industry"
        }
        cancelText="Cancel"
        variant="warning"
        isLoading={isPatchPending}
        onCancel={() => {
          if (!isPatchPending) setPendingStatusIndustry(null);
        }}
        onConfirm={() => {
          if (!pendingStatusIndustry) return;
          toggleIndustryStatus(pendingStatusIndustry);
        }}
      />
    </div>
  );
};
