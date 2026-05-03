import { supabase } from "../lib/supabase";

/**
 * Supabase Storage Service for DentEase PH.
 * Manages clinical files, X-rays, and patient documents.
 */

const BUCKET_NAME = "clinical-records";

export async function uploadToSupabase(
  patientId: string,
  file: File,
  folder: "xrays" | "docs" = "xrays"
) {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `${patientId}/${folder}/${fileName}`;

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file);

  if (error) throw error;

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  return {
    path: data.path,
    publicUrl,
    fileName: file.name,
    size: file.size,
    type: file.type
  };
}

export async function deleteFromSupabase(path: string) {
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([path]);

  if (error) throw error;
}

export async function getSignedUrl(path: string, expiresIn = 3600) {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(path, expiresIn);

  if (error) throw error;
  return data.signedUrl;
}
