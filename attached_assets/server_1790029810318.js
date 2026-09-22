const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

// Config
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
const PORT = process.env.PORT || 3000;

let activeSessions = new Set();
let messageId = null;

// POST /sessions/join
app.post("/sessions/join", async (req, res) => {
  const sessionId = req.body.sessionId || `session_${Date.now()}_${Math.random()}`;
  activeSessions.add(sessionId);

  const count = activeSessions.size;
  console.log(`User joined. Online: ${count}`);

  try {
    // Post or update Discord message
    if (!messageId) {
      // First message
      const response = await axios.post(DISCORD_WEBHOOK_URL, {
        content: `📱 **${count}** user${count !== 1 ? "s" : ""} online`,
      });
      messageId = response.data.id;
    } else {
      // Update existing message
      await axios.patch(`${DISCORD_WEBHOOK_URL}/messages/${messageId}`, {
        content: `📱 **${count}** user${count !== 1 ? "s" : ""} online`,
      });
    }
  } catch (error) {
    console.error("Discord error:", error.message);
  }

  res.json({ sessionId, onlineCount: count });
});

// POST /sessions/leave
app.post("/sessions/leave", async (req, res) => {
  const { sessionId } = req.body;
  activeSessions.delete(sessionId);

  const count = activeSessions.size;
  console.log(`User left. Online: ${count}`);

  try {
    // Update Discord message
    if (messageId) {
      await axios.patch(`${DISCORD_WEBHOOK_URL}/messages/${messageId}`, {
        content: `📱 **${count}** user${count !== 1 ? "s" : ""} online`,
      });
    }
  } catch (error) {
    console.error("Discord error:", error.message);
  }

  res.json({ onlineCount: count });
});

// GET /health (for deployment checks)
app.get("/health", (req, res) => {
  res.json({ status: "ok", onlineCount: activeSessions.size });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Online users: 0`);
});
