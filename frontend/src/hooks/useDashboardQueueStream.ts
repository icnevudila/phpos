import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { ACCESS_TOKEN_KEY } from "../constants/auth";
import { apiBaseUrl } from "../services/index";
import type { DashboardQueuePayload } from "../services/reports";

/**
 * Ops sekmesinde kuyruk verisini SSE ile günceller (polling yedek: react-query refetchInterval).
 */
export function useDashboardQueueStream(enabled: boolean): void {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!token) return;

    const url = `${apiBaseUrl}/reports/dashboard/queue/stream?access_token=${encodeURIComponent(token)}`;
    const es = new EventSource(url);

    const onQueue = (ev: MessageEvent<string>): void => {
      try {
        const data = JSON.parse(ev.data) as DashboardQueuePayload;
        queryClient.setQueryData(["dashboard-queue"], data);
      } catch {
        /* ignore malformed frame */
      }
    };

    es.addEventListener("queue", onQueue as EventListener);
    es.onerror = () => {
      es.close();
    };

    return () => {
      es.removeEventListener("queue", onQueue as EventListener);
      es.close();
    };
  }, [enabled, queryClient]);
}
