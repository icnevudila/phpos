import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

export type StorageDriver = "s3" | "supabase" | "local";

export interface UploadResult {
  storageKey: string;
  publicUrl: string | null;
}

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
}

export async function uploadPatientFile(params: {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  patientId: string;
  clinicId: string;
}): Promise<UploadResult> {
  const driver = (process.env.STORAGE_DRIVER ?? "local") as StorageDriver;
  const safeName = sanitizeFileName(params.originalName);
  const keySuffix = `${randomUUID()}-${safeName}`;

  if (driver === "s3") {
    const bucket = process.env.S3_BUCKET;
    const region = process.env.AWS_REGION;
    if (!bucket || !region) {
      throw new Error("S3_BUCKET and AWS_REGION are required for STORAGE_DRIVER=s3");
    }
    const storageKey = `clinics/${params.clinicId}/patients/${params.patientId}/${keySuffix}`;
    const client = new S3Client({ region });
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: storageKey,
        Body: params.buffer,
        ContentType: params.mimeType,
      }),
    );
    const base = process.env.S3_PUBLIC_BASE_URL?.replace(/\/$/, "");
    return {
      storageKey,
      publicUrl: base ? `${base}/${storageKey}` : null,
    };
  }

  if (driver === "supabase") {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const bucket = process.env.SUPABASE_STORAGE_BUCKET;
    if (!url || !key || !bucket) {
      throw new Error("SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_STORAGE_BUCKET required");
    }
    const storageKey = `clinics/${params.clinicId}/patients/${params.patientId}/${keySuffix}`;
    const supabase: SupabaseClient = createClient(url, key);
    const { error } = await supabase.storage.from(bucket).upload(storageKey, params.buffer, {
      contentType: params.mimeType,
      upsert: false,
    });
    if (error) {
      throw new Error(`Supabase upload failed: ${error.message}`);
    }
    const { data } = supabase.storage.from(bucket).getPublicUrl(storageKey);
    return { storageKey, publicUrl: data.publicUrl };
  }

  const root = process.env.LOCAL_UPLOAD_DIR ?? path.join(process.cwd(), "uploads", "patient-files");
  const relKey = path.join(params.clinicId, params.patientId, keySuffix);
  const absPath = path.join(root, relKey);
  await mkdir(path.dirname(absPath), { recursive: true });
  await writeFile(absPath, params.buffer);
  return {
    storageKey: relKey.split(path.sep).join("/"),
    /** Public static URL kaldırıldı (GAP-001); dosya `GET /api/patients/:id/files/:fileId/download` ile JWT ile alınır */
    publicUrl: null,
  };
}

export async function uploadHmoClaimAttachment(params: {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  claimId: string;
  clinicId: string;
}): Promise<UploadResult> {
  const driver = (process.env.STORAGE_DRIVER ?? "local") as StorageDriver;
  const safeName = sanitizeFileName(params.originalName);
  const keySuffix = `${randomUUID()}-${safeName}`;

  if (driver === "s3") {
    const bucket = process.env.S3_BUCKET;
    const region = process.env.AWS_REGION;
    if (!bucket || !region) {
      throw new Error("S3_BUCKET and AWS_REGION are required for STORAGE_DRIVER=s3");
    }
    const storageKey = `clinics/${params.clinicId}/hmo-claims/${params.claimId}/${keySuffix}`;
    const client = new S3Client({ region });
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: storageKey,
        Body: params.buffer,
        ContentType: params.mimeType,
      }),
    );
    const base = process.env.S3_PUBLIC_BASE_URL?.replace(/\/$/, "");
    return {
      storageKey,
      publicUrl: base ? `${base}/${storageKey}` : null,
    };
  }

  if (driver === "supabase") {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const bucket = process.env.SUPABASE_STORAGE_BUCKET;
    if (!url || !key || !bucket) {
      throw new Error("SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_STORAGE_BUCKET required");
    }
    const storageKey = `clinics/${params.clinicId}/hmo-claims/${params.claimId}/${keySuffix}`;
    const supabase: SupabaseClient = createClient(url, key);
    const { error } = await supabase.storage.from(bucket).upload(storageKey, params.buffer, {
      contentType: params.mimeType,
      upsert: false,
    });
    if (error) {
      throw new Error(`Supabase upload failed: ${error.message}`);
    }
    const { data } = supabase.storage.from(bucket).getPublicUrl(storageKey);
    return { storageKey, publicUrl: data.publicUrl };
  }

  const root = process.env.LOCAL_UPLOAD_DIR ?? path.join(process.cwd(), "uploads", "patient-files");
  const relKey = path.join(params.clinicId, "hmo-claims", params.claimId, keySuffix);
  const absPath = path.join(root, relKey);
  await mkdir(path.dirname(absPath), { recursive: true });
  await writeFile(absPath, params.buffer);
  return {
    storageKey: relKey.split(path.sep).join("/"),
    publicUrl: null,
  };
}

/**
 * Yerel depolanan hasta dosyasını okur. S3/Supabase için ayrı implementasyon gerekir.
 */
export async function readLocalPatientFileBuffer(storageKey: string): Promise<Buffer> {
  const root = process.env.LOCAL_UPLOAD_DIR ?? path.join(process.cwd(), "uploads", "patient-files");
  const normalized = storageKey
    .replace(/\\/g, "/")
    .split("/")
    .filter((p) => p && p !== "." && p !== "..");
  const absPath = path.join(root, ...normalized);
  const rootResolved = path.resolve(root);
  if (!absPath.startsWith(rootResolved)) {
    throw new Error("Invalid storage path");
  }
  return readFile(absPath);
}

/** Yerel `storageKey` ile eşleşen dosyayı siler (yoksa sessizce geçer). */
export async function deleteLocalStorageFile(storageKey: string): Promise<void> {
  const root = process.env.LOCAL_UPLOAD_DIR ?? path.join(process.cwd(), "uploads", "patient-files");
  const normalized = storageKey
    .replace(/\\/g, "/")
    .split("/")
    .filter((p) => p && p !== "." && p !== "..");
  const absPath = path.join(root, ...normalized);
  const rootResolved = path.resolve(root);
  if (!absPath.startsWith(rootResolved)) {
    return;
  }
  await unlink(absPath).catch(() => {});
}
