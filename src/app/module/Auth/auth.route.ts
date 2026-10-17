import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { AuthController } from "./auth.controller";
import { AuthValidation } from "./auth.validation";

const router = Router();

router.post(
  "/register",
  validateRequest(AuthValidation.registerZodSchema),
  AuthController.register,
);

router.post(
  "/login",
  validateRequest(AuthValidation.loginZodSchema),
  AuthController.login,
);

router.get("/me", checkAuth(), AuthController.getMe);
router.post("/logout", AuthController.logout);
router.post("/forgot-password", AuthController.forgotPassword);
router.post("/reset-password", AuthController.resetPassword);

// Google OAuth
router.get("/google", AuthController.googleAuthRedirect);
router.get("/google/callback", AuthController.googleAuthCallback);

export const AuthRoutes = router;
