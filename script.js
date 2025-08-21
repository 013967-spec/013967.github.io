// === Load saved data from localStorage or initialize defaults ===
let coins = parseInt(localStorage.getItem("fc26Coins")) || 100000;
let collection = JSON.parse(localStorage.getItem("fc26Collection")) || [];
let yourTeam = JSON.parse(localStorage.getItem("fc26Team")) || [];

// === Migrate existing collection: add __id if missing ===
collection = collection.map(p => ({
  ...p,
  __id: p.__id || Date.now() + Math.random() * 10000
}));

// === Save Functions ===
function saveToStorage() {
  localStorage.setItem("fc26Coins", coins.toString());
  localStorage.setItem("fc26Collection", JSON.stringify(collection));
  localStorage.setItem("fc26Team", JSON.stringify(yourTeam));
}

// === Reset All Data ===
function resetProgress() {
  const confirmed = confirm("Are you sure you want to reset ALL your progress? This cannot be undone.");
  if (confirmed) {
    coins = 100000;
    collection = [];
    yourTeam = [];

    localStorage.removeItem("fc26Coins");
    localStorage.removeItem("fc26Collection");
    localStorage.removeItem("fc26Team");

    updateCoinsDisplay();
    document.getElementById("pack-area").innerHTML = "";
    showCollection();
    showTeamSelector();
    alert("Your progress has been reset!");
  }
}

// === Update Coins Display ===
function updateCoinsDisplay() {
  document.getElementById("coin-count").textContent = coins;
}

// === Player Pool (from players.js) ===
// Assume `playerPool` is defined in players.js

// === Pack Types ===
const packs = [
  {
    name: "86+ Player Pack",
    cost: 7500,
    count: 1,
    filter: player => player.rating >= 86
  },
  {
    name: "83+ x3 Players Pack",
    cost: 20000,
    count: 3,
    filter: player => player.rating >= 83
  },
  {
    name: "Low Rated 10-Player Pack",
    cost: 30000,
    count: 10,
    custom: "lowRated10"
  },
  {
    name: "Guaranteed Icon Pack",
    cost: 12000,
    count: 1,
    filter: player => player.version === "Icon"
  },
  {
    name: "Promo Pack",
    cost: 8000,
    count: 1,
    filter: player => ["Pre-Season Standouts", "OTW", "Fan Favourite",].includes(player.version)
  },
  {
    name: "85+ x10 Players Pack",
    cost: 65000,
    count: 10,
    filter: player => player.rating >= 85
  },
];

// === Rarity Classes ===
function getRarityClass(player) {
  if (player.version === "GOAT") return "goat";
  if (player.version === "Fan Favourite") return "fan-favourite";
  if (player.version === "Icon") return "icon";
  if (player.version === "OTW") return "otw";
  if (player.version === "Pre-Season Standouts") return "pre-season-standout";
  if (player.rating >= 86) return "gold";
  if (player.rating >= 80) return "silver";
  return "bronze";
}

// === Create Player Card ===
function createCardElement(player, showButtons = true) {
  const card = document.createElement("div");
  const rarity = getRarityClass(player);
  card.className = `player-card ${rarity}`;

  card.style.width = "160px";
  card.style.height = "280px";
  card.style.overflow = "hidden";
  card.style.borderRadius = "10px";

  card.innerHTML = `
    <div class="player-img-wrapper">
      <img src="${player.image || 'default.png'}" alt="${player.name}" class="player-img"/>
    </div>
    <div class="info">
      <h3>${player.name}</h3>
      <p>${player.rating} | ${player.version}</p>
      <p>${player.club}</p>
    </div>
  `;

  if (showButtons) {
    const buttonsDiv = document.createElement("div");
    buttonsDiv.className = "card-buttons";

    const sendBtn = document.createElement("button");
    sendBtn.textContent = "Send to Collection";
    sendBtn.onclick = () => {
      // Ensure this card has a unique ID
      const playerWithId = {
        ...player,
        __id: player.__id || Date.now() + Math.random() * 10000
      };
      collection.push(playerWithId);
      saveToStorage();
      card.remove();
      if (document.getElementById("collection-screen").style.display !== "none") {
        showCollection();
      }
    };

    const sellBtn = document.createElement("button");
    sellBtn.textContent = `Sell (${player.sellValue})`;
    sellBtn.onclick = () => {
      coins += player.sellValue;
      updateCoinsDisplay();

      const index = collection.findIndex(p => p.__id === player.__id);
      if (index !== -1) {
        collection.splice(index, 1);
        saveToStorage();
        if (document.getElementById("collection-screen").style.display !== "none") {
          showCollection();
        }
      }

      card.remove();
    };

    buttonsDiv.appendChild(sendBtn);
    buttonsDiv.appendChild(sellBtn);
    card.appendChild(buttonsDiv);
  }

  return card;
}

