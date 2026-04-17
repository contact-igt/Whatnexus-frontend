import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/redux/selectors/auth/authSelector";
import { useFaqCountsQuery, useFaqReviewsQuery } from "@/hooks/useFaqQuery";
import { playNotificationSound } from "@/lib/notificationSound";
import type { FaqReviewItem } from "@/services/faq";
import { socket } from "@/utils/socket";

const FAQ_NOTIFICATION_ROLES = new Set(["tenant_admin", "staff", "doctor"]);
const DEFAULT_PREVIEW_LIMIT = 3;
const FAQ_SOCKET_EVENT = "faq-updated";

export const FAQ_REVIEW_ROUTE = "/knowledge?tab=faq-review";

const toTimestamp = (value?: string) => {
  const timestamp = value ? Date.parse(value) : NaN;
  return Number.isFinite(timestamp) ? timestamp : 0;
};

type FaqSocketPayload = {
  tenant_id?: string | number | null;
  faq_id?: string | number | null;
  action?: string | null;
  status?: string | null;
  is_active?: boolean | null;
  emitted_at?: string | null;
};

export const useFaqRealtimeUpdates = () => {
  const { user, token } = useAuth();
  const queryClient = useQueryClient();
  const tenantId = user?.tenant_id;
  const normalizedRole = String(user?.role || "").toLowerCase();

  const canListen = Boolean(
    token &&
      tenantId &&
      user?.user_type === "tenant" &&
      FAQ_NOTIFICATION_ROLES.has(normalizedRole),
  );

  useEffect(() => {
    if (!canListen || !tenantId) return;

    if (!socket.connected) {
      socket.connect();
    } else {
      socket.emit("join-tenant", tenantId);
    }

    const handleConnect = () => {
      socket.emit("join-tenant", tenantId);
    };

    // Remove any stale faq-updated listeners before registering a fresh one (HMR safety)
    socket.off(FAQ_SOCKET_EVENT);

    const handleFaqUpdate = (payload: FaqSocketPayload = {}) => {
      const eventTenantId = payload?.tenant_id;
      if (eventTenantId && String(eventTenantId) !== String(tenantId)) return;

      const eventAction = String(payload?.action || "").toLowerCase();
      const eventStatus = String(payload?.status || "").toLowerCase();
      const isFlaggedFaqEvent =
        eventAction === "faq-created" && eventStatus === "pending_review";

      console.log("[FAQ-SOCKET] event received:", { eventAction, eventStatus, isFlaggedFaqEvent });

      if (isFlaggedFaqEvent) {
        void playNotificationSound({ soundPath: "/sounds/FAQ_notify.mp3" });
      }

      queryClient.invalidateQueries({ queryKey: ["faq-counts"] });
      queryClient.invalidateQueries({ queryKey: ["faq-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["faq-master"] });
    };

    socket.on("connect", handleConnect);
    socket.on(FAQ_SOCKET_EVENT, handleFaqUpdate);

    return () => {
      socket.off("connect", handleConnect);
      socket.off(FAQ_SOCKET_EVENT, handleFaqUpdate);
    };
  }, [canListen, queryClient, tenantId]);
};

export const useFaqNotifications = (previewLimit = DEFAULT_PREVIEW_LIMIT) => {
  const { user, token } = useAuth();
  const normalizedRole = String(user?.role || "").toLowerCase();

  const canAccessFaqNotifications = Boolean(
    token &&
      user?.user_type === "tenant" &&
      FAQ_NOTIFICATION_ROLES.has(normalizedRole),
  );

  const safePreviewLimit = Math.max(1, previewLimit);

  const {
    data: countsData,
    isLoading: isCountsLoading,
    isError: isCountsError,
  } = useFaqCountsQuery({ enabled: canAccessFaqNotifications });

  const {
    data: pendingData,
    isLoading: isPendingLoading,
    isError: isPendingError,
  } = useFaqReviewsQuery("pending_review", {
    enabled: canAccessFaqNotifications,
  });

  const pendingCount = canAccessFaqNotifications
    ? Math.max(0, Number(countsData?.data?.pending_review || 0))
    : 0;

  let latestPendingFaqs: FaqReviewItem[] = [];
  if (canAccessFaqNotifications) {
    const reviews = Array.isArray(pendingData?.data?.reviews)
      ? [...pendingData.data.reviews]
      : [];

    reviews.sort(
      (a, b) => toTimestamp(b?.created_at) - toTimestamp(a?.created_at),
    );

    latestPendingFaqs = reviews.slice(0, safePreviewLimit);
  }

  return {
    canAccessFaqNotifications,
    pendingCount,
    latestPendingFaqs,
    isLoading:
      canAccessFaqNotifications && (isCountsLoading || isPendingLoading),
    isError: canAccessFaqNotifications && (isCountsError || isPendingError),
  };
};
