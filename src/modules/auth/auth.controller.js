import ApiResponse from "../../common/utils/api-response.js";
import * as authService from "./auth.service.js";

const register = async (req, res) => {
  console.log(req.body);
  const user = await authService.register(req.body);
  ApiResponse.created(res, "User registered", user);
};

const login = async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  ApiResponse.ok(res, "User logged in", { user, accessToken, refreshToken });
};

const logout = async (req, res) => {
  await authService.logout(req.user._id);
  ApiResponse.ok(res, "User logged out");
};

const refresh = async (req, res) => {
  const { accessToken, refreshToken, user } = await authService.refresh(
    req.body.refreshToken,
  );
  ApiResponse.ok(res, "Token refreshed", { user, accessToken, refreshToken });
};

const forgotPassword = async (req, res) => {
  await authService.forgotPassword(req.body.email);
  ApiResponse.ok(res, "Password reset email sent");
};

const verifyEmail = async (req, res) => {
  await authService.verifyEmail(req.params.token);
  ApiResponse.ok(res, "Email verified successfully");
};

const resetPassword = async (req, res) => {
  await authService.resetPassword(req.params.token, req.body.password);
  ApiResponse.ok(res, "Password reset successfully");
};

const getMe = async (req, res) => {
  const user = await authService.getMe(req.user._id);
  ApiResponse.ok(res, "User profile", user);
};

const resendVerificationEmail = async (req, res) => {
  await authService.resendVerificationEmail(req.body.email);
  ApiResponse.ok(res, "Verification email resent");
};

const changePassword = async (req, res) => {
  await authService.changePassword(
    req.user._id,
    req.body.currentPassword,
    req.body.newPassword,
  );
  ApiResponse.ok(res, "Password changed successfully");
};

export {
  register,
  login,
  logout,
  refresh,
  forgotPassword,
  verifyEmail,
  resetPassword,
  getMe,
  resendVerificationEmail,
  changePassword,
};
