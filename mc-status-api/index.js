const express = require("express");
const cors = require("cors");
const util = require("minecraft-server-util");
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const { Rcon } = require("rcon-client");
const fs = require("fs");


const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

/* ================== CONFIG ================== */
const SERVER_IP = "34.15.140.2";
const SERVER_PORT = 25565;
const JWT_SECRET = "secret"; 

/* ================== RCON ================== */
const rcon = new Rcon({
  host: "127.0.0.1",   
  port: 25575,
  password: "secret"
});

(async () => {
  try {
    await rcon.connect();
    console.log("✅ RCON connected");
  } catch (err) {
    console.error("❌ RCON connection failed", err);
  }
})();

/* ================== MONGOD ================== */
mongoose.connect("mongodb://127.0.0.1:27017/minecraft-admin")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

/* ================== USER MODEL ================== */
const UserSchema = new mongoose.Schema({
  username: String,
  password: String
});
const User = mongoose.model("User", UserSchema);

/* ================== AUTH MIDDLEWARE ================== */
function auth(req, res, next) {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).json({ error: "No token" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(403).json({ error: "Invalid token" });
  }
}

/* ================== REGISTER ================== */
app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  await User.create({ username, password: hash });
  res.json({ message: "User created" });
});

/* ================== LOGIN ================== */
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ error: "User not found" });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: "Wrong password" });

  const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "2h" });
  res.json({ token });
});

/* ================== ADMIN PANEL ================== */
app.get("/api/admin", auth, (req, res) => {
  res.json({ message: "Welcome Admin", user: req.user });
});

app.post("/api/admin/ban", auth, async (req, res) => {
  const player = req.body.player;
  const reason = req.body.reason || "Banned by admin";

  await rcon.send("ban " + player + " " + reason);

  res.json({
    message: "Player " + player + " banned"
  });
});

app.post("/api/admin/unban", auth, async (req, res) => {
  const player = req.body.player;

  await rcon.send("pardon " + player);

  res.json({
    message: "Player " + player + " unbanned"
  });
});

/* ================== GET BANNED PLAYERS ================== */
app.get("/api/admin/banned", auth, async (req, res) => {
  try {
    const result = await rcon.send("banlist");

    /*
      ตัวอย่าง output:
      There are 1 banned players:
      - AECEboom
    */

    const banned = result
      .split("\n")
      .filter(line => line.trim().startsWith("- "))
      .map(line => line.replace("- ", "").trim());

    res.json({ players: banned });
  } catch (err) {
    console.error("Banned fetch error:", err);
    res.json({ players: [] });
  }
});



/* ================== MINECRAFT STATUS ================== */
app.get("/status", async (req, res) => {
  try {
    const status = await util.status(SERVER_IP, SERVER_PORT);
    const playerNames = status.players.sample?.map(p => p.name) || [];
    res.json({
      online: status.players.online,
      max: status.players.max,
      latency: status.roundTripLatency,
      version: status.version.name,
      playerNames
    });
  } catch {
    res.status(500).json({ error: "Server offline" });
  }
});

app.listen(3000, "0.0.0.0", () => {
  console.log("Server running on port 3000");
});