import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.SESSION_SECRET ?? "ecotrack_dev_secret_change_me";
const JWT_EXPIRES = "30d";

export interface JwtPayload {
  userId: string;
  email: string;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}
