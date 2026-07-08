// src/js/identity-theft.js

let characters = [];
let playerNames = [];

function loadCharacters(callback) {
  if (characters.length > 0) {
    callback();
    return;
  }

  fetch('src/characters.json')
    .then(res => res.json())
    .then(data => {
      characters = data;
      callback();
    })
    .catch(err => console.error('Error loading JSON:', err));
}

document.addEventListener('DOMContentLoaded', () => {
  loadCharacters(() => {
    renderCharacterCards(shuffleArray([...characters]));
    setupFilters();
    setupShuffleButton();
    setupPlayerName();
  });
});

function setupPlayerName() {
  const input = document.getElementById('playerNameInput');
  const addBtn = document.getElementById('addPlayerBtn');
  const list = document.getElementById('playerNameList');

  if (!input || !addBtn || !list) return;

  function renderPlayerNames() {
    list.textContent = `Player Name: ${playerNames.join(', ')}`;
  }

  function addPlayerName() {
    const name = input.value.trim();

    if (!name) return;

    playerNames.push(name);
    input.value = '';
    renderPlayerNames();
    renderCharacterCards(getFilteredCharacters());
  }

  addBtn.addEventListener('click', addPlayerName);

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      addPlayerName();
    }
  });
}

function renderCharacterCards(filteredChars = characters) {
    const container = document.getElementById('card-random-number');
    if (!container) return;

    container.innerHTML = '';

    // กรอง Traveler ซ้ำ
    let seenTraveler = false;
    const uniqueChars = filteredChars.filter(char => {
        if (char.Name === "Traveler") {
            if (seenTraveler) return false;
            seenTraveler = true;
        }
        return true;
    });

    // สุ่มตัวละคร
    const shuffledCharacters = shuffleArray([...uniqueChars]);

    // ---------------------------
    // สร้างรายชื่อผู้เล่นแบบเฉลี่ย
    // ---------------------------
    let playerPool = [];

    if (playerNames.length > 0) {
        const totalCards = shuffledCharacters.length;

        // จำนวนขั้นต่ำที่ทุกคนต้องได้
        const baseCount = Math.floor(totalCards / playerNames.length);

        // จำนวนที่เหลือ
        const remain = totalCards % playerNames.length;

        playerNames.forEach(name => {
            for (let i = 0; i < baseCount; i++) {
                playerPool.push(name);
            }
        });

        // แจกส่วนเกินแบบสุ่ม
        const extraPlayers = shuffleArray([...playerNames]).slice(0, remain);

        extraPlayers.forEach(name => {
            playerPool.push(name);
        });

        // สุ่มตำแหน่งชื่ออีกครั้ง
        playerPool = shuffleArray(playerPool);
    }

    shuffledCharacters.forEach((char, idx) => {
        const owner = playerPool[idx] || '';

        const col = document.createElement('div');
        col.className = 'col';

        col.innerHTML = `
            <div class="scene">
                <div class="card-ynum">
                    <div class="card__face card__face--front">
                        <div class="card-number">${idx + 1}</div>
                    </div>

                    <div class="card__face card__face--back"
                         style="background-image:url('${char.Image}')">

                        ${
                            owner
                            ? `<div class="player-owner-back">${owner}</div>`
                            : ''
                        }

                    </div>
                </div>
            </div>
        `;

        container.appendChild(col);
    });

    container.querySelectorAll('.card-ynum').forEach(card => {
        card.addEventListener('click', () => {
            card.classList.toggle('is-flipped');
        });
    });
}

function shuffleArray(arr) {
  const newArr = [...arr];

  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }

  return newArr;
}

function getFilteredCharacters() {
  const checkboxes = document.querySelectorAll('.region-checkbox:checked');

  if (!checkboxes.length) return [...characters];

  const selectedRegions = Array.from(checkboxes).map(cb => cb.value);
  return characters.filter(c => selectedRegions.includes(c.Region));
}

function setupFilters() {
  const checkboxes = document.querySelectorAll('.region-checkbox');

  checkboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      renderCharacterCards(getFilteredCharacters());
    });
  });

  const selectAllBtn = document.getElementById('selectAllBtn');

  selectAllBtn?.addEventListener('click', () => {
    checkboxes.forEach(cb => cb.checked = true);
    renderCharacterCards(getFilteredCharacters());
  });
}

function setupShuffleButton() {
  const btn = document.getElementById('shuffleBtn');

  btn?.addEventListener('click', () => {
    renderCharacterCards(getFilteredCharacters());
  });
}