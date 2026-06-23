"use client";

import { useAuth } from "@/redux/selectors/auth/authSelector";
import { useFeatureAccess } from "@/redux/selectors/featureAccess/featureAccessSelector";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

const FEATURE_ROUTE_MAP: Array<{ route: string; featureKey: string; matchMode: "exact" | "prefix" }> = [
  { route: "/followups", featureKey: "appointments", matchMode: "prefix" },
  { route: "/followup-hub", featureKey: "appointments", matchMode: "prefix" },
  { route: "/reminders", featureKey: "appointments", matchMode: "exact" },
  { route: "/courses/sessions", featureKey: "sessions", matchMode: "exact" },
  { route: "/courses/mentors", featureKey: "mentors", matchMode: "exact" },
  { route: "/specialization", featureKey: "specialization", matchMode: "exact" },
  { route: "/appointments", featureKey: "appointments", matchMode: "exact" },
  { route: "/doctors", featureKey: "doctors", matchMode: "exact" },
  { route: "/branches", featureKey: "branches", matchMode: "exact" },
  { route: "/courses", featureKey: "courses", matchMode: "exact" },
];

const resolveFeatureKeyByPathname = (pathname: string): string | null => {
  for (const mapItem of FEATURE_ROUTE_MAP) {
    if (mapItem.matchMode === "exact" && pathname === mapItem.route) {
      return mapItem.featureKey;
    }

    if (
      mapItem.matchMode === "prefix" &&
      (pathname === mapItem.route || pathname.startsWith(`${mapItem.route}/`))
    ) {
      return mapItem.featureKey;
    }
  }

  return null;
};

const FeatureProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const { enabled_features, loading } = useFeatureAccess();

  const featureKey = useMemo(() => resolveFeatureKeyByPathname(pathname), [pathname]);
  const isTenantUser = user?.user_type === "tenant";
  const canAccessFeature = featureKey ? enabled_features.includes(featureKey) : true;

  useEffect(() => {
    if (!isTenantUser) return;
    if (!featureKey) return;
    if (loading) return;
    if (canAccessFeature) return;
    if (pathname === "/dashboard") return;

    router.replace("/dashboard");
  }, [canAccessFeature, featureKey, isTenantUser, loading, pathname, router]);

  if (isTenantUser && featureKey && loading) return null;
  if (isTenantUser && featureKey && !canAccessFeature) return null;

  return <>{children}</>;
};

export default FeatureProtectedRoute;
