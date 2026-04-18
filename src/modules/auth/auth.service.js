import {
  sendPasswordResetEmail,
  sendVerificationEmail,
} from "../../common/config/email.js";
import imagekit from "../../common/config/imagekit.js";
import ApiError from "../../common/utils/api-error.js";
import {
  generateAccessToken,
  generateRefreshToken,
  generateResetToken,
  hashedToken,
  verifyRefreshToken,
} from "../../common/utils/jwt.utils.js";
import User from "./auth.model.js";
import fs from "fs";

const register = async ({ name, email, password, role }) => {
  const exists = await User.findOne({ email });
  if (exists) throw ApiError.conflict("User already exists");

  const { rawToken, hashedToken } = generateResetToken();

  const user = await User.create({
    email,
    name,
    password,
    role,
    verificationToken: hashedToken,
  });

  try {
    const info = await sendVerificationEmail(email, rawToken);
    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.error("Error: while email sending", error);
  }

  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.verificationToken;

  return userObj;
};

const login = async ({ email, password }) => {
  console.log("Attempting login with email:", email, password);

  const user = await User.findOne({ email }).select("+password");
  console.log("User found:", user);
  if (!user) throw ApiError.unauthorized("Invalid email or password");

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw ApiError.unauthorized("Invalid Credencials");

  // if (!user.isVerified) {
  //   throw ApiError.forbidden("Please verify your email before login");
  // }

  const accessToken = generateAccessToken({ id: user?._id, role: user?.role });
  const refreshToken = generateRefreshToken({ id: user?._id });

  user.refreshToken = hashedToken(refreshToken);
  await user.save({ validateBeforeSave: false });

  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.refreshToken;

  return { user: userObj, accessToken, refreshToken };
};

const logout = async (userId) => {
  await User.findByIdAndUpdate(userId, { refreshToken: null });
};

const refresh = async (token) => {
  if (!token) throw ApiError.unauthorized("Refresh token missing");
  const decoded = verifyRefreshToken(token);

  const user = await User.findById(decoded.id).select("+refreshToken");
  if (!user) throw ApiError.unauthorized("User not found");

  if (user.refreshToken !== hashedToken(token)) {
    throw ApiError.unauthorized("Invalid refresh token");
  }

  const accessToken = generateAccessToken({ id: user._id, role: user.role });
  const refreshToken = generateRefreshToken({ id: user._id });

  user.refreshToken = hashedToken(refreshToken);
  await user.save({ validateBeforeSave: false });

  return { user, accessToken, refreshToken };
};

const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw ApiError.notFound("Account not found with this email");

  const { rawToken, hashedToken } = generateResetToken();

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
  await user.save();

  await sendPasswordResetEmail(email, rawToken);
};

const resetPassword = async (token, password) => {
  const hToken = hashedToken(token);
  const user = await User.findOne({
    resetPasswordToken: hToken,
    resetPasswordExpires: { $gt: Date.now() },
  }).select("+resetPasswordToken +resetPasswordExpires");
  if (!user) throw ApiError.badRequest("Invalid or expired reset token");

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  return user;
};

const verifyEmail = async (token) => {
  const hToken = hashedToken(token);

  const user = await User.findOne({ verificationToken: hToken }).select(
    "+verificationToken",
  );
  if (!user) throw ApiError.badRequest("Invalid or expired verification token");

  user.isVerified = true;
  user.verificationToken = undefined;
  await user.save({ validateBeforeSave: false });
  return user;
};

const getMe = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notfound("User not found");
  return user;
};

const resendVerificationEmail = async (email) => {
  const user = await User.findOne({ email });

  if (!user) throw ApiError.notFound("Account not found with this email");
  if (user.isVerified) throw ApiError.badRequest("Email is already verified");

  const { rawToken, hashedToken } = generateResetToken();

  user.verificationToken = hashedToken;
  await user.save({ validateBeforeSave: false });
  await sendVerificationEmail(email, rawToken);

  return user;
};

const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select("+password");
  if (!user) throw ApiError.notFound("User not found");

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) throw ApiError.badRequest("Current password is incorrect");

  user.password = newPassword;
  await user.save();

  return user;
};

const uploadAvatar = async (userId, file) => {
  try {
    const fileStream = fs.createReadStream(file.path);
    const uploadResponse = await imagekit.files.upload({
      file: fileStream,
      fileName: file.filename,
      folder: "/user-avatars",
    });

    await User.findByIdAndUpdate(
      userId,
      { avatar: uploadResponse.url },
      { new: true },
    );

    fs.unlinkSync(file.path);

    return {
      url: uploadResponse.url,
      fileId: uploadResponse.fileId,
    };
  } catch (error) {
    try {
      if (file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    } catch (error) {
      console.error("Error deleting temp file:", error);
    }

    throw error;
  }
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
  uploadAvatar,
};
