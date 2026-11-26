import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { env } from "./config/env.js";
import { apiRouter } from "./routes/index.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { globalLimiter } from "./middlewares/rateLimit.middleware.js";
import { notFoundMiddleware } from "./middlewares/notFound.middleware.js";

export const app = express();

// Behind Vercel's proxy: needed for correct client IPs (rate limiting) and Secure cookies.
app.set("trust proxy", 1);

app.use(helmet());
app.use(
  cors({
    origin: env.WEB_ORIGIN,
    credentials: true,
  }),
);
app.use(globalLimiter);
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

app.get("/health", (_req, res) => {
  res.status(200).json({ success: true, message: "ok", data: { status: "healthy" } });
});

app.use("/api/v1", apiRouter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
