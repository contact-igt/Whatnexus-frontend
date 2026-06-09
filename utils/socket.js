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

