import { Router, type IRouter, type Request, type Response } from "express";
import axios from "axios";

const router: IRouter = Router();

// In-memory session storage
const activeSessions = new Set<string>();
let lastMessageId: string | null = null;

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

// Helper function to update Discord
async function updateDiscordStatus(count: number) {
  if (!DISCORD_WEBHOOK_URL) {
    return;
  }

  try {
    const embed = {
      title: "App Status",
      description: `🟢 Online: ${count}`,
      color: 3066993, // Green
    };

    if (!lastMessageId) {
      // Post new message
      const response = await axios.post(DISCORD_WEBHOOK_URL, {
        embeds: [embed],
      });
      lastMessageId = response.data.id;
    } else {
      // Edit existing message
      try {
        await axios.patch(`${DISCORD_WEBHOOK_URL}/messages/${lastMessageId}`, {
          embeds: [embed],
        });
      } catch {
        // Message deleted, post new one
        const response = await axios.post(DISCORD_WEBHOOK_URL, {
          embeds: [embed],
        });
        lastMessageId = response.data.id;
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("Discord update error:", error.message);
    }
  }
}

// POST /sessions/join
router.post("/join", async (req: Request, res: Response) => {
  const sessionId =
    (req.body?.sessionId as string) ||
    `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  activeSessions.add(sessionId);
  const count = activeSessions.size;

  req.log.info({ sessionId, onlineCount: count }, "User joined");

  await updateDiscordStatus(count);

  res.json({ sessionId, onlineCount: count });
});

// POST /sessions/leave
router.post("/leave", async (req: Request, res: Response) => {
  const { sessionId } = req.body as { sessionId: string };

  if (!sessionId) {
    res.status(400).json({ error: "sessionId required" });
    return;
  }

  activeSessions.delete(sessionId);
  const count = activeSessions.size;

  req.log.info({ sessionId, onlineCount: count }, "User left");

  await updateDiscordStatus(count);

  res.json({ sessionId, onlineCount: count });
});

export default router;
