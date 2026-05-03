import { supabase } from "../lib/supabase";

/**
 * Supabase Auth Bridge for DentEase PH.
 * This service wraps Supabase authentication logic to provide a clean transition
 * from custom JWT to Supabase managed identity.
 */

export async function supabaseSignIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function supabaseSignOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function supabaseGetSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

/**
 * Staff Sign-Up (Admin only typically)
 */
export async function supabaseSignUp(email: string, password: string, metadata: any) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  });

  if (error) throw error;
  return data;
}
