import type { NextFunction, Request, Response } from "express";
import { verifyJwt, type JwtPayload } from "../lib/jwt.js";

export interface AuthRequest extends Request {
  id: string;
  email: string;
  role: "ADMIN" | "EMPLOYEE";
}

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = (await verifyJwt(token!)) as JwtPayload | null;

    if (!decoded) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    // ✅ Attach decoded fields directly to request
    (req as AuthRequest).id = decoded.id;
    (req as AuthRequest).email = decoded.email;
    (req as AuthRequest).role = decoded.role;

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
}
