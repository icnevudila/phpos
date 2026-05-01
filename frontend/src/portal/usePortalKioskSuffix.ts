import { useSearchParams } from "react-router-dom";

/** `?kiosk=1` — tablet/kiosk; iç `Link` / `navigate` yollarında `PortalLayout` ile uyumlu kalmalı. */
export function usePortalKioskSuffix(): string {
  const [searchParams] = useSearchParams();
  return searchParams.get("kiosk") === "1" ? "?kiosk=1" : "";
}
