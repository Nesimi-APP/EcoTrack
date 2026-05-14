import { type NextFunction, type Request, type Response } from "express";
import { verifyToken } from "../lib/jwt.js";

export interface AuthRequest extends Request {
  userId: string;
  userEmail: string;
}

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Giriş tələb olunur" });
    return;
  }
  const token = header.slice(7);
  try {
    const payload = verifyToken(token);
    (req as AuthRequest).userId = payload.userId;
    (req as AuthRequest).userEmail = payload.email;
    next();
  } catch {
    res.status(401).json({ error: "Token etibarsızdır" });
  }
}
