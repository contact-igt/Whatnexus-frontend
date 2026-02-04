/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { store } from "../redux/store";
import type { RootState } from "../redux/store";
import { clearAuthData } from "@/redux/slices/auth/authSlice";

interface JwtPayload {
  exp: number;
  [key: string]: any;
}

export const _axios = async (
  method: string,
  url?: string,
  body?: any,
  contentType: string = "application/json",
  params?: any
) => {
  const env = process.env.NEXT_PUBLIC_ENV;
  const APIURL =
    env === "ngrok" ? process.env.NEXT_PUBLIC_NGROK_URL :
      env === "production"
        ? process.env.NEXT_PUBLIC_PRODUCTION_API_URL
        : env === "development"
          ? process.env.NEXT_PUBLIC_DEVELOPMENT_API_URL
          : process.env.NEXT_PUBLIC_LOCALHOST_API_URL;

  const endpoint = `${APIURL}${url}`;
  const state: RootState = store.getState();
  const activeTab = state?.auth?.activeTabData;
  const loginToken = state?.auth?.token;
  const metaToken = state?.auth?.whatsappApiDetails?.accessToken;

  console.log(`[Axios] Request to ${url}`);
  console.log(`[Axios] Active Tab: ${activeTab}`);
  console.log(`[Axios] Login Token Found: ${!!loginToken}`);
  console.log(`[Axios] Meta Token Found: ${!!metaToken}`);

  if (loginToken) {
    try {
      const decoded = jwtDecode<JwtPayload>(loginToken);
      const currentTime = Math.floor(Date.now() / 1000);

      if (decoded.exp < currentTime) {
        console.warn("Token is expired");
        store.dispatch(clearAuthData());
        throw new Error("Token expired");
      }
    } catch (e) {
      console.error("Invalid login token:", e);
      store.dispatch(clearAuthData());
      throw e;
    }
  }

  const isFormData = body instanceof FormData;

  try {
    const res = await axios({
      headers: {
        ...(isFormData ? {} : { "Content-Type": contentType }),
        ...(loginToken ? { Authorization: `Bearer ${loginToken}` } : {}),
        ...(activeTab === "chats" && metaToken ? { "x-meta-token": metaToken } : {}),
        "ngrok-skip-browser-warning": true,
      },
      method: method,
      url: endpoint,
      data: body,
      params: params,
    });
    return res.data;
  } catch (err) {
    console.error("Axios error:", err);
    throw err;
  }
};
