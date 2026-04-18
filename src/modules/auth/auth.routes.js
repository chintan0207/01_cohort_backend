import { Router } from "express";
import validate from "../../common/middleware/validate.middleware.js";
import RegisterDto from "./dto/register.dto.js";
import * as controller from "./auth.controller.js";
import LoginDto from "./dto/login.dto.js";
import { authenticate } from "./auth.middleware.js";
import ForgotPasswordDto from "./dto/forgot-password.dto.js";
import ResetPasswordDto from "./dto/reset-password.dto.js";
import { upload } from "../../common/middleware/multer.middleware.js";

const router = Router();

router.post("/register", validate(RegisterDto), controller.register);
router.post("/login", validate(LoginDto), controller.login);
router.get("/logout", authenticate, controller.logout);
router.post("/refresh", controller.refresh);
router.post(
  "/forgot-password",
  validate(ForgotPasswordDto),
  controller.forgotPassword,
);
router.get("/verify-email/:token", controller.verifyEmail);
router.post(
  "/reset-password/:token",
  validate(ResetPasswordDto),
  controller.resetPassword,
);
router.get("/me", authenticate, controller.getMe);
router.post("/resend-verification-email", controller.resendVerificationEmail);
router.post("/change-password", authenticate, controller.changePassword);
router.post(
  "/avatar",
  authenticate,
  upload.single("avatar"),
  controller.uploadAvatar,
);

export default router;
