const express = require("express");
const cors = require("cors");
const util = require("minecraft-server-util");

const app = express();
app.use(cors());

const SERVER_IP = "34.15.148.61";
const SERVER_PORT = 25565;

app.get("/status", async (req, res) => {
  try {
    const status = await util.status(SERVER_IP, SERVER_PORT);
    res.json({
      onlinePlayers: status.players.online,
      maxPlayers: status.players.max,
      version: status.version.name,
      latency: status.roundTripLatency
    });
  } catch (err) {
    res.status(500).json({ error: "Server offline" });
  }
});

app.listen(3000, () => {
  console.log("Minecraft Status API running on port 3000");
});
