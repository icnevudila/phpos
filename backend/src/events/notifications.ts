/**
 * Basit in-memory event emitter — Modül 7 (Bildirim) için integrasyon noktası.
 *
 * `subscribe` ile dinleyici kaydedilir; `emit*` fonksiyonları event'leri yayar.
 * Şu an sadece console'a log atar; SMS/email entegrasyonu Modül 7'de eklenecek.
 */

type AppointmentEvent =
  | { type: "appointment.created"; appointmentId: string }
  | { type: "appointment.cancelled"; appointmentId: string; reason?: string }
  | { type: "appointment.status_changed"; appointmentId: string; from: string; to: string }
  | { type: "appointment.rescheduled"; appointmentId: string; previousScheduledAt: string };

type Listener = (e: AppointmentEvent) => void | Promise<void>;

const listeners: Listener[] = [];

export function subscribeAppointmentEvents(listener: Listener): () => void {
  listeners.push(listener);
  return () => {
    const idx = listeners.indexOf(listener);
    if (idx >= 0) listeners.splice(idx, 1);
  };
}

export function emitAppointmentEvent(event: AppointmentEvent): void {
  // fire-and-forget
  for (const listener of listeners) {
    try {
      void listener(event);
    } catch {
      /* ignore */
    }
  }
  /** GAP-008: tam event gövdesi yerine tip + id (hasta randevu detayı log’a düşmesin) */
  if (process.env.NODE_ENV !== "test") {
    const id =
      "appointmentId" in event
        ? event.appointmentId
        : undefined;
    console.info("[event]", event.type, id !== undefined ? { appointmentId: id } : {});
  }
}
