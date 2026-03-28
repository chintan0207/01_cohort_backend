import { Router } from "express";
import validate from "../../common/middleware/validate.middleware.js";
import RegisterDto from "./dto/register.dto.js";
import * as controller from "./auth.controller.js";
import LoginDto from "./dto/login.dto.js";
import { authenticate } from "./auth.middleware.js";

const router = Router();

router.post("/register", validate(RegisterDto), controller.register);
router.post("/login", validate(LoginDto), controller.login);
router.get("/logout", authenticate, controller.logout);
router.post("/refresh", controller.refresh);
router.post("/forgot-password", controller.forgotPassword);
router.get("/verify-email/:token", controller.verifyEmail);
router.post("/reset-password/:token", controller.resetPassword);
router.get("/me", authenticate, controller.getMe);
router.post("/resend-verification-email", controller.resendVerificationEmail);
router.post("/change-password", authenticate, controller.changePassword);

export default router;