// === Helper: Find index of a player in collection by __id ===
function findPlayerIndex(player) {
  return collection.findIndex(p => p.__id === player.__id);
}

// === Display Players from Pack ===
function displayPackedPlayers(players) {
  const packArea = document.getElementById("pack-area");
  packArea.innerHTML = "";

  players.forEach(player => {
    // Assign a unique ID to each pulled card
    const playerWithId = {
      ...player,
      __id: Date.now() + Math.random() * 10000
    };
    const card = createCardElement(playerWithId);
    packArea.appendChild(card);
  });
}

// === Show Collection ===
function showCollection() {
  const collectionArea = document.getElementById("collection-area");
  collectionArea.innerHTML = "";

  // Group by visual identity (excluding __id)
  const playerMap = new Map();
  collection.forEach(player => {
    const key = `${player.name}-${player.rating}-${player.version}-${player.club}-${player.image}`;
    if (!playerMap.has(key)) {
      playerMap.set(key, { player: { ...player }, count: 0 });
    }
    playerMap.get(key).count++;
  });

  // Sort by rating (highest first)
  const sortedEntries = [...playerMap.entries()].sort((a, b) => {
    return b[1].player.rating - a[1].player.rating;
  });

  sortedEntries.forEach(([key, { player, count }]) => {
    const card = createCardElement(player, false);

    // Add count badge
    const countBadge = document.createElement("div");
    countBadge.style.fontSize = "12px";
    countBadge.style.color = "white";
    countBadge.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
    countBadge.style.padding = "3px 6px";
    countBadge.style.borderRadius = "4px";
    countBadge.style.display = "inline-block";
    countBadge.style.marginTop = "4px";
    countBadge.style.fontWeight = "bold";
    countBadge.style.textAlign = "center";
    countBadge.style.boxShadow = "0 1px 2px rgba(0,0,0,0.3)";
    countBadge.style.width = "100%";
    countBadge.style.transform = "scale(0.95)";

    countBadge.textContent = `Owned: ${count}`;
    card.querySelector(".info").appendChild(countBadge);

    // Add buttons
    const buttonsDiv = document.createElement("div");
    buttonsDiv.className = "card-buttons";

    const sellOneBtn = document.createElement("button");
    sellOneBtn.textContent = `Sell One (${player.sellValue})`;
    sellOneBtn.onclick = () => {
      coins += player.sellValue;
      updateCoinsDisplay();

      const index = collection.findIndex(p => p.__id === player.__id);
      if (index !== -1) {
        collection.splice(index, 1);
        saveToStorage();
        showCollection();
      }
    };

    const sellAllBtn = document.createElement("button");
    sellAllBtn.textContent = `Sell All (${player.sellValue * count})`;
    sellAllBtn.style.background = "#b71c1c";
    sellAllBtn.onclick = () => {
      const totalValue = player.sellValue * count;
      coins += totalValue;
      updateCoinsDisplay();

      // Remove all visually identical cards
      const matchKey = `${player.name}-${player.rating}-${player.version}-${player.club}-${player.image}`;
      for (let i = collection.length - 1; i >= 0; i--) {
        const p = collection[i];
        const pKey = `${p.name}-${p.rating}-${p.version}-${p.club}-${p.image}`;
        if (pKey === matchKey) {
          collection.splice(i, 1);
        }
      }

      saveToStorage();
      showCollection();
      alert(`Sold ${count} × ${player.name} for ${totalValue} coins!`);
    };

    buttonsDiv.appendChild(sellOneBtn);
    buttonsDiv.appendChild(sellAllBtn);
    card.appendChild(buttonsDiv);
    collectionArea.appendChild(card);
  });
}

