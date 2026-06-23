"use client";

import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Loader2, MapPin, Phone, Mail, Building2, Link as LinkIcon } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Branch } from "@/services/branch";
import {
  useCreateBranchMutation,
  useUpdateBranchMutation,
} from "@/hooks/useBranchQuery";

const branchSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Branch name must be at least 2 characters")
    .max(150, "Branch name must be at most 150 characters"),
  code: z.string().trim().max(50, "Code must be at most 50 characters").optional().or(z.literal("")),
  phone: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || /^\+?[0-9]{7,15}$/.test(value.replace(/\s+/g, "")), {
      message: "Phone must be a valid phone number",
    }),
  email: z.string().trim().email("Invalid email").optional().or(z.literal("")),
  address: z.string().trim().optional().or(z.literal("")),
  city: z.string().trim().optional().or(z.literal("")),
  state: z.string().trim().optional().or(z.literal("")),
  country: z.string().trim().optional().or(z.literal("")),
  pincode: z.string().trim().optional().or(z.literal("")),
  google_map_url: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || /^https?:\/\/.+/i.test(value), {
      message: "Google map URL must be a valid URL",
    }),
  landmark: z.string().trim().optional().or(z.literal("")),
  timezone: z.string().trim().optional().or(z.literal("")),
  latitude: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((value) => {
      if (!value) return true;
      const number = Number(value);
      return !Number.isNaN(number) && number >= -90 && number <= 90;
    }, { message: "Latitude must be between -90 and 90" }),
  longitude: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((value) => {
      if (!value) return true;
      const number = Number(value);
      return !Number.isNaN(number) && number >= -180 && number <= 180;
    }, { message: "Longitude must be between -180 and 180" }),
  notes: z.string().trim().optional().or(z.literal("")),
  is_active: z.boolean().default(true),
  is_main: z.boolean().default(false),
});

type BranchFormValues = z.infer<typeof branchSchema>;

interface BranchDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  branch: Branch | null;
  mode: "view" | "edit" | "create";
  isDarkMode: boolean;
}

const toNullable = (value?: string) => {
  const normalized = String(value || "").trim();
  return normalized.length ? normalized : null;
};

