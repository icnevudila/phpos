import type { TFunction } from "i18next";

import { PortalApiError } from "./services/portalApi";

/** Portal API `code` + mesajını kullanıcı diline çevirir; bilinmeyen kodlarda sunucu mesajı döner. */
export function translatePortalError(err: unknown, t: TFunction): string {
  if (err instanceof PortalApiError) {
    if (err.code === "OTP_COOLDOWN") {
      const sec = err.message.match(/(\d+)/)?.[1];
      if (sec) {
        return t("pages.portal.errors.codes.OTP_COOLDOWN", {
          seconds: sec,
          defaultValue: err.message,
        });
      }
    }
    return t(`pages.portal.errors.codes.${err.code}`, { defaultValue: err.message });
  }
  if (err instanceof Error) return err.message;
  return t("pages.portal.errors.generic");
}