// === Special Pack: Low Rated 10-Pack ===
function getRandomPlayerForLowRatedPack() {
  const rand = Math.random();
  if (rand <= 0.001) {
    const icons = playerPool.filter(p => p.version === "Icon");
    return icons[Math.floor(Math.random() * icons.length)];
  } else if (rand <= 0.011) {
    const over88 = playerPool.filter(p => p.rating > 88);
    return over88[Math.floor(Math.random() * over88.length)];
  } else if (rand <= 0.06) {
    const over84 = playerPool.filter(p => p.rating > 84);
    return over84[Math.floor(Math.random() * over84.length)];
  } else {
    const low = playerPool.filter(p => p.rating <= 84 && p.version !== "Icon");
    return low[Math.floor(Math.random() * low.length)];
  }
}

// === Confetti Effects ===
function createConfetti(color) {
  const confetti = document.createElement("div");
  confetti.classList.add("confetti");
  confetti.style.backgroundColor = color;
  confetti.style.left = Math.random() * 100 + "vw";
  confetti.style.animationDuration = (Math.random() * 2 + 3) + "s";
  confetti.style.opacity = Math.random() + 0.5;
  confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
  document.body.appendChild(confetti);

  setTimeout(() => {
    confetti.remove();
  }, 5000);
}

function runConfettiEffect(color, count = 100) {
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      createConfetti(color);
    }, i * 10);
  }
}

function runMultiColorConfetti(colors, count = 100) {
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const color = colors[Math.floor(Math.random() * colors.length)];
      createConfetti(color);
    }, i * 10);
  }
}

// === Legendary GOAT Confetti ===
function runGoatConfetti() {
  const colors = ["#d4af37", "#FFD700", "#FFFFFF", "#f8e7a6", "#c5a000"];

  for (let i = 0; i < 200; i++) {
    setTimeout(() => {
      const confetti = document.createElement("div");
      confetti.classList.add("confetti");
      const color = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.backgroundColor = color;
      confetti.style.left = Math.random() * 100 + "vw";
      confetti.style.animationDuration = (Math.random() * 2 + 4) + "s";
      confetti.style.opacity = Math.random() * 0.8 + 0.3;
      confetti.style.width = (Math.random() * 6 + 6) + "px";
      confetti.style.height = (Math.random() * 12 + 8) + "px";
      confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
      confetti.style.boxShadow = "0 0 10px #ffd700";
      document.body.appendChild(confetti);

      setTimeout(() => {
        confetti.remove();
      }, 6000);
    }, i * 15);
  }

  // Add star emojis
  for (let i = 0; i < 40; i++) {
    setTimeout(() => {
      const star = document.createElement("div");
      star.style.position = "fixed";
      star.style.left = Math.random() * 100 + "vw";
      star.style.top = "-20px";
      star.style.fontSize = (Math.random() * 20 + 15) + "px";
      star.style.color = "#ffd700";
      star.style.pointerEvents = "none";
      star.style.zIndex = "9999";
      star.style.textShadow = "0 0 10px #fff";
      star.textContent = "⭐";
      document.body.appendChild(star);

      const fallDuration = Math.random() * 3 + 2;
      star.animate([
        { transform: `translateY(0) rotate(0deg)`, opacity: 1 },
        { transform: `translateY(100vh) rotate(360deg)`, opacity: 0 }
      ], {
        duration: fallDuration * 1000,
        easing: "cubic-bezier(0.2, 0.8, 0.7, 1)"
      });

      setTimeout(() => star.remove(), fallDuration * 1000);
    }, i * 100);
  }

  // Optional: Play epic sound (autoplays only if user has interacted)
  try {
    const audio = new Audio("https://www.myinstants.com/media/sounds/epic-win-sonido-epico-1.mp3");
    audio.volume = 0.3;
    audio.play().catch(() => {
      console.log("Audio autoplay prevented – no user interaction yet.");
    });
  } catch (e) {
    console.log("Audio failed to play:", e);
  }
}

// === Pack Opening Overlay ===
const overlay = document.createElement("div");
overlay.id = "pack-opening-overlay";
overlay.innerHTML = `
  <div class="overlay-content">
    <div class="shimmer-text">Opening Pack...</div>
  </div>
`;
document.body.appendChild(overlay);

function showPackOpeningAnimation(callback) {
  overlay.style.display = "flex";
  setTimeout(() => {
    overlay.style.display = "none";
    callback();
  }, 1500);
}

