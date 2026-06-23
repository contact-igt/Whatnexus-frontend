"use client";

import { useMemo, useState } from "react";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import {
  useCreateSaaSModuleMutation,
  useDeleteSaaSModuleMutation,
  usePatchSaaSModuleMutation,
  useSaaSModulesQuery,
} from "@/hooks/useModuleAccessManagementQuery";
import { Input } from "@/components/ui/input";
import { Drawer } from "@/components/ui/drawer";
import { Checkbox } from "@/components/ui/checkbox";
import { Select } from "@/components/ui/select";
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

const MODULE_TYPES = ["core", "feature", "addon", "experimental", "enterprise"] as const;
const VISIBILITY_TYPES = ["sidebar", "hidden", "internal", "api_only"] as const;
const DEFAULT_MODULE_TYPE = "feature";
const DEFAULT_VISIBILITY_TYPE = "sidebar";

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

const normalizeModuleType = (value?: string) =>
  MODULE_TYPES.includes((value || "") as (typeof MODULE_TYPES)[number])
    ? (value as (typeof MODULE_TYPES)[number])
    : DEFAULT_MODULE_TYPE;

const normalizeVisibilityType = (value?: string) =>
  VISIBILITY_TYPES.includes((value || "") as (typeof VISIBILITY_TYPES)[number])
    ? (value as (typeof VISIBILITY_TYPES)[number])
    : DEFAULT_VISIBILITY_TYPE;

