let coins = 1500;
let collection = [];
let yourTeam = [];

const packs = [
  {
    name: "85+ Player Pack",
    cost: 150,
    count: 1,
    filter: player => player.rating >= 85
  },
  {
    name: "83+ x3 Players Pack",
    cost: 400,
    count: 3,
    filter: player => player.rating >= 83
  },
  {
    name: "Low Rated 10-Player Pack",
    cost: 750,
    count: 10,
    custom: "lowRated10"
  },
  {
    name: "Guaranteed Icon Pack",
    cost: 1000,
    count: 1,
    filter: player => player.version === "Icon"
  }
];

function updateCoinsDisplay() {
  document.getElementById("coin-count").textContent = coins;
}

function getRarityClass(player) {
  if (player.version === "Fan Favourite") return "fan-favourite";
  if (player.version === "Icon") return "icon";
  if (player.version === "OTW") return "otw";
  if (player.rating >= 86) return "gold";
  if (player.rating >= 80) return "silver";
  return "bronze";
}

function createCardElement(player, showButtons = true) {
  const card = document.createElement("div");
  const rarity = getRarityClass(player);
  card.className = `player-card ${rarity}`;

  // Ensure consistent card size across all views
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
      collection.push(player);
      card.remove();
    };

    const sellBtn = document.createElement("button");
    sellBtn.textContent = `Sell (${player.sellValue})`;
    sellBtn.onclick = () => {
      coins += player.sellValue;
      updateCoinsDisplay();
      card.remove();
    };

    buttonsDiv.appendChild(sendBtn);
    buttonsDiv.appendChild(sellBtn);
    card.appendChild(buttonsDiv);
  }

  return card;
}

function displayPackedPlayers(players) {
  const packArea = document.getElementById("pack-area");
  packArea.innerHTML = "";
  players.forEach(player => {
    const card = createCardElement(player);
    packArea.appendChild(card);
  });
}

function showCollection() {
  const collectionArea = document.getElementById("collection-area");
  collectionArea.innerHTML = "";

  const uniquePlayers = [...new Map(collection.map(p => [p.name + p.version + p.rating, p])).values()]
    .sort((a, b) => b.rating - a.rating);

  uniquePlayers.forEach(player => {
    const card = createCardElement(player, false);

    const sellButton = document.createElement("button");
    sellButton.textContent = `Sell (${player.sellValue})`;
    sellButton.onclick = () => {
      coins += player.sellValue;
      updateCoinsDisplay();
      const index = collection.findIndex(p =>
        p.name === player.name && p.version === player.version && p.rating === player.rating
      );
      if (index !== -1) collection.splice(index, 1);
      showCollection();
    };

    card.appendChild(sellButton);
    collectionArea.appendChild(card);
  });
}

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

    displayPackedPlayers(newPlayers);

    if (newPlayers.some(p => p.version === "Fan Favourite")) {
      runMultiColorConfetti(["#8000ff", "#cc66ff", "#e0b3ff"], 150);
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
  });
}

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

// === TEAM BUILDER: IMPROVED VERSION ===

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

      // Card Preview container
      const cardPreview = document.createElement("div");
      cardPreview.className = "team-card-preview";
      slotWrapper.appendChild(cardPreview);

      // Position Label (e.g., "ST") — now below the card
      const posLabel = document.createElement("div");
      posLabel.className = "position-label";
      posLabel.textContent = pos;
      slotWrapper.appendChild(posLabel);

      // Dropdown
      const select = document.createElement("select");
      select.className = "team-select";
      select.dataset.index = dropdownIndex;
      select.dataset.position = pos;

      // Default option
      const defaultOption = document.createElement("option");
      defaultOption.value = "";
      defaultOption.textContent = `Select ${pos}`;
      defaultOption.selected = true;
      select.appendChild(defaultOption);

      // Populate only when clicked
      select.onfocus = () => {
        populateDropdownOptions(select);
      };

      // Update preview on change
      select.onchange = () => {
        updateTeamDropdownOptions();
      };

      slotWrapper.appendChild(select);
      area.el.appendChild(slotWrapper);

      dropdownIndex++;
    });
  });

  // Initial preview update
  updateTeamDropdownOptions();
}

function populateDropdownOptions(select) {
  select.innerHTML = "";

  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = `Select ${select.dataset.position}`;
  defaultOption.selected = true;
  select.appendChild(defaultOption);

  const uniquePlayers = [...new Map(collection.map(p => [p.name + p.version + p.rating, p])).values()];

  const selectedPlayers = Array.from(document.querySelectorAll(".team-select"))
    .map(s => s.value)
    .filter(v => v)
    .map(v => JSON.parse(v));

  const currentIndex = parseInt(select.dataset.index);

  uniquePlayers.forEach(player => {
    const alreadySelected = selectedPlayers.some((p, i) =>
      i !== currentIndex &&
      p.name === player.name &&
      p.version === player.version &&
      p.rating === player.rating
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

  const totalValue = yourTeam.reduce((sum, player) => sum + (player.sellValue || 0), 0);
  const totalRating = yourTeam.reduce((sum, player) => sum + player.rating, 0);
  const averageRating = yourTeam.length > 0 ? Math.round(totalRating / yourTeam.length) : 0;

  alert(
    `Team saved!\nAverage Rating: ${averageRating}\nTotal Market Value: ${totalValue.toLocaleString()} coins`
  );
}

function getTeamRating() {
  return yourTeam.reduce((sum, p) => sum + p.rating, 0);
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