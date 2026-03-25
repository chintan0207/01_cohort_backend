import ApiResponse from "../../common/utils/api-response.js";
import * as authService from "./auth.service.js";

const register = async (req, res) => {
  console.log(req.body);
  const user = await authService.register(req.body);
  ApiResponse.created(res, "User registered", user);
};

const login = async (req, res) => {
  const data = await authService.login(req.body);
  ApiResponse.ok(res, "User logged in", data);
};
export { register, login };
