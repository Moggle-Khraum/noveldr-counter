import { Router, type IRouter } from "express";
import { GetApiInfoResponse } from "@workspace/api-zod";
import healthRouter from "./health";

const router: IRouter = Router();

router.get("/", (_req, res) => {
  const data = GetApiInfoResponse.parse({
    name: "Node.js API",
    version: "0.1.0",
    status: "ok",
  });

  res.json(data);
});

router.use(healthRouter);

export default router;
