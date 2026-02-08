const token = localStorage.getItem("token");
if (!token) location.href = "/";

const onlineList = document.getElementById("onlineList");
const bannedList = document.getElementById("bannedList");
const actionModal = document.getElementById("actionModal");

let selectedPlayer = "";
let currentAction = ""; // "ban" | "unban"

const output = document.getElementById("output");
const modal = document.getElementById("adminModal");
const adminContent = document.getElementById("adminContent");
const regModal = document.getElementById("registerModal");

/* ===== ของเดิม ===== */
async function loadAdmin(){
  const res = await fetch("/api/admin", {
    headers: { Authorization: token }
  });
  const data = await res.json();

  adminContent.innerHTML = `
  <div class="admin-row"><span>Message</span><span>${data.message}</span></div>
  <div class="admin-row"><span>User ID</span><span>${data.user.id}</span></div>
  <div class="admin-row"><span>Issued At</span><span>${new Date(data.user.iat * 1000).toLocaleString()}</span></div>
  <div class="admin-row"><span>Expire</span><span>${new Date(data.user.exp * 1000).toLocaleString()}</span></div>
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

  renderOnline(data.playerNames || []);
  loadBannedPlayers();
}

function renderOnline(players){
  onlineList.innerHTML = "";

  players.forEach(p => {
    onlineList.innerHTML += `
      <li class="player-item">
        <span>${p}</span>
        <button class="icon-btn icon-ban"
          onclick="openModal('ban','${p}')"></button>
      </li>
    `;
  });
}

async function loadBannedPlayers(){
  const res = await fetch("/api/admin/banned", {
    headers: { Authorization: token }
  });

  const data = await res.json();
  renderBanned(data.players || []);
}

function renderBanned(players){
  bannedList.innerHTML = "";

  players.forEach(p => {
    bannedList.innerHTML += `
      <li class="player-item">
        <span>${p}</span>
        <button class="icon-btn icon-unban"
          onclick="openModal('unban','${p}')"></button>
      </li>
    `;
  });
}

function openModal(action, player){
  currentAction = action;
  selectedPlayer = player;

  document.getElementById("modalTitle").textContent =
    action === "ban" ? "Ban Player" : "Unban Player";

  document.getElementById("modalPlayer").textContent = player;

  document.getElementById("modalReason").style.display =
    action === "ban" ? "block" : "none";

  actionModal.classList.remove("hidden");
}

function closeModal(){
  actionModal.classList.add("hidden");
}

async function confirmAction(){
  const reason = document.getElementById("modalReason").value;

  const url = currentAction === "ban"
    ? "/api/admin/ban"
    : "/api/admin/unban";

  await fetch(url,{
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      "Authorization": token
    },
    body: JSON.stringify({
      player: selectedPlayer,
      reason
    })
  });

  closeModal();
  loadPlayers(); // refresh ทั้งสองฝั่ง
}


/* ===== logout ===== */
function logout(){
  localStorage.removeItem("token");
  location.href = "/";
}

/* init */
loadPlayers();

/* ===== REGISTER ADMIN ===== */
async function registerAdmin(){
  const username = document.getElementById("newUser").value;
  const password = document.getElementById("newPass").value;
  const log = document.getElementById("registerLog");

  const res = await fetch("/api/admin/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token
    },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();
  log.textContent = JSON.stringify(data, null, 2);
}

function openRegister(){
  regModal.classList.remove("hidden");
}

function closeRegister(){
  regModal.classList.add("hidden");
}

async function registerAdmin(){
  const username = document.getElementById("regUser").value;
  const password = document.getElementById("regPass").value;

  const res = await fetch("/api/admin/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token
    },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();

  if (res.ok) {
    alert("✅ Admin created: " + data.username);
    closeRegister();
  } else {
    alert("❌ Register failed: " + (data.error || "unknown error"));
  }
}
