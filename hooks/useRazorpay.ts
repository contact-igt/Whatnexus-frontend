"use client";

import { useState, useCallback } from "react";

export const useRazorpay = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  const loadScript = useCallback(() => {
    return new Promise((resolve) => {
      if (window.hasOwnProperty("Razorpay")) {
        setIsLoaded(true);
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        setIsLoaded(true);
        resolve(true);
      };
      script.onerror = () => {
        setIsLoaded(false);
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }, []);

  return { isLoaded, loadScript };
};
