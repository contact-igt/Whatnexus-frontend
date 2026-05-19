import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { IndustryType } from "../organization/TenantFeatureAccessChecklist";

interface TenantIndustrySelectorProps {
  isDarkMode: boolean;
  selectedIndustryType: IndustryType;
  onChange: (industryType: IndustryType) => void;
}

export const TenantIndustrySelector = ({
  isDarkMode,
  selectedIndustryType,
  onChange,
}: TenantIndustrySelectorProps) => {
  return (
    <div className={cn("rounded-xl border p-4 space-y-3", isDarkMode ? "border-white/10 bg-white/5" : "border-slate-200 bg-white")}>
      <h2 className={cn("text-sm font-bold uppercase tracking-wider", isDarkMode ? "text-white/60" : "text-slate-500")}>
        Industry Type
      </h2>
      <Select
        isDarkMode={isDarkMode}
        label="Industry Type"
        value={selectedIndustryType}
        onChange={(value) => onChange(value as IndustryType)}
        options={[
          { value: "general", label: "General" },
          { value: "healthcare", label: "Healthcare" },
          { value: "education", label: "Education" },
        ]}
      />
      <p className={cn("text-xs", isDarkMode ? "text-white/50" : "text-slate-500")}>
        Default feature access is derived from selected industry type. Save to apply updates.
      </p>
    </div>
  );
};
