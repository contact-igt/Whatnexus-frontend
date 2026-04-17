import { io } from "socket.io-client";

const env = (process.env.NEXT_PUBLIC_ENV || "").trim();

const SOCKET_URL = (() => {
  switch (env) {
    case "ngrok":
      return (process.env.NEXT_PUBLIC_SOCKET_NGROK_URL || "").trim();
    case "production":
      return (process.env.NEXT_PUBLIC_SOCKET_PRODUCTION_API_URL || "").trim();
    case "stage":
      return (process.env.NEXT_PUBLIC_SOCKET_STAGE_API_URL || "").trim();
    default:
      return (process.env.NEXT_PUBLIC_SOCKET_LOCALHOST_URL || "http://localhost:8000").trim();
  }
})();

console.log(`[Socket] ENV=${env}, URL=${SOCKET_URL}`);

export const socket = io(SOCKET_URL, {
  transports: ["websocket", "polling"],
  autoConnect: false,
});
