import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import bcrypt from "bcryptjs";
import { signJwt } from "../lib/jwt.js";

async function LoginController(req: Request, res: Response) {
  console.time("Total Login");
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    console.time("1. Prisma findUnique");
    const user = await prisma.user.findUnique({
      where: { email },
    });
    console.timeEnd("1. Prisma findUnique");

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    console.time("2. bcrypt.compare");
    const isMatch = await bcrypt.compare(password, user.password);
    console.timeEnd("2. bcrypt.compare");

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    console.time("3. signJwt");
    const token = await signJwt({
      id: user.id.toString(),
      email: user.email,
      role: user.role as "ADMIN" | "EMPLOYEE",
    });
    console.timeEnd("3. signJwt");

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    console.timeEnd("Total Login");
  }
}

export { LoginController };
