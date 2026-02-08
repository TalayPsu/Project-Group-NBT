const modal = document.getElementById("loginModal");
document.getElementById("loginBtn").onclick = () => modal.classList.remove("hidden");
document.querySelector(".close-btn").onclick = () => modal.classList.add("hidden");

async function loadStatus() {
  const statusEl = document.getElementById("status");
  const playersEl = document.getElementById("players");

  try {
    const res = await fetch("/status");
    const data = await res.json();

    statusEl.textContent = "Online";
    statusEl.className = "online";

    document.getElementById("online").textContent = data.online;
    document.getElementById("max").textContent = data.max;
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
    statusEl.textContent = "Offline";
    statusEl.className = "offline";
    playersEl.innerHTML = "<li>Server offline</li>";
  }
}

async function register() {
  await fetch("/api/register", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({
      username: user.value,
      password: pass.value
    })
  });
  alert("Registered!");
}

async function login() {
  const res = await fetch("/api/login", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({
      username: user.value,
      password: pass.value
    })
  });

  if (!res.ok){
    alert("Login failed");
    return;
  }

  const data = await res.json();
  localStorage.setItem("token", data.token);

  window.location.href = "/admin.html"; // ไปหน้าใหม่
}


async function openAdmin() {
  const token = localStorage.getItem("token");
  const res = await fetch("/api/admin", {
    headers: { "Authorization": token }
  });
  const data = await res.json();
  alert(JSON.stringify(data));
}

// auto refresh ทุก 10 วินาที
setInterval(loadStatus, 10000);
loadStatus();
