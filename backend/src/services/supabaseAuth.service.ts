
import { supabase } from '../lib/supabase.js'
import type { AuthTokensResponse, PublicUser } from '../types/auth.js'
import { AppError } from '../utils/errors.js'

export async function registerClinicAdmin(input: {
  clinicName: string
  email: string
  password: string
  firstName: string
  lastName: string
  phone: string
}): Promise<AuthTokensResponse> {
  // Supabase Auth ile kullanıcı oluştur
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
        clinicName: input.clinicName,
        role: 'ADMIN'
      }
    }
  })

  if (authError) {
    throw new AppError(authError.message, 400, 'REGISTRATION_FAILED')
  }

  if (!authData.user) {
    throw new AppError('User creation failed', 500, 'USER_CREATION_FAILED')
  }

  // Klinik oluştur (Supabase DB'de)
  const { data: clinicData, error: clinicError } = await supabase
    .from('Clinic')
    .insert({
      name: input.clinicName,
      slug: slugifyClinicName(input.clinicName)
    })
    .select()
    .single()

  if (clinicError) {
    throw new AppError(clinicError.message, 500, 'CLINIC_CREATION_FAILED')
  }

  // Kullanıcıyı güncelle
  const { error: updateError } = await supabase
    .from('User')
    .insert({
      id: authData.user.id,
      clinicId: clinicData.id,
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      role: 'ADMIN'
    })

  if (updateError) {
    throw new AppError(updateError.message, 500, 'USER_UPDATE_FAILED')
  }

  return {
    accessToken: authData.session?.access_token || '',
    refreshToken: authData.session?.refresh_token || '',
    user: {
      id: authData.user.id,
      clinicId: clinicData.id,
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      role: 'ADMIN' as const
    }
  }
}

export async function login(input: { email: string; password: string }): Promise<AuthTokensResponse> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password
  })

  if (error) {
    throw new AppError(error.message, 401, 'INVALID_CREDENTIALS')
  }

  if (!data.user || !data.session) {
    throw new AppError('Login failed', 401, 'LOGIN_FAILED')
  }

  // Kullanıcı bilgilerini al
  console.log('[auth] Fetching user metadata for ID:', data.user.id);
  const { data: users, error: userError } = await supabase
    .from('User')
    .select('*, Clinic(*)')
    .eq('id', data.user.id);

  if (userError) {
    console.error('[auth] User fetch error:', userError);
    throw new AppError(userError.message, 500, 'USER_FETCH_FAILED')
  }

  if (!users || users.length === 0) {
    console.error('[auth] No user found in DB for auth ID:', data.user.id);
    throw new AppError('User profile not found', 404, 'USER_PROFILE_MISSING')
  }

  if (users.length > 1) {
    console.warn('[auth] Multiple user profiles found for ID:', data.user.id, '- using the first one');
  }

  const userData = users[0];


  return {
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token,
    user: {
      id: userData.id,
      clinicId: userData.clinicId,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone,
      role: userData.role
    }
  }
}

export async function logout(): Promise<void> {
  const { error } = await supabase.auth.signOut()
  if (error) {
    throw new AppError(error.message, 500, 'LOGOUT_FAILED')
  }
}

export async function getCurrentUser(userId: string): Promise<PublicUser> {
  const { data, error } = await supabase
    .from('User')
    .select('*, Clinic(*)')
    .eq('id', userId)
    .single()

  if (error) {
    throw new AppError(error.message, 404, 'USER_NOT_FOUND')
  }

  return {
    id: data.id,
    clinicId: data.clinicId,
    email: data.email,
    firstName: data.firstName,
    lastName: data.lastName,
    phone: data.phone,
    role: data.role
  }
}

function slugifyClinicName(name: string): string {
  const base = name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 40) || 'clinic'
  return `${base}-${Math.random().toString(36).slice(2, 8)}`
}

/** Supabase şifre sıfırlama e-postası gönderir (kullanıcı yoksa da aynı yanıt). */
export async function requestPasswordReset(email: string): Promise<void> {
  const base = (process.env.APP_PUBLIC_URL ?? 'http://localhost:5173').replace(/\/$/, '')
  const redirectTo = `${base}/reset-password`
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
    redirectTo,
  })
  if (error) {
    console.warn('[auth] password reset email:', error.message)
  }
}

export async function refreshSession(refreshToken: string): Promise<AuthTokensResponse> {
  const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken })
  if (error) {
    throw new AppError(error.message, 401, 'REFRESH_FAILED')
  }
  if (!data.user || !data.session) {
    throw new AppError('Session refresh failed', 401, 'SESSION_REFRESH_FAILED')
  }

  const { data: users, error: userError } = await supabase
    .from('User')
    .select('id, clinicId, email, firstName, lastName, phone, role')
    .eq('id', data.user.id)

  if (userError || !users?.length) {
    throw new AppError('User profile not found', 404, 'USER_PROFILE_MISSING')
  }

  const profile = users[0]
  return {
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token,
    user: {
      id: profile.id,
      clinicId: profile.clinicId,
      email: profile.email,
      firstName: profile.firstName,
      lastName: profile.lastName,
      phone: profile.phone ?? '',
      role: profile.role,
    },
  }
}