export const SaaSModulesManagementView = () => {
  const { isDarkMode } = useTheme();
  const { data, isLoading } = useSaaSModulesQuery();
  const { mutate: createModule, isPending: isCreatePending } =
    useCreateSaaSModuleMutation();
  const { mutate: patchModule, isPending: isPatchPending } =
    usePatchSaaSModuleMutation();
  const { mutate: deleteSaaSModule, isPending: isDeletePending } =
    useDeleteSaaSModuleMutation();

  const modules = useMemo(() => data?.data || [], [data]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<any | null>(null);
  const [pendingStatusModule, setPendingStatusModule] = useState<any | null>(null);
  const [pendingDeleteModule, setPendingDeleteModule] = useState<any | null>(null);
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({});
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  const [createForm, setCreateForm] = useState({
    module_id: "",
    module_key: "",
    module_name: "",
    description: "",
    category: "",
    parent_module_id: "",
    route_path: "",
    icon_key: "",
    module_type: DEFAULT_MODULE_TYPE,
    visibility_type: DEFAULT_VISIBILITY_TYPE,
    is_system_core: false,
    is_active: true,
    sort_order: "0",
  });

  const [editForm, setEditForm] = useState({
    module_key: "",
    module_name: "",
    description: "",
    category: "",
    parent_module_id: "",
    route_path: "",
    icon_key: "",
    module_type: "feature",
    visibility_type: "sidebar",
    is_system_core: false,
    is_active: true,
    sort_order: "0",
  });

  const resetCreate = () => {
    setCreateForm({
      module_id: "",
      module_key: "",
      module_name: "",
      description: "",
      category: "",
      parent_module_id: "",
      route_path: "",
      icon_key: "",
      module_type: DEFAULT_MODULE_TYPE,
      visibility_type: DEFAULT_VISIBILITY_TYPE,
      is_system_core: false,
      is_active: true,
      sort_order: "0",
    });
    setCreateErrors({});
  };

  const openEdit = (module: any) => {
    setSelectedModule(module);
    setEditForm({
      module_key: module.module_key || "",
      module_name: module.module_name || "",
      description: module.description || "",
      category: module.category || "",
      parent_module_id: module.parent_module_id || "",
      route_path: module.route_path || "",
      icon_key: module.icon_key || "",
      module_type: module.module_type || "feature",
      visibility_type: module.visibility_type || "sidebar",
      is_system_core: Boolean(module.is_system_core),
      is_active: Boolean(module.is_active),
      sort_order: String(module.sort_order ?? 0),
    });
    setEditErrors({});
    setIsEditOpen(true);
  };

  const validateCreate = () => {
    const nextErrors: Record<string, string> = {};
    if (!createForm.module_id.trim()) nextErrors.module_id = "module_id is required";
    if (!createForm.module_key.trim()) nextErrors.module_key = "module_key is required";
    if (!createForm.module_name.trim()) nextErrors.module_name = "module_name is required";
    if (
      createForm.parent_module_id &&
      createForm.parent_module_id === createForm.module_id.trim()
    ) {
      nextErrors.parent_module_id = "parent_module_id cannot be same as module_id";
    }
    setCreateErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateEdit = () => {
    const nextErrors: Record<string, string> = {};
    if (!editForm.module_key.trim()) nextErrors.module_key = "module_key is required";
    if (!editForm.module_name.trim()) nextErrors.module_name = "module_name is required";
    if (
      selectedModule?.module_id &&
      editForm.parent_module_id &&
      editForm.parent_module_id === selectedModule.module_id
    ) {
      nextErrors.parent_module_id = "parent_module_id cannot be same as module_id";
    }
    setEditErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleCreate = () => {
    if (!validateCreate()) return;

    createModule(
      {
        module_id: createForm.module_id.trim(),
        module_key: toSnakeCaseKey(createForm.module_key),
        module_name: createForm.module_name.trim(),
        description: toNullableText(createForm.description),
        category: toNullableText(createForm.category),
        parent_module_id: createForm.parent_module_id || null,
        route_path: toNullableText(createForm.route_path),
        icon_key: toNullableText(createForm.icon_key),
        module_type: normalizeModuleType(createForm.module_type),
        visibility_type: normalizeVisibilityType(createForm.visibility_type),
        is_system_core: Boolean(createForm.is_system_core),
        is_active: Boolean(createForm.is_active),
        sort_order: Number(createForm.sort_order || 0),
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
    if (!selectedModule) return;
    if (!validateEdit()) return;

    patchModule(
      {
        moduleId: selectedModule.module_id,
        payload: {
          module_key: toSnakeCaseKey(editForm.module_key),
          module_name: editForm.module_name.trim(),
          description: toNullableText(editForm.description),
          category: toNullableText(editForm.category),
          parent_module_id: editForm.parent_module_id || null,
          route_path: toNullableText(editForm.route_path),
          icon_key: toNullableText(editForm.icon_key),
          module_type: editForm.module_type as any,
          visibility_type: editForm.visibility_type as any,
          is_system_core: Boolean(editForm.is_system_core),
          is_active: Boolean(editForm.is_active),
          sort_order: Number(editForm.sort_order || 0),
        },
      },
      {
        onSuccess: () => {
          setIsEditOpen(false);
          setSelectedModule(null);
        },
      },
    );
  };

  const toggleStatus = (module: any) => {
    patchModule({
      moduleId: module.module_id,
      payload: { is_active: !Boolean(module.is_active) },
    }, {
      onSettled: () => setPendingStatusModule(null),
    });
  };

  const handleDeleteModule = (module: any) => {
    deleteSaaSModule(module.module_id, {
      onSuccess: () => {
        setPendingDeleteModule(null);
      },
    });
  };

  const parentOptions = modules.map((module: any) => ({
    value: module.module_id,
    label: `${module.module_name} (${module.module_id})`,
  }));

  const editParentOptions = parentOptions.filter(
    (option) => option.value !== selectedModule?.module_id,
  );

  return (
    <div className="h-full overflow-y-auto p-8 space-y-6 max-w-[1400px] mx-auto no-scrollbar pb-32">
      <div className="flex justify-between items-end gap-4">
        <div>
          <h1 className={cn("text-3xl font-bold tracking-tight", isDarkMode ? "text-white" : "text-slate-900")}>
            SaaS Modules
          </h1>
          <p className={cn("text-sm mt-1", isDarkMode ? "text-white/60" : "text-slate-600")}>
            Manage module master definitions for dynamic access resolution.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors"
        >
          Add Module
        </button>
      </div>

      <div className={cn("rounded-xl border overflow-hidden", isDarkMode ? "bg-white/5 border-white/10" : "bg-white border-slate-200")}>
        <Table isDarkMode={isDarkMode}>
          <TableHeader isDarkMode={isDarkMode}>
            <TableRow isDarkMode={isDarkMode}>
              <TableHead isDarkMode={isDarkMode}>Module ID</TableHead>
              <TableHead isDarkMode={isDarkMode}>Key</TableHead>
              <TableHead isDarkMode={isDarkMode}>Name</TableHead>
              <TableHead isDarkMode={isDarkMode}>Type</TableHead>
              <TableHead isDarkMode={isDarkMode}>Visibility</TableHead>
              <TableHead isDarkMode={isDarkMode} align="center">Core</TableHead>
              <TableHead isDarkMode={isDarkMode} align="center">Status</TableHead>
              <TableHead isDarkMode={isDarkMode} align="center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow isDarkMode={isDarkMode}>
                <TableCell colSpan={8} align="center">
                  <div className={cn("py-10 text-sm", isDarkMode ? "text-white/60" : "text-slate-600")}>
                    Loading modules...
                  </div>
                </TableCell>
              </TableRow>
            ) : modules.length === 0 ? (
              <TableRow isDarkMode={isDarkMode}>
                <TableCell colSpan={8} align="center">
                  <div className={cn("py-10 text-sm", isDarkMode ? "text-white/60" : "text-slate-600")}>
                    No modules found.
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              modules.map((module: any, index: number) => (
                <TableRow key={module.module_id} isDarkMode={isDarkMode} isLast={index === modules.length - 1}>
                  <TableCell>{module.module_id}</TableCell>
                  <TableCell>{module.module_key}</TableCell>
                  <TableCell>{module.module_name}</TableCell>
                  <TableCell>{module.module_type}</TableCell>
                  <TableCell>{module.visibility_type}</TableCell>
                  <TableCell align="center">{module.is_system_core ? "Yes" : "No"}</TableCell>
                  <TableCell align="center">
                    <span
                      className={cn(
                        "px-2 py-1 text-xs rounded-lg font-semibold",
                        module.is_active
                          ? "bg-emerald-500/15 text-emerald-500"
                          : "bg-amber-500/15 text-amber-500",
                      )}
                    >
                      {module.is_active ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell align="center">
                    <div className="flex items-center justify-center">
                      <ActionMenu
                        isDarkMode={isDarkMode}
                        isEdit
                        onEdit={() => openEdit(module)}
                        isDelete
                        onDelete={() => setPendingDeleteModule(module)}
                        isActivate={!module.is_active}
                        onActivate={() => setPendingStatusModule(module)}
                        isDeactivate={module.is_active}
                        onDeactivate={() => setPendingStatusModule(module)}
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
        title="Create SaaS Module"
        description="Add a new module definition."
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
            label="Module ID"
            required
            value={createForm.module_id}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, module_id: e.target.value }))}
            error={createErrors.module_id}
          />
          <Input
            isDarkMode={isDarkMode}
            label="Module Key"
            required
            value={createForm.module_key}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, module_key: e.target.value }))}
            error={createErrors.module_key}
          />
          <Input
            isDarkMode={isDarkMode}
            label="Module Name"
            required
            value={createForm.module_name}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, module_name: e.target.value }))}
            error={createErrors.module_name}
          />
          <Input
            isDarkMode={isDarkMode}
            label="Description"
            value={createForm.description}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, description: e.target.value }))}
          />
          <Input
            isDarkMode={isDarkMode}
            label="Category"
            value={createForm.category}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, category: e.target.value }))}
          />
          <Select
            isDarkMode={isDarkMode}
            label="Parent Module"
            value={createForm.parent_module_id}
            onChange={(value) => setCreateForm((prev) => ({ ...prev, parent_module_id: value }))}
            options={[{ value: "", label: "None" }, ...parentOptions]}
            error={createErrors.parent_module_id}
          />
          <Input
            isDarkMode={isDarkMode}
            label="Route Path"
            value={createForm.route_path}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, route_path: e.target.value }))}
          />
          <Input
            isDarkMode={isDarkMode}
            label="Icon Key"
            value={createForm.icon_key}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, icon_key: e.target.value }))}
          />
          <Select
            isDarkMode={isDarkMode}
            label="Module Type"
            value={normalizeModuleType(createForm.module_type)}
            onChange={(value) => setCreateForm((prev) => ({ ...prev, module_type: value }))}
            options={MODULE_TYPES.map((v) => ({ value: v, label: v }))}
          />
          <Select
            isDarkMode={isDarkMode}
            label="Visibility Type"
            value={normalizeVisibilityType(createForm.visibility_type)}
            onChange={(value) => setCreateForm((prev) => ({ ...prev, visibility_type: value }))}
            options={VISIBILITY_TYPES.map((v) => ({ value: v, label: v }))}
          />
          <Input
            isDarkMode={isDarkMode}
            label="Sort Order"
            type="number"
            value={createForm.sort_order}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, sort_order: e.target.value }))}
          />
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={createForm.is_system_core}
                onCheckedChange={(checked) => setCreateForm((prev) => ({ ...prev, is_system_core: checked }))}
              />
              <span className={cn("text-sm", isDarkMode ? "text-white/90" : "text-slate-800")}>Is System Core</span>
            </div>
            <div className="flex items-center gap-3">
              <Checkbox
                checked={createForm.is_active}
                onCheckedChange={(checked) => setCreateForm((prev) => ({ ...prev, is_active: checked }))}
              />
              <span className={cn("text-sm", isDarkMode ? "text-white/90" : "text-slate-800")}>Is Active</span>
            </div>
          </div>
        </div>
      </Drawer>

      <Drawer
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedModule(null);
        }}
        title="Edit SaaS Module"
        description="Update module definition."
        isDarkMode={isDarkMode}
        className="max-w-xl"
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setIsEditOpen(false);
                setSelectedModule(null);
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
          <Input isDarkMode={isDarkMode} label="Module ID" value={selectedModule?.module_id || ""} disabled />
          <Input
            isDarkMode={isDarkMode}
            label="Module Key"
            required
            value={editForm.module_key}
            onChange={(e) => setEditForm((prev) => ({ ...prev, module_key: e.target.value }))}
            error={editErrors.module_key}
          />
          <Input
            isDarkMode={isDarkMode}
            label="Module Name"
            required
            value={editForm.module_name}
            onChange={(e) => setEditForm((prev) => ({ ...prev, module_name: e.target.value }))}
            error={editErrors.module_name}
          />
          <Input
            isDarkMode={isDarkMode}
            label="Description"
            value={editForm.description}
            onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
          />
          <Input
            isDarkMode={isDarkMode}
            label="Category"
            value={editForm.category}
            onChange={(e) => setEditForm((prev) => ({ ...prev, category: e.target.value }))}
          />
          <Select
            isDarkMode={isDarkMode}
            label="Parent Module"
            value={editForm.parent_module_id}
            onChange={(value) => setEditForm((prev) => ({ ...prev, parent_module_id: value }))}
            options={[{ value: "", label: "None" }, ...editParentOptions]}
            error={editErrors.parent_module_id}
          />
          <Input
            isDarkMode={isDarkMode}
            label="Route Path"
            value={editForm.route_path}
            onChange={(e) => setEditForm((prev) => ({ ...prev, route_path: e.target.value }))}
          />
          <Input
            isDarkMode={isDarkMode}
            label="Icon Key"
            value={editForm.icon_key}
            onChange={(e) => setEditForm((prev) => ({ ...prev, icon_key: e.target.value }))}
          />
          <Select
            isDarkMode={isDarkMode}
            label="Module Type"
            value={editForm.module_type}
            onChange={(value) => setEditForm((prev) => ({ ...prev, module_type: value }))}
            options={MODULE_TYPES.map((v) => ({ value: v, label: v }))}
          />
          <Select
            isDarkMode={isDarkMode}
            label="Visibility Type"
            value={editForm.visibility_type}
            onChange={(value) => setEditForm((prev) => ({ ...prev, visibility_type: value }))}
            options={VISIBILITY_TYPES.map((v) => ({ value: v, label: v }))}
          />
          <Input
            isDarkMode={isDarkMode}
            label="Sort Order"
            type="number"
            value={editForm.sort_order}
            onChange={(e) => setEditForm((prev) => ({ ...prev, sort_order: e.target.value }))}
          />
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={editForm.is_system_core}
                onCheckedChange={(checked) => setEditForm((prev) => ({ ...prev, is_system_core: checked }))}
              />
              <span className={cn("text-sm", isDarkMode ? "text-white/90" : "text-slate-800")}>Is System Core</span>
            </div>
            <div className="flex items-center gap-3">
              <Checkbox
                checked={editForm.is_active}
                onCheckedChange={(checked) => setEditForm((prev) => ({ ...prev, is_active: checked }))}
              />
              <span className={cn("text-sm", isDarkMode ? "text-white/90" : "text-slate-800")}>Is Active</span>
            </div>
          </div>
        </div>
      </Drawer>

      <ConfirmDialog
        open={Boolean(pendingStatusModule)}
        title="Update Module Status?"
        description="This may affect module availability for industries, plans, and tenants."
        confirmText={pendingStatusModule?.is_active ? "Deactivate Module" : "Activate Module"}
        cancelText="Cancel"
        variant="warning"
        isLoading={isPatchPending}
        onCancel={() => {
          if (!isPatchPending) setPendingStatusModule(null);
        }}
        onConfirm={() => {
          if (!pendingStatusModule) return;
          toggleStatus(pendingStatusModule);
        }}
      />

      <ConfirmDialog
        open={Boolean(pendingDeleteModule)}
        title="Delete Item?"
        description="Are you sure you want to delete this item? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeletePending}
        onCancel={() => {
          if (!isDeletePending) setPendingDeleteModule(null);
        }}
        onConfirm={() => {
          if (!pendingDeleteModule) return;
          handleDeleteModule(pendingDeleteModule);
        }}
      />
    </div>
  );
};