export const BranchDrawer = ({
  isOpen,
  onClose,
  branch,
  mode,
  isDarkMode,
}: BranchDrawerProps) => {
  const createBranchMutation = useCreateBranchMutation();
  const updateBranchMutation = useUpdateBranchMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
    setValue,
  } = useForm<BranchFormValues>({
    resolver: zodResolver(branchSchema) as any,
    defaultValues: {
      name: "",
      code: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      state: "",
      country: "",
      pincode: "",
      google_map_url: "",
      landmark: "",
      timezone: "",
      latitude: "",
      longitude: "",
      notes: "",
      is_active: true,
      is_main: false,
    },
  });

  useEffect(() => {
    if (branch && (mode === "edit" || mode === "view")) {
      reset({
        name: branch.name || "",
        code: branch.code || "",
        phone: branch.phone || "",
        email: branch.email || "",
        address: branch.address || "",
        city: branch.city || "",
        state: branch.state || "",
        country: branch.country || "",
        pincode: branch.pincode || "",
        google_map_url: branch.google_map_url || "",
        landmark: branch.landmark || "",
        timezone: branch.timezone || "",
        latitude:
          branch.latitude === null || branch.latitude === undefined
            ? ""
            : String(branch.latitude),
        longitude:
          branch.longitude === null || branch.longitude === undefined
            ? ""
            : String(branch.longitude),
        notes: branch.notes || "",
        is_active: Boolean(branch.is_active),
        is_main: Boolean(branch.is_main),
      });
    } else if (mode === "create") {
      reset({
        name: "",
        code: "",
        phone: "",
        email: "",
        address: "",
        city: "",
        state: "",
        country: "",
        pincode: "",
        google_map_url: "",
        landmark: "",
        timezone: "",
        latitude: "",
        longitude: "",
        notes: "",
        is_active: true,
        is_main: false,
      });
    }
  }, [branch, isOpen, mode, reset]);

  const onSubmit = async (data: BranchFormValues) => {
    const payload = {
      name: data.name.trim(),
      code: toNullable(data.code),
      phone: toNullable(data.phone),
      email: toNullable(data.email),
      address: toNullable(data.address),
      city: toNullable(data.city),
      state: toNullable(data.state),
      country: toNullable(data.country),
      pincode: toNullable(data.pincode),
      google_map_url: toNullable(data.google_map_url),
      landmark: toNullable(data.landmark),
      timezone: toNullable(data.timezone),
      notes: toNullable(data.notes),
      latitude: data.latitude ? Number(data.latitude) : null,
      longitude: data.longitude ? Number(data.longitude) : null,
      is_active: Boolean(data.is_active),
      is_main: Boolean(data.is_main),
    };

    if (mode === "create") {
      await createBranchMutation.mutateAsync(payload);
      onClose();
      return;
    }

    if (mode === "edit" && branch?.branch_id) {
      await updateBranchMutation.mutateAsync({
        branchId: branch.branch_id,
        data: payload,
      });
      onClose();
    }
  };

  const isView = mode === "view";
  const isSaving =
    createBranchMutation.isPending || updateBranchMutation.isPending;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        mode === "create"
          ? "Add Branch"
          : mode === "edit"
            ? "Edit Branch"
            : "Branch Details"
      }
      description={
        mode === "create"
          ? "Add a new branch location."
          : mode === "edit"
            ? "Update branch details."
            : "View branch details."
      }
      isDarkMode={isDarkMode}
      className={cn(
        "max-w-2xl [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']",
      )}
      footer={
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            disabled={isSaving}
            onClick={onClose}
            className={cn(
              "px-6 py-2.5 rounded-xl text-sm font-semibold transition-all border",
              isDarkMode
                ? "border-white/10 text-white/70 hover:bg-white/5 hover:text-white"
                : "border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900",
            )}
          >
            {isView ? "Close" : "Cancel"}
          </button>
          {!isView && (
            <button
              type="button"
              onClick={handleSubmit(onSubmit)}
              disabled={isSaving}
              className={cn(
                "px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all shadow-lg flex items-center gap-2",
                isDarkMode
                  ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20 disabled:opacity-50"
                  : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20 disabled:opacity-50",
              )}
            >
              {isSaving && <Loader2 size={14} className="animate-spin" />}
              <span>{mode === "create" ? "Add Branch" : "Save Changes"}</span>
            </button>
          )}
        </div>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          isDarkMode={isDarkMode}
          label="Branch Name"
          required
          icon={Building2}
          disabled={isView}
          error={errors.name?.message}
          {...register("name")}
          placeholder="Anna Nagar Branch"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            isDarkMode={isDarkMode}
            label="Branch Code"
            disabled={isView}
            error={errors.code?.message}
            {...register("code")}
            placeholder="ANN-01"
          />
          <Input
            isDarkMode={isDarkMode}
            label="Phone"
            icon={Phone}
            disabled={isView}
            error={errors.phone?.message}
            type="tel"
            {...register("phone")}
            placeholder="+919876543210"
          />
        </div>

        <Input
          isDarkMode={isDarkMode}
          label="Email"
          icon={Mail}
          disabled={isView}
          error={errors.email?.message}
          type="email"
          {...register("email")}
          placeholder="branch@hospital.com"
        />

        <Input
          isDarkMode={isDarkMode}
          label="Address"
          icon={MapPin}
          disabled={isView}
          error={errors.address?.message}
          {...register("address")}
          placeholder="Full address"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            isDarkMode={isDarkMode}
            label="City"
            disabled={isView}
            error={errors.city?.message}
            {...register("city")}
          />
          <Input
            isDarkMode={isDarkMode}
            label="State"
            disabled={isView}
            error={errors.state?.message}
            {...register("state")}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            isDarkMode={isDarkMode}
            label="Country"
            disabled={isView}
            error={errors.country?.message}
            {...register("country")}
          />
          <Input
            isDarkMode={isDarkMode}
            label="Pincode"
            disabled={isView}
            error={errors.pincode?.message}
            {...register("pincode")}
          />
        </div>

        <Input
          isDarkMode={isDarkMode}
          label="Google Map URL"
          icon={LinkIcon}
          disabled={isView}
          error={errors.google_map_url?.message}
          {...register("google_map_url")}
          placeholder="https://maps.google.com/..."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            isDarkMode={isDarkMode}
            label="Landmark"
            disabled={isView}
            error={errors.landmark?.message}
            {...register("landmark")}
          />
          <Input
            isDarkMode={isDarkMode}
            label="Timezone"
            disabled={isView}
            error={errors.timezone?.message}
            {...register("timezone")}
            placeholder="Asia/Kolkata"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            isDarkMode={isDarkMode}
            label="Latitude"
            disabled={isView}
            error={errors.latitude?.message}
            {...register("latitude")}
            placeholder="13.0827"
          />
          <Input
            isDarkMode={isDarkMode}
            label="Longitude"
            disabled={isView}
            error={errors.longitude?.message}
            {...register("longitude")}
            placeholder="80.2707"
          />
        </div>

        <div>
          <label
            className={cn(
              "text-xs font-semibold mb-2 block ml-1",
              isDarkMode ? "text-white/70" : "text-slate-700",
            )}
          >
            Notes
          </label>
          <textarea
            disabled={isView}
            {...register("notes")}
            rows={3}
            className={cn(
              "w-full px-4 py-2.5 rounded-xl text-sm border transition-all focus:outline-none resize-none",
              errors.notes && "border-red-500",
              isDarkMode
                ? "bg-white/5 border-white/10 text-white placeholder:text-white/30"
                : "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400",
            )}
            placeholder="Additional notes..."
          />
          {errors.notes && (
            <p className="text-xs text-red-500 mt-1 ml-1">{errors.notes.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              disabled={isView}
              checked={Boolean(watch("is_active"))}
              onChange={(e) => setValue("is_active", e.target.checked)}
              className="w-4 h-4"
            />
            <span
              className={cn(
                "text-sm font-medium",
                isDarkMode ? "text-white/80" : "text-slate-700",
              )}
            >
              Active Branch
            </span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              disabled={isView}
              checked={Boolean(watch("is_main"))}
              onChange={(e) => setValue("is_main", e.target.checked)}
              className="w-4 h-4"
            />
            <span
              className={cn(
                "text-sm font-medium",
                isDarkMode ? "text-white/80" : "text-slate-700",
              )}
            >
              Main Branch
            </span>
          </label>
        </div>
      </form>
    </Drawer>
  );
};
