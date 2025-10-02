import type { Response, NextFunction, Request } from "express";
import type { AuthRequest } from "./verify.middleware.js";

export function isAdmin(req: Request, res: Response, next: NextFunction) {
  const userReq = req as unknown as AuthRequest;

  if (!userReq.email) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  if (userReq.role !== "ADMIN") {
    return res
      .status(403)
      .json({ success: false, message: "Forbidden: Admins only" });
  }

  next();
}
