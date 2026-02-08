const token = localStorage.getItem("token");
if (!token) location.href = "/";

const output = document.getElementById("output");
const logEl = document.getElementById("log");
const playerSelect = document.getElementById("playerSelect");
const modal = document.getElementById("adminModal");
const adminContent = document.getElementById("adminContent");

/* ===== ของเดิม ===== */
async function loadAdmin(){
  const res = await fetch("/api/admin", {
    headers: { Authorization: token }
  });
  const data = await res.json();

  adminContent.innerHTML = `
    <div class="admin-row"><span>ID</span><span>${data.users.id}</span></div>
    <div class="admin-row"><span>Username</span><span>${data.users.username}</span></div>
  `;

  modal.classList.remove("hidden");
}

function closeAdmin(){
  modal.classList.add("hidden");
}

/* ===== โหลดรายชื่อผู้เล่น ===== */
async function loadPlayers(){
  const res = await fetch("/status");
  const data = await res.json();

  playerSelect.innerHTML =
    '<option value="">-- Select Player --</option>';

  (data.playerNames || []).forEach(p => {
    const opt = document.createElement("option");
    opt.value = p;
    opt.textContent = p;
    playerSelect.appendChild(opt);
  });
}

/* ===== ban ===== */
async function banPlayer(){
  const player = playerSelect.value;
  const reason = document.getElementById("reason").value;

  if (!player) return alert("Select player first");

  const res = await fetch("/api/admin/ban", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token
    },
    body: JSON.stringify({ player, reason })
  });

  logEl.textContent = JSON.stringify(await res.json(), null, 2);
}

/* ===== unban ===== */
async function unbanPlayer(){
  const player = playerSelect.value;
  if (!player) return alert("Select player first");

  const res = await fetch("/api/admin/unban", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token
    },
    body: JSON.stringify({ player })
  });

  logEl.textContent = JSON.stringify(await res.json(), null, 2);
}

/* ===== logout ===== */
function logout(){
  localStorage.removeItem("token");
  location.href = "/";
}

/* init */
loadPlayers();
