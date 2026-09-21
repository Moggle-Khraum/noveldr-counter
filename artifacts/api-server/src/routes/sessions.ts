import { Router, type IRouter, type Request, type Response } from "express";
import axios from "axios";
import {
  JoinSessionBody,
  JoinSessionResponse,
  LeaveSessionBody,
  LeaveSessionResponse,
} from "@workspace/api-zod";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const activeSessions = new Set<string>();
let lastMessageId: string | null = null;

const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;

async function updateDiscordStatus(count: number): Promise<void> {
  if (!discordWebhookUrl) {
    return;
  }

  const message = `📱 **${count}** user${count !== 1 ? "s" : ""} online`;

  try {
    if (!lastMessageId) {
      const webhookUrl = new URL(discordWebhookUrl);
      webhookUrl.searchParams.set("wait", "true");
      const response = await axios.post(webhookUrl.toString(), { content: message });
      lastMessageId = response.data.id;
      return;
    }

    try {
      await axios.patch(
        `${discordWebhookUrl}/messages/${lastMessageId}`,
        { content: message },
      );
    } catch {
      const webhookUrl = new URL(discordWebhookUrl);
      webhookUrl.searchParams.set("wait", "true");
      const response = await axios.post(webhookUrl.toString(), { content: message });
      lastMessageId = response.data.id;
    }
  } catch (err) {
    logger.error({ err }, "Discord status update failed");
  }
}

router.post("/join", async (req: Request, res: Response): Promise<void> => {
  const parsedBody = JoinSessionBody.safeParse(req.body ?? {});
  if (!parsedBody.success) {
    res.status(400).json({ error: parsedBody.error.message });
    return;
  }

  const requestedSessionId = parsedBody.data.sessionId;
  const sessionId =
    requestedSessionId && requestedSessionId.length > 0
      ? requestedSessionId
      : `session_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

  activeSessions.add(sessionId);
  const onlineCount = activeSessions.size;

  req.log.info({ sessionId, onlineCount }, "User joined");
  await updateDiscordStatus(onlineCount);

  res.json(JoinSessionResponse.parse({ sessionId, onlineCount }));
});

router.post("/leave", async (req: Request, res: Response): Promise<void> => {
  const parsedBody = LeaveSessionBody.safeParse(req.body);
  if (!parsedBody.success) {
    res.status(400).json({ error: "sessionId required" });
    return;
  }

  const { sessionId } = parsedBody.data;
  activeSessions.delete(sessionId);
  const onlineCount = activeSessions.size;

  req.log.info({ sessionId, onlineCount }, "User left");
  await updateDiscordStatus(onlineCount);

  res.json(LeaveSessionResponse.parse({ sessionId, onlineCount }));
});

export default router;