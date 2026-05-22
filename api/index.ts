type HttpHandler = (req: unknown, res: unknown) => void;

let app: HttpHandler | undefined;

/** Vercel serverless: backend ESM — dynamic import (ERR_REQUIRE_ESM önlenir). */
export default async function handler(req: unknown, res: unknown): Promise<void> {
  if (!app) {
    const { createApp } = await import("../backend/dist/app.js");
    app = createApp() as HttpHandler;
  }
  app(req, res);
}
