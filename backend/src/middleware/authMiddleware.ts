import type { NextFunction, Request, Response } from "express";
import { supabase } from "../lib/supabase.js";

export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      error: "Unauthorized",
      code: "UNAUTHORIZED",
    });
    return;
  }
  const token = header.slice("Bearer ".length).trim();
  if (!token) {
    res.status(401).json({
      success: false,
      error: "Unauthorized",
      code: "UNAUTHORIZED",
    });
    return;
  }

  try {
    // Supabase JWT'ini doğrula
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({
        success: false,
        error: "Invalid or expired token",
        code: "TOKEN_EXPIRED",
      });
      return;
    }

    // Kullanıcı bilgilerini al
    const { data: userData, error: userError } = await supabase
      .from('User')
      .select('*')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      res.status(401).json({
        success: false,
        error: "User not found in public database",
        code: "USER_NOT_FOUND",
      });
      return;
    }

    req.user = {
      id: userData.id,
      clinicId: userData.clinicId,
      role: userData.role,
    };
    next();
  } catch (err) {
    console.error("Auth Middleware Error:", err);
    res.status(401).json({
      success: false,
      error: "Invalid or expired token",
      code: "TOKEN_EXPIRED",
    });
  }
}
