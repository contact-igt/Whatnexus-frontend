import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
  COMMON_FEATURES,
  EDUCATION_FEATURES,
  getAllowedFeaturesForIndustry,
  getDefaultFeaturesForIndustry,
  HEALTHCARE_FEATURES,
  IndustryType,
} from "../organization/TenantFeatureAccessChecklist";

const FEATURE_GROUPS: Array<{ title: string; keys: string[] }> = [
  { title: "Common Features", keys: COMMON_FEATURES },
  { title: "Healthcare Features", keys: HEALTHCARE_FEATURES },
  { title: "Education Features", keys: EDUCATION_FEATURES },
];

interface TenantFeatureMatrixProps {
  isDarkMode: boolean;
  selectedIndustryType: IndustryType;
  selectedFeatures: Record<string, boolean>;
  onToggleFeature: (featureKey: string, checked: boolean) => void;
  featureMetadata: Array<{ key: string; label: string; category?: string }>;
}

export const TenantFeatureMatrix = ({
  isDarkMode,
  selectedIndustryType,
  selectedFeatures,
  onToggleFeature,
  featureMetadata,
}: TenantFeatureMatrixProps) => {
  const defaultFeatureSet = new Set(getDefaultFeaturesForIndustry(selectedIndustryType));
  const allowedFeatureSet = new Set(getAllowedFeaturesForIndustry(selectedIndustryType));
  const labelMap = featureMetadata.reduce<Record<string, string>>((acc, item) => {
    acc[item.key] = item.label;
    return acc;
  }, {});

  return (
    <div className={cn("rounded-xl border p-4 space-y-4", isDarkMode ? "border-white/10 bg-white/5" : "border-slate-200 bg-white")}>
      <h2 className={cn("text-sm font-bold uppercase tracking-wider", isDarkMode ? "text-white/60" : "text-slate-500")}>
        Feature Overrides
      </h2>

      {FEATURE_GROUPS.map((group) => {
        const visibleKeys = group.keys.filter((featureKey) => allowedFeatureSet.has(featureKey));
        if (visibleKeys.length === 0) return null;

        return (
          <div
            key={group.title}
            className={cn(
              "rounded-lg border p-3 space-y-2",
              isDarkMode ? "border-white/10 bg-white/[0.03]" : "border-slate-200 bg-slate-50/70",
            )}
          >
            <p className={cn("text-xs font-semibold uppercase tracking-wider", isDarkMode ? "text-white/70" : "text-slate-700")}>
              {group.title}
            </p>

            {visibleKeys.map((featureKey) => {
              const isEnabled = Boolean(selectedFeatures[featureKey]);
              const isDefaultEnabled = defaultFeatureSet.has(featureKey);
              const isOverride = isEnabled !== isDefaultEnabled;

              return (
                <div key={featureKey} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={isEnabled}
                      onCheckedChange={(checked) => onToggleFeature(featureKey, checked)}
                    />
                    <span className={cn("text-sm", isDarkMode ? "text-white/90" : "text-slate-800")}>
                      {labelMap[featureKey] || featureKey}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isDefaultEnabled && (
                      <span className={cn("px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase", isDarkMode ? "bg-emerald-500/15 text-emerald-400" : "bg-emerald-100 text-emerald-700")}>
                        Default
                      </span>
                    )}
                    {isOverride && (
                      <span className={cn("px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase", isDarkMode ? "bg-amber-500/15 text-amber-400" : "bg-amber-100 text-amber-700")}>
                        Override
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};
