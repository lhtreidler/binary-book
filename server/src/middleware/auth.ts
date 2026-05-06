import { Request, Response, NextFunction } from "express";
import {
  verifyToken,
  extractTokenFromHeader,
  TokenPayload,
} from "../utils/jwt.js";

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    res.status(401).json({ error: "No token provided" });
    return;
  }

  const payload = verifyToken(token);
  if (!payload) {
    res.status(403).json({ error: "Invalid or expired token" });
    return;
  }

  req.user = payload;
  next();
}
