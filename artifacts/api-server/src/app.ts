import express, {
  type ErrorRequestHandler,
  type Express,
} from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.disable("x-powered-by");

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
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

app.use("/api/{*splat}", (req, res) => {
  res.status(404).json({
    error: "Not Found",
    path: req.originalUrl.split("?")[0],
  });
});

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (res.headersSent) {
    next(err);
    return;
  }

  const status =
    typeof err === "object" &&
    err !== null &&
    "status" in err &&
    typeof err.status === "number"
      ? err.status
      : undefined;

  if (err instanceof SyntaxError && status === 400) {
    req.log.warn("Invalid JSON request body");
    res.status(400).json({
      error: "Invalid JSON payload",
    });
    return;
  }

  req.log.error({ err }, "Unhandled request error");
  res.status(500).json({
    error: "Internal Server Error",
  });
};

app.use(errorHandler);

export default app;
