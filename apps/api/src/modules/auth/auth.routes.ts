import { Router } from "express";
import { registerSchema, loginSchema, updateProfileSchema } from "@mogoj/shared";
import { validate } from "../../middlewares/validate.middleware.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { csrfMiddleware } from "../../middlewares/csrf.middleware.js";
import { authLimiter } from "../../middlewares/rateLimit.middleware.js";
import * as authController from "./auth.controller.js";

export const authRouter = Router();

authRouter.post("/register", authLimiter, validate({ body: registerSchema }), authController.register);
authRouter.post("/login", authLimiter, validate({ body: loginSchema }), authController.login);
authRouter.post("/logout", csrfMiddleware, authController.logout);
authRouter.post("/refresh", authLimiter, authController.refresh);
authRouter.get("/me", authMiddleware, authController.me);
authRouter.patch(
  "/profile",
  authMiddleware,
  csrfMiddleware,
  validate({ body: updateProfileSchema }),
  authController.updateProfile,
);
