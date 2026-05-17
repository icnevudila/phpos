import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { SkipToMainLink } from "./components/SkipToMainLink";
import App from "./App";
import "./i18n";
import "./index.css";
import { ThemeProvider } from "./theme/ThemeContext";
import { initSentry } from "./lib/sentry";

import { registerSW } from "virtual:pwa-register";

void initSentry();

registerSW({
  onOfflineReady() {
    console.info("[pwa] App shell ready for offline use");
  },
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <SkipToMainLink />
          <App />
          <Toaster richColors position="top-right" />
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
