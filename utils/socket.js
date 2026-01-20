import { io } from "socket.io-client";


const SOCKET_URL = process.env.NEXT_PUBLIC_ENV == "ngrok" ? process.env.NEXT_PUBLIC_SOCKET_NGROK_URL : process.env.NEXT_PUBLIC_SOCKET_PRODUCTION_API_URL;
// ngrok use panna:
// const SOCKET_URL = "https://xxxxx.ngrok-free.app";

export const socket = io(SOCKET_URL, {
  transports: ["websocket"],
  autoConnect: false, // manual connect
});
