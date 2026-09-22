import { Router, type IRouter, type Request, type Response } from "express";
import { Client, GatewayIntentBits, ChannelType } from "discord.js";

const router: IRouter = Router();

// Discord bot setup
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;

// In-memory session storage
const activeSessions = new Set<string>();

// Connect bot when server starts
let botReady = false;
if (DISCORD_BOT_TOKEN) {
  client.login(DISCORD_BOT_TOKEN);
  client.once("ready", () => {
    botReady = true;
    console.log(`✅ Discord bot logged in as ${client.user?.username}`);
  });

  client.on("error", (error) => {
    console.error("Discord bot error:", error);
  });
}

// Helper function to update Discord channel name
async function updateDiscordChannel(count: number) {
  if (!botReady || !DISCORD_CHANNEL_ID) {
    return;
  }

  try {
    const channel = await client.channels.fetch(DISCORD_CHANNEL_ID);

    if (!channel || channel.type !== ChannelType.GuildVoice) {
      console.error("Channel not found or not a voice channel");
      return;
    }

    const newName = `🟢 Online: ${count}`;

    if (channel.name !== newName) {
      await channel.setName(newName);
      console.log(`Channel renamed to: ${newName}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("Discord channel update error:", error.message);
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

  await updateDiscordChannel(count);

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

  await updateDiscordChannel(count);

  res.json({ sessionId, onlineCount: count });
});

export default router;
