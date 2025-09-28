// src/routes/auth.ts
import { Router } from "express";
import { LoginController } from "../controllers/auth.controller.js";

const AuthRouter = Router();

AuthRouter.post("/login", async (req, res) => {
  LoginController(req, res);
});

export default AuthRouter;
