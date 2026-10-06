import jwt from "jsonwebtoken";

const AUTH_SECRET = process.env.AUTH_SECRET || "atsly_jwt_super_secure_secret_default_key_2026";
const TOKEN_EXPIRY = "7d";

export interface TokenPayload {
  id: string;
  userId: string;
  email: string;
  name: string;
  role?: string;
}

export function signToken(payload: { id?: string; userId?: string; email: string; name: string; role?: string }): string {
  const normalized: TokenPayload = {
    id: payload.id || payload.userId || "",
    userId: payload.userId || payload.id || "",
    email: payload.email,
    name: payload.name,
    role: payload.role || "user",
  };
  return jwt.sign(normalized, AUTH_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, AUTH_SECRET) as any;
    if (!decoded) return null;
    return {
      id: decoded.id || decoded.userId || "",
      userId: decoded.userId || decoded.id || "",
      email: decoded.email || "",
      name: decoded.name || "",
      role: decoded.role || "user",
    };
  } catch {
    return null;
  }
}
