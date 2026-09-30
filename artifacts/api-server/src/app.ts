import express, { type Express, type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes/index.js";
import { logger } from "./lib/logger.js";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

// Body-parser failures happen before the signup route can return its JSON error.
const signupErrorHandler = (
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const parserError = error && typeof error === "object"
    ? error as { type?: string }
    : {};
  if (req.path !== "/api/auth/signup" || res.headersSent) {
    next(error);
    return;
  }
  // Parser errors contain the request body, which may include passwords.
  req.log.error({ errorType: parserError.type }, "Signup request failed");
  const status = parserError.type === "entity.parse.failed" ? 400
    : parserError.type === "entity.too.large" ? 413 : 500;
  res.status(status).json({ error: status === 400 ? "Invalid JSON request body."
    : status === 413 ? "Signup request is too large."
    : "Unable to complete signup right now. Please try again later." });
};
app.use(signupErrorHandler);

export default app;
