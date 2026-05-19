"use client";

import { useAuth } from "@/redux/selectors/auth/authSelector";
import {
  resetFeatureAccessState,
  setFeatureAccessData,
  setFeatureAccessFallback,
  setFeatureAccessLoading,
} from "@/redux/slices/featureAccess/featureAccessSlice";
import { TenantFeaturesApiData } from "@/services/tenantFeatures";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

const tenantFeaturesApi = new TenantFeaturesApiData();

export const useTenantFeaturesQuery = () => {
  const dispatch = useDispatch();
  const { token, user } = useAuth();

  const isTenantUser = user?.user_type === "tenant";
  const tenantId = user?.tenant_id;

  const query = useQuery({
    queryKey: ["tenant-features", tenantId],
    enabled: Boolean(token && isTenantUser && tenantId),
    queryFn: () => tenantFeaturesApi.getTenantFeatures(),
    staleTime: 2 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!token || !isTenantUser) {
      dispatch(resetFeatureAccessState());
      return;
    }

    dispatch(setFeatureAccessLoading(query.isLoading || query.isFetching));
  }, [dispatch, isTenantUser, query.isFetching, query.isLoading, token]);

  useEffect(() => {
    if (!token || !isTenantUser) return;
    if (!query.data?.data) return;

    dispatch(setFeatureAccessData(query.data.data));
  }, [dispatch, isTenantUser, query.data, token]);

  useEffect(() => {
    if (!token || !isTenantUser) return;
    if (!query.isError) return;

    const errorMessage =
      (query.error as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
      (query.error as { message?: string })?.message ||
      "Failed to load tenant features";

    dispatch(setFeatureAccessFallback(errorMessage));
  }, [dispatch, isTenantUser, query.error, query.isError, token]);

  return query;
};

