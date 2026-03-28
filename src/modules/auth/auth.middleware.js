import ApiError from "../../common/utils/api-error.js";
import { verifyAccessToken } from "../../common/utils/jwt.utils.js";
import User from "./auth.model.js";

const authenticate = async (req, res, next) => {
  try {
    let token;

    const authHeader = req.headers.authorization;

    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (!token && req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      throw ApiError.unauthorized("Not authenticated");
    }

    const decoded = verifyAccessToken(token);

    const user = await User.findById(decoded.id).select("+password");

    if (!user) {
      throw ApiError.unauthorized("Invalid token");
    }

    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw ApiError.forbidden(
        "You don't have permission to access this resource",
      );
    }
    next();
  };
};

export { authenticate, authorize };
