const express = require("express");
const cors = require("cors");
const util = require("minecraft-server-util");
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

/* ================== CONFIG ================== */
const SERVER_IP = "34.15.159.180";
const SERVER_PORT = 25565;
const JWT_SECRET = "secret"; // เปลี่ยนเป็นยากๆ

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

/* ================== MINECRAFT STATUS ================== */
app.get("/status", async (req, res) => {
  try {
    const status = await util.status(SERVER_IP, SERVER_PORT);
    const playerNames = status.players.sample?.map(p => p.name) || [];
    res.json({
      online: status.players.online,
      max: status.players.max,
      latency: status.roundTripLatency,
      playerNames
    });
  } catch {
    res.status(500).json({ error: "Server offline" });
  }
});

app.listen(3000, "0.0.0.0", () => {
  console.log("Server running on port 3000");
});