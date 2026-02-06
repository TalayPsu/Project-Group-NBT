async function loadStatus() {
  const statusEl = document.getElementById("status");

  try {
    const res = await fetch("/status");
    const data = await res.json();

    statusEl.textContent = "Online";
    document.getElementById("online").textContent = data.onlinePlayers;
    document.getElementById("max").textContent = data.maxPlayers;
    document.getElementById("version").textContent = data.version;
    document.getElementById("latency").textContent = data.latency;
  } catch (e) {
    statusEl.textContent = "Server offline";
  }
}

loadStatus();
