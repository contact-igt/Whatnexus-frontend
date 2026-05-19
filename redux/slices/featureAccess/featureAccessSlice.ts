import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type {
  TenantFeatureMetadata,
  TenantFeatureOverride,
} from "@/services/tenantFeatures";

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
  "fallback",
];

interface FeatureAccessState {
  industry_type: string;
  enabled_features: string[];
  disabled_features: string[];
  default_features: string[];
  overrides: TenantFeatureOverride[];
  feature_metadata: TenantFeatureMetadata[];
  loading: boolean;
  error: string | null;
}

const initialState: FeatureAccessState = {
  industry_type: "general",
  enabled_features: COMMON_FEATURES,
  disabled_features: [],
  default_features: COMMON_FEATURES,
  overrides: [],
  feature_metadata: [],
  loading: false,
  error: null,
};

interface FeatureAccessPayload {
  industry_type: string;
  enabled_features: string[];
  disabled_features: string[];
  default_features: string[];
  overrides: TenantFeatureOverride[];
  feature_metadata: TenantFeatureMetadata[];
}

const featureAccessSlice = createSlice({
  name: "featureAccess",
  initialState,
  reducers: {
    setFeatureAccessLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setFeatureAccessData: (state, action: PayloadAction<FeatureAccessPayload>) => {
      state.industry_type = action.payload.industry_type || "general";
      state.enabled_features = action.payload.enabled_features || COMMON_FEATURES;
      state.disabled_features = action.payload.disabled_features || [];
      state.default_features = action.payload.default_features || COMMON_FEATURES;
      state.overrides = action.payload.overrides || [];
      state.feature_metadata = action.payload.feature_metadata || [];
      state.error = null;
      state.loading = false;
    },
    setFeatureAccessError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    setFeatureAccessFallback: (state, action: PayloadAction<string | null>) => {
      state.industry_type = "general";
      state.enabled_features = COMMON_FEATURES;
      state.disabled_features = [];
      state.default_features = COMMON_FEATURES;
      state.overrides = [];
      state.feature_metadata = [];
      state.error = action.payload;
      state.loading = false;
    },
    resetFeatureAccessState: () => initialState,
  },
});

export const {
  setFeatureAccessLoading,
  setFeatureAccessData,
  setFeatureAccessError,
  setFeatureAccessFallback,
  resetFeatureAccessState,
} = featureAccessSlice.actions;

export default featureAccessSlice.reducer;

