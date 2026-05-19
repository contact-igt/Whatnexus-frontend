"use client";

import type { RootState } from "@/redux/store";
import { shallowEqual, useSelector } from "react-redux";

export function useFeatureAccess() {
  return useSelector(
    (state: RootState) => ({
      industry_type: state.featureAccess.industry_type,
      enabled_features: state.featureAccess.enabled_features,
      disabled_features: state.featureAccess.disabled_features,
      default_features: state.featureAccess.default_features,
      overrides: state.featureAccess.overrides,
      feature_metadata: state.featureAccess.feature_metadata,
      loading: state.featureAccess.loading,
      error: state.featureAccess.error,
    }),
    shallowEqual,
  );
}

