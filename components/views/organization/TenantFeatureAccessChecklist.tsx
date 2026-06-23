"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export type IndustryType = "general" | "healthcare" | "education";

export const COMMON_FEATURES = [
  "dashboard",
  "chat",
  "history",
  "leadpool",
  "contacts",
  "groups",
  "templates",
  "campaign",
  "media_gallery",
  "agent_matrix",
  "billing_payment",
  "general_settings",
  "followups",
  "knowledge",
  "whatsapp_settings",
  "whatsapp_playground",
];

export const HEALTHCARE_FEATURES = [
  "branches",
  "doctors",
  "appointments",
  "specialization",
];

export const EDUCATION_FEATURES = ["courses", "sessions", "mentors"];

export const ALL_FEATURE_KEYS = [
  ...COMMON_FEATURES,
  ...HEALTHCARE_FEATURES,
  ...EDUCATION_FEATURES,
];

const FEATURE_GROUPS: Array<{
  title: string;
  features: string[];
}> = [
    { title: "Common Features", features: COMMON_FEATURES },
    { title: "Healthcare Features", features: HEALTHCARE_FEATURES },
    { title: "Education Features", features: EDUCATION_FEATURES },
  ];

const FEATURE_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  chat: "Chat",
  history: "History",
  leadpool: "Lead Pool",
  contacts: "Contacts",
  groups: "Groups",
  templates: "Templates",
  campaign: "Campaign",
  media_gallery: "Media Gallery",
  agent_matrix: "Agent Matrix",
  billing_payment: "Billing & Payment",
  general_settings: "General Settings",
  followups: "Follow-up Hub",
  knowledge: "Knowledge Base",
  whatsapp_settings: "WhatsApp Settings",
  whatsapp_playground: "WhatsApp Playground",
  branches: "Branches",
  doctors: "Doctors",
  appointments: "Appointments",
  specialization: "Specialization",
  courses: "Courses",
  sessions: "Sessions",
  mentors: "Mentors",
};

export const getDefaultFeaturesForIndustry = (
  industryType: IndustryType | string,
) => {
  const normalizedIndustry =
    industryType === "healthcare" ||
      industryType === "education" ||
      industryType === "general"
      ? industryType
      : "general";

  if (normalizedIndustry === "healthcare") {
    return [...COMMON_FEATURES, ...HEALTHCARE_FEATURES];
  }

  if (normalizedIndustry === "education") {
    return [...COMMON_FEATURES, ...EDUCATION_FEATURES];
  }

  return [...COMMON_FEATURES];
};

export const getAllowedFeaturesForIndustry = (
  industryType: IndustryType | string,
) => {
  const normalizedIndustry =
    industryType === "healthcare" ||
      industryType === "education" ||
      industryType === "general"
      ? industryType
      : "general";

  if (normalizedIndustry === "healthcare") {
    return [...COMMON_FEATURES, ...HEALTHCARE_FEATURES];
  }

  if (normalizedIndustry === "education") {
    return [...COMMON_FEATURES, ...EDUCATION_FEATURES];
  }

  return [...COMMON_FEATURES];
};

interface TenantFeatureAccessChecklistProps {
  isDarkMode: boolean;
  selectedIndustryType: IndustryType;
  selectedFeatures: Record<string, boolean>;
  onToggleFeature: (featureKey: string, checked: boolean) => void;
  disabled?: boolean;
}

export const TenantFeatureAccessChecklist = ({
  isDarkMode,
  selectedIndustryType,
  selectedFeatures,
  onToggleFeature,
  disabled = false,
}: TenantFeatureAccessChecklistProps) => {
  const defaultFeatureSet = new Set(
    getDefaultFeaturesForIndustry(selectedIndustryType),
  );

  return (
    <div className="space-y-4">
      <div>
        <h3
          className={cn(
            "text-sm font-bold mb-1 uppercase tracking-wider",
            isDarkMode ? "text-white/40" : "text-slate-400",
          )}
        >
          Tenant Feature Access
        </h3>
        <p
          className={cn(
            "text-[11px]",
            isDarkMode ? "text-white/50" : "text-slate-500",
          )}
        >
          Default access is derived from selected industry type. Manual toggle
          changes are saved as tenant-specific overrides only.
        </p>
      </div>

      {FEATURE_GROUPS.map((group) => (
        <div
          key={group.title}
          className={cn(
            "rounded-xl border p-3 space-y-2",
            isDarkMode ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50/60",
          )}
        >
          <p
            className={cn(
              "text-xs font-semibold uppercase tracking-wider",
              isDarkMode ? "text-white/70" : "text-slate-700",
            )}
          >
            {group.title}
          </p>

          <div className="space-y-2">
            {group.features.map((featureKey) => {
              const isChecked = Boolean(selectedFeatures[featureKey]);
              const isDefaultEnabled = defaultFeatureSet.has(featureKey);
              const isOverride = isChecked !== isDefaultEnabled;

              return (
                <div
                  key={featureKey}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={(checked) =>
                        onToggleFeature(featureKey, checked)
                      }
                      disabled={disabled}
                    />
                    <span
                      className={cn(
                        "text-sm",
                        isDarkMode ? "text-white/85" : "text-slate-800",
                      )}
                    >
                      {FEATURE_LABELS[featureKey] || featureKey}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isDefaultEnabled && (
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase",
                          isDarkMode
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-emerald-100 text-emerald-700",
                        )}
                      >
                        Default
                      </span>
                    )}
                    {isOverride && (
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase",
                          isDarkMode
                            ? "bg-amber-500/15 text-amber-400"
                            : "bg-amber-100 text-amber-700",
                        )}
                      >
                        Override
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
