import { io } from "socket.io-client";

const SOCKET_URL = "https://fringilline-celsa-unreasoned.ngrok-free.dev";
// ngrok use panna:
// const SOCKET_URL = "https://xxxxx.ngrok-free.app";

export const socket = io(SOCKET_URL, {
  transports: ["websocket"],
  autoConnect: false, // manual connect
});
