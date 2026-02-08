const token = localStorage.getItem("token");
if (!token) location.href = "/";

const playerList = document.getElementById("playerList");
const bannedList = document.getElementById("bannedList");

/* ===== PANEL SWITCH ===== */
function showPanel(id) {
  document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

/* ===== LOAD ONLINE PLAYERS ===== */
async function loadPlayers() {
  const res = await fetch("/status");
  const data = await res.json();

  playerList.innerHTML = "";

  (data.playerNames || []).forEach(p => {
    const li = document.createElement("li");
    li.innerHTML = `
      <img src="https://mc-heads.net/avatar/${p}/32">
      <span>${p}</span>
      <button onclick="ban('${p}')">Ban</button>
      <button onclick="op('${p}')">Op</button>
      <button onclick="deop('${p}')">Deop</button>
    `;
    playerList.appendChild(li);
  });
}

/* ===== LOAD BANNED LIST ===== */
async function loadBanned() {
  const res = await fetch("/api/admin/banned", {
    headers: { Authorization: token }
  });
  const data = await res.json();

  bannedList.innerHTML = "";

  data.forEach(p => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${p}</span>
      <button onclick="unban('${p}')">Unban</button>
    `;
    bannedList.appendChild(li);
  });
}

/* ===== ACTIONS ===== */
async function ban(player) {
  await fetch("/api/admin/ban", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token
    },
    body: JSON.stringify({ player })
  });
  loadPlayers();
}

async function unban(player) {
  await fetch("/api/admin/unban", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token
    },
    body: JSON.stringify({ player })
  });
  loadBanned();
}

async function op(player) {
  await fetch("/api/admin/op", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token
    },
    body: JSON.stringify({ player })
  });
}

async function deop(player) {
  await fetch("/api/admin/deop", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token
    },
    body: JSON.stringify({ player })
  });
}

/* ===== LOGOUT ===== */
function logout() {
  localStorage.removeItem("token");
  location.href = "/";
}

/* ===== LIVE REFRESH ===== */
loadPlayers();
loadBanned();
setInterval(loadPlayers, 5000); // live refresh