// === Open Pack Logic ===
// === Open Pack Logic ===
function openPack(pack) {
  if (coins < pack.cost) return alert("Not enough coins!");
  coins -= pack.cost;
  updateCoinsDisplay();

  showPackOpeningAnimation(() => {
    let newPlayers = [];

    if (pack.custom === "lowRated10") {
      for (let i = 0; i < 10; i++) {
        newPlayers.push(getRandomPlayerForLowRatedPack());
      }
    } else {
      const eligible = playerPool.filter(pack.filter);
      for (let i = 0; i < pack.count; i++) {
        const randomIndex = Math.floor(Math.random() * eligible.length);
        newPlayers.push(eligible[randomIndex]);
      }
    }

    // Check if any card is GOAT
    const hasGoat = newPlayers.some(p => p.version === "GOAT");

    if (hasGoat) {
      // Step 1: Hide cards for now
      const packArea = document.getElementById("pack-area");
      packArea.innerHTML = "";

      // Step 2: Show legendary popup
      setTimeout(() => {
        // Step 3: Run GOAT confetti
        runGoatConfetti();

        // Step 4: Show alert (triggers after confetti starts)
        // Replace the alert line with:
showGoatRevealPopup();

function showGoatRevealPopup() {
  const popup = document.createElement("div");
  popup.style.position = "fixed";
  popup.style.inset = "0";
  popup.style.backgroundColor = "rgba(0,0,0,0.9)";
  popup.style.display = "flex";
  popup.style.flexDirection = "column";
  popup.style.justifyContent = "center";
  popup.style.alignItems = "center";
  popup.style.zIndex = "10000";
  popup.style.color = "white";
  popup.style.fontSize = "3rem";
  popup.style.textAlign = "center";
  popup.style.fontFamily = "Arial, sans-serif";
  popup.style.animation = "fade-in 0.8s";

  popup.innerHTML = `
    <div>
      <div style="font-size: 4rem; margin-bottom: 20px;">🐐</div>
      <div>THE GOAT HAS ARRIVED!</div>
      <div style="font-size: 1.5rem; margin-top: 20px; opacity: 0.8;">
        Prepare for greatness...
      </div>
    </div>
  `;

  document.body.appendChild(popup);

  // Auto-remove after 2.5 seconds and show card
  setTimeout(() => {
    popup.remove();
  }, 2500);
}

        // Step 5: After alert is dismissed, reveal the card
        setTimeout(() => {
          displayPackedPlayers(newPlayers); // Now show the card(s)
        }, 500);
      }, 500);
    } else {
      // Normal flow: just display cards and regular confetti
      displayPackedPlayers(newPlayers);

      // Regular confetti for other rarities
      if (newPlayers.some(p => p.version === "Fan Favourite")) {
        runMultiColorConfetti(["#8000ff", "#cc66ff", "#e0b3ff"], 150);
      } else if (newPlayers.some(p => p.version === "Pre-Season Standouts")) {
        runMultiColorConfetti(["#ff6b35", "#f7931e", "#fd5b71", "#c11a73"], 140);
      } else if (newPlayers.some(p => p.version === "Icon")) {
        runMultiColorConfetti(["#FFD700", "#FFFFFF"], 120);
      } else if (newPlayers.some(p => p.version === "OTW")) {
        runConfettiEffect("red", 120);
      } else if (newPlayers.some(p => p.rating >= 86)) {
        runConfettiEffect("yellow", 120);
      } else if (newPlayers.some(p => p.rating >= 80)) {
        runConfettiEffect("silver", 120);
      } else {
        runConfettiEffect("gray", 120);
      }
    }
  });
}

// === Setup Pack Buttons ===
function setupPackButtons() {
  const packsArea = document.getElementById("packs");
  packsArea.innerHTML = "";
  packs.forEach(pack => {
    const btn = document.createElement("button");
    btn.textContent = `${pack.name} - ${pack.cost} coins`;
    btn.onclick = () => openPack(pack);
    packsArea.appendChild(btn);
  });
}

