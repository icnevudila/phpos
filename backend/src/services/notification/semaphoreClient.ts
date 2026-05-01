/**
 * Semaphore.co SMS sağlayıcı istemcisi.
 *
 * Docs: https://semaphore.co/docs
 *
 * API_KEY yoksa "dry-run" modda çalışır — gerçek istek göndermez, başarılı
 * sayar ve provider ref olarak `dev-<timestamp>` döndürür. Böylece development
 * ortamında Notification kayıtları oluşur ve akış test edilebilir.
 */

export interface SemaphoreResponse {
  ok: boolean;
  providerRef?: string;
  error?: string;
  dryRun: boolean;
}

export interface SemaphoreSendOptions {
  /** 09XXXXXXXXX formatı */
  localPhone: string;
  message: string;
  /** 11 karakterle sınırlı sender name (klinik adı). Bilinen bir sender olmalı. */
  senderName?: string;
}

const SEMAPHORE_URL = "https://api.semaphore.co/api/v4/messages";

export async function semaphoreSend(options: SemaphoreSendOptions): Promise<SemaphoreResponse> {
  const apiKey = process.env.SEMAPHORE_API_KEY?.trim();
  const sender = (options.senderName ?? process.env.SEMAPHORE_SENDER ?? "DentEase").slice(0, 11);

  if (!apiKey) {
    return {
      ok: true,
      providerRef: `dev-${Date.now()}`,
      dryRun: true,
    };
  }

  const body = new URLSearchParams({
    apikey: apiKey,
    number: options.localPhone,
    message: options.message,
    sendername: sender,
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const res = await fetch(SEMAPHORE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
      signal: controller.signal,
    });
    const text = await res.text();
    if (!res.ok) {
      return { ok: false, error: `HTTP ${res.status}: ${text}`, dryRun: false };
    }
    // Semaphore success response is an array of message objects
    let providerRef: string | undefined;
    try {
      const json = JSON.parse(text) as Array<{ message_id?: number | string }>;
      if (Array.isArray(json) && json[0]?.message_id !== undefined) {
        providerRef = String(json[0].message_id);
      }
    } catch {
      /* plain text response */
    }
    return { ok: true, providerRef, dryRun: false };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: message, dryRun: false };
  } finally {
    clearTimeout(timeout);
  }
}
