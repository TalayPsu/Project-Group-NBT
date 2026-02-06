async function loadStatus() {
  const statusEl = document.getElementById("status");
  const playersEl = document.getElementById("players");

  try {
    const res = await fetch("/status");
    const data = await res.json();

    statusEl.textContent = "● Online";
    statusEl.className = "online";

    document.getElementById("online").textContent = data.onlinePlayers;
    document.getElementById("max").textContent = data.maxPlayers;
    document.getElementById("version").textContent = data.version;
    document.getElementById("latency").textContent = data.latency;

    playersEl.innerHTML = "";

    if (data.playerNames && data.playerNames.length > 0) {
      data.playerNames.forEach(player => {
        const li = document.createElement("li");
        li.className = "player";
      
        li.innerHTML = `
          <img 
            src="https://mc-heads.net/avatar/${player}/32" 
            alt="${player}"
            loading="lazy"
          >
          <span>${player}</span>
        `;
      
        playersEl.appendChild(li);
      });
      
    } else {
      playersEl.innerHTML = "<li>No players online</li>";
    }

  } catch (e) {
    statusEl.textContent = "● Offline";
    statusEl.className = "offline";
    playersEl.innerHTML = "<li>Server offline</li>";
  }
}

// auto refresh ทุก 10 วินาที
setInterval(loadStatus, 10000);
loadStatus();
