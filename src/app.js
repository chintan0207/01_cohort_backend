import express from "express";
import cookieParser from "cookie-parser";
import authRoutes from "./modules/auth/auth.routes.js";
import cors from "cors";
import { errorHandler } from "./common/middleware/error.middleware.js";

const app = express();
app.use(
  cors({
    origin: [process.env.FRONTEND_URL, "http://localhost:5173"],
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.get("/", (req, res) => {
  res.send(
    "Welcome to the Cohort 2026 Backend API with github actions and docker deployment",
  );
});
app.use("/api/auth", authRoutes);
app.use(errorHandler);
export default app;
