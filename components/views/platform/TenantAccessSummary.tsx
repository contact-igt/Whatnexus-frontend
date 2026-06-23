import { cn } from "@/lib/utils";
import {
  ALL_FEATURE_KEYS,
  getAllowedFeaturesForIndustry,
  getDefaultFeaturesForIndustry,
  IndustryType,
} from "../organization/TenantFeatureAccessChecklist";

interface TenantAccessSummaryProps {
  isDarkMode: boolean;
  selectedIndustryType: IndustryType;
  selectedFeatures: Record<string, boolean>;
  featureMetadata: Array<{ key: string; label: string }>;
}

export const TenantAccessSummary = ({
  isDarkMode,
  selectedIndustryType,
  selectedFeatures,
  featureMetadata,
}: TenantAccessSummaryProps) => {
  const defaultSet = new Set(getDefaultFeaturesForIndustry(selectedIndustryType));
  const allowedSet = new Set(getAllowedFeaturesForIndustry(selectedIndustryType));
  const labelMap = featureMetadata.reduce<Record<string, string>>((acc, item) => {
    acc[item.key] = item.label;
    return acc;
  }, {});

  const enabled: string[] = [];
  const disabled: string[] = [];
  const overrides: Array<{ key: string; enabled: boolean }> = [];

  ALL_FEATURE_KEYS.filter((featureKey) => allowedSet.has(featureKey)).forEach((featureKey) => {
    const isEnabled = Boolean(selectedFeatures[featureKey]);
    if (isEnabled) {
      enabled.push(labelMap[featureKey] || featureKey);
    } else {
      disabled.push(labelMap[featureKey] || featureKey);
    }

    const isDefaultEnabled = defaultSet.has(featureKey);
    if (isDefaultEnabled !== isEnabled) {
      overrides.push({ key: featureKey, enabled: isEnabled });
    }
  });

  return (
    <div className={cn("rounded-xl border p-4 space-y-4", isDarkMode ? "border-white/10 bg-white/5" : "border-slate-200 bg-white")}>
      <h2 className={cn("text-sm font-bold uppercase tracking-wider", isDarkMode ? "text-white/60" : "text-slate-500")}>
        Access Summary
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div>
          <p className={cn("text-xs uppercase tracking-wider mb-2", isDarkMode ? "text-white/50" : "text-slate-500")}>Enabled</p>
          <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
            {enabled.map((label) => (
              <p key={label} className={cn("text-xs", isDarkMode ? "text-white/85" : "text-slate-800")}>{label}</p>
            ))}
          </div>
        </div>

        <div>
          <p className={cn("text-xs uppercase tracking-wider mb-2", isDarkMode ? "text-white/50" : "text-slate-500")}>Disabled</p>
          <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
            {disabled.map((label) => (
              <p key={label} className={cn("text-xs", isDarkMode ? "text-white/60" : "text-slate-600")}>{label}</p>
            ))}
          </div>
        </div>

        <div>
          <p className={cn("text-xs uppercase tracking-wider mb-2", isDarkMode ? "text-white/50" : "text-slate-500")}>Overrides</p>
          <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
            {overrides.length === 0 ? (
              <p className={cn("text-xs", isDarkMode ? "text-white/50" : "text-slate-500")}>No overrides</p>
            ) : (
              overrides.map((item) => (
                <p key={item.key} className={cn("text-xs", isDarkMode ? "text-white/85" : "text-slate-700")}>
                  {(labelMap[item.key] || item.key)} - {item.enabled ? "Enabled" : "Disabled"}
                </p>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