// === TEAM BUILDER ===
function showTeamSelector() {
  const gkLine = document.getElementById("gk-line");
  const defenseLine = document.getElementById("defense-line");
  const midfieldLine = document.getElementById("midfield-line");
  const attackLine = document.getElementById("attack-line");

  const squadLayout = [
    { el: gkLine, positions: ["GK"] },
    { el: defenseLine, positions: ["RB", "CB", "CB", "LB"] },
    { el: midfieldLine, positions: ["CM", "CAM", "CM"] },
    { el: attackLine, positions: ["RW", "ST", "LW"] }
  ];

  let dropdownIndex = 0;

  squadLayout.forEach(area => {
    area.el.innerHTML = "";
    area.positions.forEach((pos, i) => {
      const slotWrapper = document.createElement("div");
      slotWrapper.className = "team-slot";

      const cardPreview = document.createElement("div");
      cardPreview.className = "team-card-preview";
      slotWrapper.appendChild(cardPreview);

      const posLabel = document.createElement("div");
      posLabel.className = "position-label";
      posLabel.textContent = pos;
      slotWrapper.appendChild(posLabel);

      const select = document.createElement("select");
      select.className = "team-select";
      select.dataset.index = dropdownIndex;
      select.dataset.position = pos;

      const defaultOption = document.createElement("option");
      defaultOption.value = "";
      defaultOption.textContent = `Select ${pos}`;
      defaultOption.selected = true;
      select.appendChild(defaultOption);

      select.onfocus = () => {
        populateDropdownOptions(select);
      };

      select.onchange = () => {
        updateTeamDropdownOptions();
      };

      slotWrapper.appendChild(select);
      area.el.appendChild(slotWrapper);

      dropdownIndex++;
    });
  });

  updateTeamDropdownOptions();
}

function populateDropdownOptions(select) {
  select.innerHTML = "";

  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = `Select ${select.dataset.position}`;
  defaultOption.selected = true;
  select.appendChild(defaultOption);

  const uniquePlayers = [...new Map(
    collection.map(p => [
      `${p.name}-${p.rating}-${p.version}-${p.club}-${p.image}`,
      p
    ])
  ).values()];

  const selectedPlayers = Array.from(document.querySelectorAll(".team-select"))
    .map(s => s.value)
    .filter(v => v)
    .map(v => JSON.parse(v));

  const currentIndex = parseInt(select.dataset.index);

  uniquePlayers.forEach(player => {
    const alreadySelected = selectedPlayers.some((p, i) =>
      i !== currentIndex &&
      p.name === player.name &&
      p.rating === player.rating &&
      p.version === player.version &&
      p.club === player.club &&
      p.image === player.image
    );

    if (!alreadySelected) {
      const option = document.createElement("option");
      option.value = JSON.stringify(player);
      option.textContent = `${player.name} (${player.rating})`;
      select.appendChild(option);
    }
  });
}

function updateTeamDropdownOptions() {
  document.querySelectorAll(".team-select").forEach(select => {
    const previewDiv = select.parentElement.querySelector(".team-card-preview");
    previewDiv.innerHTML = "";

    if (select.value) {
      const player = JSON.parse(select.value);
      const card = createCardElement(player, false);
      previewDiv.appendChild(card);
    }
  });
}

function saveTeam() {
  yourTeam = [];
  const selects = document.querySelectorAll(".team-select");

  selects.forEach(select => {
    if (select.value) {
      yourTeam.push(JSON.parse(select.value));
    }
  });

  saveToStorage();

  const totalValue = yourTeam.reduce((sum, player) => sum + (player.sellValue || 0), 0);
  const totalRating = yourTeam.reduce((sum, player) => sum + player.rating, 0);
  const averageRating = yourTeam.length > 0 ? Math.round(totalRating / yourTeam.length) : 0;

  alert(
    `Team saved!\nAverage Rating: ${averageRating}\nTotal Market Value: ${totalValue.toLocaleString()} coins`
  );
}

// === NAVIGATION ===
document.getElementById("nav-open").onclick = () => {
  document.getElementById("packs-screen").style.display = "block";
  document.getElementById("collection-screen").style.display = "none";
  document.getElementById("your-team-screen").style.display = "none";
};

document.getElementById("nav-collection").onclick = () => {
  document.getElementById("packs-screen").style.display = "none";
  document.getElementById("collection-screen").style.display = "block";
  document.getElementById("your-team-screen").style.display = "none";
  showCollection();
};

document.getElementById("nav-team").onclick = () => {
  document.getElementById("packs-screen").style.display = "none";
  document.getElementById("collection-screen").style.display = "none";
  document.getElementById("your-team-screen").style.display = "block";
  showTeamSelector();
};

// === INIT ===
setupPackButtons();
updateCoinsDisplay();

// === Add Reset Button ===
document.querySelector(".coins").insertAdjacentHTML(
  "beforeend",
  ` <button id="reset-progress-btn" style="font-size: 14px; background: #8B0000; margin-left: 10px;">Reset Progress</button>`
);
document.getElementById("reset-progress-btn").onclick = resetProgress;
