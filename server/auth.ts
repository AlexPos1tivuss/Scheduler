import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "@shared/schema";

const JWT_SECRET = process.env.SESSION_SECRET || "mitso-schedule-secret-key-change-in-production";
const COOKIE_NAME = "auth_token";

export interface AuthRequest extends Request {
  user?: User;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(user: User): string {
  return jwt.sign(
    { 
      id: user.id, 
      role: user.role,
      login: user.login 
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export function setAuthCookie(res: Response, token: string) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

export function clearAuthCookie(res: Response) {
  res.clearCookie(COOKIE_NAME);
}

// Middleware to check if user is authenticated
export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.cookies[COOKIE_NAME];

  if (!token) {
    return res.status(401).json({ error: "Требуется аутентификация" });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    clearAuthCookie(res);
    return res.status(401).json({ error: "Недействительный токен" });
  }

  // In a real app, we'd fetch the user from DB here
  // For now, we'll attach the decoded token data
  req.user = decoded as User;
  next();
}

// Middleware to check if user has admin role
export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Требуются права администратора" });
  }
  next();
}

// Middleware to check if user has teacher role
export function requireTeacher(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || (req.user.role !== "ADMIN" && req.user.role !== "TEACHER")) {
    return res.status(403).json({ error: "Требуются права преподавателя" });
  }
  next();
}
