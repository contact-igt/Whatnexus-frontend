import { io } from "socket.io-client";

const env = (process.env.NEXT_PUBLIC_ENV || "").trim();

const isPrivateIpv4Host = (hostname) => {
  return /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(hostname);
};

const isLocalBrowserHost = () => {
  if (typeof window === "undefined") {
    return true;
  }

  const hostname = window.location.hostname;
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    hostname === "[::1]" ||
    isPrivateIpv4Host(hostname)
  );
};

const isNgrokBrowserHost = () => {
  if (typeof window === "undefined") {
    return false;
  }

  const hostname = window.location.hostname;
  return hostname.includes("ngrok-free.dev") || hostname.includes("ngrok.io");
};

const SOCKET_URL = (() => {
  const localhostUrl = (
    process.env.NEXT_PUBLIC_SOCKET_LOCALHOST_URL || "http://localhost:8000"
  ).trim();
  const ngrokUrl = (process.env.NEXT_PUBLIC_SOCKET_NGROK_URL || "").trim();

  switch (env) {
    case "ngrok":
      return ngrokUrl;
    case "production":
      return (process.env.NEXT_PUBLIC_SOCKET_PRODUCTION_API_URL || "").trim();
    case "stage":
      return (process.env.NEXT_PUBLIC_SOCKET_STAGE_API_URL || "").trim();
    default:
      if (isNgrokBrowserHost() && ngrokUrl) {
        return ngrokUrl;
      }

      if (isLocalBrowserHost() && localhostUrl) {
        return localhostUrl;
      }

      return localhostUrl || ngrokUrl;
  }
})();

const socketOptions = {
  autoConnect: false,
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
};

const globalSocketKey = "__whatsnexusSocket";

export const socket =
  globalThis[globalSocketKey] ||
  (globalThis[globalSocketKey] = io(SOCKET_URL, socketOptions));

const normalizeSocketToken = (token) => {
  if (typeof token !== "string") {
    return null;
  }

  const trimmedToken = token.trim();
  if (!trimmedToken) {
    return null;
  }

  if (trimmedToken.toLowerCase().startsWith("bearer ")) {
    return trimmedToken.slice(7).trim() || null;
  }

  return trimmedToken;
};

export const setSocketAuthToken = (token) => {
  const normalizedToken = normalizeSocketToken(token);
  socket.auth = normalizedToken ? { token: normalizedToken } : {};
  socket.__authToken = normalizedToken;
  return normalizedToken;
};

export const clearSocketAuthToken = () => {
  socket.auth = {};
  socket.__authToken = null;
};

const normalizeTenantRoomId = (tenantId) => {
  if (tenantId === null || tenantId === undefined) {
    return null;
  }

  const normalizedTenantId = String(tenantId).trim();
  return normalizedTenantId || null;
};

export const connectSocketWithToken = (token) => {
  const normalizedToken = setSocketAuthToken(token);

  if (socket.connected && socket.__lastConnectedAuthToken !== normalizedToken) {
    socket.disconnect();
  }

  if (!socket.connected) {
    socket.connect();
  }

  return socket;
};

export const joinTenantSocketRoom = (tenantId, options = {}) => {
  const normalizedTenantId = normalizeTenantRoomId(tenantId);
  const shouldForceJoin = Boolean(options?.force);

  if (!normalizedTenantId) {
    return null;
  }

  if (
    shouldForceJoin ||
    socket.__joinedTenantRoomId !== normalizedTenantId
  ) {
    socket.emit("join-tenant", normalizedTenantId);
    socket.__joinedTenantRoomId = normalizedTenantId;
  }

  return normalizedTenantId;
};

export const connectTenantSocketWithToken = (token, tenantId) => {
  connectSocketWithToken(token);

  if (socket.connected) {
    joinTenantSocketRoom(tenantId);
  }

  return socket;
};

export const disconnectSocket = () => {
  clearSocketAuthToken();
  socket.__joinedTenantRoomId = null;

  if (socket.connected || socket.active) {
    socket.disconnect();
  }

  return socket;
};

socket.on("connect", () => {
  socket.__lastConnectedAuthToken = socket.__authToken || null;
});

socket.on("disconnect", () => {
  socket.__lastConnectedAuthToken = null;
  socket.__joinedTenantRoomId = null;
});

export { SOCKET_URL };
export default socket;
