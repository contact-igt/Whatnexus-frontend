"use client";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "@/redux/store";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <QueryClientProvider client={queryClient}>
          <Toaster
            position="top-right"
            theme="system"
            richColors
            toastOptions={{
              classNames: {
                toast: "group toast group-[.toaster]:bg-white/90 group-[.toaster]:dark:bg-[#151518]/90 group-[.toaster]:text-slate-950 group-[.toaster]:dark:text-white group-[.toaster]:border-slate-200 group-[.toaster]:dark:border-white/10 group-[.toaster]:shadow-lg group-[.toaster]:backdrop-blur-xl group-[.toaster]:rounded-3xl hover:group-[.toaster]:border-emerald-500/20 data-[state=open]:animate-toast-enter data-[state=closed]:animate-toast-exit",
                description: "group-[.toast]:text-slate-500 group-[.toast]:dark:text-slate-400",
                actionButton: "group-[.toast]:bg-slate-900 group-[.toast]:text-slate-50 group-[.toast]:dark:bg-slate-50 group-[.toast]:dark:text-slate-900",
                cancelButton: "group-[.toast]:bg-slate-100 group-[.toast]:text-slate-500 group-[.toast]:dark:bg-slate-800 group-[.toast]:dark:text-slate-400",
                // Vibrant Success: Deep Green (Dark) / Pale Green (Light) + Strong Text/Border
                success: "group-[.toaster]:!bg-[#ecfdf5] group-[.toaster]:dark:!bg-[#052e16]/90 group-[.toaster]:!border-emerald-500/50 group-[.toaster]:!text-emerald-800 group-[.toaster]:dark:!text-emerald-400",
                // Vibrant Error: Pale Red (Light) / Deep Red (Dark) + Strong Text/Border
                error: "group-[.toaster]:!bg-[#fef2f2] group-[.toaster]:dark:!bg-[#450a0a]/90 group-[.toaster]:!border-red-500/50 group-[.toaster]:!text-red-800 group-[.toaster]:dark:!text-red-400",
                warning: "group-[.toaster]:!bg-[#fffbeb] group-[.toaster]:dark:!bg-[#451a03]/90 group-[.toaster]:!border-amber-500/50 group-[.toaster]:!text-amber-800 group-[.toaster]:dark:!text-amber-400",
                info: "group-[.toaster]:!bg-[#eff6ff] group-[.toaster]:dark:!bg-[#172554]/90 group-[.toaster]:!border-blue-500/50 group-[.toaster]:!text-blue-800 group-[.toaster]:dark:!text-blue-400",
              },
            }}
          />
          {children}
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  );
};