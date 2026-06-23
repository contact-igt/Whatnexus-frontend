"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/redux/selectors/auth/authSelector";
import { ApiRequestLog } from "@/services/apiRequestLogs";
import {
  clearSocketAuthToken,
  connectSocketWithToken,
  socket,
} from "@/utils/socket";

const API_REQUEST_LOG_QUERY_KEY = ["api-request-logs"];
const MANAGEMENT_SOCKET_ROLES = new Set(["super_admin", "platform_admin"]);
const MANAGEMENT_JOIN_EVENT = "join-management-api-logs";
const MANAGEMENT_JOINED_EVENT = "management-api-logs:joined";
const MANAGEMENT_JOIN_DENIED_EVENT = "management-api-logs:join-denied";
const API_REQUEST_LOG_CREATED_EVENT = "api-request-log:created";
const MAX_LOG_ITEMS = 1000;

type LiveStatus = "disconnected" | "joining" | "connected";

const getLogIdentity = (log: ApiRequestLog) => {
  if (log.id != null) {
    return `id:${log.id}`;
  }

  if (log.request_id) {
    return `request:${log.request_id}`;
  }

  return null;
};

const mergeLiveLog = (
  previousLogs: ApiRequestLog[] | undefined,
  incomingLog: ApiRequestLog,
) => {
  const incomingIdentity = getLogIdentity(incomingLog);
  const nextLogs = Array.isArray(previousLogs) ? previousLogs : [];

  const dedupedLogs = nextLogs.filter((log) => {
    const identity = getLogIdentity(log);

    if (incomingIdentity && identity) {
      return identity !== incomingIdentity;
    }

    if (incomingLog.id != null && log.id != null) {
      return log.id !== incomingLog.id;
    }

    if (incomingLog.request_id && log.request_id) {
      return log.request_id !== incomingLog.request_id;
    }

    return true;
  });

  return [incomingLog, ...dedupedLogs].slice(0, MAX_LOG_ITEMS);
};

export const useApiRequestLogSocket = () => {
  const { user, token } = useAuth();
  const queryClient = useQueryClient();
  const [liveStatus, setLiveStatus] = useState<LiveStatus>("disconnected");
  const [lastLiveLogAt, setLastLiveLogAt] = useState<string | null>(null);

  const normalizedRole = String(user?.role || "").toLowerCase();
  const canUseLiveLogs = Boolean(
    token &&
      user?.user_type === "management" &&
      MANAGEMENT_SOCKET_ROLES.has(normalizedRole),
  );

  useEffect(() => {
    if (!canUseLiveLogs || !token) {
      clearSocketAuthToken();
      return;
    }

    connectSocketWithToken(token);

    const joinManagementRoom = () => {
      setLiveStatus("joining");
      socket.emit(MANAGEMENT_JOIN_EVENT);
    };

    const handleJoined = () => {
      setLiveStatus("connected");
    };

    const handleJoinDenied = () => {
      setLiveStatus("disconnected");
    };

    const handleDisconnect = () => {
      setLiveStatus("disconnected");
    };

    const handleLogCreated = (incomingLog: ApiRequestLog) => {
      if (!incomingLog || typeof incomingLog !== "object") {
        return;
      }

      setLastLiveLogAt(incomingLog.created_at || new Date().toISOString());
      setLiveStatus("connected");
      queryClient.setQueryData<ApiRequestLog[]>(
        API_REQUEST_LOG_QUERY_KEY,
        (previousLogs) => mergeLiveLog(previousLogs, incomingLog),
      );
    };

    socket.off("connect", joinManagementRoom);
    socket.off(MANAGEMENT_JOINED_EVENT, handleJoined);
    socket.off(MANAGEMENT_JOIN_DENIED_EVENT, handleJoinDenied);
    socket.off("disconnect", handleDisconnect);
    socket.off(API_REQUEST_LOG_CREATED_EVENT, handleLogCreated);

    socket.on("connect", joinManagementRoom);
    socket.on(MANAGEMENT_JOINED_EVENT, handleJoined);
    socket.on(MANAGEMENT_JOIN_DENIED_EVENT, handleJoinDenied);
    socket.on("disconnect", handleDisconnect);
    socket.on(API_REQUEST_LOG_CREATED_EVENT, handleLogCreated);

    if (socket.connected) {
      setTimeout(joinManagementRoom, 0);
    }

    return () => {
      socket.off("connect", joinManagementRoom);
      socket.off(MANAGEMENT_JOINED_EVENT, handleJoined);
      socket.off(MANAGEMENT_JOIN_DENIED_EVENT, handleJoinDenied);
      socket.off("disconnect", handleDisconnect);
      socket.off(API_REQUEST_LOG_CREATED_EVENT, handleLogCreated);
    };
  }, [canUseLiveLogs, queryClient, token]);

  return {
    liveStatus: canUseLiveLogs ? liveStatus : "disconnected",
    lastLiveLogAt: canUseLiveLogs ? lastLiveLogAt : null,
    canUseLiveLogs,
  };
};
