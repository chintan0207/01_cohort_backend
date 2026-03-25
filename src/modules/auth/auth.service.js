import ApiError from "../../common/utils/api-error.js";
import {
  generateAccessToken,
  generateRefreshToken,
  generateResetToken,
  hashedToken,
  verifyRefreshToken,
} from "../../common/utils/jwt.utils.js";
import User from "./auth.model.js";

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

  // TODO: send an email to user with token: rawToken

  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.verificationToken;

  return userObj;
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email, password }).select("+password");
  if (!user) throw ApiError.unauthorized("Invalid email or password");

  // some how checked correct password
  if (!user.isVerified) {
    throw ApiError.forbidden("Please verify your email before login");
  }

  const accessToken = generateAccessToken({ id: user?._id, role: user?.role });
  const refreshToken = generateAccessToken({ id: user?._id });

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

  if (user.refreshToken !== token) {
    throw ApiError.unauthorized("Invalid refresh token");
  }

  const accessToken = generateAccessToken({ id: user._id, role: user.role });
  const refreshToken = generateRefreshToken({ id: user._id });

  user.refreshToken = hashedToken(refreshToken);
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw ApiError.notFound("Account not found with this email");

  const { rawToken, hashedToken } = generateResetToken();

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
  await user.save();

  // send resettoken to email for reset password
};

export { register, login, logout, refresh, forgotPassword };
